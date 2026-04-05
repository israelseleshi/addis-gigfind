'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { v4 as uuidv4 } from 'uuid'

export async function markGigComplete(gigId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
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

  if (applicationError || !application) {
    return { error: 'Active job not found.' }
  }

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, status, client_id')
    .eq('id', gigId)
    .single()

  if (gigError || !gig) {
    return { error: 'Gig not found.' }
  }

  if (gig.status === 'completed') {
    return { error: 'This job is already marked as completed.' }
  }

  if (gig.status !== 'in_progress') {
    return { error: 'Only in progress jobs can be moved to completed.' }
  }

  const { error } = await supabase
    .from('gigs')
    .update({ status: 'completed' })
    .eq('id', gigId)
    .eq('status', 'in_progress')

  if (error) {
    return { error: 'Failed to update gig status.' }
  }

  revalidatePath('/freelancer/active-jobs')
  revalidatePath('/freelancer/my-applications')
  revalidatePath('/freelancer/dashboard')
  revalidatePath(`/client/my-jobs/${gigId}`)
  return { success: true }
}

export async function initiateChapaPayment(gigId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // 1. Get gig and application info
  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('*, client:client_profiles(*)')
    .eq('id', gigId)
    .eq('client_id', user.id)
    .single()

  if (gigError || !gig) {
    return { error: 'Gig not found or you are not the client' }
  }

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('freelancer_id, bid_amount')
    .eq('gig_id', gigId)
    .eq('status', 'accepted')
    .single()

  if (appError || !application) {
    return { error: 'No accepted freelancer found for this gig' }
  }

  // 2. Prepare transaction data
  const tx_ref = `tx-${gigId.slice(0, 8)}-${uuidv4().slice(0, 8)}`
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
    amount: amount.toString(),
    currency: "ETB",
    email: user.email || 'client@addisgigfind.com',
    first_name: gig.client?.company_name || 'Client',
    last_name: "GigFind",
    tx_ref: tx_ref,
    callback_url: callbackUrl,
    return_url: returnUrl,
    customization: {
      title: `Payment for ${gig.title}`,
      description: `Payment for gig completion`
    }
  }

  try {
    const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (data.status === 'success' && data.data?.checkout_url) {
      return { checkout_url: data.data.checkout_url }
    } else {
      console.error('Chapa init failed:', data)
      return { error: 'Payment gateway rejected request' }
    }
  } catch (err) {
    console.error('Chapa init exception:', err)
    return { error: 'Failed to contact payment gateway' }
  }
}
