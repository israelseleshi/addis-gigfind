import Link from 'next/link'

import { TelegramCard } from '@/components/telegram-webview/telegram-card'
import { TelegramShell } from '@/components/telegram-webview/telegram-shell'

export default function TelegramLandingPage() {
  return (
    <TelegramShell
      title="Open from Telegram"
      subtitle="This surface is meant to be opened from Addis GigFind bot buttons so your Telegram session can be verified."
    >
      <TelegramCard title="How to use it">
        <p className="text-sm leading-6 text-stone-700">
          Go back to the bot, choose a workflow, and use the button that opens the detailed page.
        </p>
        <Link
          href="https://t.me/gigaddisbot"
          className="inline-flex w-full items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700"
        >
          Open Addis-Gigs bot
        </Link>
      </TelegramCard>
    </TelegramShell>
  )
}
