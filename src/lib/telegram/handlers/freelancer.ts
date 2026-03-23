import { getTelegramGigDetails, listTelegramOpenGigs } from '@/lib/actions/telegram/gigs'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireTelegramRole } from '@/lib/telegram/guards'
import { buildGigDetailKeyboard, buildGigListKeyboard, buildLinkedHomeKeyboard } from '@/lib/telegram/keyboards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildGigBrowseEmptyState,
  buildGigBrowseIntro,
  buildGigDetailMessage,
  buildGigListMessage,
  buildGigNotFoundMessage,
  buildLinkedWelcomeMessage,
  buildTemporaryUnavailableMessage,
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

    await ctx.answerCallbackQuery({
      text: 'Apply flow is next.',
    })
    await ctx.reply(
      [
        `Gig ${gigId} selected for application.`,
        'The full Telegram apply flow is the next Phase 1 task.',
      ].join('\n'),
      {
        reply_markup: buildGigDetailKeyboard(gigId),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram freelancer apply placeholder handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
