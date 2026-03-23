import type { Bot } from 'grammy'

import { handleLinkCommand } from '@/lib/telegram/handlers/link'
import { handleStartCommand } from '@/lib/telegram/handlers/start'
import { handleTextMessage } from '@/lib/telegram/handlers/text'

export function registerTelegramHandlers(bot: Bot) {
  bot.command('start', handleStartCommand)
  bot.command('link', handleLinkCommand)
  bot.on('message:text', handleTextMessage)
}
