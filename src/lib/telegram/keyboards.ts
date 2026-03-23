import { InlineKeyboard } from 'grammy'

import type { TelegramApplicationSummary } from '@/lib/actions/telegram/applications'
import type { TelegramBrowseGig } from '@/lib/actions/telegram/gigs'
import type { TelegramUserRole } from '@/lib/telegram/types'

export function buildFreelancerHomeKeyboard() {
  return new InlineKeyboard()
    .text('Browse gigs', 'freelancer:browse_gigs')
    .text('My applications', 'freelancer:my_applications')
    .row()
    .text('Active jobs', 'freelancer:active_jobs')
    .text('Verification status', 'freelancer:verification_status')
}

export function buildClientHomeKeyboard() {
  return new InlineKeyboard()
    .text('Post gig', 'client:post_gig')
    .text('My gigs', 'client:my_gigs')
    .row()
    .text('Review applicants', 'client:review_applicants')
}

export function buildAdminHomeKeyboard() {
  return new InlineKeyboard()
    .text('Pending verifications', 'admin:pending_verifications')
    .row()
    .text('Platform stats', 'admin:platform_stats')
}

export function buildLinkedHomeKeyboard(role: TelegramUserRole) {
  if (role === 'client') {
    return buildClientHomeKeyboard()
  }

  if (role === 'admin' || role === 'regulator') {
    return buildAdminHomeKeyboard()
  }

  return buildFreelancerHomeKeyboard()
}

export function buildGigListKeyboard(
  gigs: TelegramBrowseGig[],
  page: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  const keyboard = new InlineKeyboard()

  for (const gig of gigs) {
    keyboard.text(`View: ${gig.title.slice(0, 24)}`, `freelancer:view_gig:${gig.id}`).row()
  }

  if (hasPreviousPage) {
    keyboard.text('Previous', `freelancer:browse_gigs:${page - 1}`)
  }

  if (hasNextPage) {
    keyboard.text('Next', `freelancer:browse_gigs:${page + 1}`)
  }

  if (hasPreviousPage || hasNextPage) {
    keyboard.row()
  }

  keyboard.text('Back to menu', 'freelancer:home')
  return keyboard
}

export function buildGigDetailKeyboard(gigId: string) {
  return new InlineKeyboard()
    .text('Apply to this gig', `freelancer:apply_gig:${gigId}`)
    .row()
    .text('Browse more gigs', 'freelancer:browse_gigs:0')
    .text('Back to menu', 'freelancer:home')
}

export function buildApplicationsListKeyboard(
  applications: TelegramApplicationSummary[],
  page: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  const keyboard = new InlineKeyboard()

  for (const application of applications) {
    const title = application.gig?.title ?? 'Unknown gig'
    keyboard
      .text(`View: ${title.slice(0, 24)}`, `freelancer:view_application:${application.id}`)
      .row()
  }

  if (hasPreviousPage) {
    keyboard.text('Previous', `freelancer:my_applications:${page - 1}`)
  }

  if (hasNextPage) {
    keyboard.text('Next', `freelancer:my_applications:${page + 1}`)
  }

  if (hasPreviousPage || hasNextPage) {
    keyboard.row()
  }

  keyboard.text('Back to menu', 'freelancer:home')
  return keyboard
}

export function buildApplicationDetailKeyboard(applicationId: string) {
  return new InlineKeyboard()
    .text('Refresh application', `freelancer:view_application:${applicationId}`)
    .row()
    .text('My applications', 'freelancer:my_applications:0')
    .text('Back to menu', 'freelancer:home')
}
