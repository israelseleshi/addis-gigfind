'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, MoreVertical, Phone, Video, ArrowLeft, MessageSquare } from 'lucide-react';
import { ConversationList } from '@/components/chat/ConversationList';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { MessageInput } from '@/components/chat/MessageInput';
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageAction,
  markMessagesAsRead,
  getOtherParticipant,
  ConversationWithDetails,
} from '@/lib/actions/chat';

type Message = {
  id: string;
  gig_id: string;
  content: string;
  sender_id: string;
  created_at: string;
  read: boolean | null;
  recipient_id: string;
  sender?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
};

type Conversation = {
  id: string;
  gig_id: string;
  gig?: {
    id: string;
    title: string;
  };
  participant_ids: string[];
  updated_at: string;
  messages?: Message[];
  other_participant?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
  unread_count?: number;
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<{ id: string; full_name: string; avatar_url: string | null } | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    loadInitialData();
    setupRealtimeSubscription();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.gig_id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      }

      const result = await getConversations();
      if (result.error) {
        setError(result.error);
      } else if (result.conversations) {
        const convsWithParticipantInfo = await Promise.all(
          (result.conversations as ConversationWithDetails[]).map(async (conv) => {
            const participantResult = await getOtherParticipant(conv.gig_id);
            return {
              ...conv,
              other_participant: participantResult.participant || undefined,
            };
          })
        );
        setConversations(convsWithParticipantInfo);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const newMessage = payload.new as Message;
          
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === newMessage.id);
            if (exists) return prev;
            if (selectedConversation && newMessage.gig_id === selectedConversation.gig_id) {
              return [...prev, newMessage];
            }
            return prev;
          });
          
          if (newMessage.recipient_id === currentUserId) {
            await markMessagesAsRead(newMessage.gig_id);
          }
          
          await loadInitialData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMessages = async (gigId: string) => {
    setMessagesLoading(true);
    try {
      const result = await getMessages(gigId);
      if (result.error) {
        setError(result.error);
      } else if (result.messages) {
        setMessages(result.messages as Message[]);
        
        const participantResult = await getOtherParticipant(gigId);
        if (participantResult.participant) {
          setOtherParticipant(participantResult.participant);
        }
        
        await markMessagesAsRead(gigId);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      setError('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !otherParticipant || !currentUserId) return;

    const tempId = `temp-${Date.now()}`
    const optimisticMessage: Message = {
      id: tempId,
      gig_id: selectedConversation.gig_id,
      content,
      sender_id: currentUserId,
      recipient_id: otherParticipant.id,
      created_at: new Date().toISOString(),
      read: false,
    }

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const result = await sendMessageAction({
        gigId: selectedConversation.gig_id,
        recipientId: otherParticipant.id,
        content,
      });

      if (result.error) {
        setError(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (result.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...result.message, sender: m.sender } as Message : m))
        );
        await loadInitialData();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    setMessages([]);
    setOtherParticipant(conv.other_participant || null);
    setError(null);
  };

  return (
    <div className="h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] md:h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] flex bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Sidebar - Conversation List */}
      <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 flex-col border-r border-gray-200 bg-gray-50`}>
        <ConversationList
          conversations={conversations}
          selectedGigId={selectedConversation?.gig_id}
          onSelectConversation={handleSelectConversation}
          isLoading={loading}
        />
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-[#e5ded8]">
          {/* Chat Header */}
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 md:p-4 bg-amber-600 text-white">
            <button onClick={() => setSelectedConversation(null)} className="lg:hidden p-1 hover:bg-amber-500 rounded">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12">
              <AvatarImage src={otherParticipant?.avatar_url || undefined} />
              <AvatarFallback className="bg-amber-100 text-amber-600 text-xs sm:text-sm">
                {otherParticipant?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm sm:text-base md:text-lg truncate">{otherParticipant?.full_name || 'Loading...'}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm opacity-80 truncate">{selectedConversation.gig?.title}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
                <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 hidden sm:flex">
                <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500 h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9">
                <MoreVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-4">
            {messagesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-8 w-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No messages yet</p>
                  <p className="text-xs text-gray-400">Send a message to start the conversation</p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  senderName={message.sender?.full_name || (message.sender_id === currentUserId ? 'You' : 'User')}
                  senderAvatar={message.sender?.avatar_url}
                  isOwnMessage={message.sender_id === currentUserId}
                  createdAt={message.created_at}
                  read={message.read}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <MessageInput onSendMessage={handleSendMessage} disabled={!otherParticipant} />
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 md:w-24 mx-auto mb-3 sm:mb-4 md:mb-6 rounded-full bg-gray-200 flex items-center justify-center">
              <Send className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-medium text-gray-900">Addis GigFind Chat</h3>
            <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
