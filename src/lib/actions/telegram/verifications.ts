'use server'

import { createServiceRoleClient } from '@/lib/supabase/service-role'

export type TelegramVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export type TelegramVerificationSnapshot = {
  status: TelegramVerificationStatus
  document: {
    id: string
    document_type: string
    id_number: string
    status: string
    submitted_at: string | null
    admin_notes: string | null
  } | null
}

export type TelegramPendingVerificationSummary = {
  id: string
  user_id: string
  document_type: string
  id_number: string
  description: string | null
  status: string
  admin_notes: string | null
  submitted_at: string | null
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export async function getTelegramVerificationStatus(
  userId: string
): Promise<TelegramVerificationSnapshot> {
  const supabase = await createServiceRoleClient()

  const [{ data: profile, error: profileError }, { data: document, error: documentError }] =
    await Promise.all([
      supabase.from('profiles').select('verification_status').eq('id', userId).single(),
      supabase
        .from('verification_documents')
        .select('id, document_type, id_number, status, submitted_at, admin_notes')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  if (profileError) {
    throw new Error(profileError.message)
  }

  if (documentError) {
    throw new Error(documentError.message)
  }

  return {
    status: (profile?.verification_status ?? 'unverified') as TelegramVerificationStatus,
    document: document ?? null,
  }
}

export async function listTelegramPendingVerifications() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('verification_documents')
    .select(
      `
        id,
        user_id,
        document_type,
        id_number,
        description,
        status,
        admin_notes,
        submitted_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `
    )
    .eq('status', 'pending')
    .order('submitted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as TelegramPendingVerificationSummary[]
}

export async function getTelegramPendingVerificationDetails(documentId: string) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('verification_documents')
    .select(
      `
        id,
        user_id,
        document_type,
        id_number,
        description,
        status,
        admin_notes,
        submitted_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `
    )
    .eq('id', documentId)
    .eq('status', 'pending')
    .single()

  if (error || !data) {
    return null
  }

  return data as TelegramPendingVerificationSummary
}
