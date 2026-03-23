# Feature Specification 09: Notifications System

## 1. Executive Summary
Implements the notification system for in-app alerts. Includes notification creation, display, marking as read, and real-time updates via Supabase Realtime.

## 2. Business Rules

### 2.1 AGF-BR-605 (Timely Communication)
- Users receive notifications for:
  - New applications on their gigs
  - Application status changes
  - New messages
  - Gig status updates
  - Review received
  - Verification status changes

### 2.2 Notification Types
- `application_received` - New application on user's gig
- `application_accepted` - Application was accepted
- `application_rejected` - Application was rejected
- `message_received` - New chat message
- `gig_status_changed` - Gig status was updated
- `review_received` - New review received
- `verification_approved` - ID verification approved
- `verification_rejected` - ID verification rejected
- `system` - System announcements

## 3. Database Schema

### 3.1 notifications table
```sql
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc', now())
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

## 4. Server Actions (lib/actions/notifications.ts)

### 4.1 createNotification(userId, type, content, link?)
```typescript
export async function createNotification(
  userId: string,
  type: string,
  content: string,
  link?: string
) {
  const supabase = createClient()
  
  const titleMap: Record<string, string> = {
    application_received: 'New Application',
    application_accepted: 'Application Accepted',
    application_rejected: 'Application Rejected',
    message_received: 'New Message',
    gig_status_changed: 'Gig Status Update',
    review_received: 'New Review',
    verification_approved: 'Verification Approved',
    verification_rejected: 'Verification Rejected',
    system: 'System Announcement',
  }
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title: titleMap[type] || 'Notification',
      content,
      link,
    })
  
  if (error) {
    console.error('Failed to create notification:', error)
  }
  
  return { success: true }
}
```

### 4.2 getMyNotifications(options?)
```typescript
export async function getMyNotifications(options?: {
  unreadOnly?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (options?.unreadOnly) {
    query = query.eq('is_read', false)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }
  
  const { data, error } = await query
  
  if (error) return { error: error.message }
  
  return { notifications: data }
}
```

### 4.3 getUnreadCount()
```typescript
export async function getUnreadCount() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { count: 0 }
  
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
  
  if (error) return { count: 0 }
  
  return { count: count || 0 }
}
```

### 4.4 markAsRead(notificationId)
```typescript
export async function markAsRead(notificationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/notifications')
  return { success: true }
}
```

### 4.5 markAllAsRead()
```typescript
export async function markAllAsRead() {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
  
  if (error) return { error: error.message }
  
  revalidatePath('/notifications')
  return { success: true }
}
```

### 4.6 deleteNotification(notificationId)
```typescript
export async function deleteNotification(notificationId: string) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")
  
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', user.id)
  
  if (error) return { error: error.message }
  
  revalidatePath('/notifications')
  return { success: true }
}
```

## 5. UI Components

### 5.1 NotificationBell (src/components/notifications/notification-bell.tsx)
**Features:**
- Bell icon
- Badge showing unread count
- Click to open dropdown
- Real-time update of count
- Animation on new notification

### 5.2 NotificationDropdown (src/components/notifications/notification-dropdown.tsx)
**Features:**
- List of recent notifications
- Scrollable
- Max height
- "Mark all as read" button
- "View all" link
- Empty state
- Click notification to navigate

### 5.3 NotificationItem (src/components/notifications/notification-item.tsx)
**Features:**
- Icon based on type
- Title
- Content preview
- Relative time
- Read/unread styling
- Click to navigate
- Delete button

### 5.4 NotificationList (src/components/notifications/notification-list.tsx)
**Features:**
- Full page list
- Filter tabs (All, Unread)
- Search/filter
- Pagination
- Mark as read buttons
- Delete buttons

## 6. Realtime Implementation

### 6.1 useNotifications Hook
```typescript
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

export function useNotifications() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
      setUnreadCount(data?.length || 0)
    }
    
    fetchUnreadCount()
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1)
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          if (payload.new.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])
  
  return { unreadCount, notifications, setUnreadCount }
}
```

## 7. Notification Triggers

### 7.1 Application Received
```typescript
// When freelancer applies to gig
async function onFreelancerApply(gigId: string, freelancerId: string) {
  const { data: gig } = await supabase.from('gigs').select('client_id, title').eq('id', gigId).single()
  
  await createNotification(
    gig.client_id,
    'application_received',
    `New application on your gig: ${gig.title}`,
    `/client/gigs/${gigId}/applicants`
  )
}
```

### 7.2 Application Accepted
```typescript
// When client accepts application
async function onAcceptApplication(applicationId: string) {
  const { data: app } = await supabase
    .from('applications')
    .select('freelancer_id, gig: gigs(title)')
    .eq('id', applicationId)
    .single()
  
  await createNotification(
    app.freelancer_id,
    'application_accepted',
    `Your application for "${app.gig.title}" has been accepted!`,
    `/freelancer/jobs/${app.gig_id}`
  )
}
```

### 7.3 New Message
```typescript
// When user sends chat message
async function onSendMessage(conversationId: string, recipientId: string) {
  await createNotification(
    recipientId,
    'message_received',
    'You have a new message',
    `/chat/${conversationId}`
  )
}
```

### 7.4 Gig Status Changed
```typescript
// When client updates gig status
async function onUpdateGigStatus(gigId: string, status: string) {
  const { data: gig } = await supabase
    .from('gigs')
    .select('client_id, freelancer_id')
    .eq('id', gigId)
    .single()
  
  if (gig?.freelancer_id) {
    await createNotification(
      gig.freelancer_id,
      'gig_status_changed',
      `Gig status updated to: ${status}`,
      `/freelancer/jobs/${gigId}`
    )
  }
}
```

## 8. Pages

### 8.1 Notifications Page
**Location:** src/app/(main)/notifications/page.tsx
**Features:**
- Render NotificationList
- Filter tabs (All, Unread)
- "Mark all as read" button
- Empty state
- Pagination

### 8.2 Notification Settings (Optional)
**Location:** src/app/(main)/settings/notifications/page.tsx
**Features:**
- Toggle notification types
- Email notification preferences
- Push notification preferences

## 9. Implementation Checklist

- [ ] Create src/lib/actions/notifications.ts
- [ ] Create SQL for notifications table
- [ ] Enable Realtime for notifications
- [ ] Create src/components/notifications/notification-bell.tsx
- [ ] Create src/components/notifications/notification-dropdown.tsx
- [ ] Create src/components/notifications/notification-item.tsx
- [ ] Create src/components/notifications/notification-list.tsx
- [ ] Create src/hooks/use-notifications.ts
- [ ] Integrate bell into SiteHeader
- [ ] Create /notifications/page.tsx
- [ ] Add notification triggers throughout app
- [ ] Test real-time updates
- [ ] Test mark as read functionality
- [ ] Test notification creation

## 10. Testing Strategy

### 10.1 E2E Tests (Cypress)
- Test notification creation
- Test notification display
- Test mark as read
- Test mark all as read
- Test delete notification
- Test real-time updates
- Test unread count badge

## 11. Related Files
- **Auth Spec:** specs/F01_Auth_Spec.md
- **Chat Spec:** specs/F05_ChatCommunication_Spec.md
- **Verification Spec:** specs/F07_VerificationSystem_Spec.md
- **Design System:** design_system.md
- **Types:** src/lib/types.ts
- **Tasks:** tasks.md (Phase 5)

## 12. Status
- **Created:** January 23, 2026
- **Last Updated:** January 23, 2026
- **Status:** Ready for Implementation
