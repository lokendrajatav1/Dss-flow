import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CALL_STATUSES } from '@/lib/constants';

const MySwal = withReactContent(Swal);

interface RemarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSaved?: () => void;
}

export function RemarksModal({ isOpen, onClose, lead, onSaved }: RemarksModalProps) {
  const [status, setStatus] = useState<'Positive' | 'Negative' | null>(null);
  const [followUpDate, setFollowUpDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [callStatus, setCallStatus] = useState('');
  const [teamMember, setTeamMember] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && lead) {
      setStatus(lead.customData?.sentiment || null);
      setFollowUpDate(lead.nextFollowUp ? new Date(lead.nextFollowUp).toISOString().slice(0, 16) : '');
      setRemarks(lead.notes || '');
      setCallStatus(lead.callStatus || '');
      setTeamMember(lead.assignedToId || '');
      fetchUsers();
    }
  }, [isOpen, lead]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        callStatus: callStatus || undefined,
        notes: remarks,
        nextFollowUp: followUpDate ? new Date(followUpDate).toISOString() : null,
        assignedToId: teamMember || undefined,
        customData: {
          ...lead.customData,
          sentiment: status
        }
      };

      await api.put(`/leads/${lead.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      MySwal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      MySwal.fire('Error', 'Failed to update remarks', 'error');
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-700">Remarks</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Status</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setStatus('Positive')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[13px] font-bold border transition-colors ${
                    status === 'Positive' ? 'border-[#10b981] text-[#10b981] bg-green-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status === 'Positive' ? 'bg-[#10b981] text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <ThumbsUp className="w-3 h-3" />
                  </div>
                  Positive
                </button>
                <button
                  onClick={() => setStatus('Negative')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-[13px] font-bold border transition-colors ${
                    status === 'Negative' ? 'border-[#ef4444] text-[#ef4444] bg-red-50' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${status === 'Negative' ? 'bg-[#ef4444] text-white' : 'bg-gray-100 text-gray-400'}`}>
                     <ThumbsDown className="w-3 h-3 mt-0.5" />
                  </div>
                  Negative
                </button>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Follow-up Date</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none text-gray-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-2">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none text-gray-700"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Call Status</label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
              >
                <option value="">Select option</option>
                {CALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">Team member</label>
              <select
                value={teamMember}
                onChange={(e) => setTeamMember(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
              >
                <option value="">Select option</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={handleUpdate}
            className="w-full mt-4 bg-[#007bff] text-white py-3 rounded text-[15px] font-medium hover:bg-blue-600 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
