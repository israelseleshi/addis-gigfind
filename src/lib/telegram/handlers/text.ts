import { getTelegramAccountByTelegramUserId, touchTelegramAccount } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildLinkInstructions,
  buildScaffoldingPlaceholderMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'

export async function handleTextMessage(ctx: TelegramBotContext) {
  try {
    const input = ctx.message.text.trim()
    if (input.startsWith('/')) {
      return
    }

    const account = await getTelegramAccountByTelegramUserId(String(ctx.from.id))
    if (!account) {
      await ctx.reply(buildLinkInstructions(), { parse_mode: 'HTML' })
      return
    }

    await touchTelegramAccount(String(ctx.from.id))
    await ctx.reply(buildScaffoldingPlaceholderMessage())
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram text handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
