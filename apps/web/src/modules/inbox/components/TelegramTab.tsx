import { useState } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const TelegramTab = ({ data }: { data: any }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:shadow-md">
        <div className="flex items-start sm:items-center gap-5">
          <div className={`w-[52px] h-[52px] shrink-0 rounded-[16px] flex items-center justify-center shadow-md ${data.iconBg}`}>
            <data.icon />
          </div>
          <div>
            <h2 className="text-[19px] font-black text-gray-900 mb-1.5 tracking-tight">{data.title}</h2>
            <p className="text-[14px] text-gray-500 font-medium leading-snug">{data.description}</p>
          </div>
        </div>
        <Button className="shrink-0 bg-[#5b52f6] hover:bg-[#4f46e5] text-white font-bold h-11 px-6 rounded-xl shadow-sm gap-2">
          <Plus className="w-5 h-5" /> Add Connection
        </Button>
      </div>

      <div className="bg-[#f8fafc] rounded-2xl border border-gray-100 overflow-hidden transition-all hover:border-gray-200">
        <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex items-center justify-between p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-100/50 flex items-center justify-center text-sky-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <span className="font-bold text-[15px] text-gray-900">How to Get {data.title} Credentials</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#5b52f6]">
            Step-by-Step Guide
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGuideOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {isGuideOpen && (
          <div className="px-5 pb-5 pt-2 text-[14px] text-gray-600 font-medium border-t border-gray-100 leading-relaxed">
            <ol className="list-decimal pl-5 mt-3 space-y-2 text-gray-700">
              <li>Open Telegram and search for the BotFather.</li>
              <li>Send /newbot and follow the instructions to create a bot.</li>
              <li>Copy the generated Bot Token and paste it below.</li>
            </ol>
          </div>
        )}
      </div>

      <div className="border-2 border-dashed border-[#cbd5e1] bg-[#f8fafc]/50 rounded-[24px] p-12 flex flex-col items-center justify-center text-center transition-all hover:bg-[#f1f5f9]/50">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-gray-100">
          <data.icon />
        </div>
        <h3 className="text-[17px] font-extrabold text-gray-700 mb-2.5 tracking-tight">No {data.title} Connections</h3>
        <p className="text-[14px] text-gray-500 font-medium">Fill in the form below to set up a new connection.</p>
      </div>
    </div>
  );
};
