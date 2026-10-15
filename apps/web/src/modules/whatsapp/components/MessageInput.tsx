import { Paperclip, Send, Smile, Wand2 } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: () => void;
}

export function MessageInput({ value, onChange, onSend }: MessageInputProps) {
  return (
    <div className="p-4 bg-gray-50 border-t border-gray-200">
      <div className="flex items-end gap-3 bg-white border border-gray-300 rounded-xl px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
        
        {/* Attachments & Emojis */}
        <div className="flex items-center gap-1 pb-1">
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Input Field */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 max-h-32 min-h-[40px] py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-none focus:ring-0 outline-none focus:outline-none resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        {/* AI Assist & Send Actions */}
        <div className="flex items-center gap-2 pb-1">
          <button 
            className="p-1.5 flex items-center gap-1.5 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors group"
            title="Draft with AI"
          >
            <Wand2 className="w-4 h-4" />
            <span className="text-xs font-semibold hidden md:block opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden w-0 group-hover:w-auto">Draft Reply</span>
          </button>
          
          <button 
            onClick={onSend}
            disabled={!value.trim()}
            className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 disabled:cursor-not-allowed text-white rounded-full transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-gray-400 mt-2">
        Powered by official Meta WhatsApp Cloud API.
      </p>
    </div>
  );
}
