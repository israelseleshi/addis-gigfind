import { touchTelegramAccount } from '@/lib/telegram/account-link'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { handleAdminHome, handlePendingVerifications } from '@/lib/telegram/handlers/admin'
import { handleClientHome, handleClientMyGigs } from '@/lib/telegram/handlers/client'
import { handleRejectVerificationReply } from '@/lib/telegram/handlers/admin'
import {
  handleActiveJobs,
  handleApplyReply,
  handleBrowseGigs,
  handleFreelancerHome,
  handleMyApplications,
  handleVerificationStatus,
} from '@/lib/telegram/handlers/freelancer'
import { requireLinkedTelegramAccount } from '@/lib/telegram/guards'
import { buildTelegramLogContext } from '@/lib/telegram/log-context'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildQuickActionHintMessage,
  buildUnrecognizedInputMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'
import { buildLinkedHomeKeyboard } from '@/lib/telegram/keyboards'

export async function handleTextMessage(ctx: TelegramBotContext) {
  try {
    const input = ctx.message.text.trim()
    if (input.startsWith('/')) {
      return
    }

    const applyHandled = await handleApplyReply(ctx)
    if (applyHandled) {
      return
    }

    const rejectVerificationHandled = await handleRejectVerificationReply(ctx)
    if (rejectVerificationHandled) {
      return
    }

    const resolved = await requireLinkedTelegramAccount(ctx)
    if (!resolved) {
      return
    }

    const normalized = input.trim().toLowerCase()

    if (normalized === 'menu' || normalized === 'home') {
      if (resolved.role === 'client') {
        await handleClientHome(ctx)
        return
      }

      if (resolved.role === 'admin' || resolved.role === 'regulator') {
        await handleAdminHome(ctx)
        return
      }

      await handleFreelancerHome(ctx)
      return
    }

    if (resolved.role === 'freelancer') {
      if (normalized === 'browse gigs') {
        await handleBrowseGigs(ctx, 0)
        return
      }

      if (normalized === 'my applications') {
        await handleMyApplications(ctx, 0)
        return
      }

      if (normalized === 'active jobs') {
        await handleActiveJobs(ctx, 0)
        return
      }

      if (normalized === 'verification' || normalized === 'verification status') {
        await handleVerificationStatus(ctx)
        return
      }
    }

    if (resolved.role === 'client') {
      if (normalized === 'my gigs') {
        await handleClientMyGigs(ctx, 0)
        return
      }

      if (normalized === 'applicants' || normalized === 'review applicants') {
        await handleClientMyGigs(ctx, 0)
        await ctx.reply('Open one of your gigs below, then choose "Review applicants".')
        return
      }
    }

    if ((resolved.role === 'admin' || resolved.role === 'regulator') &&
      (normalized === 'pending verifications' || normalized === 'verifications')) {
      await handlePendingVerifications(ctx)
      return
    }

    await touchTelegramAccount(resolved.telegramUserId)
    await ctx.reply([buildUnrecognizedInputMessage(), '', buildQuickActionHintMessage(resolved.role ?? 'freelancer')].join('\n'), {
      reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'freelancer'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'text' }) },
      'Telegram text handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
