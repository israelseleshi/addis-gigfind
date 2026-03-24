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
    telegramLogger.error({ error }, 'Telegram bot error')
  })

  botSingleton = bot
  return botSingleton
}
