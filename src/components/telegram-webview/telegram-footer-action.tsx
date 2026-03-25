import type { ReactNode } from 'react'

type TelegramFooterActionProps = {
  children: ReactNode
}

export function TelegramFooterAction({ children }: TelegramFooterActionProps) {
  return (
    <div className="sticky bottom-0 mt-5 border-t border-orange-100 bg-white/95 pt-4 backdrop-blur">
      {children}
    </div>
  )
}
