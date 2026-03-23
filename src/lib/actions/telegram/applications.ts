'use server'

import { z } from 'zod'

import { createServiceRoleClient } from '@/lib/supabase/service-role'

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
