import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MoreVertical, Edit2, Mail, Building, MapPin, Calendar, MessageSquare, Plus, Copy, Check, Database, Bell, PhoneCall, Activity, FileText } from 'lucide-react';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';
import { TbWorld } from 'react-icons/tb';
import api from '@/lib/api';
import { EditLeadModal } from '../components/EditLeadModal';
import { SetReminderModal } from '../components/SetReminderModal';
import { ActivityTab } from '../components/tabs/ActivityTab';
import { DealsTab } from '../components/tabs/DealsTab';
import { ReminderTab } from '../components/tabs/ReminderTab';
import { CallRecordingTab } from '../components/tabs/CallRecordingTab';
import { WAActivityTab } from '../components/tabs/WAActivityTab';
import { FilesTab } from '../components/tabs/FilesTab';
import { CALL_STATUSES, LEAD_SOURCES } from '@/lib/constants';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';



export function ClientDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Activity');
  const [groups, setGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'reminder' | 'activity'>('reminder');
  const [pendingStatus, setPendingStatus] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCallStatusChange = (status: string) => {
    setPendingStatus(status);
    setIsReminderOpen(true);
  };

  const handleFieldChange = async (field: string, value: string, label: string) => {
    const result = await MySwal.fire({
      title: `Update ${label}?`,
      text: `Are you sure you want to change the ${label.toLowerCase()}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, update it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.put(`/leads/${lead.id}`, { [field]: value || null }, { headers: { Authorization: `Bearer ${token}` } });
        await fetchLead();
        MySwal.fire('Updated!', `${label} has been updated.`, 'success');
      } catch (err) {
        console.error(`Failed to update ${field}`, err);
        MySwal.fire('Error', 'Failed to update field.', 'error');
      }
    }
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(lead.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  useEffect(() => {
    fetchLead();
    fetchDropdownData();
  }, [id]);

  const fetchDropdownData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      const [groupsRes, usersRes] = await Promise.all([
        api.get('/leads/groups', { headers }),
        api.get('/users', { headers })
      ]);
      setGroups(groupsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Failed to fetch dropdown data', err);
    }
  };

  const fetchLead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setLead(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (leadId: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/leads/${leadId}`, data, { headers: { Authorization: `Bearer ${token}` } });
      fetchLead(); // refresh lead
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading lead details...</div>;
  if (!lead) return <div className="p-8 text-center text-red-500">Lead not found</div>;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#f8fafc] overflow-hidden -m-4 sm:-m-6 lg:-m-8">
      {/* Left Sidebar */}
      <div className="w-[320px] bg-white border-r border-gray-200 flex flex-col">
        {/* Header Section */}
        <div className="p-5 flex flex-col items-center border-b border-gray-100 relative">
          <button onClick={() => navigate(-1)} className="absolute left-4 top-4 p-1.5 bg-gray-50 rounded border border-gray-100 shadow-sm hover:bg-gray-100 text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button className="absolute right-4 top-4 p-1.5 flex items-center text-blue-600 font-medium text-sm hover:bg-blue-50 rounded">
            Action <MoreVertical className="w-4 h-4 ml-1" />
          </button>

          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 text-2xl font-bold mt-4 mb-3 overflow-hidden">
            {lead.name ? getInitials(lead.name) : 'U'}
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-4">{lead.name}</h2>

          <div className="flex gap-2 justify-center items-center">
            {/* Edit */}
            <div className="relative group">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105"
                style={{ background: '#6366f1', borderColor: '#4f46e5', color: '#ffffff' }}
              >
                <Edit2 className="w-4 h-4 text-white" />
              </button>
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gray-800 text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap flex flex-col items-center">
                Edit
                <span className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </span>
            </div>

            {/* Email */}
            {lead.email && (
              <div className="relative group">
                <Link
                  to={`/email?composeTo=${lead.email}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105"
                  style={{ background: '#ef4444', borderColor: '#dc2626', color: '#ffffff' }}
                >
                  <Mail className="w-4 h-4 text-white" />
                </Link>
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gray-800 text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap flex flex-col items-center">
                  Mail
                  <span className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </span>
              </div>
            )}

            {/* Phone + WhatsApp */}
            {(lead.whatsappNumber || lead.phone) && (
              <>
                {lead.phone && (
                <div className="relative group">
                  <a
                    href={`tel:${lead.phone}`}
                    className="w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105"
                    style={{ background: '#3b82f6', borderColor: '#2563eb', color: '#ffffff' }}
                  >
                    <FaPhone size={14} style={{ transform: 'scaleX(-1)' }} />
                  </a>
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gray-800 text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap flex flex-col items-center">
                    Call
                    <span className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </span>
                </div>
                )}
                <div className="relative group">
                  <a
                    href={`https://wa.me/${String(lead.whatsappNumber || lead.phone).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105"
                    style={{ background: '#25D366', borderColor: '#1ebe5d', color: '#ffffff' }}
                  >
                    <FaWhatsapp size={18} />
                  </a>
                  <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gray-800 text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap flex flex-col items-center">
                    WhatsApp
                    <span className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                  </span>
                </div>
              </>
            )}

            {/* Website */}
            {lead.websiteUrl && (
              <div className="relative group">
                <a
                  href={lead.websiteUrl.startsWith('http') ? lead.websiteUrl : `https://${lead.websiteUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-all hover:scale-105"
                  style={{ background: '#0ea5e9', borderColor: '#0284c7', color: '#ffffff' }}
                >
                  <TbWorld size={16} />
                </a>
                <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-gray-800 text-white text-[11px] font-semibold px-2 py-1 rounded-md whitespace-nowrap flex flex-col items-center">
                  Website
                  <span className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                </span>
              </div>
            )}
          </div>

        </div>

        {/* About Contact */}
        <div className="p-5 flex-1 overflow-y-auto">
          <h3 className="text-[15px] font-bold text-gray-900 mb-4">About Contact</h3>

          <div className="space-y-3 mb-6">
            {lead.companyName && (
              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/80 flex items-start gap-3">
                <Building className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1">Company Name</div>
                  <div className="text-[13px] font-normal text-gray-900">{lead.companyName}</div>
                </div>
              </div>
            )}

            {lead.email && (
              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/80 flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1">Email</div>
                  <div className="text-[13px] font-normal text-gray-900">{lead.email}</div>
                </div>
              </div>
            )}

            {lead.phone && (
              <div className="group bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/80 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <FaPhone className="w-4 h-4 text-gray-500 mt-0.5" style={{ transform: 'scaleX(-1)' }} />
                  <div>
                    <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1">Phone Number</div>
                    <div className="text-[13px] font-normal text-gray-900">{lead.phone}</div>
                  </div>
                </div>
                <button onClick={handleCopyPhone} title="Copy" className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700">
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {(lead.address || lead.city || lead.state) && (
              <div className="bg-gray-50/50 p-3.5 rounded-xl border border-gray-100/80 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <div className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-1">Address</div>
                  <div className="text-[13px] font-normal text-gray-900">{lead.address || lead.city || lead.state}</div>
                </div>
              </div>
            )}

          </div>



          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Call Status</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
                value={lead.callStatus}
                onChange={e => handleCallStatusChange(e.target.value)}
              >
                {CALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Group</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
                value={lead.groupId || ''}
                onChange={e => handleFieldChange('groupId', e.target.value, 'Group')}
              >
                <option value="">None</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Lead Source</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
                value={lead.source || 'Select'}
                onChange={e => handleFieldChange('source', e.target.value, 'Lead Source')}
              >
                <option value="Select">Select</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <label className="block text-[13px] font-semibold text-gray-600 mb-1.5">Transfer Lead</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 bg-white outline-none focus:outline-none focus:ring-0 focus:border-gray-300 transition-colors cursor-pointer"
                value={lead.assignedToId || ''}
                onChange={e => handleFieldChange('assignedToId', e.target.value, 'Transfer Lead')}
              >
                <option value="">Select Team Member</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <button className="w-full border border-gray-200 bg-gray-50/50 hover:bg-gray-100 rounded-xl p-3 flex items-center justify-between transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center"><Edit2 className="w-4 h-4 text-gray-600" /></div>
                <span className="font-bold text-gray-900 text-[15px]">Private Notes</span>
              </div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 shadow-sm"><Edit2 className="w-4 h-4" /></div>
            </button>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col bg-gray-50/50">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 pt-2 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-6">
            {['Activity', 'Deals (0)', 'Reminder', 'Call Recording', 'WA Activity', 'Files'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 pb-2 font-medium text-[13px] border-b-2 transition-colors ${activeTab === tab ? 'text-indigo-600 border-indigo-600' : 'text-gray-500 border-transparent hover:text-gray-700'}`}
              >
                {tab === 'Activity' && <Calendar className="w-4 h-4" />}
                {tab === 'Deals (0)' && <Database className="w-4 h-4" />}
                {tab === 'Reminder' && <Bell className="w-4 h-4" />}
                {tab === 'Call Recording' && <PhoneCall className="w-4 h-4" />}
                {tab === 'WA Activity' && <Activity className="w-4 h-4" />}
                {tab === 'Files' && <FileText className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pb-2">
            <div className="relative group">
              <button className="w-8 h-8 rounded-md bg-green-50 text-green-600 flex items-center justify-center border border-green-200 hover:bg-green-100">
                <FaWhatsapp className="w-4 h-4" />
              </button>
              <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#3b3b3b] text-white text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap flex items-center shadow-sm z-10">
                WhatsApp Live Chat
                <span className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#3b3b3b] absolute -right-[5px] top-1/2 -translate-y-1/2" />
              </span>
            </div>
            
            {/* Dynamic Tab Actions */}
            {(() => {
              let tooltip = '';
              if (activeTab === 'Activity') tooltip = 'Add Activity';
              else if (activeTab === 'Deals (0)') tooltip = 'Add Deal';
              else if (activeTab === 'Reminder') tooltip = 'Add Reminder';
              else if (activeTab === 'Files') tooltip = 'Upload File';
              
              if (!tooltip) return null;

              return (
                <div className="relative group">
                  <button 
                    onClick={() => {
                      setModalInitialTab('reminder');
                      setIsReminderOpen(true);
                    }}
                    className="w-8 h-8 rounded-md bg-gray-50 text-gray-600 flex items-center justify-center border border-gray-200 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-[#3b3b3b] text-white text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap flex items-center shadow-sm z-10">
                    {tooltip}
                    <span className="w-0 h-0 border-t-[5px] border-b-[5px] border-l-[6px] border-t-transparent border-b-transparent border-l-[#3b3b3b] absolute -right-[5px] top-1/2 -translate-y-1/2" />
                  </span>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Timeline Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'Activity' && <ActivityTab lead={lead} refreshTrigger={refreshTrigger} />}
          {activeTab === 'Deals (0)' && <DealsTab />}
          {activeTab === 'Reminder' && <ReminderTab lead={lead} />}
          {activeTab === 'Call Recording' && <CallRecordingTab />}
          {activeTab === 'WA Activity' && <WAActivityTab />}
          {activeTab === 'Files' && <FilesTab lead={lead} />}
        </div>
      </div>

      {isEditModalOpen && (
        <EditLeadModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
          lead={lead}
        />
      )}

      <SetReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        lead={lead}
        onSaved={() => {
          fetchLead();
          setRefreshTrigger(prev => prev + 1);
        }}
        initialCallStatus={pendingStatus}
        initialTab={modalInitialTab}
      />
    </div>
  );
}
