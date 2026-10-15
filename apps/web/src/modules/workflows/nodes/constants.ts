import { Position } from 'reactflow';
import { WorkflowTrigger, WorkflowAction, TriggerType, ActionType, WorkflowVariable } from '../types';

// ============================================================================
// Node Data Interfaces
// ============================================================================

export interface NodeData {
    label: string;
    nodeType: string;
    description: string;
}

export interface TriggerNodeData extends NodeData {
    trigger: WorkflowTrigger;
    variables: WorkflowVariable[];
    position: Position;
}

export interface ActionNodeData extends NodeData {
    action: WorkflowAction;
    variables: WorkflowVariable[];
    position: Position;
}

export interface ConditionNodeData extends NodeData {
    conditions: any[];
    variables: WorkflowVariable[];
    position: Position;
    onTrueLabel: string;
    onFalseLabel: string;
}

export interface StartNodeData extends NodeData {
    position: Position;
}

export interface EndNodeData extends NodeData {
    position: Position;
}

// ============================================================================
// Constants - Triggers & Actions (Industry Standard Reference: Zapier/Make/n8n)
// ============================================================================

export const TRIGGER_CATEGORIES = {
    COMMUNICATION: 'Communication',
    CRM: 'CRM',
    SCHEDULE: 'Schedule',
    WEBHOOKS: 'Webhooks',
    FORMS: 'Forms'
} as const;

export const ACTION_CATEGORIES = {
    COMMUNICATION: 'Communication',
    CRM: 'CRM',
    DATA: 'Data',
    INTEGRATIONS: 'Integrations',
    CODE: 'Code'
} as const;

export const TRIGGER_METADATA: Record<TriggerType, {
    title: string;
    description: string;
    icon: any;
    category: keyof typeof TRIGGER_CATEGORIES;
    color: string;
    bgColor: string;
    borderColor: string;
    fieldCount?: number;
}> = {
    whatsapp_message_received: {
        title: 'WhatsApp Message Received',
        description: 'Triggers when a contact sends you an inbound WhatsApp message',
        icon: 'MessageSquare',
        category: 'COMMUNICATION',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
        borderColor: 'border-emerald-600'
    },
    deal_stage_changed: {
        title: 'Pipeline Stage Changed',
        description: 'Triggers when a deal moves to a new stage in your sales pipeline',
        icon: 'Briefcase',
        category: 'CRM',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600',
        borderColor: 'border-blue-600'
    },
    new_lead_added: {
        title: 'New Lead Added',
        description: 'Triggers when a new lead is created in your CRM',
        icon: 'UserPlus',
        category: 'CRM',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-600',
        borderColor: 'border-indigo-600'
    },
    lead_status_changed: {
        title: 'Lead Status Changed',
        description: 'Triggers when a lead updates their lifecycle status',
        icon: 'Activity',
        category: 'CRM',
        color: 'text-violet-600',
        bgColor: 'bg-violet-600',
        borderColor: 'border-violet-600'
    },
    tag_added: {
        title: 'Tag Added to Contact',
        description: 'Triggers when a specific tag is applied to a contact',
        icon: 'Tag',
        category: 'CRM',
        color: 'text-amber-600',
        bgColor: 'bg-amber-600',
        borderColor: 'border-amber-600'
    },
    call_disposition_logged: {
        title: 'Call Disposition Logged',
        description: 'Triggers when an agent records a call outcome',
        icon: 'PhoneCall',
        category: 'CRM',
        color: 'text-rose-600',
        bgColor: 'bg-rose-600',
        borderColor: 'border-rose-600'
    },
    webhook_received: {
        title: 'Webhook Received',
        description: 'Triggers when an external service sends an HTTP POST request',
        icon: 'Zap',
        category: 'WEBHOOKS',
        color: 'text-gray-700',
        bgColor: 'bg-gray-600',
        borderColor: 'border-gray-700'
    },
    schedule_triggered: {
        title: 'Schedule Triggered',
        description: 'Triggers on a recurring schedule (daily, weekly, monthly)',
        icon: 'Clock',
        category: 'SCHEDULE',
        color: 'text-amber-700',
        bgColor: 'bg-amber-600',
        borderColor: 'border-amber-700'
    },
    email_received: {
        title: 'Email Received',
        description: 'Triggers when a new email arrives in your inbox',
        icon: 'Mail',
        category: 'COMMUNICATION',
        color: 'text-blue-700',
        bgColor: 'bg-blue-700',
        borderColor: 'border-blue-700'
    },
    form_submitted: {
        title: 'Form Submitted',
        description: 'Triggers when a contact submits a form',
        icon: 'FileText',
        category: 'FORMS',
        color: 'text-teal-600',
        bgColor: 'bg-teal-600',
        borderColor: 'border-teal-600'
    }
};

export const ACTION_METADATA: Record<ActionType, {
    title: string;
    description: string;
    icon: any;
    category: keyof typeof ACTION_CATEGORIES;
    color: string;
    bgColor: string;
    borderColor: string;
    fieldCount?: number;
}> = {
    send_whatsapp_message: {
        title: 'Send WhatsApp Message',
        description: 'Send an automated WhatsApp message to a contact',
        icon: 'MessageCircle',
        category: 'COMMUNICATION',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-600',
        borderColor: 'border-emerald-600'
    },
    assign_to_agent: {
        title: 'Assign to Agent',
        description: 'Assign a lead or task to a team member',
        icon: 'UserPlus',
        category: 'CRM',
        color: 'text-blue-600',
        bgColor: 'bg-blue-600',
        borderColor: 'border-blue-600'
    },
    add_tag: {
        title: 'Add Tag',
        description: 'Add a tag or label to a contact or deal',
        icon: 'Tag',
        category: 'CRM',
        color: 'text-amber-600',
        bgColor: 'bg-amber-600',
        borderColor: 'border-amber-600'
    },
    move_deal_stage: {
        title: 'Move Stage',
        description: 'Move a deal to a different pipeline stage',
        icon: 'ArrowRightLeft',
        category: 'CRM',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-600',
        borderColor: 'border-indigo-600'
    },
    update_lead_status: {
        title: 'Update Lead Status',
        description: 'Change the lifecycle status of a lead',
        icon: 'Activity',
        category: 'CRM',
        color: 'text-violet-600',
        bgColor: 'bg-violet-600',
        borderColor: 'border-violet-600'
    },
    generate_ai_reply: {
        title: 'Generate AI Reply',
        description: 'Use Antigravity AI to draft smart responses',
        icon: 'Sparkles',
        category: 'DATA',
        color: 'text-purple-600',
        bgColor: 'bg-purple-600',
        borderColor: 'border-purple-600'
    },
    set_reminder: {
        title: 'Set Reminder',
        description: 'Create a follow-up reminder or task',
        icon: 'Bell',
        category: 'CRM',
        color: 'text-rose-600',
        bgColor: 'bg-rose-600',
        borderColor: 'border-rose-600'
    },
    http_request: {
        title: 'HTTP Request',
        description: 'Make a custom API request to any web service',
        icon: 'Server',
        category: 'INTEGRATIONS',
        color: 'text-gray-700',
        bgColor: 'bg-gray-700',
        borderColor: 'border-gray-700'
    },
    delay: {
        title: 'Delay',
        description: 'Pause execution for a specified duration',
        icon: 'Clock',
        category: 'CODE',
        color: 'text-amber-700',
        bgColor: 'bg-amber-600',
        borderColor: 'border-amber-700'
    },
    condition: {
        title: 'Conditional Logic',
        description: 'Route the workflow based on dynamic conditions',
        icon: 'GitBranch',
        category: 'CODE',
        color: 'text-teal-600',
        bgColor: 'bg-teal-600',
        borderColor: 'border-teal-600'
    },
    code_execution: {
        title: 'Run Code',
        description: 'Execute custom JavaScript code',
        icon: 'Code',
        category: 'CODE',
        color: 'text-pink-600',
        bgColor: 'bg-pink-600',
        borderColor: 'border-pink-600'
    },
    update_custom_field: {
        title: 'Update Custom Field',
        description: 'Set a custom field value on a record',
        icon: 'Edit3',
        category: 'DATA',
        color: 'text-gray-600',
        bgColor: 'bg-gray-600',
        borderColor: 'border-gray-600'
    },
    send_email: {
        title: 'Send Email',
        description: 'Send an email to a contact or group',
        icon: 'Mail',
        category: 'COMMUNICATION',
        color: 'text-blue-700',
        bgColor: 'bg-blue-700',
        borderColor: 'border-blue-700'
    },
    create_task: {
        title: 'Create Task',
        description: 'Create a task for a team member',
        icon: 'SquareCheck',
        category: 'CRM',
        color: 'text-slate-600',
        bgColor: 'bg-slate-600',
        borderColor: 'border-slate-600'
    },
    add_to_list: {
        title: 'Add to Audience',
        description: 'Add contact to a mailing list or audience',
        icon: 'List',
        category: 'COMMUNICATION',
        color: 'text-orange-600',
        bgColor: 'bg-orange-600',
        borderColor: 'border-orange-600'
    }
};

// Common input/output variables available across nodes
export const COMMON_VARIABLES: WorkflowVariable[] = [
    { id: 'contact_name', name: 'contact.name', type: 'string', value: null, source: 'trigger' },
    { id: 'contact_phone', name: 'contact.phone', type: 'string', value: null, source: 'trigger' },
    { id: 'contact_email', name: 'contact.email', type: 'string', value: null, source: 'trigger' },
    { id: 'contact_company', name: 'contact.company', type: 'string', value: null, source: 'trigger' },
    { id: 'deal_id', name: 'deal.id', type: 'string', value: null, source: 'trigger' },
    { id: 'deal_stage', name: 'deal.stage', type: 'string', value: null, source: 'trigger' },
    { id: 'workflow_name', name: 'workflow.name', type: 'string', value: null, source: 'trigger' },
    { id: 'execution_time', name: 'execution.time', type: 'date', value: null, source: 'trigger' },
];
