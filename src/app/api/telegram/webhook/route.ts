import { webhookCallback } from 'grammy'
import { NextRequest, NextResponse } from 'next/server'

import { getTelegramBot } from '@/lib/telegram/bot'
import { getTelegramWebhookSecret } from '@/lib/telegram/config'
import { telegramLogger } from '@/lib/telegram/logger'

export const dynamic = 'force-dynamic'

let webhookHandler: ((request: Request) => Promise<Response>) | null = null

function isAuthorizedWebhookRequest(request: NextRequest) {
  const configuredSecret = getTelegramWebhookSecret()
  if (!configuredSecret) {
    return true
  }

  const requestSecret = request.headers.get('x-telegram-bot-api-secret-token')
  return requestSecret === configuredSecret
}

function getWebhookHandler() {
  const bot = getTelegramBot()
  if (!bot) {
    return null
  }

  if (!webhookHandler) {
    webhookHandler = webhookCallback(bot, 'std/http')
  }

  return webhookHandler
}

export async function POST(request: NextRequest) {
  if (!isAuthorizedWebhookRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized webhook request.' }, { status: 401 })
  }

  const handler = getWebhookHandler()
  if (!handler) {
    return NextResponse.json({ error: 'Telegram bot is not configured.' }, { status: 503 })
  }

  try {
    return await handler(request)
  } catch (err) {
    telegramLogger.error({ err }, 'Telegram update handling error')
    return NextResponse.json({ error: 'Telegram update handling error.' }, { status: 500 })
  }
}
