import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { WhatsAppChat } from '../types';
import { ChatSidebar } from '../components/ChatSidebar';
import { ChatWindow } from '../components/ChatWindow';

export function WhatsAppPage() {
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [activeChat, setActiveChat] = useState<WhatsAppChat | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const response = await api.get('/whatsapp/conversations');
      const conversations = response.data || [];

      const transformedChats: WhatsAppChat[] = await Promise.all(
        conversations.map(async (conv: any) => {
          let contactName = conv.contactName || 'Unknown';
          try {
            const contactRes = await api.get(`/whatsapp/contact/${conv.id}`);
            if (contactRes.data?.name) contactName = contactRes.data.name;
          } catch {
            // Ignore contact fetch errors
          }

          let messages: any[] = [];
          try {
            const msgsRes = await api.get(`/whatsapp/conversations/${conv.id}/messages`);
            messages = (msgsRes.data || []).map((msg: any) => ({
              id: msg.id,
              senderId: msg.direction === 'inbound' ? 'them' : 'me',
              text: msg.content,
              timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isMe: msg.direction === 'outbound',
              status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
            }));
          } catch {
            if (conv.messages && conv.messages.length > 0) {
              const msg = conv.messages[0];
              messages = [{
                id: msg.id,
                senderId: msg.direction === 'inbound' ? 'them' : 'me',
                text: msg.content,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: msg.direction === 'outbound',
                status: msg.ack === 3 ? 'read' : msg.ack === 2 ? 'delivered' : msg.ack === 1 ? 'sent' : 'pending',
              }];
            }
          }

          return {
            id: conv.id,
            contactName,
            phoneNumber: '',
            companyName: '',
            unreadCount: 0,
            lastMessageTime: conv.lastMessageAt
              ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            isOnline: false,
            messages,
          };
        })
      );

      setChats(transformedChats);
    } catch (error) {
      console.error('Failed to fetch WhatsApp chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const filteredChats = chats.filter(c =>
    c.contactName.toLowerCase().includes(search.toLowerCase()) ||
    (c.companyName && c.companyName.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="h-[calc(100vh-100px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm max-w-[1400px] mx-auto">
      <ChatSidebar
        chats={filteredChats}
        activeChatId={activeChat?.id || ''}
        onSelectChat={setActiveChat}
        search={search}
        onSearchChange={setSearch}
      />
      <ChatWindow chat={activeChat} onRefresh={fetchChats} />
    </div>
  );
}
