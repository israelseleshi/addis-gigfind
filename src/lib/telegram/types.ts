export type TelegramLinkResult =
  | { ok: true; userId: string; role: string; fullName: string }
  | { ok: false; error: string }

export type TelegramUserRole = 'client' | 'freelancer' | 'admin' | 'regulator'

export type TelegramLinkedProfile = {
  id: string
  full_name: string | null
  role: TelegramUserRole | null
}

export type TelegramLinkedAccount = {
  user_id: string
  telegram_chat_id: string
  is_active: boolean
  profiles: TelegramLinkedProfile | TelegramLinkedProfile[] | null
}
