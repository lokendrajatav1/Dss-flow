import { Zap, MessageSquare, Briefcase, Tag, UserPlus, PhoneCall, Edit2, Activity } from 'lucide-react';
import { WorkflowTrigger } from '../types';

interface TriggerSelectorProps {
  trigger?: WorkflowTrigger;
  onClick: () => void;
  isSimulating?: boolean;
}

export function TriggerSelector({ trigger, onClick, isSimulating }: TriggerSelectorProps) {
  if (!trigger) {
    return (
      <button 
        type="button"
        onClick={onClick}
        className="w-[360px] bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center text-gray-500 hover:border-indigo-500 hover:bg-indigo-50/50 hover:text-indigo-600 transition-all group shadow-sm"
      >
        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 group-hover:scale-110 transition-transform shadow-xs">
          <Zap className="w-6 h-6 text-gray-400 group-hover:text-indigo-600" />
        </div>
        <div className="text-base font-bold text-gray-900 group-hover:text-indigo-700 mb-1">Add a Trigger</div>
        <div className="text-xs text-center text-gray-400">Click to choose an event that starts this workflow</div>
      </button>
    );
  }

  const getTriggerDetails = (type: string) => {
    switch (type) {
      case 'whatsapp_message_received':
        return { 
          icon: MessageSquare, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-100', 
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          title: 'WhatsApp Message Received' 
        };
      case 'deal_stage_changed':
        return { 
          icon: Briefcase, 
          color: 'text-blue-600', 
          bg: 'bg-blue-100', 
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          title: 'Pipeline Stage Changed' 
        };
      case 'lead_status_changed':
        return { 
          icon: Activity, 
          color: 'text-violet-600', 
          bg: 'bg-violet-100', 
          badgeBg: 'bg-violet-50 text-violet-700 border-violet-200',
          title: 'Lead Status Changed' 
        };
      case 'new_lead_added':
        return { 
          icon: UserPlus, 
          color: 'text-indigo-600', 
          bg: 'bg-indigo-100', 
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          title: 'New Lead Added' 
        };
      case 'tag_added':
        return { 
          icon: Tag, 
          color: 'text-amber-600', 
          bg: 'bg-amber-100', 
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          title: 'Tag Added to Contact' 
        };
      case 'call_disposition_logged':
        return { 
          icon: PhoneCall, 
          color: 'text-rose-600', 
          bg: 'bg-rose-100', 
          badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
          title: 'Call Disposition Logged' 
        };
      default:
        return { 
          icon: Zap, 
          color: 'text-indigo-600', 
          bg: 'bg-indigo-100', 
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          title: 'Trigger Event' 
        };
    }
  };

  const details = getTriggerDetails(trigger.type);
  const Icon = details.icon;

  const renderConfigPreview = () => {
    if (!trigger.config) return null;
    if (trigger.type === 'whatsapp_message_received') {
      if (trigger.config.isFirstMessage) return 'Condition: First message from new user';
      if (trigger.config.keyword) return `Keyword: "${trigger.config.keyword}"`;
      return 'Condition: Any inbound message';
    }
    if (trigger.type === 'deal_stage_changed') {
      return `Target Stage: "${trigger.config.stage || 'Won'}"`;
    }
    if (trigger.type === 'lead_status_changed') {
      return `Status: "${trigger.config.leadStatus || 'Qualified'}"`;
    }
    if (trigger.type === 'new_lead_added') {
      return `Source: "${trigger.config.source || 'All'}"`;
    }
    if (trigger.type === 'tag_added') {
      return `Tag: "${trigger.config.tag || 'VIP'}"`;
    }
    if (trigger.type === 'call_disposition_logged') {
      return `Call Outcome: "${trigger.config.callStatus || 'Interested'}"`;
    }
    return `Config: ${JSON.stringify(trigger.config)}`;
  };

  return (
    <div 
      onClick={onClick}
      className={`w-[360px] bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all relative text-left group ${
        isSimulating 
          ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-105' 
          : 'border-indigo-500 shadow-[0_2px_12px_rgba(99,102,241,0.12)] hover:shadow-[0_4px_20px_rgba(99,102,241,0.22)]'
      }`}
    >
      {/* Top Tag */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1">
        <Zap className="w-3 h-3 fill-white" />
        Trigger Event
      </div>
      
      {/* Edit indicator */}
      <div className="absolute top-3 right-3 text-gray-300 group-hover:text-indigo-600 transition-colors">
        <Edit2 className="w-4 h-4" />
      </div>

      <div className="flex items-start gap-3.5 mt-2">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${details.bg}`}>
          <Icon className={`w-6 h-6 ${details.color}`} />
        </div>
        <div className="flex-1 pr-4">
          <div className="font-bold text-gray-900 leading-tight text-sm">{details.title}</div>
          <div className="mt-1.5 inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border text-gray-600 bg-gray-50 border-gray-200">
            {renderConfigPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
