import { Video, Phone, Mail, Bell, X, ExternalLink } from 'lucide-react';
import { Meeting } from '../types';

interface ViewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: Meeting | null;
  onSetReminder: (meeting: Meeting) => void;
}

export function ViewMeetingModal({ isOpen, onClose, meeting, onSetReminder }: ViewMeetingModalProps) {
  if (!isOpen || !meeting) return null;

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
      case 'Scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Rescheduled':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Cancelled':
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
            <Video className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-semibold text-gray-900">Meeting Details</h2>
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
              Meeting Title
            </span>
            <h3 className="text-base font-bold text-gray-900 mt-1">
              {meeting.title || 'Untitled Meeting'}
            </h3>
          </div>

          {/* Client & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Client
              </span>
              <p className="text-gray-900 font-medium mt-1">{meeting.clientName || '-'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Company
              </span>
              <p className="text-gray-900 font-medium mt-1">{meeting.clientCompany || '-'}</p>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Email
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-900 truncate">{meeting.clientEmail || '-'}</span>
                {meeting.clientEmail && (
                  <a href={`mailto:${meeting.clientEmail}`} className="text-indigo-600 hover:text-indigo-700" title="Email">
                    <Mail className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Phone
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-gray-900 font-medium">{meeting.clientPhone || '-'}</span>
                {meeting.clientPhone && (
                  <a href={`tel:${meeting.clientPhone}`} className="text-indigo-600 hover:text-indigo-700" title="Call">
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Platform, Duration, Status */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Platform
              </span>
              <p className="text-gray-900 font-medium mt-1">{meeting.type || 'Google Meet'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Duration
              </span>
              <p className="font-mono text-gray-900 font-medium mt-1">{meeting.duration || '30m'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Status
              </span>
              <div className="mt-1">
                <span className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusBadge(meeting.status)}`}>
                  {meeting.status || 'Scheduled'}
                </span>
              </div>
            </div>
          </div>

          {/* Date & Host */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Date & Time
              </span>
              <p className="text-gray-900 font-medium mt-1 text-xs">
                {formatDate(meeting.dateTime || meeting.date, meeting.time)}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Host / Organizer
              </span>
              <p className="text-gray-900 font-medium mt-1 truncate">{meeting.host || 'Unassigned'}</p>
            </div>
          </div>

          {/* Meeting Link */}
          {meeting.meetingLink && (
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Meeting Link
              </span>
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium break-all"
              >
                <Video className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{meeting.meetingLink}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Agenda & Notes */}
          {meeting.agenda && (
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                Agenda & Discussion
              </span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs leading-relaxed whitespace-pre-wrap">
                {meeting.agenda}
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
              onSetReminder(meeting);
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
