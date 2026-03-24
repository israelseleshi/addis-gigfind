import Link from 'next/link'
import { notFound } from 'next/navigation'

import { TelegramCard } from '@/components/telegram-webview/telegram-card'
import { TelegramFooterAction } from '@/components/telegram-webview/telegram-footer-action'
import { TelegramShell } from '@/components/telegram-webview/telegram-shell'
import { getTelegramGigDetails } from '@/lib/actions/telegram/gigs'
import { buildTelegramFreelancerGigApplyUrl } from '@/lib/telegram/webview/urls'
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

export default async function TelegramFreelancerGigDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ gigId: string }>
  searchParams: Promise<{ tg_token?: string; applied?: string }>
}) {
  const { gigId } = await params
  const { tg_token: token, applied } = await searchParams

  if (!token) {
    notFound()
  }

  const session = await resolveTelegramWebviewSession(token, ['freelancer'])
  if (!session) {
    notFound()
  }

  const gig = await getTelegramGigDetails(gigId)
  if (!gig) {
    notFound()
  }

  const applyUrl = buildTelegramFreelancerGigApplyUrl(gig.id, token)

  return (
    <TelegramShell
      title={gig.title}
      subtitle={`${formatCategory(gig.category)} • ${formatLocation(gig.location)}`}
    >
      {applied === '1' ? (
        <TelegramCard>
          <p className="text-sm font-medium text-green-700">
            Your application was submitted successfully.
          </p>
        </TelegramCard>
      ) : null}

      <TelegramCard title="Overview">
        <div className="grid gap-3 text-sm text-stone-700">
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Budget</span>
            <span className="font-semibold text-stone-950">
              {gig.budget ? `ETB ${gig.budget.toLocaleString()}` : 'Negotiable'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Location</span>
            <span className="font-semibold text-stone-950">{formatLocation(gig.location)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Posted</span>
            <span className="font-semibold text-stone-950">
              {gig.created_at ? new Date(gig.created_at).toLocaleDateString('en-US') : 'Recently'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-stone-500">Client</span>
            <span className="font-semibold text-stone-950">{gig.client?.full_name ?? 'Unknown client'}</span>
          </div>
        </div>
      </TelegramCard>

      <TelegramCard title="Job description">
        <p className="whitespace-pre-line text-sm leading-7 text-stone-700">{gig.description}</p>
      </TelegramCard>

      <TelegramFooterAction>
        {session.verificationStatus !== 'verified' ? (
          <div className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
            Your account must be verified before you can apply from Telegram.
          </div>
        ) : (
          <Link
            href={applyUrl}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(234,88,12,0.9)] transition hover:from-orange-700 hover:to-amber-600"
          >
            Apply for this gig
          </Link>
        )}
      </TelegramFooterAction>
    </TelegramShell>
  )
}
