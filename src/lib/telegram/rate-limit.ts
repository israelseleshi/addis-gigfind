const telegramActionExpirations = new Map<string, number>()

function pruneExpiredTelegramActions(now: number) {
  for (const [key, expiresAt] of telegramActionExpirations.entries()) {
    if (expiresAt <= now) {
      telegramActionExpirations.delete(key)
    }
  }
}

export function shouldThrottleTelegramAction(key: string, windowMs: number) {
  const now = Date.now()
  pruneExpiredTelegramActions(now)

  const expiresAt = telegramActionExpirations.get(key)
  if (expiresAt && expiresAt > now) {
    return true
  }

  telegramActionExpirations.set(key, now + windowMs)
  return false
}
