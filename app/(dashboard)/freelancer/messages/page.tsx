"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Send } from 'lucide-react';

// Mock Data
const conversations = [
  { id: 1, name: 'Client A', avatar: '/placeholder-user.jpg', lastMessage: 'Sounds good, thank you!', timestamp: '10:42 AM' },
  { id: 2, name: 'Client B', avatar: '/placeholder-user.jpg', lastMessage: 'Can you send over the final files?', timestamp: 'Yesterday' },
  { id: 3, name: 'Client C', avatar: '/placeholder-user.jpg', lastMessage: 'Perfect, no changes needed.', timestamp: '3 days ago' },
];

const messagesData: { [key: number]: any[] } = {
  1: [
    { id: 1, sender: 'them', text: 'Hi, I saw your proposal and I am very interested.' },
    { id: 2, sender: 'me', text: 'Hello! Thank you for reaching out. I would be happy to discuss the project further.' },
    { id: 3, sender: 'them', text: 'Great. I have approved the milestone. Please proceed.' },
    { id: 4, sender: 'me', text: 'Excellent, I will get started right away.' },
    { id: 5, sender: 'them', text: 'Sounds good, thank you!' },
  ],
  2: [
    { id: 1, sender: 'them', text: 'The designs look great!' },
    { id: 2, sender: 'me', text: 'Glad you like them! I have just a few more tweaks to make.' },
    { id: 3, sender: 'them', text: 'Can you send over the final files?' },
  ],
  3: [
    { id: 1, sender: 'them', text: 'Perfect, no changes needed.' },
  ],
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);

  return (
    <Card className="h-[calc(100vh-10rem)] flex shadow-md">
      {/* Conversations List */}
      <div className="w-1/3 border-r">
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <Separator />
        <ScrollArea className="h-[calc(100%-4rem)]">
          {conversations.map(convo => (
            <div key={convo.id} onClick={() => setSelectedConversation(convo)} className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedConversation.id === convo.id ? 'bg-gray-100' : ''}`}>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={convo.avatar} />
                  <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold">{convo.name}</p>
                  <p className="text-sm text-gray-500 truncate">{convo.lastMessage}</p>
                </div>
                <p className="text-xs text-gray-400">{convo.timestamp}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b flex items-center gap-4">
              <Avatar>
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{selectedConversation.name}</h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messagesData[selectedConversation.id].map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-lg max-w-xs ${msg.sender === 'me' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="relative">
                <Input placeholder="Type a message..." className="pr-12" />
                <Button size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </Card>
  );
}
