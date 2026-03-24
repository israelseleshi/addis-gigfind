'use server'

import { applyForGigFromTelegram } from '@/lib/actions/telegram/applications'
import { resolveTelegramWebviewSession } from '@/lib/telegram/webview/auth'

export async function submitTelegramWebviewApplication(input: {
  token: string
  gigId: string
  coverNote: string
}) {
  const session = await resolveTelegramWebviewSession(input.token, ['freelancer'])
  if (!session) {
    return { error: 'Your Telegram session expired. Reopen this page from the bot.' }
  }

  return applyForGigFromTelegram({
    gigId: input.gigId,
    freelancerId: session.userId,
    coverNote: input.coverNote,
  })
}
