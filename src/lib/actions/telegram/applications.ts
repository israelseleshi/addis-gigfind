'use server'

import { z } from 'zod'

import {
  notifyClientOfNewApplication,
  notifyFreelancerOfApplicationAccepted,
  notifyFreelancerOfApplicationRejected,
  notifyUserOfGigStatusChanged,
} from '@/lib/actions/telegram/notifications'
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

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function readNullableString(value: unknown) {
  return typeof value === 'string' ? value : null
}

function readNumber(value: unknown) {
  return typeof value === 'number' ? value : 0
}

function readNullableNumber(value: unknown) {
  return typeof value === 'number' ? value : null
}

function normalizeTelegramApplicationSummary(
  row: Record<string, unknown>
): TelegramApplicationSummary {
  const gig = unwrapRelation(row.gig) as Record<string, unknown> | null
  const client = unwrapRelation(gig?.client) as Record<string, unknown> | null

  return {
    id: readString(row.id),
    status: readNullableString(row.status),
    cover_note: readNullableString(row.cover_note),
    created_at: readNullableString(row.created_at),
    gig: gig
      ? {
          id: readString(gig.id),
          title: readString(gig.title),
          budget: readNumber(gig.budget),
          location: readString(gig.location),
          category: readString(gig.category),
          status: readNullableString(gig.status),
          client: client
            ? {
                id: readString(client.id),
                full_name: readNullableString(client.full_name),
                average_rating: readNullableNumber(client.average_rating),
              }
            : null,
        }
      : null,
  }
}

function normalizeTelegramActiveJobSummary(row: Record<string, unknown>): TelegramActiveJobSummary {
  const gig = unwrapRelation(row.gig) as Record<string, unknown> | null
  const client = unwrapRelation(gig?.client) as Record<string, unknown> | null

  return {
    id: readString(row.id),
    status: readNullableString(row.status),
    created_at: readNullableString(row.created_at),
    gig: gig
      ? {
          id: readString(gig.id),
          title: readString(gig.title),
          description: readString(gig.description),
          budget: readNumber(gig.budget),
          location: readString(gig.location),
          category: readString(gig.category),
          status: readNullableString(gig.status),
          client_id: readString(gig.client_id),
          client: client
            ? {
                id: readString(client.id),
                full_name: readNullableString(client.full_name),
                average_rating: readNullableNumber(client.average_rating),
              }
            : null,
        }
      : null,
  }
}

function normalizeTelegramGigApplicantSummary(row: Record<string, unknown>): TelegramGigApplicantSummary {
  const freelancer = unwrapRelation(row.freelancer) as Record<string, unknown> | null

  return {
    id: readString(row.id),
    status: readNullableString(row.status),
    cover_note: readNullableString(row.cover_note),
    bid_amount: readNullableNumber(row.bid_amount),
    created_at: readNullableString(row.created_at),
    freelancer: freelancer
      ? {
          id: readString(freelancer.id),
          full_name: readNullableString(freelancer.full_name),
          average_rating: readNullableNumber(freelancer.average_rating),
          reviews_count: readNullableNumber(freelancer.reviews_count),
          phone_number: readNullableString(freelancer.phone_number),
        }
      : null,
  }
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

  const applications = (data ?? []).map((app: any) => {
    const rawGig = Array.isArray(app.gig) ? app.gig[0] ?? null : app.gig ?? null
    const gig = rawGig
      ? {
          ...rawGig,
          client: Array.isArray(rawGig.client)
            ? rawGig.client[0] ?? null
            : rawGig.client,
        }
      : null

    return {
      id: app.id,
      status: app.status,
      cover_note: app.cover_note,
      created_at: app.created_at,
      gig,
    } as TelegramApplicationSummary
  })

  return {
    applications: (data ?? []).map((row) =>
      normalizeTelegramApplicationSummary(row as Record<string, unknown>)
    ),
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

  const application = normalizeTelegramApplicationSummary(data as Record<string, unknown>)
  const gig = unwrapRelation((data as Record<string, unknown>).gig) as Record<string, unknown> | null

  if (!application.gig || !gig?.description) {
    return null
  }

  return {
    ...application,
    gig: {
      ...application.gig,
      description: readString(gig.description),
    },
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

  const activeJobs = (data ?? []).map((row) =>
    normalizeTelegramActiveJobSummary(row as Record<string, unknown>)
  ).filter((job) =>
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

  const job = normalizeTelegramActiveJobSummary(data as Record<string, unknown>)
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
    return { error: 'That active job could not be found.', gigTitle: null, alreadyHandled: false }
  }

  if (job.gig.status === 'in_progress') {
    return { error: null, gigTitle: job.gig.title, alreadyHandled: true }
  }

  if (job.gig.status !== 'assigned') {
    return { error: 'Only assigned jobs can be moved to in progress.', gigTitle: null, alreadyHandled: false }
  }

  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from('gigs')
    .update({ status: 'in_progress' })
    .eq('id', job.gig.id)
    .eq('status', 'assigned')

  if (error) {
    return { error: error.message, gigTitle: null, alreadyHandled: false }
  }

  void notifyUserOfGigStatusChanged({
    gigId: job.gig.id,
    userId: freelancerId,
    status: 'in_progress',
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId: job.gig?.id, userId: freelancerId, status: 'in_progress' },
      'Telegram gig status notification dispatch failed from bot flow'
    )
  })

  void notifyUserOfGigStatusChanged({
    gigId: job.gig.id,
    userId: job.gig.client_id,
    status: 'in_progress',
  }).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, gigId: job.gig?.id, userId: job.gig?.client_id, status: 'in_progress' },
      'Telegram client gig status notification dispatch failed from bot flow'
    )
  })

  return { error: null, gigTitle: job.gig.title, alreadyHandled: false }
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

  const mappedApplicants = (applicants ?? []).map((app: any) => {
    const rawFreelancer = Array.isArray(app.freelancer) ? app.freelancer[0] ?? null : app.freelancer ?? null
    const freelancer = rawFreelancer
      ? {
          ...rawFreelancer,
        }
      : null

    return {
      id: app.id,
      status: app.status,
      cover_note: app.cover_note,
      bid_amount: app.bid_amount,
      created_at: app.created_at,
      freelancer,
    } as TelegramGigApplicantSummary
  })

  return {
    gig,
    applicants: (applicants ?? []).map((row) =>
      normalizeTelegramGigApplicantSummary(row as Record<string, unknown>)
    ),
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
    return { error: 'Gig not found.', gigTitle: null, freelancerName: null, alreadyHandled: false }
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
    return { error: 'Application not found.', gigTitle: null, freelancerName: null, alreadyHandled: false }
  }

  const selectedFreelancer = Array.isArray(application.freelancer)
    ? application.freelancer[0]
    : application.freelancer

  if (application.status === 'accepted') {
    return {
      error: null,
      gigTitle: gig.title,
      freelancerName: selectedFreelancer?.full_name ?? 'Selected freelancer',
      alreadyHandled: true,
    }
  }

  if (application.status !== 'pending') {
    return {
      error: 'Only pending applications can be accepted.',
      gigTitle: null,
      freelancerName: null,
      alreadyHandled: false,
    }
  }

  if (gig.status === 'assigned' || gig.status === 'in_progress' || gig.status === 'completed') {
    return {
      error: 'This gig has already been assigned.',
      gigTitle: null,
      freelancerName: null,
      alreadyHandled: false,
    }
  }

  if (gig.status !== 'open') {
    return {
      error: 'This gig is no longer open for applicant selection.',
      gigTitle: null,
      freelancerName: null,
      alreadyHandled: false,
    }
  }

  const { error: acceptError } = await supabase
    .from('applications')
    .update({ status: 'accepted' })
    .eq('id', applicationId)

  if (acceptError) {
    return { error: acceptError.message, gigTitle: null, freelancerName: null, alreadyHandled: false }
  }

  const { error: gigUpdateError } = await supabase
    .from('gigs')
    .update({ status: 'assigned' })
    .eq('id', gigId)

  if (gigUpdateError) {
    return { error: gigUpdateError.message, gigTitle: null, freelancerName: null, alreadyHandled: false }
  }

  const { error: rejectOthersError } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('gig_id', gigId)
    .neq('id', applicationId)

  if (rejectOthersError) {
    return { error: rejectOthersError.message, gigTitle: null, freelancerName: null, alreadyHandled: false }
  }

  if (selectedFreelancer?.id) {
    void notifyFreelancerOfApplicationAccepted({
      gigId,
      freelancerId: selectedFreelancer.id,
    }).catch((notificationError) => {
      telegramLogger.error(
        { error: notificationError, gigId, freelancerId: selectedFreelancer.id },
        'Telegram application accepted notification dispatch failed from bot flow'
      )
    })

    void notifyUserOfGigStatusChanged({
      gigId,
      userId: selectedFreelancer.id,
      status: 'assigned',
    }).catch((notificationError) => {
      telegramLogger.error(
        { error: notificationError, gigId, userId: selectedFreelancer.id, status: 'assigned' },
        'Telegram gig status notification dispatch failed from bot flow'
      )
    })
  }

  return {
    error: null,
    gigTitle: gig.title,
    freelancerName: selectedFreelancer?.full_name ?? 'Selected freelancer',
    alreadyHandled: false,
  }
}

export async function rejectTelegramGigApplication(
  clientId: string,
  gigId: string,
  applicationId: string
) {
  const details = await getTelegramGigApplicantDetails(clientId, gigId, applicationId)
  if (!details) {
    return { error: 'Application not found.', gigTitle: null, freelancerName: null, alreadyHandled: false }
  }

  if (details.applicant.status === 'rejected') {
    return {
      error: null,
      gigTitle: details.gig.title,
      freelancerName: details.applicant.freelancer?.full_name ?? 'That freelancer',
      alreadyHandled: true,
    }
  }

  if (details.applicant.status !== 'pending') {
    return {
      error: 'Only pending applications can be rejected.',
      gigTitle: null,
      freelancerName: null,
      alreadyHandled: false,
    }
  }

  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', applicationId)

  if (error) {
    return { error: error.message, gigTitle: null, freelancerName: null, alreadyHandled: false }
  }

  if (details.applicant.freelancer?.id) {
    void notifyFreelancerOfApplicationRejected({
      gigId,
      freelancerId: details.applicant.freelancer.id,
    }).catch((notificationError) => {
      telegramLogger.error(
        { error: notificationError, gigId, freelancerId: details.applicant.freelancer?.id },
        'Telegram application rejected notification dispatch failed from bot flow'
      )
    })
  }

  return {
    error: null,
    gigTitle: details.gig.title,
    freelancerName: details.applicant.freelancer?.full_name ?? 'That freelancer',
    alreadyHandled: false,
  }
}
