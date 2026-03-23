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

function buildApplicationAcceptedMessage(params: { gigTitle: string }) {
  return [
    '<b>Application accepted</b>',
    '',
    `Your application for "${params.gigTitle}" was accepted.`,
    'The gig has been assigned to you.',
  ].join('\n')
}

function buildApplicationRejectedMessage(params: { gigTitle: string }) {
  return [
    '<b>Application rejected</b>',
    '',
    `Your application for "${params.gigTitle}" was rejected.`,
    'You can keep browsing and apply to other gigs.',
  ].join('\n')
}

function buildGigStatusChangedMessage(params: { gigTitle: string; status: string }) {
  return [
    '<b>Gig status updated</b>',
    '',
    `Gig: ${params.gigTitle}`,
    `New status: ${params.status.replace(/_/g, ' ')}`,
  ].join('\n')
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

export async function notifyFreelancerOfApplicationAccepted(params: {
  gigId: string
  freelancerId: string
}) {
  try {
    const supabase = await createServiceRoleClient()
    const { data: gig, error } = await supabase
      .from('gigs')
      .select('title')
      .eq('id', params.gigId)
      .single()

    if (error || !gig) {
      telegramLogger.warn(
        { error, gigId: params.gigId, freelancerId: params.freelancerId },
        'Telegram application accepted notification lookup failed'
      )
      return { success: false as const, reason: 'lookup_failed' as const }
    }

    return await sendTelegramMessageToUser(
      params.freelancerId,
      buildApplicationAcceptedMessage({ gigTitle: gig.title })
    )
  } catch (error) {
    telegramLogger.error({ error, params }, 'Telegram application accepted notification failed')
    return { success: false as const, reason: 'send_failed' as const }
  }
}

export async function notifyFreelancerOfApplicationRejected(params: {
  gigId: string
  freelancerId: string
}) {
  try {
    const supabase = await createServiceRoleClient()
    const { data: gig, error } = await supabase
      .from('gigs')
      .select('title')
      .eq('id', params.gigId)
      .single()

    if (error || !gig) {
      telegramLogger.warn(
        { error, gigId: params.gigId, freelancerId: params.freelancerId },
        'Telegram application rejected notification lookup failed'
      )
      return { success: false as const, reason: 'lookup_failed' as const }
    }

    return await sendTelegramMessageToUser(
      params.freelancerId,
      buildApplicationRejectedMessage({ gigTitle: gig.title })
    )
  } catch (error) {
    telegramLogger.error({ error, params }, 'Telegram application rejected notification failed')
    return { success: false as const, reason: 'send_failed' as const }
  }
}

export async function notifyUserOfGigStatusChanged(params: {
  gigId: string
  userId: string
  status: string
}) {
  try {
    const supabase = await createServiceRoleClient()
    const { data: gig, error } = await supabase
      .from('gigs')
      .select('title')
      .eq('id', params.gigId)
      .single()

    if (error || !gig) {
      telegramLogger.warn(
        { error, gigId: params.gigId, userId: params.userId, status: params.status },
        'Telegram gig status notification lookup failed'
      )
      return { success: false as const, reason: 'lookup_failed' as const }
    }

    return await sendTelegramMessageToUser(
      params.userId,
      buildGigStatusChangedMessage({
        gigTitle: gig.title,
        status: params.status,
      })
    )
  } catch (error) {
    telegramLogger.error({ error, params }, 'Telegram gig status notification failed')
    return { success: false as const, reason: 'send_failed' as const }
  }
}
