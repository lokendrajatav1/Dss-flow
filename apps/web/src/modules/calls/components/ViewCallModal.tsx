import { Phone, Mail, Bell, X, PhoneCall } from 'lucide-react';
import { CallItem } from '../types';

interface ViewCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: CallItem | null;
  onSetReminder: (call: CallItem) => void;
}

export function ViewCallModal({ isOpen, onClose, call, onSetReminder }: ViewCallModalProps) {
  if (!isOpen || !call) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Connected':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Busy':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'No Answer':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl border border-gray-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <PhoneCall className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Call Log Details</h2>
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
          
          {/* Contact Details */}
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Contact & Organization
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              {call.name || 'Unknown Contact'}
            </h3>
            {call.companyName && (
              <p className="text-sm text-gray-500 mt-0.5">{call.companyName}</p>
            )}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Phone
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-gray-900 font-medium">{call.phone || '-'}</span>
                {call.phone && (
                  <a href={`tel:${call.phone}`} className="text-indigo-600 hover:text-indigo-700" title="Call">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Email
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-900 truncate">{call.email || '-'}</span>
                {call.email && (
                  <a href={`mailto:${call.email}`} className="text-indigo-600 hover:text-indigo-700" title="Email">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Direction, Status, Outcome */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Direction
              </span>
              <p className="text-gray-900 font-medium mt-1">{call.direction || 'Outbound'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Status
              </span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(call.callStatus)}`}>
                  {call.callStatus || 'Unknown'}
                </span>
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Outcome
              </span>
              <div className="mt-1">
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {call.outcome || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Duration, Agent, Call Date */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Duration
              </span>
              <p className="font-mono text-gray-900 font-medium mt-1">{call.duration || '00:00'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Agent
              </span>
              <p className="text-gray-900 font-medium mt-1 truncate">{call.assignedTo || '-'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Call Date
              </span>
              <p className="text-gray-900 font-medium mt-1 text-xs">
                {formatDate(call.dateTime || call.createdAt)}
              </p>
            </div>
          </div>

          {/* Follow-up if exists */}
          {call.nextFollowUp && (
            <div>
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                Next Follow-Up
              </span>
              <p className="text-gray-900 font-medium mt-1">{call.nextFollowUp}</p>
            </div>
          )}

          {/* Notes if exists */}
          {call.notes && (
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Call Notes
              </span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs leading-relaxed whitespace-pre-wrap">
                {call.notes}
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
              onSetReminder(call);
            }}
            className="inline-flex items-center gap-2 text-xs font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3.5 py-2 rounded-md transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-600" />
            <span>Set Reminder</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-700 font-medium text-xs px-4 py-2 rounded-md transition-colors border border-gray-300 shadow-2xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
