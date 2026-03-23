export function getTelegramBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN ?? ''
}

export function getTelegramWebhookSecret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET ?? ''
}

export function isTelegramConfigured() {
  return Boolean(getTelegramBotToken())
}
