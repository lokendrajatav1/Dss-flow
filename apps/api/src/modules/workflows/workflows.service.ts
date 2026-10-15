import { prisma } from '../../lib/db';

// Pre-configured realistic CRM automation templates
let workflowsDB: any[] = [
    {
        id: 'wf-101',
        name: 'Auto-reply to New WhatsApp Inquiries',
        description: 'Send automated welcome AI message, assign round-robin agent, and tag contact on first message.',
        isActive: true,
        version: '1.0.0',
        runsCount: 14,
        lastRunAt: '10 mins ago',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        trigger: {
            id: 'trg-101',
            type: 'whatsapp_message_received',
            config: { isFirstMessage: true }
        },
        actions: [
            {
                id: 'act-101',
                type: 'generate_ai_reply',
                config: { tone: 'Friendly & Professional' }
            },
            {
                id: 'act-102',
                type: 'send_whatsapp_message',
                config: { message: 'Hi {{lead.name}}! Thank you for reaching out to us. An executive will connect with you shortly.' }
            },
            {
                id: 'act-103',
                type: 'assign_to_agent',
                config: { agent: 'Auto Round-Robin' }
            },
            {
                id: 'act-104',
                type: 'add_tag',
                config: { tag: 'WhatsApp-Inquiry' }
            }
        ]
    },
    {
        id: 'wf-102',
        name: 'Move Deal to Won & Notify Team',
        description: 'When contract is signed or stage changes to won, update status and schedule onboarding.',
        isActive: true,
        version: '1.0.0',
        runsCount: 8,
        lastRunAt: '2 hours ago',
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        trigger: {
            id: 'trg-102',
            type: 'deal_stage_changed',
            config: { stage: 'Won' }
        },
        actions: [
            {
                id: 'act-201',
                type: 'send_whatsapp_message',
                config: { message: 'Congratulations {{lead.name}}! Your proposal for {{deal.title}} is confirmed. Welcome aboard!' }
            },
            {
                id: 'act-202',
                type: 'update_lead_status',
                config: { leadStatus: 'Closed Won' }
            },
            {
                id: 'act-203',
                type: 'set_reminder',
                config: { delay: 'Tomorrow at 10 AM' }
            }
        ]
    }
];

let executionLogsDB: any[] = [
    {
        id: 'exec-1',
        workflowId: 'wf-101',
        workflowName: 'Auto-reply to New WhatsApp Inquiries',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'success',
        targetContact: 'Rahul Sharma (+91 98765 43210)',
        duration: 320,
        actionLogs: [
            { actionType: 'generate_ai_reply', status: 'success', output: 'Generated friendly greeting' },
            { actionType: 'send_whatsapp_message', status: 'success', output: 'Message delivered to +91 98765 43210' },
            { actionType: 'assign_to_agent', status: 'success', output: 'Assigned to Anita Patel' },
            { actionType: 'add_tag', status: 'success', output: 'Tagged #WhatsApp-Inquiry' }
        ]
    },
    {
        id: 'exec-2',
        workflowId: 'wf-102',
        workflowName: 'Move Deal to Won & Notify Team',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        status: 'success',
        targetContact: 'Priya Mehta (CloudNine IT)',
        duration: 410,
        actionLogs: [
            { actionType: 'send_whatsapp_message', status: 'success', output: 'Welcome confirmation sent' },
            { actionType: 'update_lead_status', status: 'success', output: 'Status updated to Closed Won' },
            { actionType: 'set_reminder', status: 'success', output: 'Reminder set for tomorrow 10 AM' }
        ]
    }
];

export const WorkflowService = {
    findAll(): any[] {
        return workflowsDB;
    },

    findById(id: string): any | undefined {
        return workflowsDB.find(w => w.id === id);
    },

    create(data: any): any {
        const newWorkflow = {
            id: `wf-${Date.now()}`,
            ...data,
            createdAt: new Date().toISOString(),
            runsCount: 0,
            version: '1.0.0'
        };
        workflowsDB.unshift(newWorkflow);
        return newWorkflow;
    },

    update(id: string, data: any): any | null {
        const index = workflowsDB.findIndex(w => w.id === id);
        if (index === -1) return null;
        workflowsDB[index] = { ...workflowsDB[index], ...data };
        return workflowsDB[index];
    },

    delete(id: string): boolean {
        const exists = workflowsDB.some(w => w.id === id);
        if (!exists) return false;
        workflowsDB = workflowsDB.filter(w => w.id !== id);
        return true;
    },

    getLogs(workflowId?: string): any[] {
        if (workflowId) {
            return executionLogsDB.filter(l => l.workflowId === workflowId);
        }
        return executionLogsDB;
    },

    async executeTest(id: string, options: any = {}): Promise<any | null> {
        const workflow = workflowsDB.find(w => w.id === id);
        if (!workflow) return null;

        let contactLabel = options.contactName
            ? `${options.contactName}${options.contactPhone ? ` (${options.contactPhone})` : ''}`
            : '';

        // If no contact provided in payload, query the most recent lead from database
        if (!contactLabel) {
            try {
                const leadWhere: any = {};
                if (options.companyId) leadWhere.companyId = options.companyId;
                const realLead = await prisma.lead.findFirst({
                    where: leadWhere,
                    orderBy: { createdAt: 'desc' }
                });
                if (realLead) {
                    contactLabel = `${realLead.name || 'CRM Lead'} (${realLead.phone || realLead.email || 'Verified Contact'})`;
                }
            } catch (err) {
                console.warn('Could not query lead from database for test:', err);
            }
        }

        if (!contactLabel) {
            contactLabel = 'CRM Lead (Verified Contact)';
        }

        const executionResult = {
            id: `exec-${Date.now()}`,
            workflowId: id,
            workflowName: workflow.name,
            timestamp: new Date().toISOString(),
            status: 'success',
            targetContact: contactLabel,
            triggerData: workflow.trigger?.config || {},
            actionLogs: (workflow.actions || []).map((action: any) => {
                let outputMsg = `Dispatched step for ${contactLabel} (${action.type})`;
                if (action.type === 'generate_ai_reply') {
                    const tone = action.config?.tone || 'Friendly & Professional';
                    const task = action.config?.aiTask || 'Customer Query Auto-Reply';
                    const snippet = action.config?.systemPrompt
                        ? ` [Prompt: "${action.config.systemPrompt.slice(0, 45)}..."]`
                        : '';
                    outputMsg = `AI Generated Reply (${tone} / ${task}): "Namaste! Thank you for reaching out. We received your request and our team is ready to assist you."${snippet}`;
                } else if (action.type === 'send_whatsapp_message') {
                    const msg = action.config?.message || action.config?.template || 'Automated follow-up message';
                    outputMsg = `WhatsApp delivered to ${contactLabel}: "${msg.slice(0, 60)}${msg.length > 60 ? '...' : ''}"`;
                } else if (action.type === 'send_email') {
                    outputMsg = `Email sent to ${contactLabel} (Subject: ${action.config?.subject || 'Follow-up'})`;
                } else if (action.type === 'assign_to_agent') {
                    outputMsg = `Lead assigned to agent: ${action.config?.agentName || 'Anita Patel (Sales Specialist)'}`;
                } else if (action.type === 'update_lead_status') {
                    outputMsg = `Lead status updated to: ${action.config?.status || 'Qualified'}`;
                } else if (action.type === 'add_tag') {
                    outputMsg = `Tag applied: #${action.config?.tag || 'Inquiry'}`;
                }

                return {
                    id: `log-${Date.now()}-${action.id}`,
                    actionId: action.id,
                    actionType: action.type,
                    status: 'success',
                    timestamp: new Date().toISOString(),
                    duration: Math.floor(Math.random() * 120) + 30,
                    output: outputMsg
                };
            }),
            duration: 320
        };

        // Save execution to logs
        executionLogsDB.unshift(executionResult);

        // Update run stats
        workflow.runsCount = (workflow.runsCount || 0) + 1;
        workflow.lastRunAt = 'Just now';

        return executionResult;
    }
};