import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Meeting, MEETING_PLATFORMS } from '../types';
import { EntityLookupInput, EntityLookupItem } from '@/components/common/EntityLookupInput';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getNowLocalDateTime = () => {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
};

interface AddMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meeting: Meeting) => void;
  availableMembers: any[];
}

export function AddMeetingModal({ isOpen, onClose, onSave, availableMembers }: AddMeetingModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<EntityLookupItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    dateTime: getNowLocalDateTime(),
    duration: '30 mins',
    type: 'Google Meet',
    meetingLink: '',
    host: '',
    status: 'Scheduled',
    priority: 'Normal',
    agenda: ''
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setSelectedEntity(null);
      setFormData({
        title: '',
        clientName: '',
        clientCompany: '',
        clientEmail: '',
        clientPhone: '',
        dateTime: getNowLocalDateTime(),
        duration: '30 mins',
        type: 'Google Meet',
        meetingLink: '',
        host: availableMembers[0]?.name || '',
        status: 'Scheduled',
        priority: 'Normal',
        agenda: ''
      });
    }
  }, [isOpen, availableMembers]);

  const handleSelectEntity = (item: EntityLookupItem | null) => {
    setSelectedEntity(item);
    if (item) {
      setFormData(prev => ({
        ...prev,
        clientName: item.name,
        clientCompany: item.companyName || '',
        clientPhone: item.phone || '',
        clientEmail: item.email || '',
        host: (typeof item.assignedTo === 'string' ? item.assignedTo : item.assignedTo?.name) || prev.host
      }));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.clientName.trim()) {
      MySwal.fire('Error', 'Please fill required fields (Title, Client Name)', 'error');
      return;
    }

    setIsLoading(true);

    const dt = formData.dateTime || getNowLocalDateTime();
    const datePart = dt.split('T')[0];
    const timePart = dt.split('T')[1] || '11:00';

    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      title: formData.title,
      clientName: formData.clientName,
      clientCompany: formData.clientCompany || 'Direct Client',
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone,
      date: datePart,
      time: timePart,
      dateTime: dt,
      duration: formData.duration,
      type: formData.type,
      meetingLink: formData.meetingLink || (formData.type === 'Google Meet' ? 'https://meet.google.com/new' : ''),
      host: formData.host || (availableMembers[0]?.name || ''),
      status: formData.status,
      priority: formData.priority,
      agenda: formData.agenda,
      createdAt: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      await onSave(newMeeting);
      onClose();
      MySwal.fire({ title: 'Success!', text: 'Meeting scheduled successfully', icon: 'success', timer: 1500, showConfirmButton: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Meeting</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Meeting Title *</label>
              <Input 
                required 
                placeholder="e.g. Product Demo & Discussion" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>

            {/* Related Entity Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1.5">
                Related To
              </label>
              <EntityLookupInput
                onSelect={handleSelectEntity}
                selectedItem={selectedEntity}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Client Name *</label>
                <Input 
                  required 
                  placeholder="Enter Client Name" 
                  value={formData.clientName} 
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                <Input 
                  placeholder="Company Name" 
                  value={formData.clientCompany} 
                  onChange={e => setFormData({ ...formData, clientCompany: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
                <Input 
                  placeholder="+91 98765 43210" 
                  value={formData.clientPhone} 
                  onChange={e => setFormData({ ...formData, clientPhone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="client@company.com" 
                  value={formData.clientEmail} 
                  onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Single combined Date field */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.dateTime} 
                  onChange={e => setFormData({ ...formData, dateTime: e.target.value })} 
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Platform</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  {MEETING_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Duration</label>
                <select
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  <option value="15 mins">15 mins</option>
                  <option value="30 mins">30 mins</option>
                  <option value="45 mins">45 mins</option>
                  <option value="60 mins">60 mins</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Host / Team Member</label>
                <select
                  value={formData.host}
                  onChange={e => setFormData({ ...formData, host: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  <option value="">Select Team Member</option>
                  {availableMembers.map((m: any) => (
                    <option key={m.id} value={m.name || m.email}>
                      {m.name || m.email} {m.role?.name ? `(${m.role.name})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Meeting Link (URL)</label>
              <Input 
                placeholder="https://meet.google.com/..." 
                value={formData.meetingLink} 
                onChange={e => setFormData({ ...formData, meetingLink: e.target.value })} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Agenda & Notes</label>
              <textarea
                rows={2}
                placeholder="Meeting agenda, discussion topics..."
                value={formData.agenda}
                onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                className="w-full p-2.5 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100 bg-white rounded-b-2xl">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="px-4 h-10 rounded-md text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px] h-10 px-5 rounded-md font-medium text-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Meeting'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
