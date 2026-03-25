import { getTelegramAccountByTelegramUserId } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { buildLinkInstructions } from '@/lib/telegram/messages'
import type { TelegramLinkedAccount, TelegramLinkedProfile, TelegramUserRole } from '@/lib/telegram/types'

type ResolvedTelegramAccount = {
  telegramUserId: string
  account: TelegramLinkedAccount | null
  profile: TelegramLinkedProfile | null
  role: TelegramUserRole | null
}

type RequiredResolvedTelegramAccount = {
  telegramUserId: string
  account: TelegramLinkedAccount
  profile: TelegramLinkedProfile
  role: TelegramUserRole | null
}

function normalizeProfile(
  account: TelegramLinkedAccount | null
): TelegramLinkedProfile | null {
  if (!account?.profiles) {
    return null
  }

  return Array.isArray(account.profiles) ? account.profiles[0] ?? null : account.profiles
}

export async function resolveLinkedTelegramAccount(ctx: TelegramBotContext) {
  const telegramUserId = String(ctx.from?.id ?? '')
  if (!telegramUserId) {
    return {
      telegramUserId: '',
      account: null,
      profile: null,
      role: null,
    }
  }

  const account = await getTelegramAccountByTelegramUserId(telegramUserId)
  const profile = normalizeProfile(account)

  return {
    telegramUserId,
    account,
    profile,
    role: profile?.role ?? null,
  } satisfies ResolvedTelegramAccount
}

export async function requireLinkedTelegramAccount(ctx: TelegramBotContext) {
  const resolved = await resolveLinkedTelegramAccount(ctx)
  if (!resolved.account || !resolved.profile) {
    await ctx.reply(buildLinkInstructions(), { parse_mode: 'HTML' })
    return null
  }

  return resolved as RequiredResolvedTelegramAccount
}

export async function requireTelegramRole(
  ctx: TelegramBotContext,
  allowedRoles: TelegramUserRole[],
  fallbackMessage: string
) {
  const resolved = await requireLinkedTelegramAccount(ctx)
  if (!resolved) {
    return null
  }

  if (!resolved.role || !allowedRoles.includes(resolved.role)) {
    await ctx.reply(fallbackMessage)
    return null
  }

  return resolved
}
