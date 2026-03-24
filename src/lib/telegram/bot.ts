import { Bot } from 'grammy'

import { getTelegramBotToken, isTelegramConfigured } from '@/lib/telegram/config'
import { registerTelegramHandlers } from '@/lib/telegram/handlers'
import { telegramLogger } from '@/lib/telegram/logger'

let botSingleton: Bot | null = null

export function getTelegramBot() {
  if (!isTelegramConfigured()) {
    return null
  }

  if (botSingleton) {
    return botSingleton
  }

  const bot = new Bot(getTelegramBotToken())
  registerTelegramHandlers(bot)

  bot.catch((error) => {
    telegramLogger.error(
      {
        error,
        telegramUserId: error.ctx?.from?.id ? String(error.ctx.from.id) : null,
        telegramChatId: error.ctx?.chat?.id ? String(error.ctx.chat.id) : null,
        telegramCallbackData: error.ctx?.callbackQuery?.data ?? null,
        telegramUpdateType: error.ctx?.updateType ?? null,
      },
      'Telegram bot error'
    )
  })

  botSingleton = bot
  return botSingleton
}
