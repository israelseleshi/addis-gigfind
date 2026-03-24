import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TelegramCard } from '@/components/telegram-webview/telegram-card'
import { TelegramFooterAction } from '@/components/telegram-webview/telegram-footer-action'
import { TelegramShell } from '@/components/telegram-webview/telegram-shell'
import { listTelegramClientGigs } from '@/lib/actions/telegram/gigs'
import {
  buildTelegramClientCreateGigUrl,
  buildTelegramClientGigDetailUrl,
} from '@/lib/telegram/webview/urls'
import { resolveTelegramWebviewSession } from '@/lib/telegram/webview/auth'

function formatCategory(value: string) {
  if (!value) {
    return 'Uncategorized'
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatLocation(value: string) {
  if (!value) {
    return 'Unknown location'
  }

  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatStatus(value: string | null) {
  if (!value) {
    return 'Unknown'
  }

  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default async function TelegramClientGigsPage({
  searchParams,
}: {
  searchParams: Promise<{ tg_token?: string; created?: string }>
}) {
  const { tg_token: token, created } = await searchParams
  if (!token) {
    notFound()
  }

  const session = await resolveTelegramWebviewSession(token, ['client'])
  if (!session) {
    notFound()
  }

  const result = await listTelegramClientGigs(session.userId, 0)
  const createGigUrl = buildTelegramClientCreateGigUrl(token)

  return (
    <TelegramShell
      title="My gigs"
      subtitle={`Manage the gigs posted by ${session.fullName ?? 'your client account'}.`}
    >
      {created === '1' ? (
        <TelegramCard>
          <p className="text-sm font-medium text-green-700">Your gig was posted successfully.</p>
        </TelegramCard>
      ) : null}

      {result.gigs.length === 0 ? (
        <TelegramCard title="No gigs yet">
          <p className="text-sm leading-6 text-stone-600">
            You have not posted any gigs yet. Use the button below to create your first one.
          </p>
        </TelegramCard>
      ) : (
        result.gigs.map((gig) => {
          const applicants = gig.applications?.[0]?.count ?? 0
          return (
            <TelegramCard key={gig.id} title={formatStatus(gig.status)}>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-stone-950">{gig.title}</p>
                <p className="text-sm text-stone-600">
                  {formatCategory(gig.category)} • {formatLocation(gig.location)}
                </p>
                <p className="text-sm text-stone-600 line-clamp-3">{gig.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-[20px] bg-orange-50/70 p-3 text-sm">
                <div>
                  <p className="text-stone-500">Budget</p>
                  <p className="font-semibold text-stone-950">ETB {gig.budget.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-stone-500">Applicants</p>
                  <p className="font-semibold text-stone-950">{applicants}</p>
                </div>
              </div>
              <Link
                href={buildTelegramClientGigDetailUrl(gig.id, token)}
                className="inline-flex w-full items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                View details
              </Link>
            </TelegramCard>
          )
        })
      )}

      <TelegramFooterAction>
        <Link
          href={createGigUrl}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(234,88,12,0.9)] transition hover:from-orange-700 hover:to-amber-600"
        >
          Post a new gig
        </Link>
      </TelegramFooterAction>
    </TelegramShell>
  )
}
