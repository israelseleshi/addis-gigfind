import { touchTelegramAccount } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { handleRejectVerificationReply } from '@/lib/telegram/handlers/admin'
import { handleApplyReply } from '@/lib/telegram/handlers/freelancer'
import { requireLinkedTelegramAccount } from '@/lib/telegram/guards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildUnrecognizedInputMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'
import { buildLinkedHomeKeyboard } from '@/lib/telegram/keyboards'

export async function handleTextMessage(ctx: TelegramBotContext) {
  try {
    const input = ctx.message.text.trim()
    if (input.startsWith('/')) {
      return
    }

    const applyHandled = await handleApplyReply(ctx)
    if (applyHandled) {
      return
    }

    const rejectVerificationHandled = await handleRejectVerificationReply(ctx)
    if (rejectVerificationHandled) {
      return
    }

    const resolved = await requireLinkedTelegramAccount(ctx)
    if (!resolved) {
      return
    }

    await touchTelegramAccount(resolved.telegramUserId)
    await ctx.reply(buildUnrecognizedInputMessage(), {
      reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'freelancer'),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram text handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
