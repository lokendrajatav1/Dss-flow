import { useState, useEffect } from 'react';
import { User, Phone, Bell, FileText, Check, X, Info } from 'lucide-react';
import api from '@/lib/api';
import { CALL_STATUSES } from '@/lib/constants';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

type Tab = 'reminder' | 'activity';

interface SetReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  onSaved?: () => void;
  initialCallStatus?: string;
  initialTab?: 'reminder' | 'activity';
}

export function SetReminderModal({ isOpen, onClose, lead, onSaved, initialCallStatus, initialTab = 'reminder' }: SetReminderModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const [callStatus, setCallStatus] = useState(initialCallStatus || '');
  const [feedback, setFeedback] = useState('');
  const [bant, setBant] = useState({
    budget: null as boolean | null,
    authority: null as boolean | null,
    need: null as boolean | null,
    timeline: null as boolean | null,
  });
  const [date, setDate] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [teamMember, setTeamMember] = useState('');
  const [agreeToAdd, setAgreeToAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Users list for the Team Member dropdown
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && lead) {
      // Reset form states to defaults
      setFeedback('');
      setBant({ budget: null, authority: null, need: null, timeline: null });
      setFollowUpDate('');
      setAgreeToAdd(false);

      // Initialize with lead's current assigned user
      setTeamMember(lead.assignedToId || '');
      setCallStatus(initialCallStatus || (lead.callStatus && lead.callStatus !== 'Untouched' ? lead.callStatus : ''));
      setActiveTab(initialTab);
      fetchUsers();

      // Auto-fill current date and time
      const now = new Date();
      const tzoffset = now.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(now.getTime() - tzoffset)).toISOString().slice(0, 16);
      setDate(localISOTime);
    }
  }, [isOpen, lead, initialTab, initialCallStatus]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  if (!isOpen || !lead) return null;

  const handleBantClick = (key: keyof typeof bant, value: boolean) => {
    setBant(prev => ({
      ...prev,
      [key]: prev[key] === value ? null : value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const rawLeadId = lead.id?.startsWith('lead-call-') 
        ? lead.id.replace('lead-call-', '') 
        : (lead.id?.startsWith('act-call-') ? null : lead.id);

      // 1. Update the Lead properties if this is a real lead
      if (rawLeadId && !rawLeadId.startsWith('c-')) {
        const leadPayload = {
          callStatus: callStatus,
          notes: feedback || lead.notes,
          nextFollowUp: followUpDate ? new Date(followUpDate).toISOString() : lead.nextFollowUp,
          assignedToId: teamMember ? teamMember : (lead.assignedToId || null),
          customData: {
            ...lead.customData,
            bant: activeTab === 'reminder' ? bant : lead.customData?.bant,
          }
        };

        try {
          await api.put(`/leads/${rawLeadId}`, leadPayload, { headers });
        } catch (leadErr) {
          console.warn('Lead update skipped or failed:', leadErr);
        }
      }

      // 2. Create Activity or Task based on active tab
      const targetEntityId = rawLeadId || lead.id;
      if (activeTab === 'activity') {
        await api.post(`/leads/${targetEntityId}/activities`, {
          type: 'NOTE',
          title: callStatus,
          description: feedback,
          metadata: {
            activityDate: date ? new Date(date).toISOString() : null,
            followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
          }
        }, { headers }).catch(e => console.warn('Activity save warning:', e));
      } else if (activeTab === 'reminder') {
        if (followUpDate || date) {
          await api.post(`/leads/${targetEntityId}/tasks`, {
            title: callStatus ? `${callStatus} Reminder` : 'Follow-up Reminder',
            description: feedback,
            dueDate: new Date(followUpDate || date).toISOString(),
            assignedToId: teamMember || undefined,
          }, { headers }).catch(e => console.warn('Task save warning:', e));
        }

        // Log the reminder in Activities
        await api.post(`/leads/${targetEntityId}/activities`, {
          type: 'REMINDER',
          title: callStatus,
          description: feedback,
          metadata: {
            bant: bant,
            activityDate: date ? new Date(date).toISOString() : null,
            followUpDate: followUpDate ? new Date(followUpDate).toISOString() : null,
          }
        }, { headers }).catch(e => console.warn('Activity log warning:', e));
      }

      MySwal.fire({
        title: 'Saved!',
        text: 'Action saved successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      MySwal.fire('Error', 'Failed to save action.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // UI helpers
  const BantToggle = ({ label, bantKey }: { label: string, bantKey: keyof typeof bant }) => (
    <div className="flex flex-col items-center">
      <span className="text-[11px] font-bold text-gray-700 tracking-wider mb-1.5">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleBantClick(bantKey, true)}
          className={`w-8 h-8 rounded-[4px] border flex items-center justify-center transition-colors ${bant[bantKey] === true ? 'bg-[#3ca638] border-[#3ca638]' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
        >
          <Check className={`w-5 h-5 ${bant[bantKey] === true ? 'text-white' : 'text-gray-500'}`} strokeWidth={bant[bantKey] === true ? 3.5 : 2} />
        </button>
        <button
          onClick={() => handleBantClick(bantKey, false)}
          className={`w-8 h-8 rounded-[4px] border flex items-center justify-center transition-colors ${bant[bantKey] === false ? 'bg-[#ff1010] border-[#ff1010]' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}
        >
          <X className={`w-5 h-5 ${bant[bantKey] === false ? 'text-white' : 'text-gray-500'}`} strokeWidth={bant[bantKey] === false ? 3.5 : 2} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 pb-3">
          <h2 className="text-[22px] text-gray-700 mb-3">
            {activeTab === 'reminder' ? 'Set Reminder' : 'Set Activity'}
          </h2>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span>{lead.name}</span>
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{lead.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-5 py-3 space-y-3">

          {/* Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('reminder')}
              className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 font-medium text-[15px] transition-colors ${activeTab === 'reminder'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <Bell className="w-4 h-4" /> Set Reminder
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`flex-1 py-2 rounded-md flex items-center justify-center gap-2 font-medium text-[15px] transition-colors ${activeTab === 'activity'
                ? 'bg-[#1877f2] text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
            >
              <FileText className="w-4 h-4" /> Set Activity
            </button>
          </div>

          {/* Form Fields */}
          {activeTab === 'reminder' && (
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1">Call Status</label>
              <select
                value={callStatus}
                onChange={(e) => setCallStatus(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              >
                <option value="">Select Call Status</option>
                {CALL_STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">Please give your feedback</label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-gray-700"
            ></textarea>
          </div>

          {activeTab === 'reminder' && (
            <div className="flex items-end justify-between py-1">
              <BantToggle label="BUDGET" bantKey="budget" />
              <BantToggle label="AUTHORITY" bantKey="authority" />
              <BantToggle label="NEED" bantKey="need" />
              <BantToggle label="TIMELINE" bantKey="timeline" />
              <div className="pb-1.5 pl-1 cursor-pointer" onClick={() => {
                MySwal.fire({
                  title: <div className="text-left text-gray-700 font-medium text-lg border-b pb-3">BANT Technique Information</div>,
                  html: (
                    <div className="text-left text-sm mt-4 text-gray-700 font-sans">
                      <div className="flex items-center gap-2 font-bold mb-2 text-[15px]">
                        <div className="w-5 h-5 bg-[#10b981] rounded text-white flex items-center justify-center">
                          <Check className="w-3 h-3" strokeWidth={4} />
                        </div>
                        What is the BANT Technique?
                      </div>
                      <p className="mb-6 text-gray-600">
                        BANT is a lead qualification framework developed by IBM, used to assess the potential of a sales lead based on four key criteria:
                      </p>

                      <div className="grid grid-cols-4 gap-3 mb-6">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-full aspect-square rounded-lg bg-[#ef4444] border-[1.5px] border-black flex items-center justify-center shadow-sm">
                            <span className="text-[55px] font-bold text-white uppercase drop-shadow-md" style={{ WebkitTextStroke: '2px black' }}>B</span>
                          </div>
                          <span className="font-bold text-[12px] uppercase tracking-wide">BUDGET</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-full aspect-square rounded-lg bg-[#fbbf24] border-[1.5px] border-black flex items-center justify-center shadow-sm">
                            <span className="text-[55px] font-bold text-white uppercase drop-shadow-md" style={{ WebkitTextStroke: '2px black' }}>A</span>
                          </div>
                          <span className="font-bold text-[12px] uppercase tracking-wide">AUTHORITY</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-full aspect-square rounded-lg bg-[#3b82f6] border-[1.5px] border-black flex items-center justify-center shadow-sm">
                            <span className="text-[55px] font-bold text-white uppercase drop-shadow-md" style={{ WebkitTextStroke: '2px black' }}>N</span>
                          </div>
                          <span className="font-bold text-[12px] uppercase tracking-wide">NEEDS</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-full aspect-square rounded-lg bg-[#10b981] border-[1.5px] border-black flex items-center justify-center shadow-sm">
                            <span className="text-[55px] font-bold text-white uppercase drop-shadow-md" style={{ WebkitTextStroke: '2px black' }}>T</span>
                          </div>
                          <span className="font-bold text-[12px] uppercase tracking-wide">TIMELINE</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">💰 Budget – Does the lead have the money to buy your solution?</p>
                          <p className="text-gray-500">What is your budget for this project?</p>
                          <p className="text-gray-500">Have you allocated funds already?</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">👤 Authority – Is the person you are speaking to the decision-maker?</p>
                          <p className="text-gray-500">Who else is involved in the decision?</p>
                          <p className="text-gray-500">Are you the final approver?</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">📌 Need – Do they need your product or service to solve a problem?</p>
                          <p className="text-gray-500">What challenge are you trying to solve?</p>
                          <p className="text-gray-500">Why is this a priority now?</p>
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2 mb-1">⏳ Timeline – When do they plan to buy or implement the solution?</p>
                          <p className="text-gray-500">When do you want to get started?</p>
                          <p className="text-gray-500">Are there deadlines you are working with?</p>
                        </div>
                      </div>
                    </div>
                  ),
                  width: 550,
                  showConfirmButton: true,
                  confirmButtonText: 'OK',
                  buttonsStyling: false,
                  customClass: {
                    confirmButton: 'bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-6 py-2 rounded transition-colors',
                  }
                });
              }}>
                <Info className="w-[18px] h-[18px] text-[#3498db]" fill="currentColor" stroke="white" strokeWidth={1} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1">Date</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-[13px] tracking-tight focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-600 mb-1">Follow-up Date</label>
              <input
                type="datetime-local"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full border border-gray-300 rounded px-1.5 py-1 text-[13px] tracking-tight focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-gray-600 mb-1">Team Member</label>
            <select
              value={teamMember}
              onChange={(e) => setTeamMember(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-700"
            >
              <option value="">Select Team Member</option>
              {users.map((u: any) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          {activeTab === 'reminder' && (
            <div className="bg-[#e2f1f5] border border-[#bee2eb] rounded p-3 flex items-start mt-2">
              <input
                type="checkbox"
                id="agree"
                checked={agreeToAdd}
                onChange={(e) => setAgreeToAdd(e.target.checked)}
                className="mt-0.5 mr-2"
              />
              <label htmlFor="agree" className="text-sm text-gray-800 leading-tight">
                I agree. Add this lead to my account.
              </label>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 pt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[110px] h-9 px-5 rounded text-sm font-semibold shadow transition-colors tracking-wide flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                SAVING...
              </span>
            ) : (
              'SAVE'
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="bg-[#f0f0f0] text-gray-800 px-4 py-2 rounded text-sm font-bold shadow hover:bg-gray-200 transition-colors tracking-wide disabled:opacity-50"
          >
            CANCEL
          </button>
        </div>

      </div>
    </div>
  );
}
