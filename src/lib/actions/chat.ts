'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type MessageWithSender = {
  id: string
  gig_id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  read: boolean | null
  conversation_id: string | null
  sender?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
}

export type ConversationWithDetails = {
  id: string
  gig_id: string
  participant_ids: string[]
  created_at: string
  updated_at: string
  gig?: {
    id: string
    title: string
  }
  messages?: MessageWithSender[]
  other_participant?: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  unread_count?: number
}

export async function getConversations() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in', conversations: null }
  }

  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      gig:gigs(id, title),
      messages(
        id,
        content,
        created_at,
        sender_id,
        recipient_id,
        read
      )
    `)
    .contains('participant_ids', [user.id])
    .order('updated_at', { ascending: false })

  if (error) {
    return { error: error.message, conversations: null }
  }

  const conversationsWithDetails: ConversationWithDetails[] = (conversations || []).map((conv) => {
    const unreadCount = conv.messages?.filter(
      (m: { recipient_id: string; read: boolean | null }) => 
        m.recipient_id === user.id && m.read === false
    ).length || 0
    
    const sortedMessages = conv.messages?.sort(
      (a: { created_at: string }, b: { created_at: string }) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return {
      ...conv,
      unread_count: unreadCount,
      last_message: sortedMessages?.[0] || null,
      messages: sortedMessages
    }
  })

  return { error: null, conversations: conversationsWithDetails }
}

export async function getMessages(gigId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in', messages: null }
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .eq('gig_id', gigId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message, messages: null }
  }

  return { error: null, messages: messages || [] }
}

export async function sendMessage(data: {
  gigId: string
  recipientId: string
  content: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to send messages' }
  }

  if (!data.content.trim()) {
    return { error: 'Message cannot be empty' }
  }

  if (data.content.length > 5000) {
    return { error: 'Message is too long (max 5000 characters)' }
  }

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      gig_id: data.gigId,
      sender_id: user.id,
      recipient_id: data.recipientId,
      content: data.content.trim(),
    })
    .select(`
      *,
      sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url)
    `)
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/client/chat')
  revalidatePath('/freelancer/chat')

  return { error: null, message }
}

export async function markMessagesAsRead(gigId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('gig_id', gigId)
    .eq('recipient_id', user.id)
    .eq('read', false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/client/chat')
  revalidatePath('/freelancer/chat')

  return { error: null }
}

export async function getOrCreateConversation(gigId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data: gig } = await supabase
    .from('gigs')
    .select('id, client_id, title')
    .eq('id', gigId)
    .single()

  if (!gig) {
    return { error: 'Gig not found' }
  }

  const { data: existingConversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('gig_id', gigId)
    .contains('participant_ids', [user.id])
    .single()

  if (existingConversation) {
    return { error: null, conversation: existingConversation }
  }

  const participantIds: string[] = [gig.client_id]
  
  const { data: acceptedApplication } = await supabase
    .from('applications')
    .select('freelancer_id')
    .eq('gig_id', gigId)
    .eq('status', 'accepted')
    .single()

  if (acceptedApplication) {
    participantIds.push(acceptedApplication.freelancer_id)
  }

  if (!participantIds.includes(user.id)) {
    return { error: 'You are not a participant of this gig' }
  }

  const { data: newConversation, error } = await supabase
    .from('conversations')
    .insert({
      gig_id: gigId,
      participant_ids: participantIds,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { error: null, conversation: newConversation }
}

export async function getOtherParticipant(gigId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in' }
  }

  const { data: gig } = await supabase
    .from('gigs')
    .select('client_id')
    .eq('id', gigId)
    .single()

  if (!gig) {
    return { error: 'Gig not found' }
  }

  if (gig.client_id === user.id) {
    const { data: acceptedApplication } = await supabase
      .from('applications')
      .select('freelancer_id')
      .eq('gig_id', gigId)
      .eq('status', 'accepted')
      .single()

    if (acceptedApplication) {
      const { data: freelancer } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('id', acceptedApplication.freelancer_id)
        .single()

      return { error: null, participant: freelancer }
    }
  } else {
    const { data: client } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .eq('id', gig.client_id)
      .single()

    return { error: null, participant: client }
  }

  return { error: null, participant: null }
}
