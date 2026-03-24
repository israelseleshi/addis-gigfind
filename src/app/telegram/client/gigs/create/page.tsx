import { notFound } from 'next/navigation'

import { ClientPostGigForm } from '@/components/telegram-webview/client-post-gig-form'
import { TelegramCard } from '@/components/telegram-webview/telegram-card'
import { TelegramShell } from '@/components/telegram-webview/telegram-shell'
import { resolveTelegramWebviewSession } from '@/lib/telegram/webview/auth'

export default async function TelegramClientCreateGigPage({
  searchParams,
}: {
  searchParams: Promise<{ tg_token?: string }>
}) {
  const { tg_token: token } = await searchParams
  if (!token) {
    notFound()
  }

  const session = await resolveTelegramWebviewSession(token, ['client'])
  if (!session) {
    notFound()
  }

  return (
    <TelegramShell
      title="Post a new gig"
      subtitle={`Create a new gig as ${session.fullName ?? 'your client account'}.`}
    >
      <TelegramCard title="Gig form">
        <p className="text-sm leading-6 text-stone-600">
          This uses the same title, category, location, budget, and description fields already used on the website.
        </p>
        <ClientPostGigForm token={token} />
      </TelegramCard>
    </TelegramShell>
  )
}
