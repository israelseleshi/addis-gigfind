'use server'

import { z } from 'zod'

import { createServiceRoleClient } from '@/lib/supabase/service-role'

const TELEGRAM_GIG_PAGE_SIZE = 5

const telegramPostGigSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  category: z.string().min(1, 'Choose a category.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  budget: z.number().int().positive('Budget must be greater than 0.'),
  location: z.string().min(1, 'Choose a location.'),
})

export type TelegramGigBrowseFilters = {
  category?: string | null
  location?: string | null
}

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

export type TelegramClientGigSummary = {
  id: string
  title: string
  category: string
  location: string
  budget: number
  description: string
  status: string | null
  created_at: string | null
  applications: { count: number }[] | null
}

export type TelegramPostGigInput = z.infer<typeof telegramPostGigSchema>

export type TelegramGigFilterOptions = {
  categories: string[]
  locations: string[]
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

function normalizeTelegramBrowseGig(row: Record<string, unknown>): TelegramBrowseGig {
  const client = unwrapRelation(row.client) as Record<string, unknown> | null

  return {
    id: readString(row.id),
    title: readString(row.title),
    category: readString(row.category),
    location: readString(row.location),
    budget: readNumber(row.budget),
    description: readString(row.description),
    created_at: readNullableString(row.created_at),
    client: client
      ? {
          id: readString(client.id),
          full_name: readNullableString(client.full_name),
          average_rating: readNullableNumber(client.average_rating),
        }
      : null,
  }
}

function normalizeTelegramClientGigSummary(row: Record<string, unknown>): TelegramClientGigSummary {
  return {
    id: readString(row.id),
    title: readString(row.title),
    category: readString(row.category),
    location: readString(row.location),
    budget: readNumber(row.budget),
    description: readString(row.description),
    status: readNullableString(row.status),
    created_at: readNullableString(row.created_at),
    applications: Array.isArray(row.applications) ? row.applications : null,
  }
}

function buildUniqueTelegramValues(values: string[], limit: number) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = value.trim()
    if (!normalized) {
      continue
    }

    const key = normalized.toLowerCase()
    if (seen.has(key)) {
      continue
    }

    seen.add(key)
    result.push(normalized)

    if (result.length >= limit) {
      break
    }
  }

  return result
}

export async function listTelegramOpenGigs(
  page: number = 0,
  filters: TelegramGigBrowseFilters = {}
) {
  const safePage = Math.max(0, page)
  const from = safePage * TELEGRAM_GIG_PAGE_SIZE
  const to = from + TELEGRAM_GIG_PAGE_SIZE - 1

  const supabase = await createServiceRoleClient()
  let query = supabase
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

  const normalizedCategory = filters.category?.trim()
  const normalizedLocation = filters.location?.trim()

  if (normalizedCategory) {
    query = query.ilike('category', `%${normalizedCategory}%`)
  }

  if (normalizedLocation) {
    query = query.ilike('location', `%${normalizedLocation}%`)
  }

  const { data, error, count } = await query.range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  const mappedGigs = (data ?? []).map((g: any) => {
    const rawClient = Array.isArray(g.client) ? g.client[0] ?? null : g.client ?? null
    const client = rawClient
      ? {
          ...rawClient,
        }
      : null

    return {
      id: g.id,
      title: g.title,
      category: g.category,
      location: g.location,
      budget: g.budget,
      description: g.description,
      created_at: g.created_at,
      client,
    } as TelegramBrowseGig
  })

  return {
    gigs: (data ?? []).map((row) =>
      normalizeTelegramBrowseGig(row as Record<string, unknown>)
    ),
    page: safePage,
    pageSize: TELEGRAM_GIG_PAGE_SIZE,
    total: count ?? 0,
    hasNextPage: typeof count === 'number' ? to + 1 < count : false,
    hasPreviousPage: safePage > 0,
    filters: {
      category: normalizedCategory ?? null,
      location: normalizedLocation ?? null,
    },
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

  return normalizeTelegramBrowseGig(data as Record<string, unknown>)
}

export async function listTelegramGigFilterOptions(): Promise<TelegramGigFilterOptions> {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('gigs')
    .select('category, location')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw new Error(error.message)
  }

  const categories = buildUniqueTelegramValues(
    (data ?? []).map((row) => readString((row as Record<string, unknown>).category)),
    8
  )
  const locations = buildUniqueTelegramValues(
    (data ?? []).map((row) => readString((row as Record<string, unknown>).location)),
    8
  )

  return { categories, locations }
}

export async function listTelegramClientGigs(clientId: string, page: number = 0) {
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
        status,
        created_at,
        applications(count)
      `,
      { count: 'exact' }
    )
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    throw new Error(error.message)
  }

  return {
    gigs: (data ?? []).map((row) =>
      normalizeTelegramClientGigSummary(row as Record<string, unknown>)
    ),
    page: safePage,
    pageSize: TELEGRAM_GIG_PAGE_SIZE,
    total: count ?? 0,
    hasNextPage: typeof count === 'number' ? to + 1 < count : false,
    hasPreviousPage: safePage > 0,
  }
}

export async function getTelegramClientGigDetails(clientId: string, gigId: string) {
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
        status,
        created_at,
        applications(count)
      `
    )
    .eq('id', gigId)
    .eq('client_id', clientId)
    .single()

  if (error || !data) {
    return null
  }

  return normalizeTelegramClientGigSummary(data as Record<string, unknown>)
}

export async function createTelegramGig(input: TelegramPostGigInput) {
  const validated = telegramPostGigSchema.safeParse(input)
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? 'Invalid gig data.' }
  }

  const supabase = await createServiceRoleClient()

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', validated.data.clientId)
    .single()

  if (profileError || !profile) {
    return { error: profileError?.message ?? 'Unable to verify client account.' }
  }

  if (profile.role !== 'client') {
    return { error: 'Only clients can post gigs.' }
  }

  const { data, error } = await supabase
    .from('gigs')
    .insert({
      title: validated.data.title,
      category: validated.data.category,
      description: validated.data.description,
      budget: validated.data.budget,
      location: validated.data.location,
      client_id: validated.data.clientId,
      status: 'open',
    })
    .select('id, title')
    .single()

  if (error || !data) {
    return { error: error?.message ?? 'Unable to create gig.' }
  }

  return {
    error: null,
    gigId: readString((data as Record<string, unknown>).id),
    title: readString((data as Record<string, unknown>).title),
  }
}
