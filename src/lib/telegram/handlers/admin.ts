import { logTelegramAuditEntry } from '@/lib/actions/telegram/audit'
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
import { respondWithTelegramMessage } from '@/lib/telegram/respond'
import { shouldThrottleTelegramAction } from '@/lib/telegram/rate-limit'
import { buildTelegramLogContext } from '@/lib/telegram/log-context'

const ADMIN_ONLY_MESSAGE = 'This action is only available to admin and regulator accounts.'
const REJECT_REPLY_WINDOW_MS = 10_000

async function safeAnswerCallbackQuery(
  ctx: TelegramBotContext,
  options?: Parameters<TelegramBotContext['answerCallbackQuery']>[0]
) {
  if (!ctx.callbackQuery) {
    return
  }

  await ctx.answerCallbackQuery(options)
}

async function logAdminVerificationAudit(params: {
  actorUserId: string
  actorTelegramUserId: string
  actorRole: string
  action: 'approve_verification' | 'reject_verification'
  documentId: string
  targetUserId: string | null
  outcome: 'success' | 'already_handled'
  rejectionReason?: string
}) {
  await logTelegramAuditEntry({
    userId: params.actorUserId,
    telegramUserId: params.actorTelegramUserId,
    role: params.actorRole,
    action: params.action,
    entityType: 'verification_document',
    entityId: params.documentId,
    metadata: {
      outcome: params.outcome,
      target_user_id: params.targetUserId,
      rejection_reason: params.rejectionReason ?? null,
    },
  })
}

export async function handleAdminHome(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const name = resolved.profile.full_name ?? 'there'
    const role = resolved.role ?? 'admin'
    await safeAnswerCallbackQuery(ctx)
    await respondWithTelegramMessage(ctx, buildLinkedWelcomeMessage(name, role), {
      parse_mode: 'HTML',
      reply_markup: buildLinkedHomeKeyboard(role),
    })
  } catch (error) {
    telegramLogger.error(
      { error, ...buildTelegramLogContext(ctx, { handler: 'admin-home' }) },
      'Telegram admin home handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handlePendingVerifications(ctx: TelegramBotContext) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const documents = await listTelegramPendingVerifications()
    await safeAnswerCallbackQuery(ctx, {
      text: documents.length > 0 ? `${documents.length} pending` : 'No pending verifications',
    })

    if (documents.length === 0) {
      await respondWithTelegramMessage(ctx, buildAdminPendingVerificationsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    await respondWithTelegramMessage(
      ctx,
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
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, { handler: 'admin-pending-verifications' }),
      },
      'Telegram admin pending verifications handler failed'
    )
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const document = await getTelegramPendingVerificationDetails(documentId)
    await safeAnswerCallbackQuery(ctx)

    if (!document) {
      await respondWithTelegramMessage(ctx, buildAdminVerificationNotFoundMessage(), {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    await respondWithTelegramMessage(ctx, buildAdminVerificationDetailMessage(document), {
      parse_mode: 'HTML',
      reply_markup: buildAdminVerificationDetailKeyboard(document.id),
    })
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'admin-verification-detail',
          documentId,
        }),
      },
      'Telegram admin verification detail handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
  }
}

export async function handleNextPendingVerification(
  ctx: TelegramBotContext,
  currentDocumentId: string
) {
  try {
    const resolved = await requireTelegramRole(ctx, ['admin', 'regulator'], ADMIN_ONLY_MESSAGE)
    if (!resolved) {
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const documents = await listTelegramPendingVerifications()
    await safeAnswerCallbackQuery(ctx)

    if (documents.length === 0) {
      await respondWithTelegramMessage(ctx, buildAdminPendingVerificationsEmptyState(), {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    const currentIndex = documents.findIndex((document) => document.id === currentDocumentId)
    const nextDocument = documents[currentIndex + 1] ?? documents[0]

    await respondWithTelegramMessage(ctx, buildAdminVerificationDetailMessage(nextDocument), {
      parse_mode: 'HTML',
      reply_markup: buildAdminVerificationDetailKeyboard(nextDocument.id),
    })
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'admin-next-verification',
          documentId: currentDocumentId,
        }),
      },
      'Telegram admin next verification handler failed'
    )
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const result = await approveTelegramVerification(documentId)
    await safeAnswerCallbackQuery(ctx, {
      text: result.error
        ? 'Unable to approve'
        : result.alreadyHandled
          ? 'Already approved'
          : 'Verification approved',
      show_alert: Boolean(result.error) && !result.alreadyHandled,
    })

    if (result.error) {
      await ctx.reply(result.error, {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return
    }

    void logAdminVerificationAudit({
      actorUserId: resolved.profile.id,
      actorTelegramUserId: resolved.telegramUserId,
      actorRole: resolved.role ?? 'admin',
      action: 'approve_verification',
      documentId,
      targetUserId: result.targetUserId,
      outcome: result.alreadyHandled ? 'already_handled' : 'success',
    }).catch((auditError) => {
      telegramLogger.error(
        { error: auditError, actorUserId: resolved.profile.id, documentId },
        'Telegram admin verification approval audit log failed'
      )
    })

    await ctx.reply(
      result.alreadyHandled
        ? `${result.fullName ?? 'This user'} was already verified.`
        : buildAdminVerificationApprovedMessage(result.fullName ?? 'This user'),
      {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      }
    )
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'admin-approve-verification',
          documentId,
        }),
      },
      'Telegram admin approve verification handler failed'
    )
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
      await safeAnswerCallbackQuery(ctx)
      return
    }

    const document = await getTelegramPendingVerificationDetails(documentId)
    await safeAnswerCallbackQuery(ctx)

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
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'admin-reject-verification-prompt',
          documentId,
        }),
      },
      'Telegram admin reject prompt handler failed'
    )
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

    const throttleKey = `reject-reply:${resolved.profile.id}:${ctx.message?.reply_to_message?.message_id ?? 'unknown'}`
    if (shouldThrottleTelegramAction(throttleKey, REJECT_REPLY_WINDOW_MS)) {
      await ctx.reply('That rejection reason is already being processed.', {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      })
      return true
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

    void logAdminVerificationAudit({
      actorUserId: resolved.profile.id,
      actorTelegramUserId: resolved.telegramUserId,
      actorRole: resolved.role ?? 'admin',
      action: 'reject_verification',
      documentId,
      targetUserId: result.targetUserId,
      outcome: result.alreadyHandled ? 'already_handled' : 'success',
      rejectionReason: reason.trim(),
    }).catch((auditError) => {
      telegramLogger.error(
        { error: auditError, actorUserId: resolved.profile.id, documentId },
        'Telegram admin verification rejection audit log failed'
      )
    })

    await ctx.reply(
      result.alreadyHandled
        ? `${result.fullName ?? 'This user'} was already rejected.`
        : buildAdminVerificationRejectedMessage(result.fullName ?? 'This user'),
      {
        reply_markup: buildLinkedHomeKeyboard(resolved.role ?? 'admin'),
      }
    )
    return true
  } catch (error) {
    telegramLogger.error(
      {
        error,
        ...buildTelegramLogContext(ctx, {
          handler: 'admin-reject-verification-reply',
        }),
      },
      'Telegram admin reject reply handler failed'
    )
    await ctx.reply(buildTemporaryUnavailableMessage())
    return true
  }
}
