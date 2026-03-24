import { beforeEach, describe, expect, it, vi } from 'vitest'

import { shouldThrottleTelegramAction } from './rate-limit'

describe('shouldThrottleTelegramAction', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-24T09:00:00.000Z'))
  })

  it('allows the first action and throttles immediate repeats', () => {
    const key = 'callback:test-user:client:accept_applicant:gig-1:app-1'

    expect(shouldThrottleTelegramAction(key, 5_000)).toBe(false)
    expect(shouldThrottleTelegramAction(key, 5_000)).toBe(true)
  })

  it('allows the same action again after the throttle window expires', () => {
    const key = 'callback:test-user:freelancer:start_job:app-1'

    expect(shouldThrottleTelegramAction(key, 5_000)).toBe(false)

    vi.advanceTimersByTime(5_001)

    expect(shouldThrottleTelegramAction(key, 5_000)).toBe(false)
  })

  it('tracks different action keys independently', () => {
    const keyA = 'callback:test-user-a:admin:approve_verification:doc-1'
    const keyB = 'callback:test-user-b:admin:approve_verification:doc-1'

    expect(shouldThrottleTelegramAction(keyA, 5_000)).toBe(false)
    expect(shouldThrottleTelegramAction(keyB, 5_000)).toBe(false)
  })
})
