import { randomBytes } from 'crypto'

import { createServiceRoleClient } from '@/lib/supabase/service-role'
import type { TelegramLinkResult } from '@/lib/telegram/types'

const LINK_CODE_LENGTH = 8

function generateLinkCode() {
  return randomBytes(LINK_CODE_LENGTH).toString('hex').slice(0, LINK_CODE_LENGTH).toUpperCase()
}

export async function issueTelegramLinkCodeForUser(userId: string) {
  const supabase = await createServiceRoleClient()
  const code = generateLinkCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  await supabase
    .from('telegram_link_codes')
    .delete()
    .eq('user_id', userId)
    .is('consumed_at', null)

  const { error } = await supabase.from('telegram_link_codes').insert({
    user_id: userId,
    code,
    expires_at: expiresAt,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    code,
    expiresAt,
  }
}

export async function consumeTelegramLinkCode(params: {
  code: string
  telegramUserId: string
  telegramChatId: string
  username?: string
  firstName?: string
  lastName?: string
}): Promise<TelegramLinkResult> {
  const supabase = await createServiceRoleClient()
  const normalizedCode = params.code.trim().toUpperCase()

  const { data: linkCode, error: codeError } = await supabase
    .from('telegram_link_codes')
    .select('id, user_id, expires_at, consumed_at')
    .eq('code', normalizedCode)
    .single()

  if (codeError || !linkCode) {
    return { ok: false, error: 'Invalid link code.' }
  }

  if (linkCode.consumed_at) {
    return { ok: false, error: 'This link code was already used.' }
  }

  if (new Date(linkCode.expires_at).getTime() < Date.now()) {
    return { ok: false, error: 'This link code has expired.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', linkCode.user_id)
    .single()

  if (profileError || !profile) {
    return { ok: false, error: 'Could not resolve the Addis GigFind account.' }
  }

  const { error: upsertError } = await supabase.from('telegram_accounts').upsert(
    {
      user_id: profile.id,
      telegram_user_id: params.telegramUserId,
      telegram_chat_id: params.telegramChatId,
      telegram_username: params.username ?? null,
      telegram_first_name: params.firstName ?? null,
      telegram_last_name: params.lastName ?? null,
      is_active: true,
      linked_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  )

  if (upsertError) {
    return { ok: false, error: upsertError.message }
  }

  const { error: consumeError } = await supabase
    .from('telegram_link_codes')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', linkCode.id)

  if (consumeError) {
    return { ok: false, error: consumeError.message }
  }

  return {
    ok: true,
    userId: profile.id,
    role: profile.role,
    fullName: profile.full_name,
  }
}

export async function getTelegramAccountByTelegramUserId(telegramUserId: string) {
  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from('telegram_accounts')
    .select(`
      user_id,
      telegram_chat_id,
      is_active,
      profiles (
        id,
        full_name,
        role
      )
    `)
    .eq('telegram_user_id', telegramUserId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function getTelegramAccountByUserId(userId: string) {
  const supabase = await createServiceRoleClient()

  const { data, error } = await supabase
    .from('telegram_accounts')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function touchTelegramAccount(telegramUserId: string) {
  const supabase = await createServiceRoleClient()

  await supabase
    .from('telegram_accounts')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('telegram_user_id', telegramUserId)
}
