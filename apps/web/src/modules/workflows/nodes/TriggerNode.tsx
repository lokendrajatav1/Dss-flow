import { NodeProps, Handle, Position } from 'reactflow';
import { 
    MessageSquare, 
    Briefcase, 
    UserPlus, 
    Activity, 
    Tag, 
    PhoneCall, 
    Zap 
} from 'lucide-react';
import { WorkflowTrigger } from '../types';

interface TriggerNodeData {
    label: string;
    nodeType: string;
    description: string;
    trigger: WorkflowTrigger;
}

export function TriggerNode({ data, selected }: NodeProps<TriggerNodeData>) {
    const trigger = data.trigger;

    const getIcon = (type: string) => {
        switch (type) {
            case 'whatsapp_message_received': return <MessageSquare className="w-4 h-4 text-emerald-600" />;
            case 'deal_stage_changed': return <Briefcase className="w-4 h-4 text-blue-600" />;
            case 'new_lead_added': return <UserPlus className="w-4 h-4 text-indigo-600" />;
            case 'lead_status_changed': return <Activity className="w-4 h-4 text-violet-600" />;
            case 'tag_added': return <Tag className="w-4 h-4 text-amber-600" />;
            case 'call_disposition_logged': return <PhoneCall className="w-4 h-4 text-rose-600" />;
            default: return <Zap className="w-4 h-4 text-gray-600" />;
        }
    };

    const getTitle = () => {
        const map: Record<string, string> = {
            whatsapp_message_received: 'WhatsApp Message',
            deal_stage_changed: 'Pipeline Stage',
            new_lead_added: 'New Lead',
            lead_status_changed: 'Lead Status',
            tag_added: 'Tag Added',
            call_disposition_logged: 'Call Disposition'
        };
        return map[trigger?.type] || 'Trigger';
    };

    const getDescription = () => {
        const cfg = trigger?.config || {};
        if (trigger?.type === 'whatsapp_message_received') {
            if (cfg.keyword) return `Keyword: "${cfg.keyword}"`;
            if (cfg.isFirstMessage) return 'First message from contact';
            return 'Any incoming message';
        }
        if (trigger?.type === 'deal_stage_changed') {
            return cfg.stage ? `Stage: ${cfg.stage}` : 'When deal stage changes';
        }
        if (trigger?.type === 'new_lead_added') {
            return cfg.source ? `Source: ${cfg.source}` : 'New lead created';
        }
        if (trigger?.type === 'lead_status_changed') {
            return cfg.leadStatus ? `Status: ${cfg.leadStatus}` : 'Lead status changed';
        }
        if (trigger?.type === 'tag_added') {
            return cfg.tag ? `Tag: #${cfg.tag}` : 'When tag is added';
        }
        if (trigger?.type === 'call_disposition_logged') {
            return cfg.disposition ? `Outcome: ${cfg.disposition}` : 'Call disposition logged';
        }
        return 'Trigger Event';
    };

    return (
        <div className={`relative px-4 py-3 rounded-xl shadow-md border-2 bg-gradient-to-br from-indigo-50/90 to-white min-w-[210px] max-w-[270px] cursor-pointer transition-all ${
            selected 
                ? 'ring-2 ring-indigo-600 border-indigo-600 shadow-indigo-100 shadow-lg scale-[1.02]' 
                : 'border-indigo-300 hover:border-indigo-500'
        }`}>
            {/* Source handle — bottom center (connect to next node) */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3.5 !h-3.5 !bg-indigo-600 !border-2 !border-white !shadow-md hover:!scale-125 !transition-transform cursor-crosshair"
            />

            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-indigo-100/70 border border-indigo-200 shadow-xs flex-shrink-0">
                    {getIcon(trigger?.type)}
                </div>
                <div className="overflow-hidden">
                    <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Trigger Rule</div>
                    <div className="text-xs font-bold text-gray-900 leading-tight truncate">{getTitle()}</div>
                    <div className="text-[10px] text-indigo-900/70 font-medium truncate mt-0.5">{getDescription()}</div>
                </div>
            </div>
        </div>
    );
}