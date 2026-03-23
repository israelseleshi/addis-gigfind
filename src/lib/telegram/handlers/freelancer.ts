import {
  applyForGigFromTelegram,
  getTelegramActiveJobDetails,
  getTelegramApplicationDetails,
  listTelegramApplicationsForFreelancer,
  listTelegramActiveJobsForFreelancer,
  markTelegramActiveJobInProgress,
} from '@/lib/actions/telegram/applications'
import { getTelegramGigDetails, listTelegramOpenGigs } from '@/lib/actions/telegram/gigs'
import { getTelegramVerificationStatus } from '@/lib/actions/telegram/verifications'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireTelegramRole } from '@/lib/telegram/guards'
import {
  buildActiveJobDetailKeyboard,
  buildActiveJobsListKeyboard,
  buildApplicationDetailKeyboard,
  buildApplicationsListKeyboard,
  buildGigDetailKeyboard,
  buildGigListKeyboard,
  buildLinkedHomeKeyboard,
  buildVerificationStatusKeyboard,
} from '@/lib/telegram/keyboards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildActiveJobDetailMessage,
  buildActiveJobMarkedInProgressMessage,
  buildActiveJobNotFoundMessage,
  buildActiveJobsEmptyState,
  buildActiveJobsIntro,
  buildActiveJobsListMessage,
  buildApplicationDetailMessage,
  buildApplicationNotFoundMessage,
  buildApplicationsListMessage,
  buildGigApplyInstructionMessage,
  buildGigApplyPromptMessage,
  buildGigApplySuccessMessage,
  buildGigBrowseEmptyState,
  buildGigBrowseIntro,
  buildGigDetailMessage,
  buildGigListMessage,
  buildGigNotFoundMessage,
  buildLinkedWelcomeMessage,
  buildMyApplicationsEmptyState,
  buildMyApplicationsIntro,
  buildTemporaryUnavailableMessage,
  buildVerificationStatusMessage,
} from '@/lib/telegram/messages'

const FREELANCER_ONLY_MESSAGE = 'This action is only available to freelancer accounts.'

export async function handleFreelancerHome(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const name = resolved.profile.full_name ?? 'there'
    await ctx.answerCallbackQuery()
    await ctx.reply(buildLinkedWelcomeMessage(name, 'freelancer'), {
      parse_mode: 'HTML',
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer home handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleBrowseGigs(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await listTelegramOpenGigs(page)

    await ctx.answerCallbackQuery({
      text: result.gigs.length > 0 ? `Loaded page ${result.page + 1}` : 'No gigs found',
    })

    if (result.gigs.length === 0) {
      await ctx.reply(buildGigBrowseEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(
      [buildGigBrowseIntro(result.page, result.total), '', buildGigListMessage(result.gigs)].join('\n'),
      {
        reply_markup: buildGigListKeyboard(
          result.gigs,
          result.page,
          result.hasPreviousPage,
          result.hasNextPage
        ),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer browse gigs handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleViewGigDetails(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const gig = await getTelegramGigDetails(gigId)
    await ctx.answerCallbackQuery()

    if (!gig) {
      await ctx.reply(buildGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(buildGigDetailMessage(gig), {
      parse_mode: 'HTML',
      reply_markup: buildGigDetailKeyboard(gig.id),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer gig detail handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleApplyGigPlaceholder(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const gig = await getTelegramGigDetails(gigId)
    await ctx.answerCallbackQuery()

    if (!gig) {
      await ctx.reply(buildGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(buildGigApplyPromptMessage(gig), {
      parse_mode: 'HTML',
      reply_markup: buildGigDetailKeyboard(gigId),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer apply placeholder handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

function extractGigIdFromApplyPrompt(messageText: string | undefined) {
  if (!messageText) {
    return null
  }

  const match = messageText.match(/^Apply prompt for gig ([0-9a-f-]{36})$/m)
  return match?.[1] ?? null
}

export async function handleApplyReply(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      return false
    }

    const gigId = extractGigIdFromApplyPrompt(ctx.message?.reply_to_message?.text)
    if (!gigId) {
      return false
    }

    const coverNote = ctx.message?.text?.trim() ?? ''
    if (!coverNote) {
      await ctx.reply(buildGigApplyInstructionMessage())
      return true
    }

    const gig = await getTelegramGigDetails(gigId)
    if (!gig) {
      await ctx.reply(buildGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return true
    }

    const result = await applyForGigFromTelegram({
      gigId,
      freelancerId: resolved.profile.id,
      coverNote,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildGigDetailKeyboard(gigId),
      })
      return true
    }

    await ctx.reply(buildGigApplySuccessMessage(gig.title), {
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
    return true
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer apply reply handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
    return true
  }
}

export async function handleMyApplications(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await listTelegramApplicationsForFreelancer(resolved.profile.id, page)
    await ctx.answerCallbackQuery({
      text: result.applications.length > 0 ? `Loaded page ${result.page + 1}` : 'No applications found',
    })

    if (result.applications.length === 0) {
      await ctx.reply(buildMyApplicationsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(
      [
        buildMyApplicationsIntro(result.page, result.total),
        '',
        buildApplicationsListMessage(result.applications),
      ].join('\n'),
      {
        reply_markup: buildApplicationsListKeyboard(
          result.applications,
          result.page,
          result.hasPreviousPage,
          result.hasNextPage
        ),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer my applications handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleViewApplicationDetails(
  ctx: TelegramBotContext,
  applicationId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const application = await getTelegramApplicationDetails(
      resolved.profile.id,
      applicationId
    )
    await ctx.answerCallbackQuery()

    if (!application || !application.gig) {
      await ctx.reply(buildApplicationNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(buildApplicationDetailMessage(application), {
      parse_mode: 'HTML',
      reply_markup: buildApplicationDetailKeyboard(application.id),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer application detail handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleActiveJobs(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await listTelegramActiveJobsForFreelancer(resolved.profile.id, page)
    await ctx.answerCallbackQuery({
      text: result.jobs.length > 0 ? `Loaded page ${result.page + 1}` : 'No active jobs found',
    })

    if (result.jobs.length === 0) {
      await ctx.reply(buildActiveJobsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(
      [buildActiveJobsIntro(result.page, result.total), '', buildActiveJobsListMessage(result.jobs)].join(
        '\n'
      ),
      {
        reply_markup: buildActiveJobsListKeyboard(
          result.jobs,
          result.page,
          result.hasPreviousPage,
          result.hasNextPage
        ),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer active jobs handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleViewActiveJobDetails(
  ctx: TelegramBotContext,
  applicationId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const job = await getTelegramActiveJobDetails(resolved.profile.id, applicationId)
    await ctx.answerCallbackQuery()

    if (!job || !job.gig) {
      await ctx.reply(buildActiveJobNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(buildActiveJobDetailMessage(job), {
      parse_mode: 'HTML',
      reply_markup: buildActiveJobDetailKeyboard(
        job.id,
        job.gig.status === 'assigned'
      ),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer active job detail handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleMarkActiveJobInProgress(
  ctx: TelegramBotContext,
  applicationId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await markTelegramActiveJobInProgress(resolved.profile.id, applicationId)
    await ctx.answerCallbackQuery({
      text: result.error ? 'Unable to update job' : 'Job updated',
      show_alert: Boolean(result.error),
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(buildActiveJobMarkedInProgressMessage(result.gigTitle ?? 'This job'), {
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer start job handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleVerificationStatus(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const snapshot = await getTelegramVerificationStatus(resolved.profile.id)
    await ctx.answerCallbackQuery({
      text: `Status: ${snapshot.status}`,
    })

    await ctx.reply(buildVerificationStatusMessage(snapshot), {
      reply_markup: buildVerificationStatusKeyboard(),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer verification status handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
