import { getTelegramBot } from '@/lib/telegram/bot'
import { getTelegramAccountByUserId } from '@/lib/telegram/account-link'
import { telegramLogger } from '@/lib/telegram/logger'

export async function sendTelegramMessageToUser(userId: string, text: string) {
  const account = await getTelegramAccountByUserId(userId)
  if (!account?.is_active) {
    return { success: false, reason: 'not_linked' as const }
  }

  const bot = getTelegramBot()
  if (!bot) {
    return { success: false, reason: 'bot_not_configured' as const }
  }

  try {
    await bot.api.sendMessage(account.telegram_chat_id, text, {
      parse_mode: 'HTML',
    })
  } catch (error) {
    telegramLogger.error({ error, userId }, 'Telegram outbound send failed')
    return { success: false, reason: 'send_failed' as const }
  }

  return { success: true as const }
}
