'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_own: boolean;
}

interface Conversation {
  id: string;
  gig_title: string;
  freelancer_name: string;
  freelancer_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setConversations([
          {
            id: '1',
            gig_title: 'Website Redesign',
            freelancer_name: 'Tadesse Bekele',
            freelancer_avatar: null,
            last_message: 'I can start tomorrow',
            last_message_time: new Date().toISOString(),
            unread_count: 2,
          },
          {
            id: '2',
            gig_title: 'Plumbing Repair',
            freelancer_name: 'Abebe Assefa',
            freelancer_avatar: null,
            last_message: 'Thanks for the opportunity',
            last_message_time: new Date(Date.now() - 3600000).toISOString(),
            unread_count: 0,
          },
          {
            id: '3',
            gig_title: 'Mobile App Development',
            freelancer_name: 'Mekdes Tadesse',
            freelancer_avatar: null,
            last_message: 'When can we discuss the project?',
            last_message_time: new Date(Date.now() - 7200000).toISOString(),
            unread_count: 1,
          },
          {
            id: '4',
            gig_title: 'House Painting',
            freelancer_name: 'Kebede Lemma',
            freelancer_avatar: null,
            last_message: 'The work is almost done',
            last_message_time: new Date(Date.now() - 10800000).toISOString(),
            unread_count: 0,
          },
          {
            id: '5',
            gig_title: 'Electrical Work',
            freelancer_name: 'Hirut Getachew',
            freelancer_avatar: null,
            last_message: 'I will bring the tools tomorrow',
            last_message_time: new Date(Date.now() - 14400000).toISOString(),
            unread_count: 3,
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    setMessages([
      { id: '1', content: 'Selam! I saw your job posting for Website Redesign', sender_id: 'other', created_at: new Date(Date.now() - 3600000).toISOString(), is_own: false },
      { id: '2', content: 'Yes, I am interested in working on this project', sender_id: 'other', created_at: new Date(Date.now() - 3500000).toISOString(), is_own: false },
      { id: '3', content: 'Great! I have 5 years of experience with React and Next.js', sender_id: 'other', created_at: new Date(Date.now() - 3400000).toISOString(), is_own: false },
      { id: '4', content: 'That sounds perfect. Can you share some of your previous work?', sender_id: 'me', created_at: new Date(Date.now() - 1800000).toISOString(), is_own: true },
      { id: '5', content: 'Sure, I can start tomorrow and show you my portfolio', sender_id: 'other', created_at: new Date().toISOString(), is_own: false },
    ]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender_id: 'me',
      created_at: new Date().toISOString(),
      is_own: true,
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.gig_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.freelancer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg overflow-hidden border border-gray-200">
      {/* Sidebar - Conversation List */}
      <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-gray-200 bg-gray-50`}>
        {/* Header */}
        <div className="p-4 bg-amber-600 text-white">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white text-gray-900 border-0"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-3 w-full bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.freelancer_avatar || undefined} />
                  <AvatarFallback className="bg-amber-100 text-amber-600">
                    {conv.freelancer_name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">{conv.freelancer_name}</h3>
                    <span className="text-xs text-gray-500">{formatTime(conv.last_message_time)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.gig_title}</p>
                  <p className="text-sm text-gray-500 truncate">{conv.last_message}</p>
                </div>
                {conv.unread_count > 0 && (
                  <div className="h-5 w-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                    {conv.unread_count}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col bg-[#e5ded8]">
          {/* Chat Header */}
          <div className="flex items-center gap-3 p-3 bg-amber-600 text-white">
            <button onClick={() => setSelectedConversation(null)} className="md:hidden p-1 hover:bg-amber-500 rounded">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedConversation.freelancer_avatar || undefined} />
              <AvatarFallback className="bg-amber-100 text-amber-600">
                {selectedConversation.freelancer_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium">{selectedConversation.freelancer_name}</h3>
              <p className="text-xs opacity-80">{selectedConversation.gig_title}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white hover:bg-amber-500">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.is_own ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg px-4 py-2 ${message.is_own ? 'bg-amber-100 text-gray-900' : 'bg-white text-gray-900'}`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs text-gray-500 mt-1 ${message.is_own ? 'text-right' : ''}`}>{formatTime(message.created_at)}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-gray-100">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 bg-white border-0"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()} className="bg-amber-600 hover:bg-amber-700">
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">Addis GigFind Chat</h3>
            <p className="text-gray-500 mt-1">Select a conversation to start chatting</p>
          </div>
        </div>
      )}
    </div>
  );
}
