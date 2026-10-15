import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Target, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  stages?: any[]; // Now optional
  initialLeadId?: string;
  onDealAdded: () => void;
}

export function AddDealModal({ isOpen, onClose, stages: propStages, initialLeadId, onDealAdded }: AddDealModalProps) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [internalStages, setInternalStages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const stages = propStages || internalStages;

  const [formData, setFormData] = useState({
    title: '',
    leadId: initialLeadId || '',
    stageId: '',
    value: '',
    expectedCloseDate: '',
    priority: 'Medium',
    notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        leadId: initialLeadId || '',
        stageId: '',
        value: '',
        expectedCloseDate: '',
        priority: 'Medium',
        assignedToId: '',
        notes: ''
      });
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
          
          // 1. Fetch leads
          const res = await axios.get(`${API_URL}/leads`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setLeads(res.data);
          
          let currentStages = propStages;

          // 2. Fetch stages if not provided
          if (!currentStages) {
             const pipeRes = await axios.get(`${API_URL}/deals/pipelines`, { headers: { Authorization: `Bearer ${token}` } });
             if (pipeRes.data?.length > 0) {
               const stagesRes = await axios.get(`${API_URL}/deals/pipelines/${pipeRes.data[0].id}/stages`, { headers: { Authorization: `Bearer ${token}` } });
               currentStages = stagesRes.data;
               setInternalStages(currentStages || []);
             }
          }
          
          if (currentStages && currentStages.length > 0) {
            setFormData(prev => ({ ...prev, stageId: prev.stageId || currentStages![0].id }));
          } else if (initialLeadId) {
            setFormData(prev => ({ ...prev, leadId: initialLeadId }));
          }

          // 3. Fetch users
          const usersRes = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
          setUsers(usersRes.data);
        } catch (err) {
          console.error("Failed to load data for deal modal", err);
        }
      };
      fetchData();
    }
  }, [isOpen, propStages, initialLeadId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stageId) {
      setError('Please select a pipeline stage.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

      await axios.post(`${API_URL}/deals`, {
        title: formData.title,
        leadId: formData.leadId || undefined,
        stageId: formData.stageId,
        value: Number(formData.value) || 0,
        expectedCloseDate: formData.expectedCloseDate || undefined,
        priority: formData.priority,
        assignedToId: formData.assignedToId || undefined,
        notes: formData.notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onDealAdded();
      onClose();
      setFormData({ title: '', leadId: '', stageId: stages[0]?.id || '', value: '', expectedCloseDate: '', priority: 'Medium', assignedToId: '', notes: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create deal.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Add New Deal</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deal Title <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Website Revamp Project"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Lead (Optional)
                </label>
                <select 
                  value={formData.leadId}
                  onChange={e => setFormData({ ...formData, leadId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- No Lead linked --</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.name} {lead.companyName ? `(${lead.companyName})` : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pipeline Stage <span className="text-red-500">*</span>
                </label>
                <select 
                  required
                  value={formData.stageId}
                  onChange={e => setFormData({ ...formData, stageId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Select Stage --</option>
                  {stages.map(stage => (
                    <option key={stage.id} value={stage.id}>{stage.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Deal Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={formData.value}
                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Close Date
                </label>
                <Input
                  type="date"
                  value={formData.expectedCloseDate}
                  onChange={e => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <select 
                  value={formData.assignedToId}
                  onChange={e => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests or details?"
                  className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-y"
                />
              </div>
            </div>
          </div>

          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-md">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-md bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Deal
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
