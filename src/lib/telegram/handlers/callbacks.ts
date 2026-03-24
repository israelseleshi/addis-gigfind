import type { TelegramBotContext } from '@/lib/telegram/context'
import {
  handleApproveVerification,
  handleAdminHome,
  handleNextPendingVerification,
  handlePendingVerificationDetails,
  handlePendingVerifications,
  handleRejectVerificationPrompt,
} from '@/lib/telegram/handlers/admin'
import {
  handleClientAcceptApplicant,
  handleClientCancelPostGig,
  handleClientConfirmPostGig,
  handleClientHome,
  handleClientMyGigs,
  handleClientPostGigStart,
  handleClientRejectApplicant,
  handleClientSelectGigCategory,
  handleClientSelectGigLocation,
  handleClientViewApplicantDetails,
  handleClientViewApplicants,
  handleClientViewGigDetails,
} from '@/lib/telegram/handlers/client'
import {
  handleActiveJobs,
  handleApplyGigPlaceholder,
  handleBrowseGigs,
  handleChooseGigCategoryFilter,
  handleChooseGigLocationFilter,
  handleCancelGigApplication,
  handleClearGigFilters,
  handleConfirmGigApplication,
  handleFreelancerHome,
  handleMarkActiveJobInProgress,
  handleMyApplications,
  handlePromptGigCategoryFilter,
  handlePromptGigLocationFilter,
  handleSetGigCategoryFilter,
  handleSetGigLocationFilter,
  handleVerificationStatus,
  handleViewActiveJobDetails,
  handleViewApplicationDetails,
  handleViewGigDetails,
} from '@/lib/telegram/handlers/freelancer'
import { requireLinkedTelegramAccount } from '@/lib/telegram/guards'
import { buildTelegramLogContext } from '@/lib/telegram/log-context'
import { buildUnrecognizedInputMessage, buildTemporaryUnavailableMessage } from '@/lib/telegram/messages'
import { telegramLogger } from '@/lib/telegram/logger'
import { shouldThrottleTelegramAction } from '@/lib/telegram/rate-limit'

const HIGH_RISK_CALLBACK_WINDOW_MS = 5_000

function isHighRiskCallback(callbackData: string) {
  return [
    'admin:approve_verification:',
    'client:accept_applicant:',
    'client:reject_applicant:',
    'freelancer:start_job:',
  ].some((prefix) => callbackData.startsWith(prefix))
}

export async function handleCallbackQuery(ctx: TelegramBotContext) {
  try {
    const callbackData = ctx.callbackQuery?.data
    if (!callbackData) {
      return
    }

    const actorId = String(ctx.from?.id ?? '')

    if (actorId && isHighRiskCallback(callbackData)) {
      const throttleKey = `callback:${actorId}:${callbackData}`
      if (shouldThrottleTelegramAction(throttleKey, HIGH_RISK_CALLBACK_WINDOW_MS)) {
        await ctx.answerCallbackQuery({
          text: 'That action is already being processed.',
        })
        return
      }
    }

    if (callbackData === 'admin:home') {
      await handleAdminHome(ctx)
      return
    }

    if (callbackData === 'admin:pending_verifications') {
      await handlePendingVerifications(ctx)
      return
    }

    if (callbackData.startsWith('admin:view_verification:')) {
      const documentId = callbackData.split(':')[2]
      await handlePendingVerificationDetails(ctx, documentId)
      return
    }

    if (callbackData.startsWith('admin:approve_verification:')) {
      const documentId = callbackData.split(':')[3]
      await handleApproveVerification(ctx, documentId)
      return
    }

    if (callbackData.startsWith('admin:next_verification:')) {
      const documentId = callbackData.split(':')[2]
      await handleNextPendingVerification(ctx, documentId)
      return
    }

    if (callbackData.startsWith('admin:reject_verification:')) {
      const documentId = callbackData.split(':')[3]
      await handleRejectVerificationPrompt(ctx, documentId)
      return
    }

    if (callbackData === 'client:home') {
      await handleClientHome(ctx)
      return
    }

    if (callbackData === 'client:post_gig') {
      await handleClientPostGigStart(ctx)
      return
    }

    if (callbackData === 'client:cancel_post_gig') {
      await handleClientCancelPostGig(ctx)
      return
    }

    if (callbackData === 'client:confirm_post_gig') {
      await handleClientConfirmPostGig(ctx)
      return
    }

    if (callbackData.startsWith('client:post_category:')) {
      const category = callbackData.split(':')[2]
      await handleClientSelectGigCategory(ctx, category)
      return
    }

    if (callbackData.startsWith('client:post_location:')) {
      const location = callbackData.split(':')[2]
      await handleClientSelectGigLocation(ctx, location)
      return
    }

    if (callbackData.startsWith('client:my_gigs')) {
      const page = Number(callbackData.split(':')[2] ?? '0')
      await handleClientMyGigs(ctx, Number.isNaN(page) ? 0 : page)
      return
    }

    if (callbackData === 'client:review_applicants') {
      await handleClientMyGigs(ctx, 0)
      return
    }

    if (callbackData.startsWith('client:view_gig:')) {
      const gigId = callbackData.split(':')[2]
      await handleClientViewGigDetails(ctx, gigId)
      return
    }

    if (callbackData.startsWith('client:view_applicants:')) {
      const gigId = callbackData.split(':')[2]
      await handleClientViewApplicants(ctx, gigId)
      return
    }

    if (callbackData.startsWith('client:view_applicant:')) {
      const [, , gigId, applicationId] = callbackData.split(':')
      await handleClientViewApplicantDetails(ctx, gigId, applicationId)
      return
    }

    if (callbackData.startsWith('client:accept_applicant:')) {
      const [, , gigId, applicationId] = callbackData.split(':')
      await handleClientAcceptApplicant(ctx, gigId, applicationId)
      return
    }

    if (callbackData.startsWith('client:reject_applicant:')) {
      const [, , gigId, applicationId] = callbackData.split(':')
      await handleClientRejectApplicant(ctx, gigId, applicationId)
      return
    }

    if (callbackData === 'freelancer:home') {
      await handleFreelancerHome(ctx)
      return
    }

    if (callbackData.startsWith('freelancer:browse_gigs')) {
      const page = Number(callbackData.split(':')[2] ?? '0')
      await handleBrowseGigs(ctx, Number.isNaN(page) ? 0 : page)
      return
    }

    if (callbackData === 'freelancer:choose_category') {
      await handleChooseGigCategoryFilter(ctx)
      return
    }

    if (callbackData === 'freelancer:choose_location') {
      await handleChooseGigLocationFilter(ctx)
      return
    }

    if (callbackData === 'freelancer:prompt_category') {
      await handlePromptGigCategoryFilter(ctx)
      return
    }

    if (callbackData === 'freelancer:prompt_location') {
      await handlePromptGigLocationFilter(ctx)
      return
    }

    if (callbackData === 'freelancer:clear_filters') {
      await handleClearGigFilters(ctx)
      return
    }

    if (callbackData === 'freelancer:clear_category') {
      await handleSetGigCategoryFilter(ctx, null)
      return
    }

    if (callbackData === 'freelancer:clear_location') {
      await handleSetGigLocationFilter(ctx, null)
      return
    }

    if (callbackData.startsWith('freelancer:set_category:')) {
      const category = decodeURIComponent(callbackData.slice('freelancer:set_category:'.length))
      await handleSetGigCategoryFilter(ctx, category)
      return
    }

    if (callbackData.startsWith('freelancer:set_location:')) {
      const location = decodeURIComponent(callbackData.slice('freelancer:set_location:'.length))
      await handleSetGigLocationFilter(ctx, location)
      return
    }

    if (callbackData.startsWith('freelancer:view_gig:')) {
      const gigId = callbackData.split(':')[2]
      await handleViewGigDetails(ctx, gigId)
      return
    }

    if (callbackData.startsWith('freelancer:active_jobs')) {
      const page = Number(callbackData.split(':')[2] ?? '0')
      await handleActiveJobs(ctx, Number.isNaN(page) ? 0 : page)
      return
    }

    if (callbackData.startsWith('freelancer:view_active_job:')) {
      const applicationId = callbackData.split(':')[2]
      await handleViewActiveJobDetails(ctx, applicationId)
      return
    }

    if (callbackData.startsWith('freelancer:start_job:')) {
      const applicationId = callbackData.split(':')[2]
      await handleMarkActiveJobInProgress(ctx, applicationId)
      return
    }

    if (callbackData === 'freelancer:verification_status') {
      await handleVerificationStatus(ctx)
      return
    }

    if (callbackData.startsWith('freelancer:my_applications')) {
      const page = Number(callbackData.split(':')[2] ?? '0')
      await handleMyApplications(ctx, Number.isNaN(page) ? 0 : page)
      return
    }

    if (callbackData.startsWith('freelancer:view_application:')) {
      const applicationId = callbackData.split(':')[2]
      await handleViewApplicationDetails(ctx, applicationId)
      return
    }

    if (callbackData.startsWith('freelancer:apply_gig:')) {
      const gigId = callbackData.split(':')[2]
      await handleApplyGigPlaceholder(ctx, gigId)
      return
    }

    if (callbackData.startsWith('freelancer:confirm_apply:')) {
      const gigId = callbackData.split(':')[2]
      await handleConfirmGigApplication(ctx, gigId)
      return
    }

    if (callbackData === 'freelancer:cancel_apply') {
      await handleCancelGigApplication(ctx)
      return
    }

    const resolved = await requireLinkedTelegramAccount(ctx)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    await ctx.answerCallbackQuery({
      text: 'Workflow button registered.',
    })

    await ctx.reply(buildUnrecognizedInputMessage())
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'callbacks' }) },
      'Telegram callback handler failed'
    )
    await ctx.answerCallbackQuery({
      text: 'Something went wrong.',
      show_alert: true,
    })
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
