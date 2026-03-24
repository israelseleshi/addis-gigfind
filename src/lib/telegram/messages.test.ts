import { describe, expect, it } from 'vitest'

import {
  buildApplicationDetailMessage,
  buildGigDetailMessage,
  buildVerificationStatusMessage,
} from './messages'

describe('telegram messages', () => {
  it('truncates long gig descriptions to stay within Telegram limits', () => {
    const message = buildGigDetailMessage({
      id: 'gig-1',
      title: 'Gig title',
      budget: 12500,
      location: 'Addis Ababa',
      category: 'Design',
      description: 'A'.repeat(2500),
      created_at: new Date().toISOString(),
      status: 'open',
      client: {
        id: 'client-1',
        full_name: 'Client User',
        average_rating: 4.8,
      },
    })

    expect(message.length).toBeLessThanOrEqual(4096)
    expect(message).toContain('...')
  })

  it('truncates long application cover notes in detail messages', () => {
    const message = buildApplicationDetailMessage({
      id: 'application-1',
      status: 'pending',
      cover_note: 'B'.repeat(2000),
      created_at: new Date().toISOString(),
      gig: {
        id: 'gig-1',
        title: 'Need a logo',
        description: 'Short description',
        budget: 4500,
        location: 'Bole',
        category: 'Branding',
        status: 'open',
        client: {
          id: 'client-1',
          full_name: 'Client User',
          average_rating: 4.5,
        },
      },
    })

    expect(message.length).toBeLessThanOrEqual(4096)
    expect(message).toContain('<b>Your cover note</b>')
    expect(message).toContain('...')
  })

  it('truncates long verification rejection reasons', () => {
    const message = buildVerificationStatusMessage({
      status: 'rejected',
      document: {
        id: 'doc-1',
        document_type: 'national_id',
        id_number: 'ET-12345',
        status: 'rejected',
        submitted_at: new Date().toISOString(),
        admin_notes: 'C'.repeat(1600),
      },
    })

    expect(message.length).toBeLessThanOrEqual(4096)
    expect(message).toContain('Reason: ')
    expect(message).toContain('...')
  })
})
