import type { InlineKeyboardMarkup } from 'grammy/types'

import type { TelegramBotContext } from '@/lib/telegram/context'

type TelegramReplyMarkup = InlineKeyboardMarkup | undefined

type RespondOptions = {
  parse_mode?: 'HTML' | 'MarkdownV2' | 'Markdown'
  reply_markup?: TelegramReplyMarkup
}

export async function respondWithTelegramMessage(
  ctx: TelegramBotContext,
  text: string,
  options: RespondOptions = {}
) {
  const canEditExistingMessage =
    Boolean(ctx.callbackQuery) &&
    Boolean(ctx.callbackQuery?.message) &&
    'editMessageText' in ctx

  if (canEditExistingMessage) {
    try {
      await ctx.editMessageText(text, options)
      return
    } catch {
      // Fall back to sending a new message when Telegram refuses edits,
      // such as after an unchanged payload or an unsupported message type.
    }
  }

  await ctx.reply(text, options)
}
