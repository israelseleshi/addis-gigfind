import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireLinkedTelegramAccount } from '@/lib/telegram/guards'
import { buildUnrecognizedInputMessage, buildTemporaryUnavailableMessage } from '@/lib/telegram/messages'
import { telegramLogger } from '@/lib/telegram/logger'

export async function handleCallbackQuery(ctx: TelegramBotContext) {
  try {
    const resolved = await requireLinkedTelegramAccount(ctx)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    await ctx.answerCallbackQuery({
      text: 'Workflow button registered.',
    })

    await ctx.reply(buildUnrecognizedInputMessage())
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram callback handler failed')
    await ctx.answerCallbackQuery({
      text: 'Something went wrong.',
      show_alert: true,
    })
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
