import { InlineKeyboard } from 'grammy'

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
