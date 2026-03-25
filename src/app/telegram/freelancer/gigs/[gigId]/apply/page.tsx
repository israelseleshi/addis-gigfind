import { notFound } from 'next/navigation'

import { FreelancerApplyForm } from '@/components/telegram-webview/freelancer-apply-form'
import { TelegramCard } from '@/components/telegram-webview/telegram-card'
import { TelegramShell } from '@/components/telegram-webview/telegram-shell'
import { getTelegramGigDetails } from '@/lib/actions/telegram/gigs'
import { resolveTelegramWebviewSession } from '@/lib/telegram/webview/auth'

export default async function TelegramFreelancerApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ gigId: string }>
  searchParams: Promise<{ tg_token?: string }>
}) {
  const { gigId } = await params
  const { tg_token: token } = await searchParams

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

  return (
    <TelegramShell
      title="Apply to gig"
      subtitle={`Submitting for ${gig.title} as ${session.fullName ?? 'your freelancer account'}.`}
    >
      <TelegramCard title="Gig summary">
        <p className="text-base font-semibold text-stone-950">{gig.title}</p>
        <p className="text-sm text-stone-600">
          {gig.category} • {gig.location} • ETB {gig.budget.toLocaleString()}
        </p>
      </TelegramCard>

      <TelegramCard title="Application form">
        <p className="text-sm leading-6 text-stone-600">
          This form uses the same application field currently supported on the website.
        </p>
        <FreelancerApplyForm gigId={gig.id} token={token} />
      </TelegramCard>
    </TelegramShell>
  )
}
