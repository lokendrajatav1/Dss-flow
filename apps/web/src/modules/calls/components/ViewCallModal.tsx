import { Link } from 'react-router-dom';
import { Phone, Mail, Bell, X, PhoneCall, Volume2, User, ExternalLink } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white rounded-xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col">

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
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-base font-bold text-gray-900">
                {call.name || 'Unknown Contact'}
              </h3>
              {call.leadId && (
                <Link
                  to={`/clients/${call.leadId}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
                  title="Open 360° Profile"
                >
                  <User className="w-3 h-3" />
                  <span>360° Profile</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </Link>
              )}
            </div>
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

          {/* Call Type & Call Result */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Call Type
              </span>
              <p className="text-gray-900 font-medium mt-1">{call.direction || 'Outbound'}</p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                Call Result
              </span>
              <div className="mt-1">
                <span className="inline-block px-2.5 py-0.5 text-xs font-medium rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {call.outcome || '-None-'}
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

          {/* Call Recording Audio Player if exists */}
          {call.recordingUrl && (
            <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  Call Recording Playback
                </span>
                <a
                  href={call.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Download Audio
                </a>
              </div>
              <audio controls className="w-full h-8" src={call.recordingUrl}>
                Your browser does not support the audio element.
              </audio>
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

          <div className="flex items-center gap-2">
            {call.leadId && (
              <Link
                to={`/clients/${call.leadId}`}
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
