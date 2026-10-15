import { NodeProps, Handle, Position } from 'reactflow';
import { 
  MessageCircle, 
  UserPlus, 
  Tag, 
  ArrowRightLeft, 
  Activity, 
  Sparkles, 
  Clock, 
  Server, 
  GitBranch, 
  Code, 
  Edit3, 
  Mail, 
  CheckSquare, 
  List, 
  Zap,
  X
} from 'lucide-react';
import { WorkflowAction, ActionType } from '../types';

interface ActionNodeData {
  label: string;
  nodeType: string;
  description: string;
  action: WorkflowAction;
  onDelete?: () => void;
}

export function ActionNode({ data, selected }: NodeProps<ActionNodeData>) {
  const action = data.action;

  const getIcon = (type: ActionType) => {
    switch (type) {
      case 'send_whatsapp_message': return <MessageCircle className="w-4 h-4 text-emerald-600" />;
      case 'assign_to_agent':       return <UserPlus className="w-4 h-4 text-blue-600" />;
      case 'add_tag':               return <Tag className="w-4 h-4 text-amber-600" />;
      case 'move_deal_stage':       return <ArrowRightLeft className="w-4 h-4 text-indigo-600" />;
      case 'update_lead_status':    return <Activity className="w-4 h-4 text-violet-600" />;
      case 'generate_ai_reply':     return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'set_reminder':          return <Clock className="w-4 h-4 text-rose-600" />;
      case 'http_request':          return <Server className="w-4 h-4 text-gray-700" />;
      case 'delay':                 return <Clock className="w-4 h-4 text-amber-700" />;
      case 'condition':             return <GitBranch className="w-4 h-4 text-teal-600" />;
      case 'code_execution':        return <Code className="w-4 h-4 text-pink-600" />;
      case 'update_custom_field':   return <Edit3 className="w-4 h-4 text-gray-600" />;
      case 'send_email':            return <Mail className="w-4 h-4 text-blue-700" />;
      case 'create_task':           return <CheckSquare className="w-4 h-4 text-orange-600" />;
      case 'add_to_list':           return <List className="w-4 h-4 text-cyan-600" />;
      default:                      return <Zap className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTitle = (type: ActionType) => {
    const map: Record<string, string> = {
      send_whatsapp_message: 'Send WhatsApp',
      assign_to_agent:       'Assign to Agent',
      add_tag:               'Add Tag',
      move_deal_stage:       'Move Deal Stage',
      update_lead_status:    'Update Lead Status',
      generate_ai_reply:     'Generate AI Reply',
      set_reminder:          'Set Reminder',
      http_request:          'HTTP Request',
      delay:                 'Delay',
      condition:             'Condition (If/Else)',
      code_execution:        'Run Code',
      update_custom_field:   'Update Custom Field',
      send_email:            'Send Email',
      create_task:           'Create Task',
      add_to_list:           'Add to Audience List'
    };
    return map[type] || 'Action';
  };

  const getSubtitle = () => {
    if (!action?.config) return null;
    if (action.type === 'send_whatsapp_message' && action.config.message) {
      return `"${action.config.message.slice(0, 24)}${action.config.message.length > 24 ? '...' : ''}"`;
    }
    if (action.type === 'add_tag' && action.config.tag) {
      return `Tag: #${action.config.tag}`;
    }
    if (action.type === 'move_deal_stage' && action.config.stage) {
      return `Stage: ${action.config.stage}`;
    }
    if (action.type === 'assign_to_agent' && action.config.agent) {
      return `Agent: ${action.config.agent}`;
    }
    if (action.type === 'generate_ai_reply' && action.config.tone) {
      return `Tone: ${action.config.tone}`;
    }
    if (action.type === 'set_reminder' && action.config.delay) {
      return `Timing: ${action.config.delay}`;
    }
    if (action.type === 'update_lead_status' && action.config.leadStatus) {
      return `Status: ${action.config.leadStatus}`;
    }
    if (action.type === 'delay' && action.config.delay) {
      return `Wait: ${action.config.delay}`;
    }
    if (action.type === 'send_email' && action.config.subject) {
      return `Subject: "${action.config.subject.slice(0, 20)}${action.config.subject.length > 20 ? '...' : ''}"`;
    }
    if (action.type === 'http_request' && action.config.url) {
      return `${action.config.method || 'POST'}: ${action.config.url.slice(0, 20)}`;
    }
    if (action.type === 'condition' && action.config.conditionField) {
      return `If ${action.config.conditionField} == "${action.config.conditionValue || '...'}"`;
    }
    if (action.type === 'create_task' && action.config.taskTitle) {
      return `Task: ${action.config.taskTitle}`;
    }
    return null;
  };

  const subtitle = getSubtitle();

  return (
    <div className={`relative group px-4 py-3 rounded-xl shadow-md border-2 bg-white transition-all cursor-pointer min-w-[200px] max-w-[260px] ${
      selected 
        ? 'ring-2 ring-indigo-600 border-indigo-500 shadow-indigo-100 shadow-lg scale-[1.02]' 
        : 'border-gray-200 hover:border-indigo-300'
    }`}>
      {/* Quick Delete button (visible on hover or when selected) */}
      {data.onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            data.onDelete?.();
          }}
          className={`absolute -top-2 -right-2 w-5 h-5 rounded-full bg-rose-50 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-200 flex items-center justify-center shadow-xs transition-all z-10 ${
            selected ? 'opacity-100 scale-100' : 'opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100'
          }`}
          title="Delete action"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Target handle — top center (receives connection from previous node) */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3.5 !h-3.5 !bg-indigo-400 !border-2 !border-white !shadow-md hover:!scale-125 !transition-transform cursor-crosshair"
      />

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-200 flex-shrink-0">
          {getIcon(action?.type)}
        </div>
        <div className="overflow-hidden">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Action</div>
          <div className="text-xs font-bold text-gray-900 leading-tight truncate">{getTitle(action?.type)}</div>
          {subtitle ? (
            <div className="text-[10px] text-indigo-600 font-medium truncate mt-0.5">{subtitle}</div>
          ) : (
            <div className="text-[10px] text-gray-500 truncate mt-0.5">Click to configure</div>
          )}
        </div>
      </div>

      {/* Source handle — bottom center (connect to next node) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3.5 !h-3.5 !bg-emerald-500 !border-2 !border-white !shadow-md hover:!scale-125 !transition-transform cursor-crosshair"
      />
    </div>
  );
}