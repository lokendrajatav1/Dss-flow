import { Workflow } from '../types';

export interface WorkflowRecipe {
  id: string;
  name: string;
  description: string;
  category: 'lead' | 'whatsapp' | 'deal' | 'ai';
  categoryLabel: string;
  badge: string;
  icon: string;
  workflow: Omit<Workflow, 'id' | 'createdAt' | 'runsCount'>;
}

export const CRM_RECIPES: WorkflowRecipe[] = [
  {
    id: 'recipe-whatsapp-welcome',
    name: 'Instant WhatsApp Auto-Reply & Agent Assignment',
    description: 'When a new contact sends their first WhatsApp message, send an AI welcome note, assign to round-robin sales agent, and apply a tag.',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & SMS',
    badge: 'Most Popular',
    icon: 'MessageSquare',
    workflow: {
      name: 'Instant WhatsApp Auto-Reply & Agent Assignment',
      description: 'Welcome new inquiries on WhatsApp, route to sales agent, and tag.',
      isActive: true,
      version: '1.0.0',
      trigger: {
        id: 'trg-welcome',
        type: 'whatsapp_message_received',
        config: {
          isFirstMessage: true,
          matchType: 'first_message'
        }
      },
      actions: [
        {
          id: 'act-ai-greeting',
          type: 'generate_ai_reply',
          config: { tone: 'Friendly & Professional' }
        },
        {
          id: 'act-send-wa',
          type: 'send_whatsapp_message',
          config: { message: 'Hello {{lead.name}}! Thank you for contacting us. We have received your query and a representative will assist you in a few minutes.' }
        },
        {
          id: 'act-assign-rep',
          type: 'assign_to_agent',
          config: { agent: 'Auto Round-Robin' }
        },
        {
          id: 'act-tag-inquiry',
          type: 'add_tag',
          config: { tag: 'WhatsApp-Lead' }
        }
      ]
    }
  },
  {
    id: 'recipe-deal-won-onboarding',
    name: 'Deal Won: VIP Onboarding & Handover',
    description: 'When a deal enters the "Won" stage, send a celebration WhatsApp message, send a welcome email, update lead status to Closed Won, and set a reminder.',
    category: 'deal',
    categoryLabel: 'Deals & Pipeline',
    badge: 'High Conversion',
    icon: 'Briefcase',
    workflow: {
      name: 'Deal Won: VIP Onboarding & Handover',
      description: 'Congratulate client, send onboarding assets, update lead status.',
      isActive: true,
      version: '1.0.0',
      trigger: {
        id: 'trg-deal-won',
        type: 'deal_stage_changed',
        config: { stage: 'Won' }
      },
      actions: [
        {
          id: 'act-wa-congrats',
          type: 'send_whatsapp_message',
          config: { message: '🎉 Congratulations {{lead.name}}! We are thrilled to partner with {{lead.company}}. Your deal {{deal.title}} is confirmed.' }
        },
        {
          id: 'act-email-onboard',
          type: 'send_email',
          config: {
            subject: 'Welcome to the Family, {{lead.name}}!',
            body: 'Hi {{lead.name}},\n\nThank you for choosing us! Attached is your onboarding guide. Your account manager {{agent.name}} will schedule our kickoff call.\n\nBest regards,\nExecutive Team'
          }
        },
        {
          id: 'act-status-closed',
          type: 'update_lead_status',
          config: { leadStatus: 'Closed Won' }
        },
        {
          id: 'act-reminder-kickoff',
          type: 'set_reminder',
          config: { delay: 'Tomorrow at 10 AM' }
        }
      ]
    }
  },
  {
    id: 'recipe-lead-qualification',
    name: 'New Lead Auto-Qualifier & Routing',
    description: 'When a new lead is captured from Website or Ads, tag them, wait 5 minutes, and send an introductory message with personalized company tags.',
    category: 'lead',
    categoryLabel: 'Lead Routing',
    badge: 'Essential',
    icon: 'UserPlus',
    workflow: {
      name: 'New Lead Auto-Qualifier & Routing',
      description: 'Acknowledge web leads promptly and assign to right team member.',
      isActive: true,
      version: '1.0.0',
      trigger: {
        id: 'trg-new-lead',
        type: 'new_lead_added',
        config: { source: 'All Sources' }
      },
      actions: [
        {
          id: 'act-tag-new',
          type: 'add_tag',
          config: { tag: 'Web-Inbound' }
        },
        {
          id: 'act-delay-5m',
          type: 'delay',
          config: { delay: '5 Minutes' }
        },
        {
          id: 'act-send-intro',
          type: 'send_whatsapp_message',
          config: { message: 'Hi {{lead.name}}, saw you checked out our services for {{lead.company}}. Are you free for a quick 2-minute overview?' }
        },
        {
          id: 'act-assign-sales',
          type: 'assign_to_agent',
          config: { agent: 'Sales Team' }
        }
      ]
    }
  },
  {
    id: 'recipe-cold-lead-drip',
    name: 'Cold Lead Re-engagement Drip',
    description: 'If a lead is contacted but stalls, wait 24 hours, check in via WhatsApp, wait another 3 days, and follow up with a value proposition.',
    category: 'lead',
    categoryLabel: 'Lead Routing',
    badge: 'Nurture',
    icon: 'Clock',
    workflow: {
      name: 'Cold Lead Re-engagement Drip',
      description: 'Automated 2-step follow-up sequence for non-responsive leads.',
      isActive: false,
      version: '1.0.0',
      trigger: {
        id: 'trg-status-contacted',
        type: 'lead_status_changed',
        config: { leadStatus: 'Contacted' }
      },
      actions: [
        {
          id: 'act-wait-24h',
          type: 'delay',
          config: { delay: '24 Hours' }
        },
        {
          id: 'act-drip-wa1',
          type: 'send_whatsapp_message',
          config: { message: 'Hi {{lead.name}}, following up on our previous note. Let me know if you would like me to share our portfolio!' }
        },
        {
          id: 'act-wait-3d',
          type: 'delay',
          config: { delay: '3 Days' }
        },
        {
          id: 'act-drip-email2',
          type: 'send_email',
          config: {
            subject: 'Quick question for {{lead.name}}',
            body: 'Hi {{lead.name}},\n\nWanted to see if scaling your CRM operations is still a priority this quarter. Here is a link to our case studies.\n\nBest,\n{{agent.name}}'
          }
        }
      ]
    }
  },
  {
    id: 'recipe-vip-high-value',
    name: 'High-Value Deal VIP Escalation',
    description: 'Detect high-value pipeline progression, assign Senior Account Executive, send priority alert webhook, and add VIP tag.',
    category: 'deal',
    categoryLabel: 'Deals & Pipeline',
    badge: 'High Value',
    icon: 'Sparkles',
    workflow: {
      name: 'High-Value Deal VIP Escalation',
      description: 'Route major accounts to senior closers and trigger VIP alerts.',
      isActive: true,
      version: '1.0.0',
      trigger: {
        id: 'trg-deal-proposal',
        type: 'deal_stage_changed',
        config: { stage: 'Proposal Sent' }
      },
      actions: [
        {
          id: 'act-tag-vip',
          type: 'add_tag',
          config: { tag: 'VIP-Enterprise' }
        },
        {
          id: 'act-assign-exec',
          type: 'assign_to_agent',
          config: { agent: 'Account Executives' }
        },
        {
          id: 'act-wa-vip',
          type: 'send_whatsapp_message',
          config: { message: 'Hello {{lead.name}}, our senior partner has been assigned to your proposal for {{deal.title}}. We will be in touch shortly.' }
        }
      ]
    }
  },
  {
    id: 'recipe-call-disposition',
    name: 'Post-Call Follow-up & Booking Link',
    description: 'When an agent logs a call disposition, automatically dispatch a WhatsApp recap and meeting booking link to the customer.',
    category: 'whatsapp',
    categoryLabel: 'WhatsApp & SMS',
    badge: 'Sales Acceleration',
    icon: 'Activity',
    workflow: {
      name: 'Post-Call Follow-up & Booking Link',
      description: 'Send meeting link right after call disposition is recorded.',
      isActive: true,
      version: '1.0.0',
      trigger: {
        id: 'trg-call-logged',
        type: 'call_disposition_logged',
        config: { disposition: 'Interested - Follow Up Needed' }
      },
      actions: [
        {
          id: 'act-wa-call-recap',
          type: 'send_whatsapp_message',
          config: { message: 'Great speaking with you, {{lead.name}}! As discussed, please book our next milestone call here: https://cal.com/crm-demo' }
        },
        {
          id: 'act-reminder-call',
          type: 'set_reminder',
          config: { delay: 'In 3 Days' }
        }
      ]
    }
  }
];
