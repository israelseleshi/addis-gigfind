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

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function normalizeTelegramPendingVerificationSummary(
  row: Record<string, any>
): TelegramPendingVerificationSummary {
  const profile = unwrapRelation(row.profiles)

  return {
    id: row.id,
    user_id: row.user_id,
    document_type: row.document_type,
    id_number: row.id_number,
    description: row.description ?? null,
    status: row.status,
    admin_notes: row.admin_notes ?? null,
    submitted_at: row.submitted_at ?? null,
    profiles: profile
      ? {
          id: profile.id,
          full_name: profile.full_name ?? null,
          avatar_url: profile.avatar_url ?? null,
        }
      : null,
  }
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

  return (data ?? []).map((row) =>
    normalizeTelegramPendingVerificationSummary(row as Record<string, any>)
  )
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

  return normalizeTelegramPendingVerificationSummary(data as Record<string, any>)
}

export async function approveTelegramVerification(documentId: string) {
  const supabase = await createServiceRoleClient()

  const { data: document, error: documentError } = await supabase
    .from('verification_documents')
    .select(
      `
        id,
        user_id,
        status,
        profiles (
          full_name
        )
      `
    )
    .eq('id', documentId)
    .single()

  if (documentError || !document) {
    return { error: 'Verification request not found.', fullName: null, targetUserId: null, alreadyHandled: false }
  }

  if ((document as { status?: string }).status === 'verified') {
    const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles
    return {
      error: null,
      fullName: profile?.full_name ?? 'This user',
      targetUserId: document.user_id,
      alreadyHandled: true,
    }
  }

  if ((document as { status?: string }).status !== 'pending') {
    return {
      error: 'Only pending verification requests can be approved.',
      fullName: null,
      targetUserId: null,
      alreadyHandled: false,
    }
  }

  const { error: verificationError } = await supabase
    .from('verification_documents')
    .update({ status: 'verified' })
    .eq('id', documentId)

  if (verificationError) {
    return { error: verificationError.message, fullName: null, targetUserId: null, alreadyHandled: false }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'verified' })
    .eq('id', document.user_id)

  if (profileError) {
    return { error: profileError.message, fullName: null, targetUserId: null, alreadyHandled: false }
  }

  const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles
  void notifyUserOfVerificationApproved(document.user_id).catch((notificationError) => {
    telegramLogger.error(
      { error: notificationError, userId: document.user_id },
      'Telegram verification approved notification dispatch failed from bot flow'
    )
  })
  return {
    error: null,
    fullName: profile?.full_name ?? 'This user',
    targetUserId: document.user_id,
    alreadyHandled: false,
  }
}

export async function rejectTelegramVerification(documentId: string, reason: string) {
  const trimmedReason = reason.trim()
  if (trimmedReason.length < 5) {
    return {
      error: 'Rejection reason must be at least 5 characters.',
      fullName: null,
      targetUserId: null,
      alreadyHandled: false,
    }
  }

  const supabase = await createServiceRoleClient()

  const { data: document, error: documentError } = await supabase
    .from('verification_documents')
    .select(
      `
        id,
        user_id,
        status,
        profiles (
          full_name
        )
      `
    )
    .eq('id', documentId)
    .single()

  if (documentError || !document) {
    return { error: 'Verification request not found.', fullName: null, targetUserId: null, alreadyHandled: false }
  }

  if ((document as { status?: string }).status === 'rejected') {
    const profile = Array.isArray(document.profiles) ? document.profiles[0] : document.profiles
    return {
      error: null,
      fullName: profile?.full_name ?? 'This user',
      targetUserId: document.user_id,
      alreadyHandled: true,
    }
  }

  if ((document as { status?: string }).status !== 'pending') {
    return {
      error: 'Only pending verification requests can be rejected.',
      fullName: null,
      targetUserId: null,
      alreadyHandled: false,
    }
  }

  const { error: verificationError } = await supabase
    .from('verification_documents')
    .update({
      status: 'rejected',
      admin_notes: trimmedReason,
    })
    .eq('id', documentId)

  if (verificationError) {
    return { error: verificationError.message, fullName: null, targetUserId: null, alreadyHandled: false }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verification_status: 'rejected' })
    .eq('id', document.user_id)

  if (profileError) {
    return { error: profileError.message, fullName: null, targetUserId: null, alreadyHandled: false }
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
  return {
    error: null,
    fullName: profile?.full_name ?? 'This user',
    targetUserId: document.user_id,
    alreadyHandled: false,
  }
}
