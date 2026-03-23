'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { notifyClientOfNewApplication } from '@/lib/actions/telegram/notifications'
import { telegramLogger } from '@/lib/telegram/logger'

const applicationSchema = z.object({
  gigId: z.string().uuid(),
  coverNote: z.string().min(20, 'Cover note must be at least 20 characters.'),
})

export async function applyForGig(data: { gigId: string; coverNote: string }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to apply.' }
  }

  const validated = applicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: 'Invalid form data.' }
  }

  const { gigId, coverNote } = validated.data

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, verification_status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return { error: profileError?.message ?? 'Unable to verify account status.' }
  }

  if (profile.role !== 'freelancer') {
    return { error: 'Only freelancers can apply for gigs.' }
  }

  if (profile.verification_status !== 'verified') {
    return { error: 'You must be verified to apply for gigs.' }
  }

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('status')
    .eq('id', gigId)
    .single()

  if (gigError || !gig) {
    return { error: gigError?.message ?? 'Gig not found.' }
  }

  if (gig.status !== 'open') {
    return { error: 'This gig is no longer accepting applications.' }
  }

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
    status: 'pending',
  })

  if (error) {
    return { error: error.message }
  }

  void notifyClientOfNewApplication({
    gigId,
    freelancerId: user.id,
    coverNote,
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId, freelancerId: user.id },
      'Telegram application notification dispatch failed'
    )
  })

  revalidatePath(`/client/applicants`)
  return { success: true }
}
