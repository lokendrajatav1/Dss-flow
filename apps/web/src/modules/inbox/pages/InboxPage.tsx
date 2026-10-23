import React, { useState, useEffect, useRef } from 'react';
import { Search, Settings, Bot, Wand2, Globe, Send, User, MessageSquarePlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/api';

const MessengerIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.9 1.458 5.485 3.738 7.151.218.16.36.402.392.67l.192 1.55c.032.257.294.417.525.32l1.792-.756a.796.796 0 0 1 .531.018A10.597 10.597 0 0 0 12 20.52c5.523 0 10-4.145 10-9.26S17.523 2 12 2zm1.094 12.392-2.146-2.29a.834.834 0 0 0-1.127-.08l-3.238 2.45c-.328.249-.74-.15-.52-.511l2.585-4.242a1.442 1.442 0 0 1 1.95-.536l2.146 1.22a.834.834 0 0 0 1.127-.08l3.238-3.447c.328-.35.882.029.626.446l-2.69 4.39a1.442 1.442 0 0 1-1.95.08z" /></svg>
);

const IgIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.148 1.603 5.928L.18 23.361l5.545-1.455c1.721.956 3.659 1.464 5.679 1.464h.01C18.615 23.37 24 17.985 24 11.34 24 8.113 22.743 5.08 20.463 2.797 18.18 5.513 15.249 0 12.031 0zm.01 19.397c-1.802 0-3.567-.484-5.114-1.401l-.367-.217-3.799.997.994-3.702-.239-.38a9.497 9.497 0 0 1-1.45-5.07c0-5.246 4.269-9.516 9.516-9.516 2.54 0 4.928.99 6.723 2.784a9.518 9.518 0 0 1 2.783 6.721c0 5.247-4.269 9.516-9.516 9.516zm5.222-7.142c-.287-.143-1.696-.837-1.96-.933-.263-.093-.456-.143-.65.093-.19.237-.743.934-.91 1.127-.167.19-.335.215-.623.071-.287-.143-1.21-.446-2.306-1.422-.852-.76-1.428-1.7-1.595-1.986-.167-.287-.018-.442.126-.584.13-.129.287-.335.43-.502.143-.167.19-.287.287-.478.096-.19.048-.36-.024-.502-.072-.143-.65-1.569-.89-2.147-.234-.564-.473-.487-.65-.497-.167-.008-.36-.008-.55-.008-.19 0-.5.071-.763.36-.263.287-1.004.981-1.004 2.392s1.028 2.774 1.171 2.964c.143.19 2.022 3.085 4.898 4.327.685.296 1.219.473 1.636.606.688.218 1.314.187 1.808.113.553-.083 1.696-.693 1.936-1.363.239-.67.239-1.244.167-1.363-.071-.12-.263-.19-.55-.333z" /></svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
);

function ConversationItem({ conv, isActive, onClick, onContactLoaded }: {
  conv: any;
  isActive: boolean;
  onClick: () => void;
  onContactLoaded?: (id: string, name: string, profilePicUrl: string | null, isReadOnly: boolean) => void;
}) {
  const [contactInfo, setContactInfo] = useState<{ name: string, profilePicUrl: string | null, isReadOnly?: boolean } | null>(null);

  useEffect(() => {
    if (conv.channel === 'whatsapp') {
      const fetchInfo = async () => {
        try {
          const res = await api.get(`/whatsapp/contact/${conv.status}`);
          setContactInfo(res.data);
          onContactLoaded?.(conv.status, res.data.name, res.data.profilePicUrl, res.data.isReadOnly);
        } catch (e) {
          console.error(e);
        }
      };
      fetchInfo();
    }
  }, [conv.status, conv.channel]);

  const defaultName = conv.status.endsWith('@newsletter') ? 'WhatsApp Channel' :
    conv.status.endsWith('@g.us') ? 'WhatsApp Group' :
      conv.status.replace('@c.us', '');
  const displayName = contactInfo?.name || defaultName;
  const avatarUrl = contactInfo?.profilePicUrl;

  return (
    <button
      onClick={() => {
        conv.contactName = displayName;
        conv.contactAvatar = avatarUrl;
        onClick();
      }}
      className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${isActive ? 'bg-[#f8fafc]' : ''}`}
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center overflow-hidden shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <User className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5 min-w-0 pr-2">
              <span className="font-medium text-gray-900 text-[14px] truncate">
                {displayName}
              </span>
              {/* Group / Channel Badges */}
              {conv.status.endsWith('@g.us') && (
                <span className="shrink-0 bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  Group
                </span>
              )}
              {conv.status.endsWith('@newsletter') && (
                <span className="shrink-0 bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                  Channel
                </span>
              )}
            </div>
            <span className="text-[11px] text-gray-400 shrink-0">
              {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-[13px] text-gray-500 truncate">
            {conv.messages?.[0]?.content || 'No messages yet'}
          </p>
        </div>
      </div>
    </button>
  );
}

const renderMessageText = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// WhatsApp-style message tick component
// ack: 0=pending(clock), 1=sent(✓ gray), 2=delivered(✓✓ gray), 3=read(✓✓ blue)
function MessageTick({ ack }: { ack: number }) {
  if (ack === 0) {
    return (
      <svg className="w-3 h-3 text-gray-400 inline-block" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 3.5v2.8l1.5 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (ack === 1) {
    return (
      <svg className="w-4 h-3 text-gray-400 inline-block" viewBox="0 0 16 12" fill="none">
        <path d="M2 6l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (ack === 2) {
    return (
      <svg className="w-5 h-3 text-gray-400 inline-block" viewBox="0 0 20 12" fill="none">
        <path d="M1 6l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 6l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-3 text-[#53bdeb] inline-block" viewBox="0 0 20 12" fill="none">
      <path d="M1 6l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 6l4 4 8-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function InboxPage() {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState<string>('all');
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'found' | 'not_found'>('idle');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeContactInfo, setActiveContactInfo] = useState<{ name: string, profilePicUrl: string | null, isReadOnly?: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  // Map of conv.status -> { name, profilePicUrl } loaded by ConversationItem children
  const [contactNamesMap, setContactNamesMap] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleContactLoaded = (id: string, name: string) => {
    setContactNamesMap(prev => ({ ...prev, [id]: name }));
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/whatsapp/conversations');
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '')
        : window.location.origin);
    const newSocket = io(socketUrl);
    setSocket(newSocket);

    newSocket.on('conversations_updated', () => {
      fetchConversations();
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch messages + contact info when conversation changes
  useEffect(() => {
    if (activeConversation) {
      setActiveContactInfo(null); // reset while loading
      api.get(`/whatsapp/conversations/${activeConversation.id}/messages`)
        .then(res => {
          setMessages(res.data);
          scrollToBottom('instant'); // instant on load so user sees bottom immediately
        })
        .catch(console.error);

      // Fetch contact info (name + profile pic) for the header
      if (activeConversation.channel === 'whatsapp') {
        api.get(`/whatsapp/contact/${activeConversation.status}`)
          .then(res => setActiveContactInfo(res.data))
          .catch(() => setActiveContactInfo(null));
      }

      if (socket) {
        socket.emit('join_conversation', activeConversation.id);
      }
    }
  }, [activeConversation, socket]);

  // Keep a ref to activeConversation so the socket handler always has the latest value
  const activeConversationRef = useRef<any>(null);
  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // Register socket 'new_message' listener only ONCE when socket is ready
  useEffect(() => {
    if (!socket) return;
    const messageHandler = (msg: any) => {
      if (msg.conversationId === activeConversationRef.current?.id) {
        setMessages(prev => {
          // Deduplicate by id in case of any race condition
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };
    // Update ack status in real-time
    const ackHandler = ({ id, ack }: { id: string; ack: number }) => {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, ack } : m));
    };
    socket.on('new_message', messageHandler);
    socket.on('message_ack', ackHandler);
    return () => {
      socket.off('new_message', messageHandler);
      socket.off('message_ack', ackHandler);
    };
  }, [socket]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 50);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeConversation) return;
    const text = inputText.trim();
    setInputText('');

    try {
      await api.post('/whatsapp/messages', {
        to: activeConversation.status, // We stored the phone number in status for now
        content: text
      });
      fetchConversations(); // Update list preview
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleCheckNumber = async () => {
    const num = newChatNumber.replace(/\D/g, '');
    if (!num) return;
    setCheckStatus('checking');
    try {
      const res = await api.get(`/whatsapp/check/${num}`);
      setCheckStatus(res.data.isRegistered ? 'found' : 'not_found');
    } catch {
      setCheckStatus('not_found');
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatNumber.trim() || !newChatMessage.trim()) return;
    const formattedNumber = newChatNumber.replace(/\D/g, '');
    try {
      await api.post('/whatsapp/messages', { to: formattedNumber, content: newChatMessage });
      setIsNewChatOpen(false);
      setNewChatNumber('');
      setNewChatMessage('');
      setCheckStatus('idle');
      fetchConversations();
    } catch (err) {
      console.error('Failed to start new chat', err);
      alert('Failed to send message. Make sure WhatsApp is connected.');
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-white border-l border-gray-200">

      {/* Left Sidebar - Chat List */}
      <div className="w-[320px] flex-shrink-0 flex flex-col border-r border-gray-100 bg-white">

        {/* Top Controls */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
              All
            </span>
            <span className="text-[13px] font-bold text-gray-700 flex items-center gap-1.5 cursor-pointer hover:text-gray-900 transition-colors">
              Unread
              <span className="bg-[#f59e0b] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full leading-none mt-[1px]">0</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setIsNewChatOpen(true); setActiveConversation(null); }}
              className="bg-[#5b52f6] text-white w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#4f46e5] transition-colors shadow-sm"
              title="New Chat"
            >
              <MessageSquarePlus className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/inbox/channels')} className="text-gray-400 hover:text-gray-600 transition-colors ml-1">
              <Settings className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-3 py-2 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus-within:border-[#5b52f6] focus-within:ring-1 focus-within:ring-[#5b52f6] transition-all">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-[13px] text-gray-700 placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Channels Filter */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Channels:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChannel(activeChannel === 'whatsapp' ? 'all' : 'whatsapp')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeChannel === 'whatsapp' || activeChannel === 'all' ? 'bg-green-100 text-green-600' : 'bg-green-50 text-green-400 hover:bg-green-100'}`}
              title="WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChannel(activeChannel === 'facebook' ? 'all' : 'facebook')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeChannel === 'facebook' || activeChannel === 'all' ? 'bg-blue-100 text-blue-600' : 'bg-blue-50 text-blue-400 hover:bg-blue-100'}`}
              title="Facebook Messenger"
            >
              <MessengerIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveChannel(activeChannel === 'instagram' ? 'all' : 'instagram')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeChannel === 'instagram' || activeChannel === 'all' ? 'bg-pink-100 text-pink-600' : 'bg-pink-50 text-pink-400 hover:bg-pink-100'}`}
              title="Instagram Direct"
            >
              <IgIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveChannel(activeChannel === 'telegram' ? 'all' : 'telegram')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeChannel === 'telegram' || activeChannel === 'all' ? 'bg-sky-100 text-sky-600' : 'bg-sky-50 text-sky-400 hover:bg-sky-100'}`}
              title="Telegram"
            >
              <TelegramIcon className="w-3.5 h-3.5 ml-[-1px]" />
            </button>
            <button
              onClick={() => setActiveChannel(activeChannel === 'website' ? 'all' : 'website')}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${activeChannel === 'website' || activeChannel === 'all' ? 'bg-indigo-100 text-indigo-600' : 'bg-indigo-50 text-indigo-400 hover:bg-indigo-100'}`}
              title="Website Live Chat"
            >
              <Globe className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {(() => {
            const filtered = conversations
              .filter(c => activeChannel === 'all' || c.channel === activeChannel)
              .filter(c => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                const phone = c.status?.replace('@c.us', '').toLowerCase() || '';
                // Use contactNamesMap (loaded async) for accurate name search
                const name = (contactNamesMap[c.status] || '').toLowerCase();
                return phone.includes(q) || name.includes(q);
              });

            if (filtered.length === 0) return (
              <div className="flex items-center justify-center h-40">
                <p className="text-[14px] font-medium text-gray-400">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No conversations found.'}
                </p>
              </div>
            );

            return (
              <div className="flex flex-col">
                {filtered.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conv={conv}
                    isActive={activeConversation?.id === conv.id && !isNewChatOpen}
                    onClick={() => { setActiveConversation(conv); setIsNewChatOpen(false); setActiveContactInfo(null); }}
                    onContactLoaded={handleContactLoaded}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Right Area - Chat Window / Empty State */}
      <div className="flex-1 bg-[#f8fafc] flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-[68px] px-6 bg-white border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center overflow-hidden">
                  {activeContactInfo?.profilePicUrl ? (
                    <img src={activeContactInfo.profilePicUrl} alt={activeContactInfo.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 leading-tight">
                      {activeContactInfo?.name || (
                        activeConversation.status.endsWith('@newsletter') ? 'WhatsApp Channel' :
                          activeConversation.status.endsWith('@g.us') ? 'WhatsApp Group' :
                            activeConversation.status.split('@')[0]
                      )}
                    </h3>
                    {activeConversation.status.endsWith('@g.us') && (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        Group
                      </span>
                    )}
                    {activeConversation.status.endsWith('@newsletter') && (
                      <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                        Channel
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-green-500 font-medium flex items-center gap-1.5 mt-0.5">
                    WhatsApp
                    {!(activeConversation.status.endsWith('@newsletter') || activeConversation.status.endsWith('@g.us')) && (
                      <>
                        <span className="text-gray-300 font-normal">&bull;</span>
                        <span className="text-gray-500 font-normal">
                          {(() => {
                            const num = activeConversation.status.split('@')[0];
                            if (num.length === 12 && num.startsWith('91')) {
                              return `+91 ${num.slice(2, 7)} ${num.slice(7)}`;
                            }
                            if (/^\d+$/.test(num)) {
                              return `+${num}`;
                            }
                            return num;
                          })()}
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(() => {
                // Group messages with date separators
                const getDateLabel = (dateStr: string) => {
                  const d = new Date(dateStr);
                  const today = new Date();
                  const yesterday = new Date();
                  yesterday.setDate(today.getDate() - 1);
                  if (d.toDateString() === today.toDateString()) return 'Today';
                  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
                  return d.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' });
                };

                const elements: React.ReactNode[] = [];
                let lastDateLabel = '';

                messages.forEach((msg) => {
                  const label = getDateLabel(msg.timestamp);
                  if (label !== lastDateLabel) {
                    lastDateLabel = label;
                    elements.push(
                      <div key={`sep-${msg.id}`} className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[11px] font-medium text-gray-400 px-2 bg-[#f8fafc] rounded-full border border-gray-200 py-0.5">
                          {label}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    );
                  }
                  const isOutbound = msg.direction === 'outbound';
                  elements.push(
                    <div key={msg.id} className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${isOutbound ? 'bg-[#5b52f6] text-white rounded-br-sm' : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-sm'}`}>
                        <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words break-all">{renderMessageText(msg.content)}</p>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 mx-1 flex items-center gap-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {isOutbound && <MessageTick ack={msg.ack ?? 1} />}
                      </span>
                    </div>
                  );
                });
                return elements;
              })()}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {activeConversation.status.endsWith('@newsletter') || activeContactInfo?.isReadOnly ? (
              <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
                <p className="text-[13px] text-gray-500 font-medium flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  {activeConversation.status.endsWith('@newsletter')
                    ? "This is a read-only channel. You can't send messages here."
                    : "Only admins can send messages in this group."}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2 bg-gray-50/80 border border-gray-200 rounded-xl p-1.5 focus-within:bg-white focus-within:border-[#5b52f6] focus-within:ring-1 focus-within:ring-[#5b52f6] transition-all shadow-sm">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent border-none outline-none resize-none max-h-32 min-h-[38px] py-[9px] px-3.5 text-[14px] text-gray-900 placeholder:text-gray-400 leading-relaxed"
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputText.trim()}
                    className="w-[38px] h-[38px] mb-[1px] mr-[1px] flex-shrink-0 flex items-center justify-center rounded-lg bg-[#5b52f6] text-white hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-[18px] h-[18px] ml-[-2px]" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : isNewChatOpen ? (
          <div className="flex-1 flex flex-col bg-white">
            <div className="h-[68px] px-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Start New Chat</h3>
              <button onClick={() => setIsNewChatOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 flex justify-center">
              <div className="w-full max-w-md bg-gray-50/50 border border-gray-100 rounded-2xl p-6 h-fit">
                <div className="mb-6 flex justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <WhatsAppIcon className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h4 className="text-center font-bold text-[18px] text-gray-900 mb-6">Send WhatsApp Message</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Phone Number (with Country Code)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChatNumber}
                        onChange={(e) => { setNewChatNumber(e.target.value); setCheckStatus('idle'); }}
                        placeholder="e.g. 919876543210"
                        className="flex-1 h-11 px-4 bg-white border border-gray-200 rounded-xl text-[14px] outline-none focus:border-[#5b52f6] focus:ring-1 focus:ring-[#5b52f6] transition-all"
                      />
                      <button
                        onClick={handleCheckNumber}
                        disabled={!newChatNumber.trim() || checkStatus === 'checking'}
                        className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[13px] font-medium rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {checkStatus === 'checking' ? 'Checking...' : 'Verify'}
                      </button>
                    </div>
                    {/* WhatsApp status badge */}
                    {checkStatus === 'found' && (
                      <div className="flex items-center gap-1.5 mt-2 text-green-600">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-[12px] font-medium">WhatsApp account found ✓</span>
                      </div>
                    )}
                    {checkStatus === 'not_found' && (
                      <div className="flex items-center gap-1.5 mt-2 text-red-500">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        <span className="text-[12px] font-medium">No WhatsApp on this number</span>
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400 mt-1.5">Don't use + or symbols, just the country code and number.</p>
                  </div>

                  <div>
                    <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">First Message</label>
                    <textarea
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="Hello, thanks for contacting us..."
                      className="w-full h-32 px-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] outline-none focus:border-[#5b52f6] focus:ring-1 focus:ring-[#5b52f6] transition-all resize-none"
                    />
                  </div>

                  <button
                    onClick={handleStartNewChat}
                    disabled={!newChatNumber.trim() || !newChatMessage.trim()}
                    className="w-full h-11 bg-[#5b52f6] hover:bg-[#4f46e5] text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <WhatsAppIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-[22px] font-semibold text-gray-800 tracking-tight mb-1">OmniChat Inbox</h2>
            <p className="text-[15px] font-medium text-gray-500">Select a conversation from the left or start a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}
