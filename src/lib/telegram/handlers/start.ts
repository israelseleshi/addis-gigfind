import { touchTelegramAccount } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { resolveLinkedTelegramAccount } from '@/lib/telegram/guards'
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

    const resolved = await resolveLinkedTelegramAccount(ctx)
    if (!resolved.account || !resolved.profile) {
      await ctx.reply(buildLinkInstructions(), { parse_mode: 'HTML' })
      return
    }

    await touchTelegramAccount(telegramUserId)
    const name = resolved.profile.full_name ?? 'there'
    const role = resolved.role ?? 'freelancer'

    await ctx.reply(buildLinkedWelcomeMessage(name, role), { parse_mode: 'HTML' })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram /start handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
