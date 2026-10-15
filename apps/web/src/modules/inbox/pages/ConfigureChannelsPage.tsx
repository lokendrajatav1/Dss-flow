import { useState } from 'react';
import { Bot, Activity, ArrowLeft, Plus, ChevronDown, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { FacebookTab } from '../components/FacebookTab';
import { InstagramTab } from '../components/InstagramTab';
import { WhatsAppTab } from '../components/WhatsAppTab';
import { TelegramTab } from '../components/TelegramTab';
import { WebsiteTab } from '../components/WebsiteTab';

const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
    <path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.9 1.458 5.485 3.738 7.151.218.16.36.402.392.67l.192 1.55c.032.257.294.417.525.32l1.792-.756a.796.796 0 0 1 .531.018A10.597 10.597 0 0 0 12 20.52c5.523 0 10-4.145 10-9.26S17.523 2 12 2zm1.094 12.392-2.146-2.29a.834.834 0 0 0-1.127-.08l-3.238 2.45c-.328.249-.74-.15-.52-.511l2.585-4.242a1.442 1.442 0 0 1 1.95-.536l2.146 1.22a.834.834 0 0 0 1.127-.08l3.238-3.447c.328-.35.882.029.626.446l-2.69 4.39a1.442 1.442 0 0 1-1.95.08z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white ml-[-2px]">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

const IgIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const CHANNELS = [
  { id: 'facebook', name: 'Facebook', title: 'Facebook Messenger', description: 'Reply to comments and DMs from your Facebook Page in one thread.', iconBg: 'bg-[#1877F2]', icon: MessengerIcon, count: 0 },
  { id: 'instagram', name: 'Instagram', title: 'Instagram Direct', description: 'Reply to comments and DMs from your Instagram Account in one thread.', iconBg: 'bg-gradient-to-tr from-[#FFDC80] via-[#F56040] to-[#833AB4]', icon: IgIcon, count: 0 },
  { id: 'whatsapp', name: 'WhatsApp', title: 'WhatsApp Unofficial', description: 'Connect your WhatsApp account using a local Node.js microservice by scanning a QR code.', iconBg: 'bg-[#25D366]', icon: () => <img src="https://thesvg.org/icons/whatsapp/default.svg" alt="WA" className="w-5 h-5 filter brightness-0 invert" />, count: 0 },
  { id: 'telegram', name: 'Telegram', title: 'Telegram Bot', description: 'Manage Telegram bot conversations in one place.', iconBg: 'bg-[#0088cc]', icon: TelegramIcon, count: 0 },
  { id: 'website', name: 'Website', title: 'Website Live Chat', description: 'Chat with your website visitors in real-time.', iconBg: 'bg-[#6366f1]', icon: () => <MessageSquare className="w-4 h-4 text-white fill-white" />, count: 0 },
];

export function ConfigureChannelsPage() {
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(CHANNELS[0].id);
  const activeData = CHANNELS.find(c => c.id === activeChannel)!;

  const renderTabContent = () => {
    switch (activeChannel) {
      case 'facebook': return <FacebookTab data={activeData} />;
      case 'instagram': return <InstagramTab data={activeData} />;
      case 'whatsapp': return <WhatsAppTab data={activeData} />;
      case 'telegram': return <TelegramTab data={activeData} />;
      case 'website': return <WebsiteTab data={activeData} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[24px] font-semibold text-gray-900 tracking-tight mb-2">Configure Channels</h1>
          <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
            Manage multi-account connections for WhatsApp, Facebook Messenger, Instagram, Telegram, and Website.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Button className="h-10 bg-[#5b52f6] hover:bg-[#4f46e5] text-white font-medium px-4 rounded-lg shadow-sm gap-2 transition-all">
            <Bot className="w-4 h-4" /> AI Automation
          </Button>
          <Button onClick={() => navigate('/inbox/channels')} variant="outline" className="h-10 font-medium text-gray-700 px-4 rounded-lg shadow-sm border-gray-200 gap-2 hover:bg-gray-50 transition-all">
            <Activity className="w-4 h-4 text-red-500" /> Check All Channels
          </Button>
          <Button onClick={() => navigate('/inbox')} className="h-10 bg-[#0084FF] hover:bg-[#0073e6] text-white font-medium px-4 rounded-lg shadow-sm gap-2 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Inbox
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar - Channel List */}
        <div className="w-full md:w-[280px] shrink-0 space-y-3">
          {CHANNELS.map((channel) => {
            const isActive = activeChannel === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-[#eef2ff] border border-[#e0e7ff] shadow-sm' 
                    : 'bg-[#f8fafc] border border-transparent hover:bg-gray-100/80 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-[12px] flex items-center justify-center border border-gray-100 ${channel.iconBg}`}>
                    <channel.icon />
                  </div>
                  <span className={`font-medium text-[15px] ${isActive ? 'text-[#5b52f6] font-semibold' : 'text-gray-700'}`}>
                    {channel.name}
                  </span>
                </div>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-medium shadow-sm border ${
                  isActive ? 'bg-[#eef2ff] border-[#c7d2fe] text-[#4f46e5]' : 'bg-white border-gray-200 text-gray-500'
                }`}>
                  {channel.count}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
