'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

const applicationSchema = z.object({
  gigId: z.string().uuid(),
  coverNote: z.string().min(20, 'Cover note must be at least 20 characters.'),
  bidAmount: z.coerce.number().positive('Bid amount must be a positive number.'),
})

export async function applyForGig(data: { gigId: string; coverNote: string; bidAmount: number }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to apply.' }
  }

  const validated = applicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid form data.' }
  }

  const { gigId, coverNote, bidAmount } = validated.data

  // Security Check 1: Check if already applied
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('gig_id', gigId)
    .eq('freelancer_id', user.id)
    .single()

  if (existingApplication) {
    return { error: 'You have already applied for this gig.' }
  }

  // Security Check 2: Check for max active applications
  const { count: activeApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', user.id)
    .eq('status', 'pending')

  if (activeApplications !== null && activeApplications >= 5) {
    return { error: 'You cannot have more than 5 active applications.' }
  }

  // Insert new application
  const { error } = await supabase.from('applications').insert({
    gig_id: gigId,
    freelancer_id: user.id,
    cover_note: coverNote,
    bid_amount: bidAmount,
    status: 'pending',
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/client/applicants`)
  return { success: true }
}
