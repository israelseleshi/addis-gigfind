'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

type Conversation = {
  id: string
  gig_id: string
  gig?: {
    id: string
    title: string
  }
  participant_ids: string[]
  updated_at: string
  last_message?: {
    content: string
    created_at: string
  }
  other_participant?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  unread_count?: number
}

type ConversationListProps = {
  conversations: Conversation[]
  selectedGigId?: string | null
  onSelectConversation: (conversation: Conversation) => void
  isLoading?: boolean
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function truncateMessage(message: string, maxLength: number = 40): string {
  if (message.length <= maxLength) return message
  return message.slice(0, maxLength) + '...'
}

export function ConversationList({
  conversations,
  selectedGigId,
  onSelectConversation,
  isLoading = false,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter((conv) => {
    const searchLower = searchQuery.toLowerCase()
    const gigTitle = conv.gig?.title?.toLowerCase() || ''
    const participantName = conv.other_participant?.full_name?.toLowerCase() || ''
    const lastMessage = conv.last_message?.content?.toLowerCase() || ''
    
    return (
      gigTitle.includes(searchLower) ||
      participantName.includes(searchLower) ||
      lastMessage.includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="h-10 bg-zinc-100 rounded-lg animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-zinc-100 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
                <div className="h-3 w-32 bg-zinc-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-zinc-200 
                       text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 
                       focus:border-orange-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageSquare className="h-12 w-12 text-zinc-300 mb-3" />
            <p className="text-sm text-zinc-500">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {searchQuery ? 'Try a different search' : 'Start a conversation by applying to a gig'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredConversations.map((conversation) => {
              const isSelected = selectedGigId === conversation.gig_id
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-zinc-50 transition-colors',
                    isSelected && 'bg-orange-50 hover:bg-orange-50'
                  )}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage
                        src={conversation.other_participant?.avatar_url || undefined}
                        alt={conversation.other_participant?.full_name}
                      />
                      <AvatarFallback>
                        {conversation.other_participant
                          ? getInitials(conversation.other_participant.full_name)
                          : '?'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {conversation.other_participant?.full_name || 'Unknown User'}
                          </p>
                          {conversation.gig && (
                            <p className="text-xs text-zinc-500 truncate">
                              {conversation.gig.title}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs text-zinc-400">
                            {conversation.updated_at && formatTimeAgo(conversation.updated_at)}
                          </span>
                          {conversation.unread_count && conversation.unread_count > 0 && (
                            <Badge variant="default" className="h-5 px-1.5 text-xs bg-orange-500">
                              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {conversation.last_message && (
                        <p className="text-xs text-zinc-500 mt-1 truncate">
                          {truncateMessage(conversation.last_message.content)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
