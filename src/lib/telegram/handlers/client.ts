import {
  acceptTelegramGigApplication,
  getTelegramGigApplicantDetails,
  listTelegramGigApplicants,
  rejectTelegramGigApplication,
} from '@/lib/actions/telegram/applications'
import { getTelegramClientGigDetails, listTelegramClientGigs } from '@/lib/actions/telegram/gigs'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireTelegramRole } from '@/lib/telegram/guards'
import {
  buildClientApplicantDetailKeyboard,
  buildClientApplicantsListKeyboard,
  buildClientGigDetailKeyboard,
  buildClientGigsListKeyboard,
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
  buildLinkedWelcomeMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'

const CLIENT_ONLY_MESSAGE = 'This action is only available to client accounts.'

export async function handleClientHome(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const name = resolved.profile.full_name ?? 'there'
    await ctx.answerCallbackQuery()
    await ctx.reply(buildLinkedWelcomeMessage(name, 'client'), {
      parse_mode: 'HTML',
      reply_markup: buildLinkedHomeKeyboard('client'),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram client home handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientMyGigs(ctx: TelegramBotContext, page: number = 0) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await listTelegramClientGigs(resolved.profile.id, page)
    await ctx.answerCallbackQuery({
      text: result.gigs.length > 0 ? `Loaded page ${result.page + 1}` : 'No gigs found',
    })

    if (result.gigs.length === 0) {
      await ctx.reply(buildClientGigsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    await ctx.reply(
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
    telegramLogger.error({ error }, 'Telegram client my gigs handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientViewGigDetails(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const gig = await getTelegramClientGigDetails(resolved.profile.id, gigId)
    await ctx.answerCallbackQuery()

    if (!gig) {
      await ctx.reply(buildClientGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    await ctx.reply(buildClientGigDetailMessage(gig), {
      parse_mode: 'HTML',
      reply_markup: buildClientGigDetailKeyboard(gig.id),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram client gig detail handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleClientViewApplicants(ctx: TelegramBotContext, gigId: string) {
  try {
    const resolved = await requireTelegramRole(ctx, ['client'], CLIENT_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await listTelegramGigApplicants(resolved.profile.id, gigId)
    await ctx.answerCallbackQuery()

    if (!result) {
      await ctx.reply(buildClientGigNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    if (result.applicants.length === 0) {
      await ctx.reply(buildClientApplicantsEmptyState(result.gig.title), {
        reply_markup: buildClientGigDetailKeyboard(gigId),
      })
      return
    }

    await ctx.reply(
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
    telegramLogger.error({ error }, 'Telegram client applicants handler failed')
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
      await ctx.answerCallbackQuery()
      return
    }

    const details = await getTelegramGigApplicantDetails(resolved.profile.id, gigId, applicationId)
    await ctx.answerCallbackQuery()

    if (!details) {
      await ctx.reply(buildClientApplicantNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard('client'),
      })
      return
    }

    await ctx.reply(buildClientApplicantDetailMessage(details.gig.title, details.applicant), {
      parse_mode: 'HTML',
      reply_markup: buildClientApplicantDetailKeyboard(
        gigId,
        applicationId,
        details.applicant.status === 'pending'
      ),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram client applicant detail handler failed')
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
      await ctx.answerCallbackQuery()
      return
    }

    const result = await acceptTelegramGigApplication(resolved.profile.id, gigId, applicationId)
    await ctx.answerCallbackQuery({
      text: result.error ? 'Unable to accept applicant' : 'Applicant accepted',
      show_alert: Boolean(result.error),
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildClientApplicantDetailKeyboard(gigId, applicationId, true),
      })
      return
    }

    await ctx.reply(
      buildClientApplicationAcceptedMessage(
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
      await ctx.answerCallbackQuery()
      return
    }

    const result = await rejectTelegramGigApplication(resolved.profile.id, gigId, applicationId)
    await ctx.answerCallbackQuery({
      text: result.error ? 'Unable to reject applicant' : 'Applicant rejected',
      show_alert: Boolean(result.error),
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildClientApplicantDetailKeyboard(gigId, applicationId, true),
      })
      return
    }

    await ctx.reply(
      buildClientApplicationRejectedMessage(
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
