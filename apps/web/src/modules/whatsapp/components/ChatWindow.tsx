import { useState } from 'react';
import { MoreVertical, Building2, Check, CheckCheck } from 'lucide-react';
import { WhatsAppChat } from '../types';
import { MessageInput } from './MessageInput';
import api from '@/lib/api';

interface ChatWindowProps {
  chat: WhatsAppChat | null;
  onRefresh?: () => void;
}

export function ChatWindow({ chat, onRefresh }: ChatWindowProps) {
  const [inputText, setInputText] = useState('');

  if (!chat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">WhatsApp for Business</h2>
        <p className="text-sm text-gray-500 max-w-md text-center">
          Send and receive messages directly via Meta Cloud API. Select a contact from the sidebar to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#EFEAE2]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
              {chat.contactName.charAt(0)}
            </div>
            {chat.isOnline && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm leading-tight">{chat.contactName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <Building2 className="w-3 h-3" />
              <span>{chat.companyName}</span>
              <span className="mx-1">•</span>
              <span className="font-mono">{chat.phoneNumber}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors ml-1">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', opacity: 0.8 }}>
        <div className="flex justify-center mb-6">
          <span className="bg-white text-gray-500 text-[10px] font-semibold px-3 py-1 rounded-full shadow-sm border border-gray-100">
            Messages are end-to-end encrypted
          </span>
        </div>

        {chat.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm relative ${
              msg.isMe ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'
            }`}>
              <p className="text-sm whitespace-pre-wrap pb-4 leading-relaxed">{msg.text}</p>
              
              <div className="absolute right-2 bottom-1 flex items-center gap-1">
                <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
                {msg.isMe && (
                  <span className={msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'}>
                    {msg.status === 'sent' ? <Check className="w-3 h-3" /> : <CheckCheck className="w-3 h-3" />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <MessageInput 
        value={inputText}
        onChange={setInputText}
        onSend={async () => {
          if (!inputText.trim() || !chat) return;
          const text = inputText.trim();
          setInputText('');
          try {
            await api.post('/whatsapp/messages', {
              to: chat.id,
              content: text,
            });
            onRefresh?.();
          } catch (error) {
            console.error('Failed to send message:', error);
          }
        }}
      />
    </div>
  );
}
