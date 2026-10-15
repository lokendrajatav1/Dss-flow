import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskItem, TASK_PRIORITIES, TASK_STATUSES } from '../types';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const getNowLocalDateTime = () => {
  const now = new Date();
  const tzoffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tzoffset).toISOString().slice(0, 16);
};

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskItem) => void;
  availableMembers: any[];
}

export function AddTaskModal({ isOpen, onClose, onSave, availableMembers }: AddTaskModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    companyName: '',
    dueDateTime: getNowLocalDateTime(),
    status: 'Pending',
    priority: 'Medium',
    assignedTo: '',
    description: '',
    phone: ''
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setFormData({
        title: '',
        clientName: '',
        companyName: '',
        dueDateTime: getNowLocalDateTime(),
        status: 'Pending',
        priority: 'Medium',
        assignedTo: availableMembers[0]?.name || '',
        description: '',
        phone: ''
      });
    }
  }, [isOpen, availableMembers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      MySwal.fire('Error', 'Please fill task title', 'error');
      return;
    }

    setIsLoading(true);

    const dt = formData.dueDateTime || getNowLocalDateTime();
    const datePart = dt.split('T')[0];
    const timePart = dt.split('T')[1] || '14:00';

    const newTask: TaskItem = {
      id: `t-${Date.now()}`,
      title: formData.title,
      clientName: formData.clientName || 'General Client',
      companyName: formData.companyName || 'Organization',
      dueDate: datePart,
      dueTime: timePart,
      dueDateTime: dt,
      status: formData.status,
      priority: formData.priority,
      assignedTo: formData.assignedTo || (availableMembers[0]?.name || ''),
      description: formData.description,
      phone: formData.phone,
      createdAt: new Date().toISOString()
    };

    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      await onSave(newTask);
      onClose();
      MySwal.fire({ title: 'Success!', text: 'Task created successfully', icon: 'success', timer: 1500, showConfirmButton: false });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
          <button onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Task Title *</label>
              <Input 
                required 
                placeholder="e.g. Follow up with client regarding proposal" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Client Name</label>
                <Input 
                  placeholder="Enter Client Name" 
                  value={formData.clientName} 
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })} 
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
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
                <Input 
                  placeholder="+91 98765 43210" 
                  value={formData.phone} 
                  onChange={e => setFormData({ ...formData, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                <input 
                  type="datetime-local" 
                  required 
                  value={formData.dueDateTime} 
                  onChange={e => setFormData({ ...formData, dueDateTime: e.target.value })} 
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  {TASK_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white cursor-pointer"
                >
                  {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Assignee / Team Member</label>
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">Task Description & Notes</label>
              <textarea
                rows={2}
                placeholder="Description, notes, checklist items..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] h-10 px-5 rounded-md font-medium text-sm flex items-center justify-center gap-2"
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
                'Save Task'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
