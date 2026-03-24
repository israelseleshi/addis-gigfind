import type { ReactNode } from 'react'

type TelegramCardProps = {
  title?: string
  children: ReactNode
}

export function TelegramCard({ title, children }: TelegramCardProps) {
  return (
    <section className="rounded-[24px] border border-stone-200/80 bg-white p-4 shadow-[0_14px_40px_-28px_rgba(28,25,23,0.35)]">
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{title}</h2> : null}
      <div className="space-y-3">{children}</div>
    </section>
  )
}
