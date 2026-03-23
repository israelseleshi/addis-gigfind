'use server'

import { createServiceRoleClient } from '@/lib/supabase/service-role'

const TELEGRAM_GIG_PAGE_SIZE = 5

export type TelegramBrowseGig = {
  id: string
  title: string
  category: string
  location: string
  budget: number
  description: string
  created_at: string | null
  client: {
    id: string
    full_name: string | null
    average_rating: number | null
  } | null
}

export async function listTelegramOpenGigs(page: number = 0) {
  const safePage = Math.max(0, page)
  const from = safePage * TELEGRAM_GIG_PAGE_SIZE
  const to = from + TELEGRAM_GIG_PAGE_SIZE - 1

  const supabase = await createServiceRoleClient()
  const { data, error, count } = await supabase
    .from('gigs')
    .select(
      `
        id,
        title,
        category,
        location,
        budget,
        description,
        created_at,
        client:profiles!gigs_client_id_fkey (
          id,
          full_name,
          average_rating
        )
      `,
      { count: 'exact' }
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    gigs: (data ?? []) as TelegramBrowseGig[],
    page: safePage,
    pageSize: TELEGRAM_GIG_PAGE_SIZE,
    total: count ?? 0,
    hasNextPage: typeof count === 'number' ? to + 1 < count : false,
    hasPreviousPage: safePage > 0,
  }
}

export async function getTelegramGigDetails(gigId: string) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('gigs')
    .select(
      `
        id,
        title,
        category,
        location,
        budget,
        description,
        created_at,
        status,
        client:profiles!gigs_client_id_fkey (
          id,
          full_name,
          average_rating
        )
      `
    )
    .eq('id', gigId)
    .eq('status', 'open')
    .single()

  if (error || !data) {
    return null
  }

  return data as TelegramBrowseGig
}
