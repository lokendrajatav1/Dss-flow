import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Sparkles, UserPlus, Tag, ArrowRightLeft, Clock, Check, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionType, WorkflowAction } from '../types';
import { LEAD_STATUSES } from '@/lib/constants';
import api from '@/lib/api';

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAction?: WorkflowAction | null;
  onSave: (action: WorkflowAction) => void;
}

const DEFAULT_STAGES = [
  'Lead In',
  'Contact Made',
  'Requirements Gathered',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost'
];

const ACTION_OPTIONS: {
  type: ActionType;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}[] = [
  {
    type: 'send_whatsapp_message',
    title: 'Send WhatsApp Message',
    description: 'Dispatch an automated WhatsApp reply or template to the contact',
    icon: MessageCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200'
  },
  {
    type: 'generate_ai_reply',
    title: 'Generate AI Reply / Analysis',
    description: 'Use Antigravity AI to draft smart context-aware responses or summaries',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  {
    type: 'assign_to_agent',
    title: 'Assign to Team Member',
    description: 'Assign lead or task to a real platform team member or auto round-robin',
    icon: UserPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  {
    type: 'move_deal_stage',
    title: 'Move Pipeline Stage',
    description: 'Advance lead or deal stage in your sales pipeline',
    icon: ArrowRightLeft,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200'
  },
  {
    type: 'update_lead_status',
    title: 'Update Lead Status',
    description: 'Change the contact lifecycle status (e.g. Qualified, Proposal Sent)',
    icon: Activity,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50 border-violet-200'
  },
  {
    type: 'add_tag',
    title: 'Add Tag / Label',
    description: 'Attach a label or tag to categorize the contact',
    icon: Tag,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200'
  },
  {
    type: 'set_reminder',
    title: 'Schedule Follow-up Task',
    description: 'Create a calendar follow-up reminder for the team',
    icon: Clock,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200'
  }
];

export function ActionModal({ isOpen, onClose, currentAction, onSave }: ActionModalProps) {
  const [selectedType, setSelectedType] = useState<ActionType>(
    currentAction?.type || 'send_whatsapp_message'
  );

  // Platform dynamic data
  const [realUsers, setRealUsers] = useState<any[]>([]);
  const [availableStages, setAvailableStages] = useState<string[]>(DEFAULT_STAGES);

  // Form states for configs
  const [waMessage, setWaMessage] = useState<string>(
    currentAction?.config?.message || 'Hello {name}, thank you for contacting us! How can we assist you today?'
  );
  const [aiPrompt, setAiPrompt] = useState<string>(
    currentAction?.config?.prompt || 'Draft a helpful, professional greeting addressing the customer inquiry.'
  );
  const [aiTone, setAiTone] = useState<string>(currentAction?.config?.tone || 'Friendly & Professional');
  const [agentName, setAgentName] = useState<string>(currentAction?.config?.agent || 'Auto Round-Robin');
  const [dealStage, setDealStage] = useState<string>(currentAction?.config?.stage || DEFAULT_STAGES[0]);
  const [leadStatus, setLeadStatus] = useState<string>(currentAction?.config?.leadStatus || LEAD_STATUSES[0]);
  const [tagText, setTagText] = useState<string>(currentAction?.config?.tag || 'New Lead');
  const [reminderDelay, setReminderDelay] = useState<string>(currentAction?.config?.delay || 'Tomorrow at 10 AM');
  const [reminderNote, setReminderNote] = useState<string>(currentAction?.config?.note || 'Follow up with customer regarding inquiry');

  // Fetch real platform users and pipeline stages
  useEffect(() => {
    const fetchPlatformData = async () => {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const usersRes = await api.get('/users', { headers });
        if (Array.isArray(usersRes.data)) {
          setRealUsers(usersRes.data);
        }
      } catch (err) {
        console.warn('Could not fetch real users', err);
      }

      try {
        const pipelinesRes = await api.get('/pipelines', { headers });
        if (Array.isArray(pipelinesRes.data) && pipelinesRes.data.length > 0) {
          const stagesSet = new Set<string>();
          pipelinesRes.data.forEach((p: any) => {
            if (Array.isArray(p.stages)) {
              p.stages.forEach((s: any) => {
                if (s.name) stagesSet.add(s.name);
              });
            }
          });
          if (stagesSet.size > 0) {
            setAvailableStages(Array.from(stagesSet));
          }
        }
      } catch (err) {
        setAvailableStages(DEFAULT_STAGES);
      }
    };

    if (isOpen) {
      fetchPlatformData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentAction) {
      setSelectedType(currentAction.type);
      if (currentAction.config?.message) setWaMessage(currentAction.config.message);
      if (currentAction.config?.prompt) setAiPrompt(currentAction.config.prompt);
      if (currentAction.config?.tone) setAiTone(currentAction.config.tone);
      if (currentAction.config?.agent) setAgentName(currentAction.config.agent);
      if (currentAction.config?.stage) setDealStage(currentAction.config.stage);
      if (currentAction.config?.leadStatus) setLeadStatus(currentAction.config.leadStatus);
      if (currentAction.config?.tag) setTagText(currentAction.config.tag);
      if (currentAction.config?.delay) setReminderDelay(currentAction.config.delay);
      if (currentAction.config?.note) setReminderNote(currentAction.config.note);
    } else {
      setSelectedType('send_whatsapp_message');
    }
  }, [currentAction, isOpen]);

  if (!isOpen) return null;

  const handleInsertTag = (tag: string) => {
    setWaMessage((prev: string) => `${prev} ${tag}`);
  };

  const handleSave = () => {
    let config: Record<string, any> = {};

    switch (selectedType) {
      case 'send_whatsapp_message':
        config = { message: waMessage.trim() };
        break;
      case 'generate_ai_reply':
        config = { prompt: aiPrompt.trim(), tone: aiTone };
        break;
      case 'assign_to_agent':
        config = { agent: agentName };
        break;
      case 'move_deal_stage':
        config = { stage: dealStage };
        break;
      case 'update_lead_status':
        config = { leadStatus };
        break;
      case 'add_tag':
        config = { tag: tagText.trim() };
        break;
      case 'set_reminder':
        config = { delay: reminderDelay, note: reminderNote.trim() };
        break;
    }

    onSave({
      id: currentAction?.id || `act-${Date.now()}`,
      type: selectedType,
      config
    });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {currentAction ? 'Edit Workflow Action' : 'Add New Workflow Action'}
            </h3>
            <p className="text-xs text-gray-500">Configure task execution parameters</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Action Type Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              1. Choose Action Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACTION_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? `${opt.bgColor} border-indigo-600 shadow-xs ring-1 ring-indigo-600`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-lg bg-white shadow-xs ${opt.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 stroke-[3]" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 leading-tight">{opt.title}</div>
                      <div className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{opt.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Configuration Fields */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              2. Action Details & Configuration
            </label>

            {/* Send WhatsApp Message */}
            {selectedType === 'send_whatsapp_message' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-700">Message Content:</label>
                  <div className="flex gap-1">
                    {['{name}', '{phone}', '{email}', '{company}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleInsertTag(tag)}
                        className="text-[10px] bg-white border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 px-1.5 py-0.5 rounded text-gray-600 transition-colors"
                      >
                        +{tag}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Enter message text..."
                  className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {/* Generate AI Reply */}
            {selectedType === 'generate_ai_reply' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">AI Prompt Instructions:</label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Instructions for AI sales assistant..."
                    className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Tone of Voice:</label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Friendly & Professional">Friendly & Professional</option>
                    <option value="Direct & Concise">Direct & Concise</option>
                    <option value="Warm & Consultative">Warm & Consultative</option>
                    <option value="Urgent Sales Closer">Urgent Sales Closer</option>
                  </select>
                </div>
              </div>
            )}

            {/* Assign to Real Platform User */}
            {selectedType === 'assign_to_agent' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">Select Team Member:</label>
                <select
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="Auto Round-Robin">🔄 Auto Round-Robin (Equally distribute across team)</option>
                  {realUsers.length > 0 ? (
                    realUsers.map(user => (
                      <option key={user.id} value={user.name}>
                        {user.name} ({user.role?.name || user.email})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Admin">Admin</option>
                      <option value="Sales Representative">Sales Representative</option>
                    </>
                  )}
                </select>
                <p className="text-[11px] text-gray-500">Connected to your platform's active users directory.</p>
              </div>
            )}

            {/* Move Pipeline Stage */}
            {selectedType === 'move_deal_stage' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">Target Pipeline Stage:</label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {availableStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">Synchronized with platform pipeline stages.</p>
              </div>
            )}

            {/* Update Lead Status */}
            {selectedType === 'update_lead_status' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">Set Lead Status To:</label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {LEAD_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">Standard lead statuses from platform configuration.</p>
              </div>
            )}

            {/* Add Tag */}
            {selectedType === 'add_tag' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">Tag Label to Apply:</label>
                <input
                  type="text"
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  placeholder="e.g. VIP, Hot Lead, High Intent"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            )}

            {/* Set Reminder */}
            {selectedType === 'set_reminder' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Reminder When:</label>
                  <select
                    value={reminderDelay}
                    onChange={(e) => setReminderDelay(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="In 1 Hour">In 1 Hour</option>
                    <option value="In 4 Hours">In 4 Hours</option>
                    <option value="Tomorrow at 10 AM">Tomorrow at 10 AM</option>
                    <option value="In 3 Days">In 3 Days</option>
                    <option value="In 1 Week">In 1 Week</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Task Note:</label>
                  <input
                    type="text"
                    value={reminderNote}
                    onChange={(e) => setReminderNote(e.target.value)}
                    placeholder="e.g. Follow up with contact"
                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700" size="sm">
            {currentAction ? 'Update Action' : 'Add Action'}
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
