'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'

import { createTelegramWebviewGig } from '@/lib/telegram/webview/actions'

const CATEGORIES = [
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Development' },
  { value: 'writing', label: 'Writing' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'tutoring', label: 'Tutoring' },
] as const

const LOCATIONS = [
  { value: 'bole', label: 'Bole' },
  { value: 'kazanchis', label: 'Kazanchis' },
  { value: 'piassa', label: 'Piassa' },
  { value: 'addis_ketema', label: 'Addis Ketema' },
  { value: 'gulele', label: 'Gulele' },
  { value: 'yeka', label: 'Yeka' },
  { value: 'arada', label: 'Arada' },
  { value: 'nifas_silk', label: 'Nifas Silk' },
] as const

type ClientPostGigFormProps = {
  token: string
}

export function ClientPostGigForm({ token }: ClientPostGigFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const categoryOptions = useMemo(() => CATEGORIES, [])
  const locationOptions = useMemo(() => LOCATIONS, [])

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        setError(null)

        startTransition(async () => {
          const result = await createTelegramWebviewGig({
            token,
            title,
            category,
            description,
            budget: Number.parseInt(budget, 10),
            location,
          })

          if (result.error) {
            setError(result.error)
            return
          }

          router.push(
            `/telegram/client/gigs/${result.gigId}?tg_token=${encodeURIComponent(token)}&created=1`
          )
        })
      }}
    >
      <div className="space-y-2">
        <label htmlFor="gig-title" className="text-sm font-medium text-stone-900">
          Gig Title
        </label>
        <input
          id="gig-title"
          className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          placeholder="e.g., Professional House Painting"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="gig-category" className="text-sm font-medium text-stone-900">
            Category
          </label>
          <select
            id="gig-category"
            className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">Select category</option>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="gig-location" className="text-sm font-medium text-stone-900">
            Location
          </label>
          <select
            id="gig-location"
            className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            <option value="">Select location</option>
            {locationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="gig-budget" className="text-sm font-medium text-stone-900">
          Budget (ETB)
        </label>
        <input
          id="gig-budget"
          type="number"
          className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          placeholder="e.g., 5000"
          value={budget}
          onChange={(event) => setBudget(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="gig-description" className="text-sm font-medium text-stone-900">
          Description
        </label>
        <textarea
          id="gig-description"
          className="min-h-40 w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm leading-6 text-stone-900 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          placeholder="Describe the work to be done in detail..."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      {error ? <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-16px_rgba(234,88,12,0.9)] transition hover:from-orange-700 hover:to-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Posting...' : 'Post Gig'}
      </button>
    </form>
  )
}
