'use server'

import { createServiceRoleClient } from '@/lib/supabase/service-role'
import { telegramLogger } from '@/lib/telegram/logger'
import { sendTelegramMessageToUser } from '@/lib/telegram/sender'

function buildNewApplicationMessage(params: {
  gigTitle: string
  freelancerName: string
  coverNote: string
}) {
  return [
    '<b>New application received</b>',
    '',
    `Gig: ${params.gigTitle}`,
    `Freelancer: ${params.freelancerName}`,
    '',
    '<b>Cover note</b>',
    params.coverNote,
  ].join('\n')
}

function buildVerificationApprovedMessage() {
  return [
    '<b>Verification approved</b>',
    '',
    'Your Addis GigFind verification has been approved.',
    'You can now access verified freelancer workflows.',
  ].join('\n')
}

function buildVerificationRejectedMessage(reason?: string | null) {
  const lines = [
    '<b>Verification rejected</b>',
    '',
    'Your Addis GigFind verification was rejected.',
  ]

  if (reason) {
    lines.push(`Reason: ${reason}`)
  }

  lines.push('Please review the feedback and resubmit your documents on the website.')
  return lines.join('\n')
}

export async function notifyClientOfNewApplication(params: {
  gigId: string
  freelancerId: string
  coverNote: string
}) {
  try {
    const supabase = await createServiceRoleClient()

    const [{ data: gig, error: gigError }, { data: freelancer, error: freelancerError }] =
      await Promise.all([
        supabase.from('gigs').select('title, client_id').eq('id', params.gigId).single(),
        supabase.from('profiles').select('full_name').eq('id', params.freelancerId).single(),
      ])

    if (gigError || !gig || freelancerError || !freelancer) {
      telegramLogger.warn(
        { gigError, freelancerError, gigId: params.gigId, freelancerId: params.freelancerId },
        'Telegram new application notification lookup failed'
      )
      return { success: false as const, reason: 'lookup_failed' as const }
    }

    return await sendTelegramMessageToUser(
      gig.client_id,
      buildNewApplicationMessage({
        gigTitle: gig.title,
        freelancerName: freelancer.full_name ?? 'Unknown freelancer',
        coverNote: params.coverNote,
      })
    )
  } catch (error) {
    telegramLogger.error({ error, params }, 'Telegram new application notification failed')
    return { success: false as const, reason: 'send_failed' as const }
  }
}

export async function notifyUserOfVerificationApproved(userId: string) {
  try {
    return await sendTelegramMessageToUser(userId, buildVerificationApprovedMessage())
  } catch (error) {
    telegramLogger.error({ error, userId }, 'Telegram verification approved notification failed')
    return { success: false as const, reason: 'send_failed' as const }
  }
}

export async function notifyUserOfVerificationRejected(userId: string, reason?: string | null) {
  try {
    return await sendTelegramMessageToUser(userId, buildVerificationRejectedMessage(reason))
  } catch (error) {
    telegramLogger.error({ error, userId }, 'Telegram verification rejected notification failed')
    return { success: false as const, reason: 'send_failed' as const }
  }
}
