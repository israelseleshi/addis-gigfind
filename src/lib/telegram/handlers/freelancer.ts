import {
  applyForGigFromTelegram,
  getTelegramActiveJobDetails,
  getTelegramApplicationDetails,
  listTelegramApplicationsForFreelancer,
  listTelegramActiveJobsForFreelancer,
  markTelegramActiveJobInProgress,
} from '@/lib/actions/telegram/applications'
import {
  getTelegramGigDetails,
  listTelegramGigFilterOptions,
  listTelegramOpenGigs,
} from '@/lib/actions/telegram/gigs'
import { getTelegramVerificationStatus } from '@/lib/actions/telegram/verifications'
import type { TelegramBotContext } from '@/lib/telegram/context'
import {
  clearFreelancerApplicationDraft,
  clearFreelancerBrowseFilters,
  consumeFreelancerBrowsePrompt,
  getFreelancerApplicationDraft,
  getFreelancerBrowseFilters,
  saveFreelancerApplicationDraftCoverNote,
  setFreelancerBrowsePrompt,
  startFreelancerApplicationDraft,
  updateFreelancerBrowseFilters,
} from '@/lib/telegram/conversations/freelancer'
import { requireTelegramRole } from '@/lib/telegram/guards'
import { createTelegramWebviewToken } from '@/lib/telegram/webview/auth'
import { buildTelegramFreelancerGigDetailUrl } from '@/lib/telegram/webview/urls'
import {
  buildActiveJobDetailKeyboard,
  buildActiveJobsListKeyboard,
  buildApplicationDetailKeyboard,
  buildApplicationsListKeyboard,
  buildGigApplyDraftKeyboard,
  buildGigCategoryOptionsKeyboard,
  buildGigDetailKeyboard,
  buildGigListKeyboard,
  buildGigLocationOptionsKeyboard,
  buildLinkedHomeKeyboard,
  buildVerificationStatusKeyboard,
} from '@/lib/telegram/keyboards'
import { buildTelegramLogContext } from '@/lib/telegram/log-context'
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
  buildGigApplyCancelledMessage,
  buildGigApplyDraftReviewMessage,
  buildGigApplyInstructionMessage,
  buildGigApplyPromptMessage,
  buildGigApplySuccessMessage,
  buildGigBrowseEmptyState,
  buildGigBrowseFilterSummary,
  buildGigBrowseIntro,
  buildGigDetailMessage,
  buildGigFilterPromptMessage,
  buildGigFilterOptionsMessage,
  buildGigListMessage,
  buildGigNotFoundMessage,
  buildLinkedWelcomeMessage,
  buildMyApplicationsEmptyState,
  buildMyApplicationsIntro,
  buildTemporaryUnavailableMessage,
  buildVerificationStatusMessage,
} from '@/lib/telegram/messages'
import { shouldThrottleTelegramAction } from '@/lib/telegram/rate-limit'
import { respondWithTelegramMessage } from '@/lib/telegram/respond'

const FREELANCER_ONLY_MESSAGE = 'This action is only available to freelancer accounts.'
const APPLY_REPLY_WINDOW_MS = 10_000

async function safeAnswerCallbackQuery(
  ctx: TelegramBotContext,
  options?: Parameters<TelegramBotContext['answerCallbackQuery']>[0]
) {
  if (!ctx.callbackQuery) {
    return
  }

  await ctx.answerCallbackQuery(options)
}

export async function handleFreelancerHome(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const name = resolved.profile.full_name ?? 'there'
    await safeAnswerCallbackQuery(ctx)
    await respondWithTelegramMessage(ctx, buildLinkedWelcomeMessage(name, 'freelancer'), {
      parse_mode: 'HTML',
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-home' }) },
      'Telegram freelancer home handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleBrowseGigs(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const filters = getFreelancerBrowseFilters(String(resolved.telegramUserId))
    const result = await listTelegramOpenGigs(page, filters)
    const webviewToken = createTelegramWebviewToken({
      userId: resolved.profile.id,
      telegramUserId: resolved.telegramUserId,
      role: 'freelancer',
    })
    const detailUrls = Object.fromEntries(
      result.gigs.map((gig) => [gig.id, buildTelegramFreelancerGigDetailUrl(gig.id, webviewToken)])
    )

    await safeAnswerCallbackQuery(ctx, {
      text: result.gigs.length > 0 ? `Loaded page ${result.page + 1}` : 'No gigs found',
    })

    if (result.gigs.length === 0) {
      await respondWithTelegramMessage(
        ctx,
        [buildGigBrowseFilterSummary(result.filters), '', buildGigBrowseEmptyState()].join('\n'),
        {
          reply_markup: buildGigListKeyboard([], 0, false, false, result.filters, detailUrls),
        }
      )
      return
    }

    await respondWithTelegramMessage(
      ctx,
      [
        buildGigBrowseIntro(result.page, result.total),
        '',
        buildGigBrowseFilterSummary(result.filters),
        '',
        buildGigListMessage(result.gigs),
      ].join('\n'),
      {
        reply_markup: buildGigListKeyboard(
          result.gigs,
          result.page,
          result.hasPreviousPage,
          result.hasNextPage,
          result.filters,
          detailUrls
        ),
      }
    )
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, { handler: 'freelancer-browse-gigs', page }),
      },
      'Telegram freelancer browse gigs handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handlePromptGigCategoryFilter(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const filters = getFreelancerBrowseFilters(String(resolved.telegramUserId))
    setFreelancerBrowsePrompt(String(resolved.telegramUserId), 'browse_category')
    await safeAnswerCallbackQuery(ctx, { text: 'Send a category name' })
    await respondWithTelegramMessage(ctx, buildGigFilterPromptMessage('category', filters.category), {
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-prompt-category' }) },
      'Telegram freelancer category prompt handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleChooseGigCategoryFilter(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const filters = getFreelancerBrowseFilters(String(resolved.telegramUserId))
    const options = await listTelegramGigFilterOptions()
    await safeAnswerCallbackQuery(ctx, { text: 'Choose a category' })
    await respondWithTelegramMessage(
      ctx,
      buildGigFilterOptionsMessage('category', options.categories, filters.category),
      {
        reply_markup: buildGigCategoryOptionsKeyboard(options.categories, filters.category),
      }
    )
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-choose-category' }) },
      'Telegram freelancer choose category handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handlePromptGigLocationFilter(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const filters = getFreelancerBrowseFilters(String(resolved.telegramUserId))
    setFreelancerBrowsePrompt(String(resolved.telegramUserId), 'browse_location')
    await safeAnswerCallbackQuery(ctx, { text: 'Send a location name' })
    await respondWithTelegramMessage(ctx, buildGigFilterPromptMessage('location', filters.location), {
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-prompt-location' }) },
      'Telegram freelancer location prompt handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleChooseGigLocationFilter(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const filters = getFreelancerBrowseFilters(String(resolved.telegramUserId))
    const options = await listTelegramGigFilterOptions()
    await safeAnswerCallbackQuery(ctx, { text: 'Choose a location' })
    await respondWithTelegramMessage(
      ctx,
      buildGigFilterOptionsMessage('location', options.locations, filters.location),
      {
        reply_markup: buildGigLocationOptionsKeyboard(options.locations, filters.location),
      }
    )
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-choose-location' }) },
      'Telegram freelancer choose location handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClearGigFilters(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    clearFreelancerBrowseFilters(String(resolved.telegramUserId))
    await safeAnswerCallbackQuery(ctx, { text: 'Filters cleared' })
    await handleBrowseGigs(ctx, 0)
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-clear-filters' }) },
      'Telegram freelancer clear filters handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleSetGigCategoryFilter(ctx: TelegramBotContext, category: string | null) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    updateFreelancerBrowseFilters(String(resolved.telegramUserId), { category })
    await safeAnswerCallbackQuery(ctx, {
      text: category ? `Category: ${category}` : 'Category cleared',
    })
    await handleBrowseGigs(ctx, 0)
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'freelancer-set-category',
          category: category ?? 'any',
        }),
      },
      'Telegram freelancer set category handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleSetGigLocationFilter(ctx: TelegramBotContext, location: string | null) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    updateFreelancerBrowseFilters(String(resolved.telegramUserId), { location })
    await safeAnswerCallbackQuery(ctx, {
      text: location ? `Location: ${location}` : 'Location cleared',
    })
    await handleBrowseGigs(ctx, 0)
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'freelancer-set-location',
          location: location ?? 'any',
        }),
      },
      'Telegram freelancer set location handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleBrowseFilterReply(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      return false
    }

    const userId = String(resolved.telegramUserId)
    const prompt = consumeFreelancerBrowsePrompt(userId)
    if (!prompt) {
      return false
    }

    const rawInput = ctx.message?.text?.trim() ?? ''
    const nextValue = !rawInput || rawInput.toLowerCase() === 'any' ? null : rawInput

    if (prompt === 'browse_category') {
      updateFreelancerBrowseFilters(userId, { category: nextValue })
    } else {
      updateFreelancerBrowseFilters(userId, { location: nextValue })
    }

    await ctx.reply(
      prompt === 'browse_category'
        ? `Category filter ${nextValue ? `set to "${nextValue}".` : 'cleared.'}`
        : `Location filter ${nextValue ? `set to "${nextValue}".` : 'cleared.'}`
    )
    await handleBrowseGigs(ctx, 0)
    return true
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-browse-filter-reply' }) },
      'Telegram freelancer browse filter reply handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
    return true
  }
}

export async function handleViewGigDetails(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const gig = await getTelegramGigDetails(gigId)
    await safeAnswerCallbackQuery(ctx)

    if (!gig) {
      await respondWithTelegramMessage(ctx, buildGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await respondWithTelegramMessage(ctx, buildGigDetailMessage(gig), {
      parse_mode: 'HTML',
      reply_markup: buildGigDetailKeyboard(gig.id),
    })
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, { handler: 'freelancer-gig-detail', gigId }),
      },
      'Telegram freelancer gig detail handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleApplyGigPlaceholder(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const gig = await getTelegramGigDetails(gigId)
    await safeAnswerCallbackQuery(ctx)

    if (!gig) {
      await respondWithTelegramMessage(ctx, buildGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    startFreelancerApplicationDraft(String(resolved.telegramUserId), {
      gigId: gig.id,
      gigTitle: gig.title,
    })

    await respondWithTelegramMessage(ctx, buildGigApplyPromptMessage(gig), {
      parse_mode: 'HTML',
      reply_markup: buildGigApplyDraftKeyboard(gig.id, false),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-apply-start', gigId }) },
      'Telegram freelancer apply start handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleApplyReply(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      return false
    }

    const userId = String(resolved.telegramUserId)
    const draft = getFreelancerApplicationDraft(userId)
    if (!draft) {
      return false
    }

    const throttleKey = `apply-reply:${resolved.profile.id}:${draft.gigId}`
    if (shouldThrottleTelegramAction(throttleKey, APPLY_REPLY_WINDOW_MS)) {
      await ctx.reply('That application reply is already being processed.', {
        reply_markup: buildGigApplyDraftKeyboard(draft.gigId, Boolean(draft.coverNote)),
      })
      return true
    }

    const coverNote = ctx.message?.text?.trim() ?? ''
    if (!coverNote) {
      await ctx.reply(buildGigApplyInstructionMessage())
      return true
    }

    if (coverNote.length < 20) {
      await ctx.reply('Your cover note must be at least 20 characters long.', {
        reply_markup: buildGigApplyDraftKeyboard(draft.gigId, Boolean(draft.coverNote)),
      })
      return true
    }

    const nextDraft = saveFreelancerApplicationDraftCoverNote(userId, coverNote)
    if (!nextDraft) {
      await ctx.reply(buildTemporaryUnavailableMessage())
      return true
    }

    await ctx.reply(buildGigApplyDraftReviewMessage(nextDraft.gigTitle, nextDraft.coverNote ?? ''), {
      parse_mode: 'HTML',
      reply_markup: buildGigApplyDraftKeyboard(nextDraft.gigId, true),
    })
    return true
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, { handler: 'freelancer-apply-reply' }),
      },
      'Telegram freelancer apply reply handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
    return true
  }
}

export async function handleConfirmGigApplication(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const draft = getFreelancerApplicationDraft(String(resolved.telegramUserId))
    await safeAnswerCallbackQuery(ctx)

    if (!draft || draft.gigId !== gigId || !draft.coverNote) {
      await respondWithTelegramMessage(ctx, buildGigApplyInstructionMessage(), {
        reply_markup: buildGigApplyDraftKeyboard(gigId, false),
      })
      return
    }

    const throttleKey = `apply-confirm:${resolved.profile.id}:${gigId}`
    if (shouldThrottleTelegramAction(throttleKey, APPLY_REPLY_WINDOW_MS)) {
      await ctx.reply('That application is already being processed.', {
        reply_markup: buildGigApplyDraftKeyboard(gigId, true),
      })
      return
    }

    const result = await applyForGigFromTelegram({
      gigId,
      freelancerId: resolved.profile.id,
      coverNote: draft.coverNote,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildGigApplyDraftKeyboard(gigId, true),
      })
      return
    }

    clearFreelancerApplicationDraft(String(resolved.telegramUserId))
    await ctx.reply(buildGigApplySuccessMessage(draft.gigTitle), {
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-apply-confirm', gigId }) },
      'Telegram freelancer apply confirm handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleCancelGigApplication(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    clearFreelancerApplicationDraft(String(resolved.telegramUserId))
    await safeAnswerCallbackQuery(ctx, { text: 'Application cancelled' })
    await respondWithTelegramMessage(ctx, buildGigApplyCancelledMessage(), {
      reply_markup: buildLinkedHomeKeyboard('freelancer'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'freelancer-apply-cancel' }) },
      'Telegram freelancer apply cancel handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleMyApplications(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await listTelegramApplicationsForFreelancer(resolved.profile.id, page)
    await safeAnswerCallbackQuery(ctx, {
      text: result.applications.length > 0 ? `Loaded page ${result.page + 1}` : 'No applications found',
    })

    if (result.applications.length === 0) {
      await respondWithTelegramMessage(ctx, buildMyApplicationsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await respondWithTelegramMessage(
      ctx,
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const application = await getTelegramApplicationDetails(resolved.profile.id, applicationId)
    await safeAnswerCallbackQuery(ctx)

    if (!application || !application.gig) {
      await respondWithTelegramMessage(ctx, buildApplicationNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await respondWithTelegramMessage(ctx, buildApplicationDetailMessage(application), {
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await listTelegramActiveJobsForFreelancer(resolved.profile.id, page)
    await safeAnswerCallbackQuery(ctx, {
      text: result.jobs.length > 0 ? `Loaded page ${result.page + 1}` : 'No active jobs found',
    })

    if (result.jobs.length === 0) {
      await respondWithTelegramMessage(ctx, buildActiveJobsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await respondWithTelegramMessage(
      ctx,
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
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, { handler: 'freelancer-active-jobs', page }),
      },
      'Telegram freelancer active jobs handler failed'
    )
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const job = await getTelegramActiveJobDetails(resolved.profile.id, applicationId)
    await safeAnswerCallbackQuery(ctx)

    if (!job || !job.gig) {
      await respondWithTelegramMessage(ctx, buildActiveJobNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await respondWithTelegramMessage(ctx, buildActiveJobDetailMessage(job), {
      parse_mode: 'HTML',
      reply_markup: buildActiveJobDetailKeyboard(job.id, job.gig.status === 'assigned'),
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await markTelegramActiveJobInProgress(resolved.profile.id, applicationId)
    await safeAnswerCallbackQuery(ctx, {
      text: result.error
        ? 'Unable to update job'
        : result.alreadyHandled
          ? 'Job already in progress'
          : 'Job updated',
      show_alert: Boolean(result.error) && !result.alreadyHandled,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      })
      return
    }

    await ctx.reply(
      result.alreadyHandled
        ? `"${result.gigTitle ?? 'This job'}" was already marked as in progress.`
        : buildActiveJobMarkedInProgressMessage(result.gigTitle ?? 'This job'),
      {
        reply_markup: buildLinkedHomeKeyboard('freelancer'),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer start job handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleVerificationStatus(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['freelancer'], FREELANCER_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const snapshot = await getTelegramVerificationStatus(resolved.profile.id)
    await safeAnswerCallbackQuery(ctx, {
      text: `Status: ${snapshot.status}`,
    })

    await respondWithTelegramMessage(ctx, buildVerificationStatusMessage(snapshot), {
      reply_markup: buildVerificationStatusKeyboard(),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer verification status handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
