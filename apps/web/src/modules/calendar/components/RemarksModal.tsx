import { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      setStatus(null); // No status selected by default
      setFollowUpDate('');
      setRemarks('');
      setCallStatus(''); // Unselected by default; if left untouched, retains previous status
      setTeamMember(lead.assignedToId || '');
      setLoading(false);
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
    if (!status) {
      MySwal.fire({
        title: 'Status Required',
        text: 'Please select either Positive or Negative status.',
        icon: 'warning',
        confirmButtonColor: '#007bff'
      });
      return;
    }

    if (loading) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // If user didn't select a new call status, retain the previous lead call status
      const finalCallStatus = callStatus || lead.callStatus || undefined;

      const payload: any = {
        callStatus: finalCallStatus,
        notes: remarks.trim() ? remarks.trim() : (lead.notes || undefined),
        assignedToId: teamMember || undefined,
        customData: {
          ...lead.customData,
          sentiment: status
        }
      };

      if (status === 'Negative') {
        payload.nextFollowUp = null; // Clear follow-up if negative
      } else if (followUpDate) {
        payload.nextFollowUp = new Date(followUpDate).toISOString();
      }

      // 1. Update lead details
      await api.put(`/leads/${lead.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Only record an Activity log entry if call status was actually changed
      const hasCallStatusChanged = Boolean(callStatus && callStatus !== lead.callStatus);

      if (hasCallStatusChanged) {
        const isoFollowUp = status !== 'Negative' && followUpDate ? new Date(followUpDate).toISOString() : null;
        const activityTitle = finalCallStatus;

        await api.post(`/leads/${lead.id}/activities`, {
          type: 'NOTE',
          title: activityTitle,
          description: remarks.trim() || undefined,
          assignedToId: teamMember || undefined,
          metadata: {
            outcome: finalCallStatus || undefined,
            status: finalCallStatus,
            sentiment: status,
            followUpDate: isoFollowUp,
            nextFollowUp: isoFollowUp,
            teamMember: teamMember || undefined
          }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(err => console.warn('Activity logging warning:', err));
      }
      
      MySwal.fire({ 
        title: hasCallStatusChanged ? 'Updated & Logged in Activity!' : 'Updated!', 
        icon: 'success', 
        timer: 1500, 
        showConfirmButton: false 
      });
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      MySwal.fire('Error', 'Failed to update remarks', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[470px] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-700">Remarks</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3.5">
            <div className={status === 'Negative' ? 'col-span-2' : ''}>
              <label className="block text-[13px] font-semibold text-gray-600 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5">
                {/* Positive Button */}
                <button
                  type="button"
                  onClick={() => setStatus('Positive')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded text-xs font-bold border transition-all ${
                    status === 'Positive'
                      ? 'bg-[#00a854] border-[#00a854] text-white shadow-xs'
                      : 'bg-white border-[#00a854] text-[#00a854] hover:bg-green-50/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    status === 'Positive' ? 'bg-white text-[#00a854]' : 'bg-[#00a854] text-white'
                  }`}>
                    <ThumbsUp className="w-2.5 h-2.5 fill-current" />
                  </div>
                  <span>Positive</span>
                </button>

                {/* Negative Button */}
                <button
                  type="button"
                  onClick={() => {
                    setStatus('Negative');
                    setFollowUpDate('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded text-xs font-bold border transition-all ${
                    status === 'Negative'
                      ? 'bg-[#e91e63] border-[#e91e63] text-white shadow-xs'
                      : 'bg-white border-[#e91e63] text-[#e91e63] hover:bg-pink-50/50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    status === 'Negative' ? 'bg-white text-[#e91e63]' : 'bg-[#e91e63] text-white'
                  }`}>
                    <ThumbsDown className="w-2.5 h-2.5 fill-current mt-0.5" />
                  </div>
                  <span>Negative</span>
                </button>
              </div>
            </div>

            {/* Follow-up Date (Hidden when Negative) */}
            {status !== 'Negative' && (
              <div>
                <label className="block text-[13px] font-semibold text-gray-600 mb-2">Follow-up Date</label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Remarks</label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter new call remarks or notes..."
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-gray-700"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Call Status</label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
              >
                <option value="">Select option</option>
                {CALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Team member</label>
              <select
                value={teamMember}
                onChange={(e) => setTeamMember(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700 bg-white"
              >
                <option value="">Select option</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleUpdate}
            disabled={loading}
            className="w-full mt-2 bg-[#007bff] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Updating...</span>
              </>
            ) : (
              <span>Update</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
