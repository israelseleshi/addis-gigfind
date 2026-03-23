import { getTelegramBot } from '@/lib/telegram/bot'
import { getTelegramAccountByUserId } from '@/lib/telegram/account-link'

export async function sendTelegramMessageToUser(userId: string, text: string) {
  const account = await getTelegramAccountByUserId(userId)
  if (!account?.is_active) {
    return { success: false, reason: 'not_linked' as const }
  }

  const bot = getTelegramBot()
  if (!bot) {
    return { success: false, reason: 'bot_not_configured' as const }
  }

  await bot.api.sendMessage(account.telegram_chat_id, text, {
    parse_mode: 'HTML',
  })

  return { success: true as const }
}
