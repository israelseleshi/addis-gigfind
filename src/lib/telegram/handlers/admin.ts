import {
  approveTelegramVerification,
  getTelegramPendingVerificationDetails,
  listTelegramPendingVerifications,
  rejectTelegramVerification,
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
  buildAdminVerificationApprovedMessage,
  buildAdminVerificationRejectInstructionMessage,
  buildAdminVerificationRejectedMessage,
  buildAdminVerificationRejectPromptMessage,
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

export async function handleApproveVerification(
  ctx: TelegramBotContext,
  documentId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await ctx.answerCallbackQuery()
      return
    }

    const result = await approveTelegramVerification(documentId)
    await ctx.answerCallbackQuery({
      text: result.error ? 'Unable to approve' : 'Verification approved',
      show_alert: Boolean(result.error),
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    await ctx.reply(buildAdminVerificationApprovedMessage(result.fullName ?? 'This user'), {
      reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
    })
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram admin approve verification handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleRejectVerificationPrompt(
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

    await ctx.reply(
      buildAdminVerificationRejectPromptMessage(
        document.id,
        document.profiles?.full_name ?? 'Unknown user'
      ),
      {
        reply_markup: buildAdminVerificationDetailKeyboard(document.id),
      }
    )
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram admin reject prompt handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

function extractDocumentIdFromRejectPrompt(messageText: string | undefined) {
  if (!messageText) {
    return null
  }

  const match = messageText.match(/^Reject verification prompt for document ([0-9a-f-]{36})$/m)
  return match?.[1] ?? null
}

export async function handleRejectVerificationReply(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      return false
    }

    const documentId = extractDocumentIdFromRejectPrompt(ctx.message?.reply_to_message?.text)
    if (!documentId) {
      return false
    }

    const reason = ctx.message?.text?.trim() ?? ''
    if (!reason) {
      await ctx.reply(buildAdminVerificationRejectInstructionMessage())
      return true
    }

    const result = await rejectTelegramVerification(documentId, reason)
    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return true
    }

    await ctx.reply(buildAdminVerificationRejectedMessage(result.fullName ?? 'This user'), {
      reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
    })
    return true
  } catch (error) {
    telegramLogger.error({ error }, 'Telegram admin reject reply handler failed')
    await ctx.reply(buildTemporaryUnavailableMessage())
    return true
  }
}
