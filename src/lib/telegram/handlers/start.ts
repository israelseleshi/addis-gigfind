import { getTelegramAccountByTelegramUserId, touchTelegramAccount } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildLinkInstructions,
  buildLinkedWelcomeMessage,
  buildStartupStatusMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'

export async function handleStartCommand(ctx: TelegramBotContext) {
  try {
    await ctx.reply(buildStartupStatusMessage())

    const telegramUserId = String(ctx.from?.id ?? '')
    if (!telegramUserId) {
      await ctx.reply('Could not identify your Telegram account.')
      return
    }

    const account = await getTelegramAccountByTelegramUserId(telegramUserId)
    if (!account) {
      await ctx.reply(buildLinkInstructions(), { parse_mode: 'HTML' })
      return
    }

    await touchTelegramAccount(telegramUserId)
    const profile = Array.isArray(account.profiles) ? account.profiles[0] : account.profiles
    const name = profile?.full_name ?? 'there'
    const role = profile?.role ?? 'freelancer'

    await ctx.reply(buildLinkedWelcomeMessage(name, role), { parse_mode: 'HTML' })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram /start handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
