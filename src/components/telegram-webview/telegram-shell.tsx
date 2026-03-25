import type { ReactNode } from 'react'

type TelegramShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function TelegramShell({ title, subtitle, children }: TelegramShellProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_38%,#fffaf5_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5">
        <div className="rounded-[28px] border border-orange-100 bg-white/95 p-5 shadow-[0_24px_80px_-32px_rgba(194,65,12,0.45)] backdrop-blur">
          <div className="mb-5 border-b border-orange-100 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-500">
              Addis GigFind
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm leading-6 text-stone-600">{subtitle}</p> : null}
          </div>
          <div className="space-y-4">{children}</div>
        </div>
      </div>
    </div>
  )
}
