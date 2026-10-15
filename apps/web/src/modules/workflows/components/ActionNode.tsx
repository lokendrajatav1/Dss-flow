import { 
  MessageCircle, 
  Sparkles, 
  UserPlus, 
  Tag, 
  ArrowRightLeft, 
  Clock, 
  X, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Edit2,
  Activity
} from 'lucide-react';
import { WorkflowAction } from '../types';

interface ActionNodeProps {
  action: WorkflowAction;
  index: number;
  totalActions: number;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isSimulating?: boolean;
}

export function ActionNode({ 
  action, 
  index, 
  totalActions, 
  onEdit, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  isSimulating 
}: ActionNodeProps) {
  const getActionDetails = (type: string) => {
    switch(type) {
      case 'send_whatsapp_message':
        return { 
          icon: MessageCircle, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-100', 
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          title: 'Send WhatsApp Message' 
        };
      case 'generate_ai_reply':
        return { 
          icon: Sparkles, 
          color: 'text-purple-600', 
          bg: 'bg-purple-100', 
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          title: 'Generate AI Reply' 
        };
      case 'assign_to_agent':
        return { 
          icon: UserPlus, 
          color: 'text-blue-600', 
          bg: 'bg-blue-100', 
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          title: 'Assign to Agent' 
        };
      case 'move_deal_stage':
        return { 
          icon: ArrowRightLeft, 
          color: 'text-indigo-600', 
          bg: 'bg-indigo-100', 
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          title: 'Move Pipeline Stage' 
        };
      case 'update_lead_status':
        return { 
          icon: Activity, 
          color: 'text-violet-600', 
          bg: 'bg-violet-100', 
          badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
          title: 'Update Lead Status' 
        };
      case 'add_tag':
        return { 
          icon: Tag, 
          color: 'text-amber-600', 
          bg: 'bg-amber-100', 
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          title: 'Add Tag / Label' 
        };
      case 'set_reminder':
        return { 
          icon: Clock, 
          color: 'text-rose-600', 
          bg: 'bg-rose-100', 
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
          title: 'Schedule Follow-up' 
        };
      default:
        return { 
          icon: ChevronRight, 
          color: 'text-gray-600', 
          bg: 'bg-gray-100', 
          badgeColor: 'bg-gray-50 text-gray-700 border-gray-200',
          title: 'Action' 
        };
    }
  };

  const details = getActionDetails(action.type);
  const Icon = details.icon;

  const renderConfigPreview = () => {
    if (!action.config) return null;

    if (action.type === 'send_whatsapp_message' && action.config.message) {
      return (
        <div className="text-xs text-gray-600 italic bg-gray-50 p-2.5 rounded-lg border border-gray-100 line-clamp-2">
          "{action.config.message}"
        </div>
      );
    }
    if (action.type === 'generate_ai_reply') {
      return (
        <div className="text-xs space-y-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
          <div className="text-purple-700 font-medium">Tone: {action.config.tone || 'Professional'}</div>
          {action.config.prompt && <div className="text-gray-500 line-clamp-1">Prompt: {action.config.prompt}</div>}
        </div>
      );
    }
    if (action.type === 'assign_to_agent' && action.config.agent) {
      return (
        <div className="text-xs font-medium text-blue-700 bg-blue-50/70 px-2.5 py-1.5 rounded-lg border border-blue-100">
          👤 Assigned to: <span className="font-bold">{action.config.agent}</span>
        </div>
      );
    }
    if (action.type === 'add_tag' && action.config.tag) {
      return (
        <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block">
          🏷️ #{action.config.tag}
        </div>
      );
    }
    if (action.type === 'move_deal_stage' && action.config.stage) {
      return (
        <div className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100">
          Stage ➔ <span className="font-bold">{action.config.stage}</span>
        </div>
      );
    }
    if (action.type === 'update_lead_status' && action.config.leadStatus) {
      return (
        <div className="text-xs font-medium text-violet-700 bg-violet-50 px-2.5 py-1.5 rounded-lg border border-violet-100">
          Status ➔ <span className="font-bold">{action.config.leadStatus}</span>
        </div>
      );
    }
    if (action.type === 'set_reminder') {
      return (
        <div className="text-xs space-y-1 bg-rose-50/70 p-2.5 rounded-lg border border-rose-100 text-rose-800">
          <div>⏰ When: <span className="font-semibold">{action.config.delay || 'Tomorrow'}</span></div>
          {action.config.note && <div className="text-gray-600 line-clamp-1 font-normal">Note: {action.config.note}</div>}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative flex flex-col items-center">
      {/* Connector Line from previous node */}
      <div className={`w-[2px] h-9 transition-colors ${isSimulating ? 'bg-emerald-500' : 'bg-indigo-200'}`}></div>
      
      {/* The Node Card */}
      <div 
        className={`bg-white border-2 rounded-2xl shadow-sm w-[360px] p-4 relative group transition-all text-left ${
          isSimulating 
            ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)] scale-105' 
            : 'border-gray-200 hover:border-indigo-400 hover:shadow-md'
        }`}
      >
        {/* Step Index Circle */}
        <div className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-sm z-10">
          {index}
        </div>
        
        {/* Action Controls (Top-right) */}
        <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-1 rounded-lg border border-gray-100 shadow-xs z-10">
          {index > 1 && onMoveUp && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              title="Move Up"
              className="p-1 rounded text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}
          {index < totalActions && onMoveDown && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              title="Move Down"
              className="p-1 rounded text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            title="Edit Action"
            className="p-1 rounded text-gray-500 hover:text-indigo-600 hover:bg-gray-100"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            title="Delete Action"
            className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Body (Clickable to edit) */}
        <div onClick={onEdit} className="cursor-pointer">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs ${details.bg}`}>
              <Icon className={`w-5 h-5 ${details.color}`} />
            </div>
            <div className="flex-1 pr-6">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Step {index} • Action
              </div>
              <div className="font-bold text-gray-900 text-sm">{details.title}</div>
            </div>
          </div>

          {/* Config Preview Section */}
          <div className="mt-3 pt-2.5 border-t border-gray-100">
            {renderConfigPreview()}
          </div>
        </div>
      </div>
    </div>
  );
}
