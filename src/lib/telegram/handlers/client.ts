import {
  acceptTelegramGigApplication,
  getTelegramGigApplicantDetails,
  listTelegramGigApplicants,
  rejectTelegramGigApplication,
} from '@/lib/actions/telegram/applications'
import {
  createTelegramGig,
  getTelegramClientGigDetails,
  listTelegramClientGigs,
} from '@/lib/actions/telegram/gigs'
import type { TelegramBotContext } from '@/lib/telegram/context'
import {
  clearClientPostGigDraft,
  getClientPostGigDraft,
  startClientPostGigDraft,
  updateClientPostGigDraft,
} from '@/lib/telegram/conversations/client'
import { requireTelegramRole } from '@/lib/telegram/guards'
import {
  buildClientApplicantDetailKeyboard,
  buildClientApplicantsListKeyboard,
  buildClientGigDetailKeyboard,
  buildClientGigsListKeyboard,
  buildClientPostGigCategoryKeyboard,
  buildClientPostGigLocationKeyboard,
  buildClientPostGigReviewKeyboard,
  buildLinkedHomeKeyboard,
} from '@/lib/telegram/keyboards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildClientApplicantDetailMessage,
  buildClientApplicantNotFoundMessage,
  buildClientApplicantsEmptyState,
  buildClientApplicantsIntro,
  buildClientApplicantsListMessage,
  buildClientApplicationAcceptedMessage,
  buildClientApplicationRejectedMessage,
  buildClientGigDetailMessage,
  buildClientGigNotFoundMessage,
  buildClientGigsEmptyState,
  buildClientGigsIntro,
  buildClientGigsListMessage,
  buildClientPostGigBudgetPromptMessage,
  buildClientPostGigCancelledMessage,
  buildClientPostGigDescriptionPromptMessage,
  buildClientPostGigReviewMessage,
  buildClientPostGigStartMessage,
  buildClientPostGigSuccessMessage,
  buildLinkedWelcomeMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'
import { buildTelegramLogContext } from '@/lib/telegram/log-context'
import { respondWithTelegramMessage } from '@/lib/telegram/respond'

const CLIENT_ONLY_MESSAGE = 'This action is only available to client accounts.'

const CLIENT_POST_GIG_CATEGORIES = [
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'tutoring', label: 'Tutoring' },
] as const

const CLIENT_POST_GIG_LOCATIONS = [
  { value: 'bole', label: 'Bole' },
  { value: 'kazanchis', label: 'Kazanchis' },
  { value: 'piassa', label: 'Piassa' },
  { value: 'addis_ketema', label: 'Addis Ketema' },
  { value: 'gulele', label: 'Gulele' },
  { value: 'yeka', label: 'Yeka' },
  { value: 'arada', label: 'Arada' },
  { value: 'nifas_silk', label: 'Nifas Silk' },
] as const

function getClientCategoryLabel(value: string | null) {
  return CLIENT_POST_GIG_CATEGORIES.find((item) => item.value === value)?.label ?? 'Unknown'
}

function getClientLocationLabel(value: string | null) {
  return CLIENT_POST_GIG_LOCATIONS.find((item) => item.value === value)?.label ?? 'Unknown'
}

async function safeAnswerCallbackQuery(
  ctx: TelegramBotContext,
  options?: Parameters<TelegramBotContext['answerCallbackQuery']>[0]
) {
  if (!ctx.callbackQuery) {
    return
  }

  await ctx.answerCallbackQuery(options)
}

export async function handleClientHome(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const name = resolved.profile.full_name ?? 'there'
    await safeAnswerCallbackQuery(ctx)
    await respondWithTelegramMessage(ctx, buildLinkedWelcomeMessage(name, 'client'), {
      parse_mode: 'HTML',
      reply_markup: buildLinkedHomeKeyboard('client'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-home' }) },
      'Telegram client home handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientPostGigStart(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    startClientPostGigDraft(String(resolved.telegramUserId))
    await safeAnswerCallbackQuery(ctx, { text: 'Posting flow started' })
    await respondWithTelegramMessage(ctx, buildClientPostGigStartMessage(), {
      reply_markup: buildLinkedHomeKeyboard('client'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-post-gig-start' }) },
      'Telegram client post gig start handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientSelectGigCategory(ctx: TelegramBotContext, category: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const draft = getClientPostGigDraft(String(resolved.telegramUserId))
    if (!draft || !draft.title) {
      await safeAnswerCallbackQuery(ctx)
      await respondWithTelegramMessage(ctx, buildClientPostGigStartMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    updateClientPostGigDraft(String(resolved.telegramUserId), { category }, 'location')
    await safeAnswerCallbackQuery(ctx, { text: `Category: ${getClientCategoryLabel(category)}` })
    await respondWithTelegramMessage(
      ctx,
      `Choose the location for "${draft.title}".`,
      {
        reply_markup: buildClientPostGigLocationKeyboard(CLIENT_POST_GIG_LOCATIONS, null),
      }
    )
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-post-gig-category', category }) },
      'Telegram client post gig category handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientSelectGigLocation(ctx: TelegramBotContext, location: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const draft = getClientPostGigDraft(String(resolved.telegramUserId))
    if (!draft || !draft.title || !draft.category) {
      await safeAnswerCallbackQuery(ctx)
      await respondWithTelegramMessage(ctx, buildClientPostGigStartMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    updateClientPostGigDraft(String(resolved.telegramUserId), { location }, 'budget')
    await safeAnswerCallbackQuery(ctx, { text: `Location: ${getClientLocationLabel(location)}` })
    await respondWithTelegramMessage(
      ctx,
      buildClientPostGigBudgetPromptMessage(
        draft.title,
        getClientCategoryLabel(draft.category),
        getClientLocationLabel(location)
      ),
      {
        reply_markup: buildLinkedHomeKeyboard('client'),
      }
    )
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-post-gig-location', location }) },
      'Telegram client post gig location handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientCancelPostGig(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    clearClientPostGigDraft(String(resolved.telegramUserId))
    await safeAnswerCallbackQuery(ctx, { text: 'Posting cancelled' })
    await respondWithTelegramMessage(ctx, buildClientPostGigCancelledMessage(), {
      reply_markup: buildLinkedHomeKeyboard('client'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-post-gig-cancel' }) },
      'Telegram client post gig cancel handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientConfirmPostGig(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const draft = getClientPostGigDraft(String(resolved.telegramUserId))
    await safeAnswerCallbackQuery(ctx)

    if (!draft?.title || !draft.category || !draft.location || !draft.budget || !draft.description) {
      await respondWithTelegramMessage(ctx, buildClientPostGigStartMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    const result = await createTelegramGig({
      clientId: resolved.profile.id,
      title: draft.title,
      category: draft.category,
      location: draft.location,
      budget: draft.budget,
      description: draft.description,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildClientPostGigReviewKeyboard(),
      })
      return
    }

    clearClientPostGigDraft(String(resolved.telegramUserId))
    await ctx.reply(buildClientPostGigSuccessMessage(result.title ?? draft.title), {
      reply_markup: buildLinkedHomeKeyboard('client'),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-post-gig-confirm' }) },
      'Telegram client post gig confirm handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientConversationText(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      return false
    }

    const userId = String(resolved.telegramUserId)
    const draft = getClientPostGigDraft(userId)
    if (!draft) {
      return false
    }

    const input = ctx.message?.text?.trim() ?? ''
    if (!input) {
      return true
    }

    if (draft.step === 'title') {
      if (input.length < 5) {
        await ctx.reply('Title must be at least 5 characters long.')
        return true
      }

      updateClientPostGigDraft(userId, { title: input }, 'category')
      await ctx.reply(`Choose a category for "${input}".`, {
        reply_markup: buildClientPostGigCategoryKeyboard(CLIENT_POST_GIG_CATEGORIES, null),
      })
      return true
    }

    if (draft.step === 'budget') {
      const budget = Number.parseInt(input, 10)
      if (!Number.isFinite(budget) || budget <= 0) {
        await ctx.reply('Send the budget as a valid ETB number, for example 5000.')
        return true
      }

      updateClientPostGigDraft(userId, { budget }, 'description')
      await ctx.reply(
        buildClientPostGigDescriptionPromptMessage(
          draft.title ?? 'Untitled gig',
          getClientCategoryLabel(draft.category),
          getClientLocationLabel(draft.location),
          budget
        )
      )
      return true
    }

    if (draft.step === 'description') {
      if (input.length < 20) {
        await ctx.reply('Description must be at least 20 characters long.')
        return true
      }

      const nextDraft = updateClientPostGigDraft(userId, { description: input }, 'review')
      if (!nextDraft?.title || !nextDraft.category || !nextDraft.location || !nextDraft.budget) {
        await ctx.reply(buildTemporaryUnavailableMessage())
        return true
      }

      await ctx.reply(
        buildClientPostGigReviewMessage({
          title: nextDraft.title,
          categoryLabel: getClientCategoryLabel(nextDraft.category),
          locationLabel: getClientLocationLabel(nextDraft.location),
          budget: nextDraft.budget,
          description: input,
        }),
        {
          parse_mode: 'HTML',
          reply_markup: buildClientPostGigReviewKeyboard(),
        }
      )
      return true
    }

    await ctx.reply('Use the buttons below to continue the gig posting flow.', {
      reply_markup: buildLinkedHomeKeyboard('client'),
    })
    return true
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-conversation-text' }) },
      'Telegram client conversation text handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
    return true
  }
}

export async function handleClientMyGigs(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await listTelegramClientGigs(resolved.profile.id, page)
    await safeAnswerCallbackQuery(ctx, {
      text: result.gigs.length > 0 ? `Loaded page ${result.page + 1}` : 'No gigs found',
    })

    if (result.gigs.length === 0) {
      await respondWithTelegramMessage(ctx, buildClientGigsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    await respondWithTelegramMessage(
      ctx,
      [buildClientGigsIntro(result.page, result.total), '', buildClientGigsListMessage(result.gigs)].join(
        '\n'
      ),
      {
        reply_markup: buildClientGigsListKeyboard(
          result.gigs,
          result.page,
          result.hasPreviousPage,
          result.hasNextPage
        ),
      }
    )
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-my-gigs', page }) },
      'Telegram client my gigs handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientViewGigDetails(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const gig = await getTelegramClientGigDetails(resolved.profile.id, gigId)
    await safeAnswerCallbackQuery(ctx)

    if (!gig) {
      await respondWithTelegramMessage(ctx, buildClientGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    await respondWithTelegramMessage(ctx, buildClientGigDetailMessage(gig), {
      parse_mode: 'HTML',
      reply_markup: buildClientGigDetailKeyboard(gig.id),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-gig-detail', gigId }) },
      'Telegram client gig detail handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientViewApplicants(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await listTelegramGigApplicants(resolved.profile.id, gigId)
    await safeAnswerCallbackQuery(ctx)

    if (!result) {
      await respondWithTelegramMessage(ctx, buildClientGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    if (result.applicants.length === 0) {
      await respondWithTelegramMessage(ctx, buildClientApplicantsEmptyState(result.gig.title), {
        reply_markup: buildClientGigDetailKeyboard(gigId),
      })
      return
    }

    await respondWithTelegramMessage(
      ctx,
      [
        buildClientApplicantsIntro(result.gig.title, result.applicants.length),
        '',
        buildClientApplicantsListMessage(result.applicants),
      ].join('\n'),
      {
        reply_markup: buildClientApplicantsListKeyboard(gigId, result.applicants),
      }
    )
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'client-applicants', gigId }) },
      'Telegram client applicants handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientViewApplicantDetails(
  ctx: TelegramBotContext,
  gigId: string,
  applicationId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const details = await getTelegramGigApplicantDetails(resolved.profile.id, gigId, applicationId)
    await safeAnswerCallbackQuery(ctx)

    if (!details) {
      await respondWithTelegramMessage(ctx, buildClientApplicantNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    await respondWithTelegramMessage(ctx, buildClientApplicantDetailMessage(details.gig.title, details.applicant), {
      parse_mode: 'HTML',
      reply_markup: buildClientApplicantDetailKeyboard(
        gigId,
        applicationId,
        details.applicant.status === 'pending'
      ),
    })
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'client-applicant-detail',
          gigId,
          applicationId,
        }),
      },
      'Telegram client applicant detail handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientAcceptApplicant(
  ctx: TelegramBotContext,
  gigId: string,
  applicationId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await acceptTelegramGigApplication(resolved.profile.id, gigId, applicationId)
    await safeAnswerCallbackQuery(ctx, {
      text: result.error
        ? 'Unable to accept applicant'
        : result.alreadyHandled
          ? 'Applicant was already accepted'
          : 'Applicant accepted',
      show_alert: Boolean(result.error) && !result.alreadyHandled,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildClientApplicantDetailKeyboard(gigId, applicationId, true),
      })
      return
    }

    await ctx.reply(
      result.alreadyHandled
        ? `${result.freelancerName ?? 'This freelancer'} was already accepted for "${result.gigTitle ?? 'this gig'}".`
        : buildClientApplicationAcceptedMessage(
            result.freelancerName ?? 'Selected freelancer',
            result.gigTitle ?? 'this gig'
          ),
      {
        reply_markup: buildClientGigDetailKeyboard(gigId),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram client applicant accept handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientRejectApplicant(
  ctx: TelegramBotContext,
  gigId: string,
  applicationId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await rejectTelegramGigApplication(resolved.profile.id, gigId, applicationId)
    await safeAnswerCallbackQuery(ctx, {
      text: result.error
        ? 'Unable to reject applicant'
        : result.alreadyHandled
          ? 'Applicant was already rejected'
          : 'Applicant rejected',
      show_alert: Boolean(result.error) && !result.alreadyHandled,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildClientApplicantDetailKeyboard(gigId, applicationId, true),
      })
      return
    }

    await ctx.reply(
      result.alreadyHandled
        ? `${result.freelancerName ?? 'That freelancer'} was already rejected for "${result.gigTitle ?? 'this gig'}".`
        : buildClientApplicationRejectedMessage(
            result.freelancerName ?? 'That freelancer',
            result.gigTitle ?? 'this gig'
          ),
      {
        reply_markup: buildClientApplicantsListKeyboard(gigId, []),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram client applicant reject handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
