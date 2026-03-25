'use server'

import { applyForGigFromTelegram } from '@/lib/actions/telegram/applications'
import { createTelegramGig } from '@/lib/actions/telegram/gigs'
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

export async function createTelegramWebviewGig(input: {
  token: string
  title: string
  category: string
  description: string
  budget: number
  location: string
}) {
  const session = await resolveTelegramWebviewSession(input.token, ['client'])
  if (!session) {
    return { error: 'Your Telegram session expired. Reopen this page from the bot.' }
  }

  return createTelegramGig({
    clientId: session.userId,
    title: input.title,
    category: input.category,
    description: input.description,
    budget: input.budget,
    location: input.location,
  })
}
