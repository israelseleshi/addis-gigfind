'use server'

import { z } from 'zod'

import { notifyClientOfNewApplication } from '@/lib/actions/telegram/notifications'
import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { telegramLogger } from '@/lib/telegram/logger'

const TELEGRAM_APPLICATION_PAGE_SIZE = 5

const telegramApplicationSchema = z.object({
  gigId: z.string().uuid(),
  freelancerId: z.string().uuid(),
  coverNote: z.string().min(20, 'Cover note must be at least 20 characters.'),
})

export type TelegramApplicationSummary = {
  id: string
  status: string | null
  cover_note: string | null
  created_at: string | null
  gig: {
    id: string
    title: string
    budget: number
    location: string
    category: string
    status: string | null
    client: {
      id: string
      full_name: string | null
      average_rating: number | null
    } | null
  } | null
}

export type TelegramActiveJobSummary = {
  id: string
  status: string | null
  created_at: string | null
  gig: {
    id: string
    title: string
    description: string
    budget: number
    location: string
    category: string
    status: string | null
    client_id: string
    client: {
      id: string
      full_name: string | null
      average_rating: number | null
    } | null
  } | null
}

export type TelegramGigApplicantSummary = {
  id: string
  status: string | null
  cover_note: string | null
  bid_amount: number | null
  created_at: string | null
  freelancer: {
    id: string
    full_name: string | null
    average_rating: number | null
    reviews_count: number | null
    phone_number: string | null
  } | null
}

export async function applyForGigFromTelegram(data: {
  gigId: string
  freelancerId: string
  coverNote: string
}) {
  const validated = telegramApplicationSchema.safeParse(data)
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? 'Invalid application data.' }
  }

  const { gigId, freelancerId, coverNote } = validated.data
  const supabase = await createServiceRoleClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, verification_status')
    .eq('id', freelancerId)
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
    .select('status, client_id')
    .eq('id', gigId)
    .single()

  if (gigError || !gig) {
    return { error: gigError?.message ?? 'Gig not found.' }
  }

  if (gig.status !== 'open') {
    return { error: 'This gig is no longer accepting applications.' }
  }

  if (gig.client_id === freelancerId) {
    return { error: 'You cannot apply to your own gig.' }
  }

  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('gig_id', gigId)
    .eq('freelancer_id', freelancerId)
    .single()

  if (existingApplication) {
    return { error: 'You have already applied for this gig.' }
  }

  const { count: activeApplications } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('freelancer_id', freelancerId)
    .eq('status', 'pending')

  if (activeApplications !== null && activeApplications >= 5) {
    return { error: 'You cannot have more than 5 active applications.' }
  }

  const { error } = await supabase.from('applications').insert({
    gig_id: gigId,
    freelancer_id: freelancerId,
    cover_note: coverNote,
    status: 'pending',
  })

  if (error) {
    return { error: error.message }
  }

  void notifyClientOfNewApplication({
    gigId,
    freelancerId,
    coverNote,
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId, freelancerId },
      'Telegram application notification dispatch failed from bot flow'
    )
  })

  return { success: true as const }
}

export async function listTelegramApplicationsForFreelancer(
  freelancerId: string,
  page: number = 0
) {
  const safePage = Math.max(0, page)
  const from = safePage * TELEGRAM_APPLICATION_PAGE_SIZE
  const to = from + TELEGRAM_APPLICATION_PAGE_SIZE - 1

  const supabase = await createServiceRoleClient()
  const { data, error, count } = await supabase
    .from('applications')
    .select(
      `
        id,
        status,
        cover_note,
        created_at,
        gig:gigs (
          id,
          title,
          budget,
          location,
          category,
          status,
          client:profiles!gigs_client_id_fkey (
            id,
            full_name,
            average_rating
          )
        )
      `,
      { count: 'exact' }
    )
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    applications: (data ?? []) as TelegramApplicationSummary[],
    page: safePage,
    total: count ?? 0,
    hasNextPage: typeof count === 'number' ? to + 1 < count : false,
    hasPreviousPage: safePage > 0,
  }
}

export async function getTelegramApplicationDetails(
  freelancerId: string,
  applicationId: string
) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
        id,
        status,
        cover_note,
        created_at,
        gig:gigs (
          id,
          title,
          description,
          budget,
          location,
          category,
          status,
          client:profiles!gigs_client_id_fkey (
            id,
            full_name,
            average_rating
          )
        )
      `
    )
    .eq('id', applicationId)
    .eq('freelancer_id', freelancerId)
    .single()

  if (error || !data) {
    return null
  }

  return data as TelegramApplicationSummary & {
    gig: TelegramApplicationSummary['gig'] & {
      description: string
    }
  }
}

export async function listTelegramActiveJobsForFreelancer(
  freelancerId: string,
  page: number = 0
) {
  const safePage = Math.max(0, page)

  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
        id,
        status,
        created_at,
        gig:gigs (
          id,
          title,
          description,
          budget,
          location,
          category,
          status,
          client_id,
          client:profiles!gigs_client_id_fkey (
            id,
            full_name,
            average_rating
          )
        )
      `
    )
    .eq('freelancer_id', freelancerId)
    .eq('status', 'accepted')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const activeJobs = ((data ?? []) as TelegramActiveJobSummary[]).filter((job) =>
    ['assigned', 'in_progress'].includes(job.gig?.status ?? '')
  )
  const total = activeJobs.length
  const from = safePage * TELEGRAM_APPLICATION_PAGE_SIZE
  const to = from + TELEGRAM_APPLICATION_PAGE_SIZE

  return {
    jobs: activeJobs.slice(from, to),
    page: safePage,
    total,
    hasNextPage: to < total,
    hasPreviousPage: safePage > 0,
  }
}

export async function getTelegramActiveJobDetails(
  freelancerId: string,
  applicationId: string
) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('applications')
    .select(
      `
        id,
        status,
        created_at,
        gig:gigs (
          id,
          title,
          description,
          budget,
          location,
          category,
          status,
          client_id,
          client:profiles!gigs_client_id_fkey (
            id,
            full_name,
            average_rating
          )
        )
      `
    )
    .eq('id', applicationId)
    .eq('freelancer_id', freelancerId)
    .eq('status', 'accepted')
    .single()

  if (error || !data) {
    return null
  }

  const job = data as TelegramActiveJobSummary
  if (!job.gig || !['assigned', 'in_progress'].includes(job.gig.status ?? '')) {
    return null
  }

  return job
}

export async function markTelegramActiveJobInProgress(
  freelancerId: string,
  applicationId: string
) {
  const job = await getTelegramActiveJobDetails(freelancerId, applicationId)
  if (!job || !job.gig) {
    return { error: 'That active job could not be found.', gigTitle: null }
  }

  if (job.gig.status === 'in_progress') {
    return { error: 'This job is already marked as in progress.', gigTitle: null }
  }

  if (job.gig.status !== 'assigned') {
    return { error: 'Only assigned jobs can be moved to in progress.', gigTitle: null }
  }

  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from('gigs')
    .update({ status: 'in_progress' })
    .eq('id', job.gig.id)
    .eq('status', 'assigned')

  if (error) {
    return { error: error.message, gigTitle: null }
  }

  return { error: null, gigTitle: job.gig.title }
}

export async function listTelegramGigApplicants(clientId: string, gigId: string) {
  const supabase = await createServiceRoleClient()

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, title, budget, status')
    .eq('id', gigId)
    .eq('client_id', clientId)
    .single()

  if (gigError || !gig) {
    return null
  }

  const { data: applicants, error: applicantsError } = await supabase
    .from('applications')
    .select(
      `
        id,
        status,
        cover_note,
        bid_amount,
        created_at,
        freelancer:profiles!applications_freelancer_id_fkey (
          id,
          full_name,
          average_rating,
          reviews_count,
          phone_number
        )
      `
    )
    .eq('gig_id', gigId)
    .order('created_at', { ascending: false })

  if (applicantsError) {
    throw new Error(applicantsError.message)
  }

  return {
    gig,
    applicants: (applicants ?? []) as TelegramGigApplicantSummary[],
  }
}

export async function getTelegramGigApplicantDetails(
  clientId: string,
  gigId: string,
  applicationId: string
) {
  const result = await listTelegramGigApplicants(clientId, gigId)
  if (!result) {
    return null
  }

  const applicant = result.applicants.find((item) => item.id === applicationId) ?? null
  if (!applicant) {
    return null
  }

  return {
    gig: result.gig,
    applicant,
  }
}

export async function acceptTelegramGigApplication(
  clientId: string,
  gigId: string,
  applicationId: string
) {
  const supabase = await createServiceRoleClient()

  const { data: gig, error: gigError } = await supabase
    .from('gigs')
    .select('id, title, status')
    .eq('id', gigId)
    .eq('client_id', clientId)
    .single()

  if (gigError || !gig) {
    return { error: 'Gig not found.', gigTitle: null, freelancerName: null }
  }

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select(
      `
        id,
        status,
        freelancer:profiles!applications_freelancer_id_fkey (
          id,
          full_name
        )
      `
    )
    .eq('id', applicationId)
    .eq('gig_id', gigId)
    .single()

  if (applicationError || !application) {
    return { error: 'Application not found.', gigTitle: null, freelancerName: null }
  }

  if (application.status !== 'pending') {
    return {
      error: 'Only pending applications can be accepted.',
      gigTitle: null,
      freelancerName: null,
    }
  }

  if (gig.status !== 'open') {
    return {
      error: 'This gig is no longer open for applicant selection.',
      gigTitle: null,
      freelancerName: null,
    }
  }

  const { error: acceptError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (acceptError) {
    return { error: acceptError.message, gigTitle: null, freelancerName: null }
  }

  const { error: gigUpdateError } = await supabase
    .from('gigs')
    .update({ status: 'assigned' })
    .eq('id', gigId)

  if (gigUpdateError) {
    return { error: gigUpdateError.message, gigTitle: null, freelancerName: null }
  }

  const { error: rejectOthersError } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('gig_id', gigId)
    .neq('id', applicationId)

  if (rejectOthersError) {
    return { error: rejectOthersError.message, gigTitle: null, freelancerName: null }
  }

  return {
    error: null,
    gigTitle: gig.title,
    freelancerName: application.freelancer?.full_name ?? 'Selected freelancer',
  }
}

export async function rejectTelegramGigApplication(
  clientId: string,
  gigId: string,
  applicationId: string
) {
  const details = await getTelegramGigApplicantDetails(clientId, gigId, applicationId)
  if (!details) {
    return { error: 'Application not found.', gigTitle: null, freelancerName: null }
  }

  if (details.applicant.status !== 'pending') {
    return {
      error: 'Only pending applications can be rejected.',
      gigTitle: null,
      freelancerName: null,
    }
  }

  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) {
    return { error: error.message, gigTitle: null, freelancerName: null }
  }

  return {
    error: null,
    gigTitle: details.gig.title,
    freelancerName: details.applicant.freelancer?.full_name ?? 'That freelancer',
  }
}
