import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { WhatsAppChat } from '../types';

interface ChatSidebarProps {
  chats: WhatsAppChat[];
  activeChatId: string;
  onSelectChat: (chat: WhatsAppChat) => void;
  search: string;
  onSearchChange: (val: string) => void;
}

export function ChatSidebar({ chats, activeChatId, onSelectChat, search, onSearchChange }: ChatSidebarProps) {
  return (
    <div className="w-80 flex flex-col bg-white border-r border-gray-200 h-full flex-shrink-0">
      {/* Header & Search */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">Chats</h2>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input 
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search or start new chat" 
            className="pl-8 h-8 text-xs bg-white rounded-md bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500" 
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {chats.map(chat => {
          const lastMsg = chat.messages[chat.messages.length - 1];
          const isActive = chat.id === activeChatId;
          
          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full text-left p-3 flex gap-3 transition-colors hover:bg-gray-50 border-l-2 ${
                isActive ? 'bg-indigo-50/50 border-indigo-600' : 'border-transparent'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                  {chat.contactName.charAt(0)}
                </div>
                {chat.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                )}
              </div>

              {/* Chat Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm truncate pr-2">{chat.contactName}</span>
                  <span className={`text-[10px] flex-shrink-0 ${chat.unreadCount > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                    {chat.lastMessageTime}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                    {lastMsg?.isMe && <span className="text-gray-400 mr-1">✓</span>}
                    {lastMsg?.text}
                  </p>
                  {chat.unreadCount > 0 && (
                    <span className="flex-shrink-0 bg-emerald-500 text-white text-[10px] font-bold px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
