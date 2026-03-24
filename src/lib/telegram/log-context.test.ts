import { describe, expect, it } from 'vitest'

import { buildTelegramLogContext } from './log-context'

describe('buildTelegramLogContext', () => {
  it('extracts Telegram identifiers and merges extra context', () => {
    const ctx = {
      from: {
        id: 123456,
        username: 'gigtester',
      },
      chat: {
        id: 987654,
      },
      msg: {
        message_id: 42,
      },
      callbackQuery: {
        data: 'client:accept_applicant:gig-1:app-1',
      },
      updateType: 'callback_query',
    } as const

    const context = buildTelegramLogContext(ctx as never, {
      handler: 'client-accept-applicant',
      gigId: 'gig-1',
    })

    expect(context).toEqual({
      telegramUserId: '123456',
      telegramChatId: '987654',
      telegramUsername: 'gigtester',
      telegramMessageId: 42,
      telegramCallbackData: 'client:accept_applicant:gig-1:app-1',
      telegramUpdateType: 'callback_query',
      handler: 'client-accept-applicant',
      gigId: 'gig-1',
    })
  })

  it('returns nulls when Telegram identifiers are missing', () => {
    const context = buildTelegramLogContext({ updateType: 'message' } as never)

    expect(context.telegramUserId).toBeNull()
    expect(context.telegramChatId).toBeNull()
    expect(context.telegramUsername).toBeNull()
    expect(context.telegramMessageId).toBeNull()
    expect(context.telegramCallbackData).toBeNull()
    expect(context.telegramUpdateType).toBe('message')
  })
})
