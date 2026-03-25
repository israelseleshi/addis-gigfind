'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

import { submitTelegramWebviewApplication } from '@/lib/telegram/webview/actions'

type FreelancerApplyFormProps = {
  gigId: string
  token: string
}

export function FreelancerApplyForm({ gigId, token }: FreelancerApplyFormProps) {
  const router = useRouter()
  const [coverNote, setCoverNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)

        startTransition(async () => {
          const result = await submitTelegramWebviewApplication({
            token,
            gigId,
            coverNote,
          })

          if ('error' in result && result.error) {
            setError(result.error)
            return
          }

          router.push(`/telegram/freelancer/gigs/${gigId}?tg_token=${encodeURIComponent(token)}&applied=1`)
        })
      }}
    >
      <div className="space-y-2">
        <label htmlFor="cover-note" className="text-sm font-medium text-stone-900">
          Cover note
        </label>
        <textarea
          id="cover-note"
          className="min-h-48 w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          placeholder="Write your cover note using the same information you would submit on the website."
          value={coverNote}
          onChange={(event) => setCoverNote(event.target.value)}
          maxLength={1000}
        />
        <p className="text-xs text-stone-500">{Math.max(0, 1000 - coverNote.length)} characters left</p>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(234,88,12,0.9)] transition hover:from-orange-700 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Submitting...' : 'Submit application'}
      </button>
    </form>
  )
}
