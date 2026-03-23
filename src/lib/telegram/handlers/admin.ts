import {
  getTelegramPendingVerificationDetails,
  listTelegramPendingVerifications,
} from '@/lib/actions/telegram/verifications'
import type { TelegramBotContext } from '@/lib/telegram/context'
import { requireTelegramRole } from '@/lib/telegram/guards'
import {
  buildAdminVerificationDetailKeyboard,
  buildAdminPendingVerificationsKeyboard,
  buildLinkedHomeKeyboard,
} from '@/lib/telegram/keyboards'
import { telegramLogger } from '@/lib/telegram/logger'
import {
  buildAdminPendingVerificationsEmptyState,
  buildAdminPendingVerificationsIntro,
  buildAdminPendingVerificationsListMessage,
  buildAdminVerificationDetailMessage,
  buildAdminVerificationNotFoundMessage,
  buildLinkedWelcomeMessage,
  buildTemporaryUnavailableMessage,
} from '@/lib/telegram/messages'

const ADMIN_ONLY_MESSAGE = 'This action is only available to admin and regulator accounts.'

export async function handleAdminHome(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const name = resolved.profile.full_name ?? 'there'
    const role = resolved.role ?? 'admin'
    await ctx.answerCallbackQuery()
    await ctx.reply(buildLinkedWelcomeMessage(name, role), {
      parse_mode: 'HTML',
      reply_markup: buildLinkedHomeKeyboard(role),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram admin home handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handlePendingVerifications(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const documents = await listTelegramPendingVerifications()
    await ctx.answerCallbackQuery({
      text: documents.length > 0 ? `${documents.length} pending` : 'No pending verifications',
    })

    if (documents.length === 0) {
      await ctx.reply(buildAdminPendingVerificationsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    await ctx.reply(
      [
        buildAdminPendingVerificationsIntro(documents.length),
        '',
        buildAdminPendingVerificationsListMessage(documents),
      ].join('\n'),
      {
        reply_markup: buildAdminPendingVerificationsKeyboard(documents),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram admin pending verifications handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handlePendingVerificationDetails(
  ctx: TelegramBotContext,
  documentId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const document = await getTelegramPendingVerificationDetails(documentId)
    await ctx.answerCallbackQuery()

    if (!document) {
      await ctx.reply(buildAdminVerificationNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    await ctx.reply(buildAdminVerificationDetailMessage(document), {
      parse_mode: 'HTML',
      reply_markup: buildAdminVerificationDetailKeyboard(document.id),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram admin verification detail handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}
