import type { TelegramBotContext } from '@/lib/telegram/context'

type TelegramLogExtras = Record<string, string | number | boolean | null | undefined>

export function buildTelegramLogContext(
  ctx: TelegramBotContext,
  extras: TelegramLogExtras = {}
) {
  const telegramUpdateType =
    'updateType' in ctx && typeof ctx.updateType === 'string'
      ? ctx.updateType
      : null

  return {
    telegramUserId: ctx.from?.id ? String(ctx.from.id) : null,
    telegramChatId: ctx.chat?.id ? String(ctx.chat.id) : null,
    telegramUsername: ctx.from?.username ?? null,
    telegramMessageId: ctx.msg?.message_id ?? null,
    telegramCallbackData: ctx.callbackQuery?.data ?? null,
    telegramUpdateType,
    ...extras,
  }
}
