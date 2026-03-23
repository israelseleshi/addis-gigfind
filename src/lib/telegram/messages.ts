import type { TelegramApplicationSummary } from '@/lib/actions/telegram/applications'
import type { TelegramBrowseGig } from '@/lib/actions/telegram/gigs'

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
    'Role-specific workflows are being added step by step.',
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
