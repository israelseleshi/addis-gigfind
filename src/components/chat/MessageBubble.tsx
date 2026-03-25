'use client'

import { Check, CheckCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type MessageBubbleProps = {
  content: string
  senderName: string
  senderAvatar?: string | null
  isOwnMessage: boolean
  createdAt: string
  read?: boolean | null
}

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function MessageBubble({
  content,
  senderName,
  senderAvatar,
  isOwnMessage,
  createdAt,
  read,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex gap-2 max-w-[80%]',
        isOwnMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={senderAvatar || undefined} alt={senderName} />
        <AvatarFallback className="text-xs">
          {getInitials(senderName)}
        </AvatarFallback>
      </Avatar>
      
      <div
        className={cn(
          'flex flex-col gap-1',
          isOwnMessage ? 'items-end' : 'items-start'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-xs font-medium',
              isOwnMessage ? 'text-orange-600' : 'text-zinc-600'
            )}
          >
            {isOwnMessage ? 'You' : senderName}
          </span>
          <span className="text-xs text-zinc-400">{formatMessageTime(createdAt)}</span>
          {isOwnMessage && (
            <span className="flex items-center">
              {read ? (
                <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
              ) : (
                <Check className="h-3.5 w-3.5 text-zinc-400" />
              )}
            </span>
          )}
        </div>
        
        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isOwnMessage
              ? 'bg-orange-500 text-white rounded-br-md'
              : 'bg-zinc-100 text-zinc-900 rounded-bl-md'
          )}
        >
          {content}
        </div>
      </div>
    </div>
  )
}
