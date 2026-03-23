import pino from 'pino'

export const telegramLogger = pino({
  name: 'telegram-bot',
  level: process.env.LOG_LEVEL ?? 'info',
})
