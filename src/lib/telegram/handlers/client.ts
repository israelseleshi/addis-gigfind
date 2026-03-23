import { getTelegramClientGigDetails, listTelegramClientGigs } from '@/lib/actions/telegram/gigs'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireTelegramRole } from '@/lib/telegram/guards'
import {
  buildClientGigDetailKeyboard,
  buildClientGigsListKeyboard,
  buildLinkedHomeKeyboard,
} from '@/lib/telegram/keyboards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
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
