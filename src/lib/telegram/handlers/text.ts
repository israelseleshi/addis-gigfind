import { touchTelegramAccount } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireLinkedTelegramAccount } from '@/lib/telegram/guards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildScaffoldingPlaceholderMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'

export async function handleTextMessage(ctx: TelegramBotContext) {
  try {
    const input = ctx.message.text.trim()
    if (input.startsWith('/')) {
      return
    }

    const resolved = await requireLinkedTelegramAccount(ctx)
    if (!resolved) {
      return
    }

    await touchTelegramAccount(resolved.telegramUserId)
    await ctx.reply(buildScaffoldingPlaceholderMessage())
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram text handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
