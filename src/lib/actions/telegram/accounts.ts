'use server'

import { createClient } from '@/lib/supabase/server'
import { issueTelegramLinkCodeForUser } from '@/lib/telegram/account-link'

export async function createTelegramLinkCode() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to connect Telegram.' }
  }

  try {
    const result = await issueTelegramLinkCodeForUser(user.id)
    return { success: true, ...result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create Telegram link code.'
    return { error: message }
  }
}
