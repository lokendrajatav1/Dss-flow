import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Briefcase, UserPlus, Tag, PhoneCall, Check, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TriggerType, WorkflowTrigger } from '../types';
import { LEAD_SOURCES, LEAD_STATUSES, CALL_STATUSES } from '@/lib/constants';
import api from '@/lib/api';

interface TriggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrigger?: WorkflowTrigger;
  onSave: (trigger: WorkflowTrigger) => void;
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

const TRIGGER_OPTIONS: {
  type: TriggerType;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}[] = [
  {
    type: 'whatsapp_message_received',
    title: 'WhatsApp Message Received',
    description: 'Trigger when an inbound WhatsApp message arrives from a customer',
    icon: MessageSquare,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200'
  },
  {
    type: 'deal_stage_changed',
    title: 'Pipeline Stage Changed',
    description: 'Trigger when a lead or deal moves into a specific pipeline stage',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  {
    type: 'lead_status_changed',
    title: 'Lead Status Changed',
    description: 'Trigger when a contact lead status is updated (e.g. Qualified, Contacted)',
    icon: Activity,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  {
    type: 'new_lead_added',
    title: 'New Lead Added',
    description: 'Trigger automatically whenever a new lead is created in the CRM',
    icon: UserPlus,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50 border-indigo-200'
  },
  {
    type: 'call_disposition_logged',
    title: 'Call Disposition Logged',
    description: 'Trigger when an agent logs a calling outcome (e.g. Interested, Call Back Later)',
    icon: PhoneCall,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200'
  },
  {
    type: 'tag_added',
    title: 'Tag Added to Contact',
    description: 'Trigger when a specific tag or label is assigned to a lead',
    icon: Tag,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200'
  }
];

export function TriggerModal({ isOpen, onClose, currentTrigger, onSave }: TriggerModalProps) {
  const [selectedType, setSelectedType] = useState<TriggerType>(
    currentTrigger?.type || 'whatsapp_message_received'
  );
  
  // Real platform stages from API
  const [availableStages, setAvailableStages] = useState<string[]>(DEFAULT_STAGES);

  // Trigger form states
  const [waMode, setWaMode] = useState<'first_message' | 'keyword' | 'any'>(
    currentTrigger?.config?.keyword ? 'keyword' : currentTrigger?.config?.isFirstMessage ? 'first_message' : 'any'
  );
  const [waKeyword, setWaKeyword] = useState<string>(currentTrigger?.config?.keyword || '');
  const [dealStage, setDealStage] = useState<string>(currentTrigger?.config?.stage || DEFAULT_STAGES[0]);
  const [leadStatus, setLeadStatus] = useState<string>(currentTrigger?.config?.leadStatus || LEAD_STATUSES[0]);
  const [leadSource, setLeadSource] = useState<string>(currentTrigger?.config?.source || 'All');
  const [callStatus, setCallStatus] = useState<string>(currentTrigger?.config?.callStatus || 'Interested');
  const [tagValue, setTagValue] = useState<string>(currentTrigger?.config?.tag || 'New Lead');

  // Fetch real pipeline stages from backend
  useEffect(() => {
    const fetchPipelineStages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/pipelines', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          const stagesSet = new Set<string>();
          res.data.forEach((p: any) => {
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
        // Fallback to platform default stages
        setAvailableStages(DEFAULT_STAGES);
      }
    };

    if (isOpen) {
      fetchPipelineStages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentTrigger) {
      setSelectedType(currentTrigger.type);
      if (currentTrigger.config?.keyword) {
        setWaMode('keyword');
        setWaKeyword(currentTrigger.config.keyword);
      } else if (currentTrigger.config?.isFirstMessage) {
        setWaMode('first_message');
      } else {
        setWaMode('any');
      }
      if (currentTrigger.config?.stage) setDealStage(currentTrigger.config.stage);
      if (currentTrigger.config?.leadStatus) setLeadStatus(currentTrigger.config.leadStatus);
      if (currentTrigger.config?.source) setLeadSource(currentTrigger.config.source);
      if (currentTrigger.config?.callStatus) setCallStatus(currentTrigger.config.callStatus);
      if (currentTrigger.config?.tag) setTagValue(currentTrigger.config.tag);
    }
  }, [currentTrigger, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    let config: Record<string, any> = {};

    switch (selectedType) {
      case 'whatsapp_message_received':
        if (waMode === 'first_message') config = { isFirstMessage: true };
        else if (waMode === 'keyword') config = { keyword: waKeyword.trim() || 'info' };
        else config = { isFirstMessage: false, anyMessage: true };
        break;
      case 'deal_stage_changed':
        config = { stage: dealStage };
        break;
      case 'lead_status_changed':
        config = { leadStatus };
        break;
      case 'new_lead_added':
        config = { source: leadSource };
        break;
      case 'call_disposition_logged':
        config = { callStatus };
        break;
      case 'tag_added':
        config = { tag: tagValue.trim() || 'New Lead' };
        break;
    }

    onSave({
      id: currentTrigger?.id || `trg-${Date.now()}`,
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
            <h3 className="text-lg font-bold text-gray-900">Configure Trigger Event</h3>
            <p className="text-xs text-gray-500">Select when this automation workflow should begin</p>
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
          {/* Trigger Type Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              1. Choose Trigger Event
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TRIGGER_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                      isSelected
                        ? `${opt.bgColor} border-indigo-600 shadow-xs ring-1 ring-indigo-600`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-white shadow-xs ${opt.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-900 flex items-center justify-between truncate">
                        {opt.title}
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3] ml-1 flex-shrink-0" />}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{opt.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trigger Specific Configuration with Real Platform Data */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              2. Event Conditions & Parameters
            </label>

            {/* WhatsApp Trigger */}
            {selectedType === 'whatsapp_message_received' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">Trigger condition:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWaMode('first_message')}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                      waMode === 'first_message'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    First Message Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaMode('keyword')}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                      waMode === 'keyword'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Specific Keyword
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaMode('any')}
                    className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                      waMode === 'any'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Any Message
                  </button>
                </div>

                {waMode === 'keyword' && (
                  <div className="mt-3">
                    <label className="text-xs text-gray-600 mb-1 block">Inbound message contains text:</label>
                    <input
                      type="text"
                      value={waKeyword}
                      onChange={(e) => setWaKeyword(e.target.value)}
                      placeholder="e.g. price, demo, quote, inquiry"
                      className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Pipeline Stage Changed Trigger */}
            {selectedType === 'deal_stage_changed' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">When deal moves to pipeline stage:</label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {availableStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">Stages are synchronized from your platform's active pipelines.</p>
              </div>
            )}

            {/* Lead Status Changed Trigger */}
            {selectedType === 'lead_status_changed' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">When lead status changes to:</label>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {LEAD_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">Using standard platform lead statuses.</p>
              </div>
            )}

            {/* New Lead Added Trigger (Real Platform LEAD_SOURCES) */}
            {selectedType === 'new_lead_added' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">Lead Source filter:</label>
                <select
                  value={leadSource}
                  onChange={(e) => setLeadSource(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="All">All Sources (Any Inbound Lead)</option>
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">Sources defined in platform CRM settings.</p>
              </div>
            )}

            {/* Call Disposition Trigger (Real Platform CALL_STATUSES) */}
            {selectedType === 'call_disposition_logged' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">When call outcome status is logged:</label>
                <select
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {CALL_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500">Covers all calling outcomes defined in CRM constants.</p>
              </div>
            )}

            {/* Tag Added Trigger */}
            {selectedType === 'tag_added' && (
              <div className="space-y-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                <label className="text-xs font-medium text-gray-700 block">When tag label is applied:</label>
                <input
                  type="text"
                  value={tagValue}
                  onChange={(e) => setTagValue(e.target.value)}
                  placeholder="e.g. VIP, Hot Lead, Follow-up Required"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
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
            Save Trigger
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
