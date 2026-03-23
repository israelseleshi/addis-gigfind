export type TelegramLinkResult =
  | { ok: true; userId: string; role: string; fullName: string }
  | { ok: false; error: string }
