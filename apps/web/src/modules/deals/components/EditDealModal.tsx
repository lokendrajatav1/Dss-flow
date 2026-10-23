import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import { CALL_STATUSES, DEAL_STAGES } from '@/lib/constants';
import { ContactSelectDropdown } from '@/components/common/ContactSelectDropdown';
import { Deal } from '../types';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages?: any[];
  deal: Deal | null;
  onDealUpdated: () => void;
}

export function EditDealModal({ isOpen, onClose, stages: propStages, deal, onDealUpdated }: EditDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [internalStages, setInternalStages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [funnels, setFunnels] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stages = propStages || internalStages;

  const [formData, setFormData] = useState({
    title: '',
    customerId: '',
    value: '',
    assignedToId: '',
    notes: '',
    startDate: '',
    expectedCloseDate: '',
    stageId: '',
    dealStage: DEAL_STAGES[0],
    callStatus: '',
    funnelId: '',
    groupId: '',
    attachment: null as File | null
  });

  useEffect(() => {
    if (isOpen) {
      setError(null);
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };

          // 1. Fetch Stages if not provided
          let fetchedStages: any[] = [];
          if (!propStages || propStages.length === 0) {
            const pipeRes = await api.get('/deals/pipelines', { headers }).catch(() => ({ data: [] }));
            if (Array.isArray(pipeRes.data) && pipeRes.data.length > 0) {
              if (pipeRes.data[0].stages && pipeRes.data[0].stages.length > 0) {
                fetchedStages = pipeRes.data[0].stages;
              } else {
                const stagesRes = await api.get(`/deals/pipelines/${pipeRes.data[0].id}/stages`, { headers }).catch(() => ({ data: [] }));
                fetchedStages = Array.isArray(stagesRes.data) ? stagesRes.data : [];
              }
            }
            if (fetchedStages.length === 0) {
              const fallbackRes = await api.get('/pipelines', { headers }).catch(() => ({ data: [] }));
              if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
                fetchedStages = fallbackRes.data[0].stages || [];
              }
            }
            setInternalStages(fetchedStages);
          } else {
            fetchedStages = propStages;
          }

          // 2. Users (Team Members)
          const usersRes = await api.get('/users', { headers }).catch(() => ({ data: [] }));
          setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

          // 2.1 Customers (Clients)
          const custRes = await api.get('/customers', { headers }).catch(() => ({ data: [] }));
          const custList = Array.isArray(custRes.data) ? custRes.data : (custRes.data?.customers || []);
          setCustomers(custList);

          // 3. Funnels
          const funnelsRes = await api.get('/leads/funnels', { headers }).catch(() => ({ data: [] }));
          setFunnels(Array.isArray(funnelsRes.data) ? funnelsRes.data : []);

          // 4. Groups
          const groupsRes = await api.get('/leads/groups', { headers }).catch(() => ({ data: [] }));
          setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
        } catch (err) {
          console.error("Failed to load data for edit deal modal", err);
        }
      };
      fetchData();
    }
  }, [isOpen, propStages]);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        customerId: deal.customerId || (deal.customer?.id) || '',
        value: deal.value ? String(deal.value) : '',
        assignedToId: deal.assignedToId || '',
        notes: deal.notes || '',
        startDate: (deal as any).startDate ? new Date((deal as any).startDate).toISOString().split('T')[0] : '',
        expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split('T')[0] : '',
        stageId: deal.stageId || '',
        dealStage: (() => {
          const raw = deal.stage?.name || (deal as any).dealStage || 'Deal Raised';
          const lower = raw.toLowerCase();
          if (lower === 'won' || lower === 'deal won') return 'Deal Won';
          if (lower === 'lost' || lower === 'deal lost') return 'Deal Lost';
          if (lower === 'negotiation') return 'Negotiation';
          if (lower === 'awaiting approval') return 'Awaiting Approval';
          if (lower === 'proposal sent') return 'Proposal Sent';
          if (lower === 'deal raised') return 'Deal Raised';
          const found = DEAL_STAGES.find(s => s.toLowerCase() === lower);
          return found || 'Deal Raised';
        })(),
        callStatus: (deal as any).callStatus || '',
        funnelId: (deal as any).funnelId || '',
        groupId: (deal as any).groupId || '',
        attachment: null
      });
    }
  }, [deal]);

  if (!isOpen || !deal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please enter a deal name.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const selectedStageId = formData.stageId || deal.stageId;

      await api.patch(`/deals/${deal.id}`, {
        stageId: selectedStageId,
        customerId: formData.customerId || null,
        title: formData.title.trim(),
        value: Number(formData.value) || 0,
        assignedToId: formData.assignedToId || null,
        notes: formData.notes.trim() || null,
        startDate: formData.startDate || null,
        expectedCloseDate: formData.expectedCloseDate || null,
        callStatus: formData.callStatus || null,
        funnelId: formData.funnelId || null,
        groupId: formData.groupId || null,
      }, { headers });

      onDealUpdated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update deal.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">Edit Deal</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              
              {/* Deal Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Deal Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="Enter Deal Name"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                />
              </div>

              {/* Client Name (Searchable dropdown with + New Contact Modal) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Client Name
                </label>
                <ContactSelectDropdown
                  contacts={customers}
                  selectedContactId={formData.customerId}
                  onSelectContact={(contact) => {
                    setFormData(prev => ({
                      ...prev,
                      customerId: contact ? contact.id : ''
                    }));
                  }}
                  onContactCreated={(newContact) => {
                    setCustomers(prev => [newContact, ...prev]);
                    setFormData(prev => ({
                      ...prev,
                      customerId: newContact.id
                    }));
                  }}
                  placeholder="Search or select client..."
                />
              </div>

              {/* Deal Price */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Deal Price
                </label>
                <Input
                  type="number"
                  min="0"
                  placeholder="Enter Deal Price"
                  value={formData.value}
                  onChange={e => setFormData({ ...formData, value: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm"
                />
              </div>

              {/* Team Member */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Team Member
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Team</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {/* Deal Stage */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Deal Stage <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.dealStage}
                  onChange={e => {
                    const val = e.target.value;
                    const matched = stages.find(s => 
                      s.name.toLowerCase() === val.toLowerCase() ||
                      (val === 'Deal Won' && s.name.toLowerCase() === 'won') ||
                      (val === 'Deal Lost' && s.name.toLowerCase() === 'lost')
                    );
                    setFormData({
                      ...formData,
                      dealStage: val,
                      stageId: matched ? matched.id : val
                    });
                  }}
                  className="form-control w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Deal Raised">Deal Raised</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Awaiting Approval">Awaiting Approval</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Deal Won">Deal Won</option>
                  <option value="Deal Lost">Deal Lost</option>
                </select>
              </div>

              {/* Call Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Call Status
                </label>
                <select
                  value={formData.callStatus}
                  onChange={e => setFormData({ ...formData, callStatus: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Call Status</option>
                  {CALL_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Select Funnel */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <label className="text-sm font-medium text-gray-900">Select Funnel</label>
                  <span 
                    className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold cursor-pointer"
                    title="Funnel details"
                  >
                    i
                  </span>
                </div>
                <select
                  value={formData.funnelId}
                  onChange={e => setFormData({ ...formData, funnelId: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Funnel</option>
                  {funnels.map(funnel => (
                    <option key={funnel.id} value={funnel.id}>{funnel.name}</option>
                  ))}
                </select>
              </div>

              {/* Select Group */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Select Group
                </label>
                <select
                  value={formData.groupId}
                  onChange={e => setFormData({ ...formData, groupId: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select Group</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
              </div>

              {/* Attachment */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Attachment
                </label>
                <div className="border border-gray-300 rounded-md px-3 py-1.5 bg-white flex items-center h-10">
                  <input
                    type="file"
                    onChange={e => {
                      const file = e.target.files?.[0] || null;
                      setFormData({ ...formData, attachment: file });
                    }}
                    className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded file:border file:border-gray-200 file:text-xs file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer w-full"
                  />
                </div>
              </div>

              {/* About Deal */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  About Deal
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the deal"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : 'Save Deal'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
