import type { TelegramUserRole } from '@/lib/telegram/types'

export type TelegramWebviewTokenPayload = {
  userId: string
  telegramUserId: string
  role: TelegramUserRole
  exp: number
}

export type TelegramWebviewSession = {
  userId: string
  telegramUserId: string
  role: TelegramUserRole
  fullName: string | null
  verificationStatus: string | null
}
