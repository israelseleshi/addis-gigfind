import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  handleApproveVerification: vi.fn(),
  handleAdminHome: vi.fn(),
  handlePendingVerificationDetails: vi.fn(),
  handlePendingVerifications: vi.fn(),
  handleRejectVerificationPrompt: vi.fn(),
  handleClientAcceptApplicant: vi.fn(),
  handleClientHome: vi.fn(),
  handleClientMyGigs: vi.fn(),
  handleClientRejectApplicant: vi.fn(),
  handleClientViewApplicantDetails: vi.fn(),
  handleClientViewApplicants: vi.fn(),
  handleClientViewGigDetails: vi.fn(),
  handleActiveJobs: vi.fn(),
  handleApplyGigPlaceholder: vi.fn(),
  handleBrowseGigs: vi.fn(),
  handleFreelancerHome: vi.fn(),
  handleMarkActiveJobInProgress: vi.fn(),
  handleMyApplications: vi.fn(),
  handleVerificationStatus: vi.fn(),
  handleViewActiveJobDetails: vi.fn(),
  handleViewApplicationDetails: vi.fn(),
  handleViewGigDetails: vi.fn(),
  requireLinkedTelegramAccount: vi.fn(),
  shouldThrottleTelegramAction: vi.fn(),
  telegramLoggerError: vi.fn(),
}))

vi.mock('@/lib/telegram/handlers/admin', () => ({
  handleApproveVerification: mocks.handleApproveVerification,
  handleAdminHome: mocks.handleAdminHome,
  handlePendingVerificationDetails: mocks.handlePendingVerificationDetails,
  handlePendingVerifications: mocks.handlePendingVerifications,
  handleRejectVerificationPrompt: mocks.handleRejectVerificationPrompt,
}))

vi.mock('@/lib/telegram/handlers/client', () => ({
  handleClientAcceptApplicant: mocks.handleClientAcceptApplicant,
  handleClientHome: mocks.handleClientHome,
  handleClientMyGigs: mocks.handleClientMyGigs,
  handleClientRejectApplicant: mocks.handleClientRejectApplicant,
  handleClientViewApplicantDetails: mocks.handleClientViewApplicantDetails,
  handleClientViewApplicants: mocks.handleClientViewApplicants,
  handleClientViewGigDetails: mocks.handleClientViewGigDetails,
}))

vi.mock('@/lib/telegram/handlers/freelancer', () => ({
  handleActiveJobs: mocks.handleActiveJobs,
  handleApplyGigPlaceholder: mocks.handleApplyGigPlaceholder,
  handleBrowseGigs: mocks.handleBrowseGigs,
  handleFreelancerHome: mocks.handleFreelancerHome,
  handleMarkActiveJobInProgress: mocks.handleMarkActiveJobInProgress,
  handleMyApplications: mocks.handleMyApplications,
  handleVerificationStatus: mocks.handleVerificationStatus,
  handleViewActiveJobDetails: mocks.handleViewActiveJobDetails,
  handleViewApplicationDetails: mocks.handleViewApplicationDetails,
  handleViewGigDetails: mocks.handleViewGigDetails,
}))

vi.mock('@/lib/telegram/guards', () => ({
  requireLinkedTelegramAccount: mocks.requireLinkedTelegramAccount,
}))

vi.mock('@/lib/telegram/rate-limit', () => ({
  shouldThrottleTelegramAction: mocks.shouldThrottleTelegramAction,
}))

vi.mock('@/lib/telegram/logger', () => ({
  telegramLogger: {
    error: mocks.telegramLoggerError,
  },
}))

import { handleCallbackQuery } from './callbacks'

function createCallbackContext(callbackData: string) {
  return {
    from: { id: 12345, username: 'tester' },
    chat: { id: 67890 },
    callbackQuery: { data: callbackData },
    answerCallbackQuery: vi.fn(),
    reply: vi.fn(),
    updateType: 'callback_query',
  } as never
}

describe('handleCallbackQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.shouldThrottleTelegramAction.mockReturnValue(false)
    mocks.requireLinkedTelegramAccount.mockResolvedValue({
      telegramUserId: '12345',
      account: { user_id: 'user-1' },
      profile: { id: 'user-1', role: 'freelancer', full_name: 'Test User' },
      role: 'freelancer',
    })
  })

  it('routes applicant detail callbacks with parsed gig and application ids', async () => {
    const ctx = createCallbackContext('client:view_applicant:gig-1:application-1')
    mocks.requireLinkedTelegramAccount.mockResolvedValue({
      telegramUserId: '12345',
      account: { user_id: 'user-2' },
      profile: { id: 'user-2', role: 'client', full_name: 'Client User' },
      role: 'client',
    })

    await handleCallbackQuery(ctx)

    expect(mocks.handleClientViewApplicantDetails).toHaveBeenCalledWith(
      ctx,
      'gig-1',
      'application-1'
    )
  })

  it('routes paginated freelancer browse callbacks with a numeric page', async () => {
    const ctx = createCallbackContext('freelancer:browse_gigs:2')

    await handleCallbackQuery(ctx)

    expect(mocks.handleBrowseGigs).toHaveBeenCalledWith(ctx, 2)
  })

  it('suppresses repeated high-risk callbacks during the throttle window', async () => {
    const ctx = createCallbackContext('client:accept_applicant:gig-1:application-1')
    mocks.shouldThrottleTelegramAction.mockReturnValue(true)

    await handleCallbackQuery(ctx)

    expect(mocks.shouldThrottleTelegramAction).toHaveBeenCalledWith(
      'callback:12345:client:accept_applicant:gig-1:application-1',
      5_000
    )
    expect(ctx.answerCallbackQuery).toHaveBeenCalledWith({
      text: 'That action is already being processed.',
    })
    expect(mocks.handleClientAcceptApplicant).not.toHaveBeenCalled()
  })

  it('falls back safely for unrecognized callbacks from linked users', async () => {
    const ctx = createCallbackContext('unknown:action')
    mocks.requireLinkedTelegramAccount.mockResolvedValue({
      telegramUserId: '12345',
      account: { user_id: 'user-1' },
      profile: { id: 'user-1', role: 'freelancer', full_name: 'Test User' },
      role: 'freelancer',
    })

    await handleCallbackQuery(ctx)

    expect(ctx.answerCallbackQuery).toHaveBeenCalledWith({
      text: 'Workflow button registered.',
    })
    expect(ctx.reply).toHaveBeenCalledWith(
      'Use the Telegram buttons below to continue.\nYou can also type "menu" or "home" at any time.'
    )
  })
})
