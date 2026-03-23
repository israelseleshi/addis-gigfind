import { NextRequest, NextResponse } from 'next/server'

import { getTelegramBot } from '@/lib/telegram/bot'
import { getTelegramWebhookSecret } from '@/lib/telegram/config'
import { telegramLogger } from '@/lib/telegram/logger'

export const dynamic = 'force-dynamic'

function isAuthorizedWebhookRequest(request: NextRequest) {
  const configuredSecret = getTelegramWebhookSecret()
  if (!configuredSecret) {
    return true
  }

  const requestSecret = request.headers.get('x-telegram-bot-api-secret-token')
  return requestSecret === configuredSecret
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedWebhookRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized webhook request.' }, { status: 401 })
  }

  const bot = getTelegramBot()
  if (!bot) {
    return NextResponse.json({ error: 'Telegram bot is not configured.' }, { status: 503 })
  }

  const update = await request.json()

  try {
    await bot.handleUpdate(update)
  } catch (err) {
    telegramLogger.error({ err }, 'Telegram update handling error')
  }

  return NextResponse.json({ ok: true })
}
