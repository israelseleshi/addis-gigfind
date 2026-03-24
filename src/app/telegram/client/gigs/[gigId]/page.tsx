import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TelegramCard } from '@/components/telegram-webview/telegram-card'
import { TelegramFooterAction } from '@/components/telegram-webview/telegram-footer-action'
import { TelegramShell } from '@/components/telegram-webview/telegram-shell'
import { getTelegramClientGigDetails } from '@/lib/actions/telegram/gigs'
import { buildTelegramClientGigsUrl } from '@/lib/telegram/webview/urls'
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

export default async function TelegramClientGigDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ gigId: string }>
  searchParams: Promise<{ tg_token?: string; created?: string }>
}) {
  const { gigId } = await params
  const { tg_token: token, created } = await searchParams
  if (!token) {
    notFound()
  }

  const session = await resolveTelegramWebviewSession(token, ['client'])
  if (!session) {
    notFound()
  }

  const gig = await getTelegramClientGigDetails(session.userId, gigId)
  if (!gig) {
    notFound()
  }

  const applicants = gig.applications?.[0]?.count ?? 0

  return (
    <TelegramShell
      title={gig.title}
      subtitle={`${formatCategory(gig.category)} • ${formatLocation(gig.location)}`}
    >
      {created === '1' ? (
        <TelegramCard>
          <p className="text-sm font-medium text-green-700">Your gig is live and ready for applicants.</p>
        </TelegramCard>
      ) : null}

      <TelegramCard title="Overview">
        <div className="grid gap-3 text-sm text-stone-700">
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Status</span>
            <span className="font-semibold text-stone-950">{formatStatus(gig.status)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Budget</span>
            <span className="font-semibold text-stone-950">ETB {gig.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Location</span>
            <span className="font-semibold text-stone-950">{formatLocation(gig.location)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Applicants</span>
            <span className="font-semibold text-stone-950">{applicants}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Posted</span>
            <span className="font-semibold text-stone-950">
              {gig.created_at ? new Date(gig.created_at).toLocaleDateString('en-US') : 'Recently'}
            </span>
          </div>
        </div>
      </TelegramCard>

      <TelegramCard title="Description">
        <p className="whitespace-pre-line text-sm leading-7 text-stone-700">{gig.description}</p>
      </TelegramCard>

      <TelegramFooterAction>
        <div className="space-y-3">
          <div className="rounded-[22px] border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-900">
            Use the bot&apos;s applicant review flow to accept or reject freelancers for this gig.
          </div>
          <Link
            href={buildTelegramClientGigsUrl(token)}
            className="inline-flex w-full items-center justify-center rounded-full border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
          >
            Back to my gigs
          </Link>
        </div>
      </TelegramFooterAction>
    </TelegramShell>
  )
}
