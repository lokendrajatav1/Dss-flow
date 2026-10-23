import { Link } from 'react-router-dom';
import { CheckSquare, Phone, Bell, X, User, ExternalLink } from 'lucide-react';
import { TaskItem } from '../types';

interface ViewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskItem | null;
  onSetReminder: (task: TaskItem) => void;
}

export function ViewTaskModal({ isOpen, onClose, task, onSetReminder }: ViewTaskModalProps) {
  if (!isOpen || !task) return null;

  const formatDate = (dateString?: string, timeStr?: string) => {
    if (!dateString) return '-';
    try {
      if (dateString.includes('T')) {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
          d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      const d = new Date(dateString);
      const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return timeStr ? `${formatted} ${timeStr}` : formatted;
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Low':
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Task Details</h2>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-sm max-h-[75vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Task Title
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              {task.title || 'Untitled Task'}
            </h3>
          </div>

          {/* Client & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Client
              </span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-900 font-medium">{task.clientName || '-'}</p>
                {task.leadId && (
                  <Link
                    to={`/clients/${task.leadId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
                    title="Open 360° Profile"
                  >
                    <User className="w-3 h-3" />
                    <span>360° Profile</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                )}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Company
              </span>
              <p className="text-gray-900 font-medium mt-1">{task.companyName || '-'}</p>
            </div>
          </div>

          {/* Status, Priority, Due Date */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Status
              </span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(task.status)}`}>
                  {task.status || 'Pending'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Priority
              </span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getPriorityBadge(task.priority)}`}>
                  {task.priority || 'Normal'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Due Date
              </span>
              <p className="text-gray-900 font-medium mt-1 text-xs">
                {formatDate(task.dueDateTime || task.dueDate, task.dueTime)}
              </p>
            </div>
          </div>

          {/* Assignee & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Assignee
              </span>
              <p className="text-gray-900 font-medium mt-1 truncate">{task.assignedTo || 'Unassigned'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Phone
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-gray-900 font-medium">{task.phone || '-'}</span>
                {task.phone && (
                  <a href={`tel:${task.phone}`} className="text-indigo-600 hover:text-indigo-700" title="Call">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Follow-up if exists */}
          {task.nextFollowUp && (
            <div>
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                Next Follow-Up
              </span>
              <p className="text-gray-900 font-medium mt-1">{task.nextFollowUp}</p>
            </div>
          )}

          {/* Description & Notes */}
          {task.description && (
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Description & Notes
              </span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-200 bg-gray-50/50">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSetReminder(task);
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-md transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Set Reminder</span>
          </button>
          
          <div className="flex items-center gap-2">
            {task.leadId && (
              <Link
                to={`/clients/${task.leadId}`}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3.5 py-2 rounded-md transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>Full 360° Profile</span>
              </Link>
            )}
            <button
              type="button"
              onClick={onClose}
              className="bg-white hover:bg-gray-100 text-gray-700 font-medium text-xs px-4 py-2 rounded-md transition-colors border border-gray-300"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
