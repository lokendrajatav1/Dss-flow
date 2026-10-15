import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, ArrowRightLeft, Target, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onConverted: () => void;
}

export function ConvertLeadModal({ isOpen, onClose, lead, onConverted }: ConvertLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [createCustomer, setCreateCustomer] = useState(true);
  const [createDeal, setCreateDeal] = useState(true);
  
  const [stages, setStages] = useState<any[]>([]);
  
  const [dealData, setDealData] = useState({
    title: '',
    stageId: '',
    value: '',
  });

  useEffect(() => {
    if (isOpen && lead) {
      setDealData(prev => ({ ...prev, title: `${lead.name || 'New'} Deal` }));
      
      const fetchStages = async () => {
        try {
          const token = localStorage.getItem('token');
          const pipeRes = await api.get('/deals/pipelines', { headers: { Authorization: `Bearer ${token}` } });
          if (pipeRes.data?.length > 0) {
            const stagesRes = await api.get(`/deals/pipelines/${pipeRes.data[0].id}/stages`, { headers: { Authorization: `Bearer ${token}` } });
            setStages(stagesRes.data);
            if (stagesRes.data.length > 0) {
              setDealData(prev => ({ ...prev, stageId: stagesRes.data[0].id }));
            }
          }
        } catch (err) {
          console.error("Failed to fetch pipeline stages", err);
        }
      };
      
      fetchStages();
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createDeal && !dealData.stageId) {
      MySwal.fire('Error', 'Please select a pipeline stage for the deal.', 'error');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 1. Convert Lead (updates status and creates Customer)
      const convertRes = await api.post(`/leads/${lead.id}/convert`, 
        { createCustomer },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Create Deal if checked
      if (createDeal) {
        await api.post(`/deals`, {
          title: dealData.title,
          leadId: lead.id,
          customerId: convertRes.data.customerId || undefined,
          stageId: dealData.stageId,
          value: Number(dealData.value) || 0,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      MySwal.fire({ title: 'Success!', text: 'Lead converted successfully!', icon: 'success', timer: 1500, showConfirmButton: false });
      onConverted();
      onClose();
    } catch (err: any) {
      console.error(err);
      MySwal.fire('Error', err.response?.data?.message || 'Failed to convert lead.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[75vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900">Convert Lead: {lead.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-2 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div className="space-y-4 border-b border-gray-100 pb-6">
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={createCustomer} 
                onChange={(e) => setCreateCustomer(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Create Contact Profile</span>
                <span className="text-xs text-gray-500">Add to your Contacts database.</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={createDeal} 
                onChange={(e) => setCreateDeal(e.target.checked)}
                className="w-4 h-4 text-[#00d084] border-gray-300 rounded focus:ring-[#00d084]"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">Create a Deal (Pipeline)</span>
                <span className="text-xs text-gray-500">Move this prospect to your sales pipeline.</span>
              </div>
            </label>
          </div>

          {createDeal && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> Deal Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
                <Input required value={dealData.title} onChange={e => setDealData({ ...dealData, title: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pipeline Stage *</label>
                  <select 
                    required
                    value={dealData.stageId}
                    onChange={e => setDealData({ ...dealData, stageId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">-- Select Stage --</option>
                    {stages.map(stage => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value *</label>
                  <div className="relative">
                    <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input required type="number" min="0" value={dealData.value} onChange={e => setDealData({ ...dealData, value: e.target.value })} className="pl-9" />
                  </div>
                </div>
              </div>
            </div>
          )}

          </div>

          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Convert Lead
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
