import type {
  TelegramActiveJobSummary,
  TelegramApplicationSummary,
  TelegramGigApplicantSummary,
} from '@/lib/actions/telegram/applications'
import type { TelegramBrowseGig, TelegramClientGigSummary } from '@/lib/actions/telegram/gigs'
import type { TelegramVerificationSnapshot } from '@/lib/actions/telegram/verifications'
import type { TelegramPendingVerificationSummary } from '@/lib/actions/telegram/verifications'

export function buildRoleMenu(role: string) {
  if (role === 'client') {
    return [
      'Available actions:',
      '- Post a gig',
      '- View my gigs',
      '- Review applicants',
    ].join('\n')
  }

  if (role === 'admin' || role === 'regulator') {
    return [
      'Available actions:',
      '- Review verifications',
      '- View platform stats',
      '- Moderate users and gigs',
    ].join('\n')
  }

  return [
    'Available actions:',
    '- Browse gigs',
    '- Apply to gigs',
    '- View my applications',
    '- Check active jobs',
  ].join('\n')
}

export function buildRoleHomePrompt(role: string) {
  if (role === 'client') {
    return 'Choose a client action below.'
  }

  if (role === 'admin' || role === 'regulator') {
    return 'Choose an admin action below.'
  }

  return 'Choose a freelancer action below.'
}

export function buildLinkInstructions() {
  return [
    'Your Telegram account is not linked yet.',
    '',
    'On the Addis GigFind website, generate a Telegram link code, then send:',
    '<code>/link YOURCODE</code>',
  ].join('\n')
}

export function buildTemporaryUnavailableMessage() {
  return [
    'The bot is online, but account linking is not ready yet.',
    'Please finish the Addis GigFind backend setup and try again.',
  ].join('\n')
}

export function buildStartupStatusMessage() {
  return [
    'Addis GigFind bot is online.',
    'Checking your account link status...',
  ].join('\n')
}

export function buildLinkedWelcomeMessage(name: string, role: string) {
  return [
    `Welcome back, ${name}.`,
    '',
    `Role: ${role}`,
    buildRoleMenu(role),
    '',
    buildRoleHomePrompt(role),
  ].join('\n')
}

export function buildScaffoldingPlaceholderMessage() {
  return [
    'Core bot scaffolding is live.',
    'Next implementation step is role-specific gig and review flows.',
  ].join('\n')
}

export function buildUnrecognizedInputMessage() {
  return [
    'Use the Telegram buttons below to continue.',
    'You can also type "menu" or "home" at any time.',
  ].join('\n')
}

export function buildQuickActionHintMessage(role: string) {
  if (role === 'client') {
    return [
      'Quick text shortcuts:',
      '"menu", "home", "my gigs", "applicants"',
    ].join('\n')
  }

  if (role === 'admin' || role === 'regulator') {
    return [
      'Quick text shortcuts:',
      '"menu", "home", "pending verifications"',
    ].join('\n')
  }

  return [
    'Quick text shortcuts:',
    '"menu", "home", "browse gigs", "my applications", "active jobs", "verification"',
  ].join('\n')
}

function formatRelativeTelegramTime(value: string | null) {
  if (!value) {
    return 'Recently'
  }

  const createdAt = new Date(value).getTime()
  const diffSeconds = Math.max(0, Math.floor((Date.now() - createdAt) / 1000))

  if (diffSeconds < 60) {
    return 'Just now'
  }

  if (diffSeconds < 3600) {
    return `${Math.floor(diffSeconds / 60)}m ago`
  }

  if (diffSeconds < 86400) {
    return `${Math.floor(diffSeconds / 3600)}h ago`
  }

  return `${Math.floor(diffSeconds / 86400)}d ago`
}

function formatApplicationStatus(status: string | null) {
  switch (status) {
    case 'accepted':
      return 'Accepted'
    case 'rejected':
      return 'Rejected'
    case 'withdrawn':
      return 'Withdrawn'
    default:
      return 'Pending'
  }
}

function formatGigStatus(status: string | null) {
  switch (status) {
    case 'assigned':
      return 'Assigned'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

function formatGigStatusLower(status: string | null) {
  return formatGigStatus(status)
}

export function buildGigBrowseIntro(page: number, total: number) {
  return [
    'Open gigs for freelancers',
    '',
    `Showing page ${page + 1}`,
    `${total} open gig${total === 1 ? '' : 's'} available`,
    '',
    'Tap a gig below to view details.',
  ].join('\n')
}

export function buildGigBrowseEmptyState() {
  return [
    'No open gigs are available right now.',
    'Check back later or use the website to browse again.',
  ].join('\n')
}

export function buildGigSummaryLines(gig: TelegramBrowseGig) {
  return [
    `- ${gig.title}`,
    `  ${gig.category} | ${gig.location} | ETB ${gig.budget.toLocaleString()}`,
    `  Client: ${gig.client?.full_name ?? 'Unknown client'} | Posted ${formatRelativeTelegramTime(gig.created_at)}`,
  ].join('\n')
}

export function buildGigListMessage(gigs: TelegramBrowseGig[]) {
  return gigs.map(buildGigSummaryLines).join('\n\n')
}

export function buildGigDetailMessage(gig: TelegramBrowseGig) {
  const rating = gig.client?.average_rating ? ` | Rating ${gig.client.average_rating}` : ''

  return [
    `<b>${gig.title}</b>`,
    `${gig.category} | ${gig.location}`,
    `Budget: <b>ETB ${gig.budget.toLocaleString()}</b>`,
    `Client: ${gig.client?.full_name ?? 'Unknown client'}${rating}`,
    '',
    gig.description,
  ].join('\n')
}

export function buildGigNotFoundMessage() {
  return 'That gig is no longer available.'
}

export function buildGigApplyPromptMessage(gig: TelegramBrowseGig) {
  return [
    `Apply prompt for gig ${gig.id}`,
    '',
    `<b>${gig.title}</b>`,
    `Budget: ETB ${gig.budget.toLocaleString()}`,
    '',
    'Reply to this exact message with your cover note.',
    'Minimum length: 20 characters.',
  ].join('\n')
}

export function buildGigApplySuccessMessage(title: string) {
  return [
    `Application submitted for "${title}".`,
    'You can review its status later in My applications.',
  ].join('\n')
}

export function buildGigApplyInstructionMessage() {
  return [
    'Please reply directly to the apply prompt message with your cover note.',
    'That lets the bot know which gig you are applying to.',
  ].join('\n')
}

export function buildMyApplicationsIntro(page: number, total: number) {
  return [
    'Your applications',
    '',
    `Showing page ${page + 1}`,
    `${total} application${total === 1 ? '' : 's'} found`,
    '',
    'Tap an application below to inspect it.',
  ].join('\n')
}

export function buildMyApplicationsEmptyState() {
  return [
    'You have not submitted any applications yet.',
    'Browse gigs and apply to one to get started.',
  ].join('\n')
}

export function buildApplicationSummaryLines(application: TelegramApplicationSummary) {
  return [
    `- ${application.gig?.title ?? 'Unknown gig'}`,
    `  Status: ${formatApplicationStatus(application.status)}`,
    `  ${application.gig?.category ?? 'Uncategorized'} | ${application.gig?.location ?? 'Unknown location'}`,
    `  Applied ${formatRelativeTelegramTime(application.created_at)}`,
  ].join('\n')
}

export function buildApplicationsListMessage(applications: TelegramApplicationSummary[]) {
  return applications.map(buildApplicationSummaryLines).join('\n\n')
}

export function buildApplicationDetailMessage(
  application: TelegramApplicationSummary & {
    gig: TelegramApplicationSummary['gig'] & { description: string }
  }
) {
  return [
    `<b>${application.gig?.title ?? 'Unknown gig'}</b>`,
    `Status: <b>${formatApplicationStatus(application.status)}</b>`,
    `${application.gig?.category ?? 'Uncategorized'} | ${application.gig?.location ?? 'Unknown location'}`,
    `Budget: ETB ${application.gig?.budget?.toLocaleString() ?? '0'}`,
    `Client: ${application.gig?.client?.full_name ?? 'Unknown client'}`,
    '',
    `<b>Your cover note</b>`,
    application.cover_note ?? 'No cover note provided.',
  ].join('\n')
}

export function buildApplicationNotFoundMessage() {
  return 'That application could not be found.'
}

export function buildActiveJobsIntro(page: number, total: number) {
  return [
    'Your active jobs',
    '',
    `Showing page ${page + 1}`,
    `${total} active job${total === 1 ? '' : 's'} found`,
    '',
    'Tap a job below to inspect it.',
  ].join('\n')
}

export function buildActiveJobsEmptyState() {
  return [
    'You do not have any active jobs right now.',
    'Accepted applications with assigned or in-progress gigs will appear here.',
  ].join('\n')
}

export function buildActiveJobSummaryLines(job: TelegramActiveJobSummary) {
  return [
    `- ${job.gig?.title ?? 'Unknown gig'}`,
    `  Status: ${formatGigStatus(job.gig?.status ?? null)}`,
    `  ${job.gig?.category ?? 'Uncategorized'} | ${job.gig?.location ?? 'Unknown location'}`,
    `  Budget: ETB ${job.gig?.budget?.toLocaleString() ?? '0'}`,
  ].join('\n')
}

export function buildActiveJobsListMessage(jobs: TelegramActiveJobSummary[]) {
  return jobs.map(buildActiveJobSummaryLines).join('\n\n')
}

export function buildActiveJobDetailMessage(job: TelegramActiveJobSummary) {
  return [
    `<b>${job.gig?.title ?? 'Unknown gig'}</b>`,
    `Job status: <b>${formatGigStatus(job.gig?.status ?? null)}</b>`,
    `${job.gig?.category ?? 'Uncategorized'} | ${job.gig?.location ?? 'Unknown location'}`,
    `Budget: ETB ${job.gig?.budget?.toLocaleString() ?? '0'}`,
    `Client: ${job.gig?.client?.full_name ?? 'Unknown client'}`,
    '',
    job.gig?.description ?? 'No description available.',
  ].join('\n')
}

export function buildActiveJobNotFoundMessage() {
  return 'That active job could not be found.'
}

export function buildActiveJobMarkedInProgressMessage(title: string) {
  return [
    `"${title}" is now marked as in progress.`,
    'The job status is updated in the main platform as well.',
  ].join('\n')
}

function formatVerificationStatus(status: TelegramVerificationSnapshot['status']) {
  switch (status) {
    case 'verified':
      return 'Verified'
    case 'pending':
      return 'Pending review'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Not verified'
  }
}

function formatDocumentType(documentType: string | undefined) {
  if (!documentType) {
    return 'Unknown'
  }

  return documentType.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export function buildVerificationStatusMessage(snapshot: TelegramVerificationSnapshot) {
  const lines = [
    'Your verification status',
    '',
    `Status: ${formatVerificationStatus(snapshot.status)}`,
  ]

  if (!snapshot.document) {
    lines.push('', 'No verification document is on file yet.', 'Submit your documents on the website to unlock applications and hiring workflows.')
    return lines.join('\n')
  }

  lines.push(
    '',
    `Document type: ${formatDocumentType(snapshot.document.document_type)}`,
    `ID number: ${snapshot.document.id_number}`,
    `Document status: ${formatVerificationStatus(
      (snapshot.document.status as TelegramVerificationSnapshot['status']) ?? snapshot.status
    )}`
  )

  if (snapshot.document.submitted_at) {
    lines.push(`Submitted: ${new Date(snapshot.document.submitted_at).toLocaleDateString('en-US')}`)
  }

  if (snapshot.status === 'pending') {
    lines.push('', 'Your verification is under review. This usually takes 1-2 business days.')
  }

  if (snapshot.status === 'verified') {
    lines.push('', 'Your account is verified. You can apply to gigs from Telegram and the website.')
  }

  if (snapshot.status === 'rejected') {
    lines.push('', 'Your latest verification was rejected.')
    if (snapshot.document.admin_notes) {
      lines.push(`Reason: ${snapshot.document.admin_notes}`)
    }
    lines.push('Resubmit your documents on the website when ready.')
  }

  if (snapshot.status === 'unverified') {
    lines.push('', 'Submit your verification documents on the website to start applying for gigs.')
  }

  return lines.join('\n')
}

export function buildClientGigsIntro(page: number, total: number) {
  return [
    'Your gigs',
    '',
    `Showing page ${page + 1}`,
    `${total} gig${total === 1 ? '' : 's'} found`,
    '',
    'Tap a gig below to inspect it.',
  ].join('\n')
}

export function buildClientGigsEmptyState() {
  return [
    'You have not posted any gigs yet.',
    'Use the website for now to post your first gig while the Telegram posting flow is being added.',
  ].join('\n')
}

export function buildClientGigSummaryLines(gig: TelegramClientGigSummary) {
  const applicants = gig.applications?.[0]?.count ?? 0

  return [
    `- ${gig.title}`,
    `  ${formatGigStatusLower(gig.status)} | ${gig.category} | ${gig.location}`,
    `  ETB ${gig.budget.toLocaleString()} | ${applicants} applicant${applicants === 1 ? '' : 's'}`,
  ].join('\n')
}

export function buildClientGigsListMessage(gigs: TelegramClientGigSummary[]) {
  return gigs.map(buildClientGigSummaryLines).join('\n\n')
}

export function buildClientGigDetailMessage(gig: TelegramClientGigSummary) {
  const applicants = gig.applications?.[0]?.count ?? 0

  return [
    `<b>${gig.title}</b>`,
    `Status: <b>${formatGigStatusLower(gig.status)}</b>`,
    `${gig.category} | ${gig.location}`,
    `Budget: ETB ${gig.budget.toLocaleString()}`,
    `Applicants: ${applicants}`,
    '',
    gig.description,
  ].join('\n')
}

export function buildClientGigNotFoundMessage() {
  return 'That client gig could not be found.'
}

export function buildAdminPendingVerificationsIntro(count: number) {
  return [
    'Pending verifications',
    '',
    `${count} verification request${count === 1 ? '' : 's'} waiting for review`,
    'Tap a request below to inspect it.',
  ].join('\n')
}

export function buildAdminPendingVerificationsEmptyState() {
  return [
    'There are no pending verifications right now.',
    'You are caught up on verification review.',
  ].join('\n')
}

export function buildAdminPendingVerificationSummaryLines(
  document: TelegramPendingVerificationSummary
) {
  return [
    `- ${document.profiles?.full_name ?? 'Unknown user'}`,
    `  ${formatDocumentType(document.document_type)} | ID ${document.id_number}`,
    `  Submitted ${formatRelativeTelegramTime(document.submitted_at)}`,
  ].join('\n')
}

export function buildAdminPendingVerificationsListMessage(
  documents: TelegramPendingVerificationSummary[]
) {
  return documents.map(buildAdminPendingVerificationSummaryLines).join('\n\n')
}

export function buildAdminVerificationDetailMessage(
  document: TelegramPendingVerificationSummary
) {
  const lines = [
    `<b>${document.profiles?.full_name ?? 'Unknown user'}</b>`,
    `Status: <b>Pending</b>`,
    `Document type: ${formatDocumentType(document.document_type)}`,
    `ID number: ${document.id_number}`,
    `User ID: ${document.user_id}`,
  ]

  if (document.submitted_at) {
    lines.push(`Submitted: ${new Date(document.submitted_at).toLocaleDateString('en-US')}`)
  }

  if (document.description) {
    lines.push('', '<b>Description</b>', document.description)
  }

  return lines.join('\n')
}

export function buildAdminVerificationNotFoundMessage() {
  return 'That verification request could not be found.'
}

export function buildAdminVerificationApprovedMessage(fullName: string) {
  return [
    `${fullName} has been verified.`,
    'The user profile and verification record were updated.',
  ].join('\n')
}

export function buildAdminVerificationRejectPromptMessage(documentId: string, fullName: string) {
  return [
    `Reject verification prompt for document ${documentId}`,
    '',
    `User: ${fullName}`,
    'Reply to this exact message with the rejection reason.',
    'Minimum length: 5 characters.',
  ].join('\n')
}

export function buildAdminVerificationRejectedMessage(fullName: string) {
  return [
    `${fullName} was rejected.`,
    'The rejection reason was saved to the verification record.',
  ].join('\n')
}

export function buildAdminVerificationRejectInstructionMessage() {
  return [
    'Please reply directly to the rejection prompt message with the rejection reason.',
    'That lets the bot know which verification request to reject.',
  ].join('\n')
}

export function buildClientApplicantsIntro(gigTitle: string, applicantCount: number) {
  return [
    `Applicants for ${gigTitle}`,
    '',
    `${applicantCount} application${applicantCount === 1 ? '' : 's'} found`,
    'Tap an applicant below to inspect the submission.',
  ].join('\n')
}

export function buildClientApplicantsEmptyState(gigTitle: string) {
  return [
    `No applicants yet for ${gigTitle}.`,
    'Applications will appear here when freelancers start applying.',
  ].join('\n')
}

export function buildClientApplicantSummaryLines(applicant: TelegramGigApplicantSummary) {
  const rating =
    typeof applicant.freelancer?.average_rating === 'number'
      ? ` | Rating ${applicant.freelancer.average_rating.toFixed(1)}`
      : ''

  return [
    `- ${applicant.freelancer?.full_name ?? 'Unknown freelancer'}`,
    `  Status: ${formatApplicationStatus(applicant.status)}`,
    `  Applied ${formatRelativeTelegramTime(applicant.created_at)}${rating}`,
  ].join('\n')
}

export function buildClientApplicantsListMessage(applicants: TelegramGigApplicantSummary[]) {
  return applicants.map(buildClientApplicantSummaryLines).join('\n\n')
}

export function buildClientApplicantDetailMessage(
  gigTitle: string,
  applicant: TelegramGigApplicantSummary
) {
  const lines = [
    `<b>${applicant.freelancer?.full_name ?? 'Unknown freelancer'}</b>`,
    `Gig: ${gigTitle}`,
    `Status: <b>${formatApplicationStatus(applicant.status)}</b>`,
  ]

  if (typeof applicant.freelancer?.average_rating === 'number') {
    lines.push(
      `Rating: ${applicant.freelancer.average_rating.toFixed(1)} (${applicant.freelancer.reviews_count ?? 0} reviews)`
    )
  }

  if (applicant.freelancer?.phone_number) {
    lines.push(`Phone: ${applicant.freelancer.phone_number}`)
  }

  if (typeof applicant.bid_amount === 'number') {
    lines.push(`Bid amount: ETB ${applicant.bid_amount.toLocaleString()}`)
  }

  lines.push('', '<b>Cover note</b>', applicant.cover_note ?? 'No cover note provided.')
  return lines.join('\n')
}

export function buildClientApplicantNotFoundMessage() {
  return 'That applicant submission could not be found.'
}

export function buildClientApplicationAcceptedMessage(
  freelancerName: string,
  gigTitle: string
) {
  return [
    `${freelancerName} has been accepted for "${gigTitle}".`,
    'The gig is now assigned and the other applications were rejected.',
  ].join('\n')
}

export function buildClientApplicationRejectedMessage(
  freelancerName: string,
  gigTitle: string
) {
  return [
    `${freelancerName} was rejected for "${gigTitle}".`,
    'You can continue reviewing the remaining applicants.',
  ].join('\n')
}
