import { InlineKeyboard } from 'grammy'

import type {
  TelegramActiveJobSummary,
  TelegramApplicationSummary,
  TelegramGigApplicantSummary,
} from '@/lib/actions/telegram/applications'
import type {
  TelegramBrowseGig,
  TelegramClientGigSummary,
  TelegramGigBrowseFilters,
} from '@/lib/actions/telegram/gigs'
import type { TelegramPendingVerificationSummary } from '@/lib/actions/telegram/verifications'
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
  hasNextPage: boolean,
  filters: TelegramGigBrowseFilters
) {
  const keyboard = new InlineKeyboard()

  keyboard
    .text('Choose category', 'freelancer:choose_category')
    .text('Choose location', 'freelancer:choose_location')
    .row()

  if (filters.category || filters.location) {
    keyboard.text('Clear filters', 'freelancer:clear_filters').row()
  }

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

export function buildGigCategoryOptionsKeyboard(categories: string[], currentValue?: string | null) {
  const keyboard = new InlineKeyboard()

  for (const category of categories) {
    const label = category === currentValue ? `• ${category}` : category
    keyboard.text(label.slice(0, 28), `freelancer:set_category:${encodeURIComponent(category)}`).row()
  }

  keyboard.text('Type category', 'freelancer:prompt_category')

  if (currentValue) {
    keyboard.text('Clear category', 'freelancer:clear_category')
  }

  keyboard.row().text('Back to gigs', 'freelancer:browse_gigs:0')
  return keyboard
}

export function buildGigLocationOptionsKeyboard(locations: string[], currentValue?: string | null) {
  const keyboard = new InlineKeyboard()

  for (const location of locations) {
    const label = location === currentValue ? `• ${location}` : location
    keyboard.text(label.slice(0, 28), `freelancer:set_location:${encodeURIComponent(location)}`).row()
  }

  keyboard.text('Type location', 'freelancer:prompt_location')

  if (currentValue) {
    keyboard.text('Clear location', 'freelancer:clear_location')
  }

  keyboard.row().text('Back to gigs', 'freelancer:browse_gigs:0')
  return keyboard
}

export function buildGigDetailKeyboard(gigId: string) {
  return new InlineKeyboard()
    .text('Apply to this gig', `freelancer:apply_gig:${gigId}`)
    .row()
    .text('Browse more gigs', 'freelancer:browse_gigs:0')
    .text('Back to menu', 'freelancer:home')
}

export function buildGigApplyDraftKeyboard(gigId: string, hasCoverNote: boolean) {
  const keyboard = new InlineKeyboard()

  if (hasCoverNote) {
    keyboard.text('Confirm application', `freelancer:confirm_apply:${gigId}`).row()
  }

  return keyboard
    .text('Cancel application', 'freelancer:cancel_apply')
    .row()
    .text('Back to gig', `freelancer:view_gig:${gigId}`)
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

export function buildActiveJobsListKeyboard(
  jobs: TelegramActiveJobSummary[],
  page: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  const keyboard = new InlineKeyboard()

  for (const job of jobs) {
    const title = job.gig?.title ?? 'Unknown gig'
    keyboard.text(`View: ${title.slice(0, 24)}`, `freelancer:view_active_job:${job.id}`).row()
  }

  if (hasPreviousPage) {
    keyboard.text('Previous', `freelancer:active_jobs:${page - 1}`)
  }

  if (hasNextPage) {
    keyboard.text('Next', `freelancer:active_jobs:${page + 1}`)
  }

  if (hasPreviousPage || hasNextPage) {
    keyboard.row()
  }

  keyboard.text('Back to menu', 'freelancer:home')
  return keyboard
}

export function buildActiveJobDetailKeyboard(applicationId: string, canMarkInProgress: boolean) {
  const keyboard = new InlineKeyboard()

  if (canMarkInProgress) {
    keyboard.text('Mark as in progress', `freelancer:start_job:${applicationId}`).row()
  }

  return keyboard
    .text('Refresh job', `freelancer:view_active_job:${applicationId}`)
    .row()
    .text('Active jobs', 'freelancer:active_jobs:0')
    .text('Back to menu', 'freelancer:home')
}

export function buildVerificationStatusKeyboard() {
  return new InlineKeyboard()
    .text('Refresh status', 'freelancer:verification_status')
    .row()
    .text('Back to menu', 'freelancer:home')
}

export function buildAdminPendingVerificationsKeyboard(
  documents: TelegramPendingVerificationSummary[]
) {
  const keyboard = new InlineKeyboard()

  for (const document of documents) {
    const name = document.profiles?.full_name ?? 'Unknown user'
    keyboard
      .text(`Review: ${name.slice(0, 20)}`, `admin:view_verification:${document.id}`)
      .row()
  }

  keyboard.text('Back to menu', 'admin:home')
  return keyboard
}

export function buildAdminVerificationDetailKeyboard(documentId: string) {
  return new InlineKeyboard()
    .text('Approve', `admin:approve_verification:${documentId}`)
    .text('Reject', `admin:reject_verification:${documentId}`)
    .row()
    .text('Refresh verification', `admin:view_verification:${documentId}`)
    .row()
    .text('Pending verifications', 'admin:pending_verifications')
    .text('Back to menu', 'admin:home')
}

export function buildClientGigsListKeyboard(
  gigs: TelegramClientGigSummary[],
  page: number,
  hasPreviousPage: boolean,
  hasNextPage: boolean
) {
  const keyboard = new InlineKeyboard()

  for (const gig of gigs) {
    keyboard.text(`View: ${gig.title.slice(0, 24)}`, `client:view_gig:${gig.id}`).row()
  }

  if (hasPreviousPage) {
    keyboard.text('Previous', `client:my_gigs:${page - 1}`)
  }

  if (hasNextPage) {
    keyboard.text('Next', `client:my_gigs:${page + 1}`)
  }

  if (hasPreviousPage || hasNextPage) {
    keyboard.row()
  }

  keyboard.text('Back to menu', 'client:home')
  return keyboard
}

export function buildClientGigDetailKeyboard(gigId: string) {
  return new InlineKeyboard()
    .text('Review applicants', `client:view_applicants:${gigId}`)
    .row()
    .text('Refresh gig', `client:view_gig:${gigId}`)
    .row()
    .text('My gigs', 'client:my_gigs:0')
    .text('Back to menu', 'client:home')
}

export function buildClientApplicantsListKeyboard(
  gigId: string,
  applicants: TelegramGigApplicantSummary[]
) {
  const keyboard = new InlineKeyboard()

  for (const applicant of applicants) {
    const name = applicant.freelancer?.full_name ?? 'Unknown freelancer'
    keyboard.text(`View: ${name.slice(0, 24)}`, `client:view_applicant:${gigId}:${applicant.id}`).row()
  }

  keyboard.text('Back to gig', `client:view_gig:${gigId}`).row()
  keyboard.text('My gigs', 'client:my_gigs:0').text('Back to menu', 'client:home')
  return keyboard
}

export function buildClientApplicantDetailKeyboard(
  gigId: string,
  applicationId: string,
  isPending: boolean
) {
  const keyboard = new InlineKeyboard()

  if (isPending) {
    keyboard
      .text('Accept applicant', `client:accept_applicant:${gigId}:${applicationId}`)
      .text('Reject applicant', `client:reject_applicant:${gigId}:${applicationId}`)
      .row()
  }

  return keyboard
    .text('Back to applicants', `client:view_applicants:${gigId}`)
    .row()
    .text('Back to gig', `client:view_gig:${gigId}`)
    .text('Back to menu', 'client:home')
}
