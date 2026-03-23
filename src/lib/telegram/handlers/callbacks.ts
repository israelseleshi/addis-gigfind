import type { TelegramBotContext } from '@/lib/telegram/context'
import {
  handleActiveJobs,
  handleApplyGigPlaceholder,
  handleBrowseGigs,
  handleFreelancerHome,
  handleMarkActiveJobInProgress,
  handleMyApplications,
  handleViewActiveJobDetails,
  handleViewApplicationDetails,
  handleViewGigDetails,
} from '@/lib/telegram/handlers/freelancer'
import { requireLinkedTelegramAccount } from '@/lib/telegram/guards'
import { buildUnrecognizedInputMessage, buildTemporaryUnavailableMessage } from '@/lib/telegram/messages'
import { telegramLogger } from '@/lib/telegram/logger'

export async function handleCallbackQuery(ctx: TelegramBotContext) {
  try {
    const callbackData = ctx.callbackQuery.data

    if (callbackData === 'freelancer:home') {
      await handleFreelancerHome(ctx)
      return
    }

    if (callbackData.startsWith('freelancer:browse_gigs')) {
      const page = Number(callbackData.split(':')[2] ?? '0')
      await handleBrowseGigs(ctx, Number.isNaN(page) ? 0 : page)
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
    telegramLogger.error({ error }, 'Telegram callback handler failed')
    await ctx.answerCallbackQuery({
      text: 'Something went wrong.',
      show_alert: true,
    })
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
