'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function markGigComplete(gigId: string) {
  console.log('=== markGigComplete called ===', gigId)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  console.log('User:', user?.id)
  if (!user) {
    return { error: 'You must be logged in to update a job.' }
  }

  // Verify freelancer owns this gig application and it's accepted
  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id')
    .eq('gig_id', gigId)
    .eq('freelancer_id', user.id)
    .eq('status', 'accepted')
    .single()

  console.log('Application found:', application, 'error:', applicationError)

  if (applicationError || !application) {
    return { error: 'Active job not found.' }
  }

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, status, client_id')
    .eq('id', gigId)
    .single()

  console.log('Gig found:', gig, 'error:', gigError)

  if (gigError || !gig) {
    return { error: 'Gig not found.' }
  }

  console.log('Current gig status:', gig.status)

  if (gig.status === 'completed') {
    return { error: 'This job is already marked as completed.' }
  }

  if (gig.status !== 'in_progress') {
    return { error: `Only in progress jobs can be moved to completed. Current status: ${gig.status}` }
  }

  console.log('Updating gig status to completed...')
  const { error } = await supabase
    .from('gigs')
    .update({ status: 'completed' })
    .eq('id', gigId)
    .eq('status', 'in_progress')

  console.log('Update result error:', error)

  if (error) {
    return { error: 'Failed to update gig status: ' + error.message }
  }

  // Verify the update actually happened
  const { data: verifyGig } = await supabase
    .from('gigs')
    .select('status')
    .eq('id', gigId)
    .single()
  
  console.log('Verification - gig status after update:', verifyGig?.status)

  revalidatePath('/freelancer/active-jobs')
  revalidatePath('/freelancer/my-applications')
  revalidatePath('/freelancer/dashboard')
  revalidatePath(`/client/my-jobs/${gigId}`)
  return { success: true }
}

export async function initiateChapaPayment(gigId: string) {
  console.log('=== initiateChapaPayment called ===', gigId)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('User:', user?.id)

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // 1. Get gig and application info
  console.log('Fetching gig with client_id:', user.id)
  
  // First just get the gig by ID
  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, title, budget, client_id, status, payment_status')
    .eq('id', gigId)
    .single()

  console.log('Gig fetched:', gig, 'error:', gigError)

  if (gigError || !gig) {
    console.error('Gig fetch error:', gigError)
    return { error: 'Gig not found' }
  }

  // Now verify this user is the client
  console.log('Gig client_id:', gig.client_id, 'User id:', user.id)
  
  if (gig.client_id !== user.id) {
    console.error('User is not the client of this gig')
    return { error: 'Gig not found or you are not the client' }
  }

  console.log('Gig status:', gig.status)

  if (gig.status === 'completed' && gig.payment_status === 'paid') {
    return { error: 'This gig has already been paid' }
  }

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('freelancer_id, bid_amount')
    .eq('gig_id', gigId)
    .eq('status', 'accepted')
    .single()

  console.log('Application:', application, 'error:', appError)

  if (appError || !application) {
    return { error: 'No accepted freelancer found for this gig' }
  }

  // 2. Prepare transaction data
  const tx_ref = `gig-${gigId.slice(0, 8)}-${uuidv4().slice(0, 8)}`
  const amount = application.bid_amount || gig.budget
  
  // 3. Create pending payment record
  const { error: insertError } = await supabase
    .from('payments')
    .insert({
      gig_id: gigId,
      client_id: user.id,
      freelancer_id: application.freelancer_id,
      amount: amount,
      status: 'pending',
      currency: 'ETB',
      transaction_id: tx_ref,
      payment_method: 'chapa'
    })

  if (insertError) {
    console.error('Payment insert error:', insertError)
    return { error: 'Failed to create payment record' }
  }

  // 4. Initialize Chapa
  const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY
  if (!CHAPA_SECRET_KEY) {
    return { error: 'Payment gateway not configured' }
  }

  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chapa/webhook`
  const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/client/my-jobs/${gigId}/complete`

  const payload = {
    amount: amount, // Chapa expects number, not string
    currency: "ETB",
    email: user.email || 'client@addisgigfind.com',
    first_name: 'Client',
    last_name: 'GigFind',
    tx_ref: tx_ref,
    callback_url: callbackUrl,
    return_url: returnUrl,
    customization: {
      title: `Payment for gig`, // Max 16 chars
      description: `Payment for gig completion`
    }
  }

  try {
    console.log('Sending to Chapa with key:', CHAPA_SECRET_KEY?.slice(0, 10) + '...')
    console.log('Payload:', JSON.stringify(payload, null, 2))
    
    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    console.log('Chapa response:', data)

    if (data.status === 'success' && data.data?.checkout_url) {
      return { checkout_url: data.data.checkout_url }
    } else {
      console.error('Chapa init failed:', data)
      return { error: data.message || 'Payment gateway rejected request' }
    }
  } catch (err) {
    console.error('Chapa init exception:', err)
    return { error: 'Failed to contact payment gateway' }
  }
}
