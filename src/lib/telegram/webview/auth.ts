import { createHmac, timingSafeEqual } from 'crypto'

import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { getTelegramWebviewSecret } from '@/lib/telegram/config'
import type { TelegramUserRole } from '@/lib/telegram/types'
import type {
  TelegramWebviewSession,
  TelegramWebviewTokenPayload,
} from '@/lib/telegram/webview/types'

const TELEGRAM_WEBVIEW_TOKEN_TTL_SECONDS = 15 * 60

function getSigningSecret() {
  const secret = getTelegramWebviewSecret()
  if (!secret) {
    throw new Error('Telegram webview secret is not configured.')
  }

  return secret
}

function signTelegramWebviewPayload(encodedPayload: string) {
  return createHmac('sha256', getSigningSecret()).update(encodedPayload).digest('base64url')
}

function encodePayload(payload: TelegramWebviewTokenPayload) {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(encodedPayload: string) {
  const json = Buffer.from(encodedPayload, 'base64url').toString('utf8')
  return JSON.parse(json) as TelegramWebviewTokenPayload
}

export function createTelegramWebviewToken(params: {
  userId: string
  telegramUserId: string
  role: TelegramUserRole
  ttlSeconds?: number
}) {
  const payload: TelegramWebviewTokenPayload = {
    userId: params.userId,
    telegramUserId: params.telegramUserId,
    role: params.role,
    exp: Math.floor(Date.now() / 1000) + (params.ttlSeconds ?? TELEGRAM_WEBVIEW_TOKEN_TTL_SECONDS),
  }

  const encodedPayload = encodePayload(payload)
  const signature = signTelegramWebviewPayload(encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function verifyTelegramWebviewToken(token: string) {
  const [encodedPayload, signature] = token.split('.')
  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = signTelegramWebviewPayload(encodedPayload)
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null
  }

  const payload = decodePayload(encodedPayload)
  if (!payload.userId || !payload.telegramUserId || !payload.role || !payload.exp) {
    return null
  }

  if (payload.exp < Math.floor(Date.now() / 1000)) {
    return null
  }

  return payload
}

export async function resolveTelegramWebviewSession(
  token: string,
  allowedRoles?: TelegramUserRole[]
): Promise<TelegramWebviewSession | null> {
  const payload = verifyTelegramWebviewToken(token)
  if (!payload) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(payload.role)) {
    return null
  }

  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('telegram_accounts')
    .select(
      `
        user_id,
        telegram_user_id,
        is_active,
        profiles (
          id,
          full_name,
          role,
          verification_status
        )
      `
    )
    .eq('user_id', payload.userId)
    .eq('telegram_user_id', payload.telegramUserId)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
  if (!profile || profile.role !== payload.role) {
    return null
  }

  return {
    userId: data.user_id,
    telegramUserId: data.telegram_user_id,
    role: profile.role,
    fullName: profile.full_name ?? null,
    verificationStatus: profile.verification_status ?? null,
  }
}
