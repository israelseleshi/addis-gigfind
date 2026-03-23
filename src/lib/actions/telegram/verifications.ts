'use server'

import { createServiceRoleClient } from '@/lib/supabase/service-role'
import {
  notifyUserOfVerificationApproved,
  notifyUserOfVerificationRejected,
} from '@/lib/actions/telegram/notifications'
import { telegramLogger } from '@/lib/telegram/logger'

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

export async function approveTelegramVerification(documentId: string) {
  const supabase = await createServiceRoleClient()

  const { data: document, error: documentError } = await supabase
    .from('verification_documents')
    .select(
      `
        id,
        user_id,
        profiles (
          full_name
        )
      `
    )
    .eq('id', documentId)
    .eq('status', 'pending')
    .single()

  if (documentError || !document) {
    return { error: 'Verification request not found.', fullName: null }
  }

  const { error: verificationError } = await supabase
    .from('verification_documents')
    .update({ status: 'verified' })
    .eq('id', documentId)

  if (verificationError) {
    return { error: verificationError.message, fullName: null }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', document.user_id)

  if (profileError) {
    return { error: profileError.message, fullName: null }
  }

  const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles
  void notifyUserOfVerificationApproved(document.user_id).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, userId: document.user_id },
      'Telegram verification approved notification dispatch failed from bot flow'
    )
  })
  return { error: null, fullName: profile?.full_name ?? 'This user' }
}

export async function rejectTelegramVerification(documentId: string, reason: string) {
  const trimmedReason = reason.trim()
  if (trimmedReason.length < 5) {
    return { error: 'Rejection reason must be at least 5 characters.', fullName: null }
  }

  const supabase = await createServiceRoleClient()

  const { data: document, error: documentError } = await supabase
    .from('verification_documents')
    .select(
      `
        id,
        user_id,
        profiles (
          full_name
        )
      `
    )
    .eq('id', documentId)
    .eq('status', 'pending')
    .single()

  if (documentError || !document) {
    return { error: 'Verification request not found.', fullName: null }
  }

  const { error: verificationError } = await supabase
    .from('verification_documents')
    .update({
      status: 'rejected',
      admin_notes: trimmedReason,
    })
    .eq('id', documentId)

  if (verificationError) {
    return { error: verificationError.message, fullName: null }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'rejected' })
    .eq('id', document.user_id)

  if (profileError) {
    return { error: profileError.message, fullName: null }
  }

  const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles
  void notifyUserOfVerificationRejected(document.user_id, trimmedReason).catch(
    (notificationError) => {
      telegramLogger.error(
        { error: notificationError, userId: document.user_id },
        'Telegram verification rejected notification dispatch failed from bot flow'
      )
    }
  )
  return { error: null, fullName: profile?.full_name ?? 'This user' }
}
