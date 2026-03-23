'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import {
  notifyClientOfNewApplication,
  notifyFreelancerOfApplicationAccepted,
  notifyFreelancerOfApplicationRejected,
  notifyUserOfGigStatusChanged,
} from '@/lib/actions/telegram/notifications'
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

export async function acceptApplication(applicationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to review applications.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'client') {
    return { error: 'Only clients can accept applications.' }
  }

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id, gig_id, freelancer_id, status')
    .eq('id', applicationId)
    .single()

  if (applicationError || !application) {
    return { error: 'Application not found.' }
  }

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, title, client_id, status')
    .eq('id', application.gig_id)
    .eq('client_id', user.id)
    .single()

  if (gigError || !gig) {
    return { error: 'Gig not found.' }
  }

  if (application.status !== 'pending') {
    return { error: 'Only pending applications can be accepted.' }
  }

  if (gig.status !== 'open') {
    return { error: 'This gig is no longer open for applicant selection.' }
  }

  const { error: acceptError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (acceptError) {
    return { error: acceptError.message }
  }

  const { error: gigUpdateError } = await supabase
    .from('gigs')
    .update({ status: 'assigned' })
    .eq('id', gig.id)

  if (gigUpdateError) {
    return { error: gigUpdateError.message }
  }

  const { error: rejectOthersError } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('gig_id', gig.id)
    .neq('id', applicationId)

  if (rejectOthersError) {
    return { error: rejectOthersError.message }
  }

  void notifyFreelancerOfApplicationAccepted({
    gigId: gig.id,
    freelancerId: application.freelancer_id,
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId: gig.id, freelancerId: application.freelancer_id },
      'Telegram application accepted notification dispatch failed'
    )
  })

  void notifyUserOfGigStatusChanged({
    gigId: gig.id,
    userId: application.freelancer_id,
    status: 'assigned',
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId: gig.id, userId: application.freelancer_id, status: 'assigned' },
      'Telegram gig status notification dispatch failed'
    )
  })

  revalidatePath('/client/applicants')
  revalidatePath(`/client/my-jobs/${gig.id}`)
  revalidatePath(`/client/my-jobs/${gig.id}/applicants`)
  return { success: true }
}

export async function rejectApplication(applicationId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to review applications.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'client') {
    return { error: 'Only clients can reject applications.' }
  }

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id, gig_id, freelancer_id, status')
    .eq('id', applicationId)
    .single()

  if (applicationError || !application) {
    return { error: 'Application not found.' }
  }

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, client_id')
    .eq('id', application.gig_id)
    .eq('client_id', user.id)
    .single()

  if (gigError || !gig) {
    return { error: 'Gig not found.' }
  }

  if (application.status !== 'pending') {
    return { error: 'Only pending applications can be rejected.' }
  }

  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) {
    return { error: error.message }
  }

  void notifyFreelancerOfApplicationRejected({
    gigId: application.gig_id,
    freelancerId: application.freelancer_id,
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId: application.gig_id, freelancerId: application.freelancer_id },
      'Telegram application rejected notification dispatch failed'
    )
  })

  revalidatePath('/client/applicants')
  revalidatePath(`/client/my-jobs/${application.gig_id}/applicants`)
  return { success: true }
}

export async function markGigInProgress(gigId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to update a job.' }
  }

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
    .select('id, status')
    .eq('id', gigId)
    .single()

  if (gigError || !gig) {
    return { error: 'Gig not found.' }
  }

  if (gig.status === 'in_progress') {
    return { error: 'This job is already marked as in progress.' }
  }

  if (gig.status !== 'assigned') {
    return { error: 'Only assigned jobs can be moved to in progress.' }
  }

  const { error } = await supabase
    .from('gigs')
    .update({ status: 'in_progress' })
    .eq('id', gigId)
    .eq('status', 'assigned')

  if (error) {
    return { error: error.message }
  }

  void notifyUserOfGigStatusChanged({
    gigId,
    userId: user.id,
    status: 'in_progress',
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId, userId: user.id, status: 'in_progress' },
      'Telegram gig status notification dispatch failed'
    )
  })

  revalidatePath('/freelancer/active-jobs')
  return { success: true }
}
