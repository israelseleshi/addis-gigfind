# Feature Specification 05: Chat & Communication

## 1. Executive Summary
Implements real-time chat system using Supabase Realtime. Includes conversation management, message sending/receiving, and notification integration.

## 2. Business Rules

### 2.1 AGF-BR-303 (Contact Reveal)
- Phone number is ONLY shown after Gig Status is 'assigned'
- Before assignment: Only in-app chat allowed

### 2.2 Chat Eligibility
- Chat is enabled when Application Status is 'accepted'
- Only participants (client + freelancer) can access chat
- No third-party access

## 3. Database Schema

### 3.1 messages table
```sql
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid REFERENCES public.profiles(id) NOT NULL,
  recipient_id uuid REFERENCES public.profiles(id) NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  read boolean DEFAULT false
);

-- RLS Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

### 3.2 conversations table (optional, for grouping)
```sql
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id uuid REFERENCES public.gigs(id) ON DELETE CASCADE NOT NULL,
  participant_ids uuid[] NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc', now()),
  updated_at timestamp with time zone DEFAULT timezone('utc', now()),
  UNIQUE(gig_id)
);
```

### 3.3 Enable Realtime
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

## 4. Server Actions (lib/actions/chat.ts)

### 4.1 createConversation(gigId)
```typescript
export async function createConversation(gigId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Get gig with client info
  const { data: gig } = await supabase
    .from('gigs')
    .select('id, client_id')
    .eq('id', gigId)
    .single()
  
  if (!gig) return { error: "Gig not found" }
  
  // Verify user is participant
  const isClient = gig.client_id === user.id
  const isFreelancer = await checkAcceptedApplication(gigId, user.id)
  
  if (!isClient && !isFreelancer) {
    return { error: "Not authorized to create conversation" }
  }
  
  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('gig_id', gigId)
    .single()
  
  if (existing) {
    return { conversation: existing }
  }
  
  // Create conversation
  const { data: conversation, error } = await supabase
    .from('conversations')
    .insert({
      gig_id: gigId,
      participant_ids: [gig.client_id, user.id],
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  return { conversation }
}
```

### 4.2 sendMessage(conversationId, content)
```typescript
export async function sendMessage(conversationId: string, content: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Verify user is participant
  const { data: conversation } = await supabase
    .from('conversations')
    .select('participant_ids, gig_id')
    .eq('id', conversationId)
    .single()
  
  if (!conversation?.participant_ids.includes(user.id)) {
    return { error: "Not authorized to send messages" }
  }
  
  // Get recipient
  const recipientId = conversation.participant_ids.find(id => id !== user.id)
  
  // Create message
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      gig_id: conversation.gig_id,
      sender_id: user.id,
      recipient_id: recipientId,
      content,
    })
    .select()
    .single()
  
  if (error) {
    return { error: error.message }
  }
  
  // Create notification for recipient
  await createNotification(recipientId, 'message', `New message from ${user.email}`)
  
  revalidatePath(`/chat/${conversationId}`)
  return { message }
}
```

### 4.3 getMessages(conversationId)
```typescript
export async function getMessages(conversationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  // Verify user is participant
  const { data: conversation } = await supabase
    .from('conversations')
    .select('participant_ids')
    .eq('id', conversationId)
    .single()
  
  if (!conversation?.participant_ids.includes(user.id)) {
    return { error: "Not authorized" }
  }
  
  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .eq('gig_id', conversation.gig_id)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: true })
  
  if (error) {
    return { error: error.message }
  }
  
  return { messages }
}
```

### 4.4 getMyConversations()
```typescript
export async function getMyConversations() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      gig:gigs (id, title, status),
      messages (
        content,
        created_at,
        sender_id
      )
    `)
    .contains('participant_ids', [user.id])
    .order('updated_at', { ascending: false })
  
  if (error) {
    return { error: error.message }
  }
  
  // Get last message and unread count for each conversation
  const conversationsWithMeta = await Promise.all(
    conversations.map(async (conv) => {
      const { data: unread } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('gig_id', conv.gig_id)
        .eq('recipient_id', user.id)
        .eq('read', false)
      
      const lastMessage = conv.messages[conv.messages.length - 1]
      
      return {
        ...conv,
        lastMessage,
        unreadCount: unread || 0,
      }
    })
  )
  
  return { conversations: conversationsWithMeta }
}
```

### 4.5 markMessagesAsRead(conversationId)
```typescript
export async function markMessagesAsRead(conversationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { data: conversation } = await supabase
    .from('conversations')
    .select('gig_id')
    .eq('id', conversationId)
    .single()
  
  if (!conversation) return { error: "Conversation not found" }
  
  await supabase
    .from('messages')
    .update({ read: true })
    .eq('gig_id', conversation.gig_id)
    .eq('recipient_id', user.id)
    .eq('read', false)
  
  revalidatePath(`/chat/${conversationId}`)
  return { success: true }
}
```

## 5. Client Components

### 5.1 ChatList (src/components/chat/chat-list.tsx)
**Features:**
- List of conversations
- Shows gig title
- Shows last message preview
- Shows unread count badge
- Shows relative time
- Active state styling
- Empty state

### 5.2 ChatWindow (src/components/chat/chat-window.tsx)
**Features:**
- Header with gig title
- Message list (scrollable)
- Message bubbles (sent vs received)
- Timestamp display
- Read status indicators
- Typing indicator

### 5.3 MessageInput (src/components/chat/message-input.tsx)
**Features:**
- Text input field
- Send button
- Character limit
- Loading state
- Auto-resize textarea

### 5.4 ChatProvider (src/components/chat/chat-provider.tsx)
**Features:**
- Wraps chat components
- Sets up Supabase Realtime subscription
- Handles new message events
- Updates message list in real-time

## 6. Pages

### 6.1 Chat List Page
**Location:** src/app/(main)/chat/page.tsx
**Features:**
- Render ChatList
- Title: "Messages"
- Empty state when no conversations
- Click conversation to open chat window

### 6.2 Chat Detail Page
**Location:** src/app/(main)/chat/[id]/page.tsx
**Features:**
- Render ChatWindow
- Render MessageInput
- Auto-scroll to bottom on new message
- Mark messages as read on load

### 6.3 Embedded Chat
**Location:** src/app/(main)/gigs/[id]/chat/page.tsx
**Features:**
- Chat for specific gig
- Redirect if not authorized
- Show gig context in header

## 7. Realtime Implementation

### 7.1 Subscribe to Messages
```typescript
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function useRealtimeMessages(conversationId: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [messages, setMessages] = useState<Message[]>([])
  
  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('gig_id', conversationId)
        .order('created_at', { ascending: true })
      setMessages(data || [])
    }
    
    fetchMessages()
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `gig_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])
  
  return messages
}
```

## 8. Implementation Checklist

- [ ] Create src/lib/actions/chat.ts
- [ ] Create src/lib/validations/chat.ts
- [ ] Create src/components/chat/chat-list.tsx
- [ ] Create src/components/chat/chat-window.tsx
- [ ] Create src/components/chat/message-input.tsx
- [ ] Create src/components/chat/chat-provider.tsx
- [ ] Create /chat/page.tsx
- [ ] Create /chat/[id]/page.tsx
- [ ] Enable Realtime for messages table
- [ ] Test real-time message updates
- [ ] Test conversation creation
- [ ] Test message sending
- [ ] Test read status
- [ ] Test notification integration

## 9. Testing Strategy

### 9.1 E2E Tests (Cypress)
- Test conversation list display
- Test message sending
- Test real-time updates
- Test authorization checks
- Test read status marking

## 10. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Gig Management Spec:** specs/F03_GigManagement_Spec.md
- **Freelancer Features Spec:** specs/F04_FreelancerFeatures_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 5)

## 11. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
