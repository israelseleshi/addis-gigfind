import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  requireLinkedTelegramAccount,
  requireTelegramRole,
  resolveLinkedTelegramAccount,
} from './guards'

const { getTelegramAccountByTelegramUserId } = vi.hoisted(() => ({
  getTelegramAccountByTelegramUserId: vi.fn(),
}))

vi.mock('@/lib/telegram/account-link', () => ({
  getTelegramAccountByTelegramUserId,
}))

describe('telegram guards', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves a linked account and normalizes array profiles', async () => {
    getTelegramAccountByTelegramUserId.mockResolvedValue({
      user_id: 'user-1',
      telegram_chat_id: 'chat-1',
      is_active: true,
      profiles: [
        {
          id: 'user-1',
          full_name: 'Freelancer One',
          role: 'freelancer',
        },
      ],
    })

    const result = await resolveLinkedTelegramAccount({
      from: { id: 123456 },
    } as never)

    expect(getTelegramAccountByTelegramUserId).toHaveBeenCalledWith('123456')
    expect(result.profile).toEqual({
      id: 'user-1',
      full_name: 'Freelancer One',
      role: 'freelancer',
    })
    expect(result.role).toBe('freelancer')
  })

  it('replies with link instructions when no linked account exists', async () => {
    getTelegramAccountByTelegramUserId.mockResolvedValue(null)

    const reply = vi.fn()

    const result = await requireLinkedTelegramAccount({
      from: { id: 777 },
      reply,
    } as never)

    expect(result).toBeNull()
    expect(reply).toHaveBeenCalledOnce()
    expect(reply).toHaveBeenCalledWith(
      expect.stringContaining('/link YOURCODE'),
      { parse_mode: 'HTML' }
    )
  })

  it('blocks users whose linked role is not allowed', async () => {
    getTelegramAccountByTelegramUserId.mockResolvedValue({
      user_id: 'user-2',
      telegram_chat_id: 'chat-2',
      is_active: true,
      profiles: {
        id: 'user-2',
        full_name: 'Client User',
        role: 'client',
      },
    })

    const reply = vi.fn()

    const result = await requireTelegramRole(
      {
        from: { id: 222 },
        reply,
      } as never,
      ['admin'],
      'This action is only available to admins.'
    )

    expect(result).toBeNull()
    expect(reply).toHaveBeenCalledWith('This action is only available to admins.')
  })
})
