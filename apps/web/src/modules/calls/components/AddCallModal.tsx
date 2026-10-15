import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CALL_STATUSES } from '@/lib/constants';
import { CallItem, CALL_DIRECTIONS, CALL_OUTCOMES } from '../types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getNowLocalDateTime = () => {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
};

interface AddCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newCall: CallItem) => void;
  availableMembers: any[];
}

export function AddCallModal({ isOpen, onClose, onSave, availableMembers }: AddCallModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    phone: '',
    email: '',
    direction: 'Outbound',
    callStatus: 'Connected',
    outcome: 'Interested',
    dateTime: getNowLocalDateTime(),
    durationMinutes: '05',
    durationSeconds: '00',
    assignedTo: '',
    notes: '',
    priority: 'Normal'
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setFormData({
        name: '',
        companyName: '',
        phone: '',
        email: '',
        direction: 'Outbound',
        callStatus: 'Connected',
        outcome: 'Interested',
        dateTime: getNowLocalDateTime(),
        durationMinutes: '05',
        durationSeconds: '00',
        assignedTo: availableMembers[0]?.name || '',
        notes: '',
        priority: 'Normal'
      });
    }
  }, [isOpen, availableMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      MySwal.fire('Error', 'Please fill required fields (Name, Phone)', 'error');
      return;
    }

    setIsLoading(true);

    const mins = parseInt(formData.durationMinutes) || 0;
    const secs = parseInt(formData.durationSeconds) || 0;
    const formattedDuration = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const dt = formData.dateTime || getNowLocalDateTime();

    const newCall: CallItem = {
      id: `c-${Date.now()}`,
      name: formData.name,
      companyName: formData.companyName || 'Direct Contact',
      phone: formData.phone,
      email: formData.email || '',
      direction: formData.direction,
      callStatus: formData.callStatus,
      outcome: formData.outcome,
      duration: formattedDuration,
      assignedTo: formData.assignedTo || (availableMembers[0]?.name || ''),
      notes: formData.notes,
      priority: formData.priority,
      createdAt: new Date().toISOString(),
      dateTime: dt
    };

    // Clean loading state UX
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      await onSave(newCall);
      onClose();
      MySwal.fire({ title: 'Success!', text: 'Call activity saved successfully', icon: 'success', timer: 1500, showConfirmButton: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">Add New Call Log</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Contact Name *</label>
                <Input 
                  required 
                  placeholder="Enter Contact Name" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                <Input 
                  placeholder="Company Name" 
                  value={formData.companyName} 
                  onChange={e => setFormData({ ...formData, companyName: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number *</label>
                <Input 
                  required 
                  placeholder="+91 98765 43210" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="contact@company.com" 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Direction</label>
                <select
                  value={formData.direction}
                  onChange={e => setFormData({ ...formData, direction: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  {CALL_DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Call Status</label>
                <select
                  value={formData.callStatus}
                  onChange={e => setFormData({ ...formData, callStatus: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  {CALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Call Outcome</label>
                <select
                  value={formData.outcome}
                  onChange={e => setFormData({ ...formData, outcome: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  {CALL_OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
                <label className="block text-sm font-medium text-gray-900 mb-1">Duration (Min : Sec)</label>
                <div className="flex items-center gap-1.5">
                  <Input 
                    type="number" 
                    min="0" 
                    placeholder="05" 
                    value={formData.durationMinutes} 
                    onChange={e => setFormData({ ...formData, durationMinutes: e.target.value })} 
                  />
                  <span className="text-gray-400 font-bold">:</span>
                  <Input 
                    type="number" 
                    min="0" 
                    max="59" 
                    placeholder="00" 
                    value={formData.durationSeconds} 
                    onChange={e => setFormData({ ...formData, durationSeconds: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Agent / Team Member</label>
              <select
                value={formData.assignedTo}
                onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-900 mb-1">Call Summary & Notes</label>
              <textarea
                rows={2}
                placeholder="Discussion points, objections, next action items..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
                'Save Call Log'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
