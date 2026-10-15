import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportCase, CasePriority, CaseStatus } from '../types';

interface CaseDrawerProps {
  selectedCase: SupportCase | null;
  onClose: () => void;
  onEdit: (c: SupportCase) => void;
  onQuickUpdate: (id: string, payload: Partial<SupportCase>) => void;
  onAddComment: (caseId: string, comment: string, isInternal: boolean) => Promise<void>;
  priorities: CasePriority[];
  statuses: CaseStatus[];
  getPriorityBadge: (p: CasePriority) => string;
  getStatusBadge: (s: CaseStatus) => string;
  formatDate: (d: string) => string;
}

export const CaseDrawer: React.FC<CaseDrawerProps> = ({
  selectedCase,
  onClose,
  onEdit,
  onQuickUpdate,
  onAddComment,
  priorities,
  statuses,
  getPriorityBadge,
  getStatusBadge,
  formatDate,
}) => {
  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  if (!selectedCase) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await onAddComment(selectedCase.id, newComment.trim(), isInternalComment);
      setNewComment('');
    } finally {
      setSubmittingComment(false);
    }
  };

  return createPortal(
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9980] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-[9985] border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {selectedCase.caseNumber}
              </span>
              <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${getStatusBadge(selectedCase.status)}`}>
                {selectedCase.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1 line-clamp-1">{selectedCase.subject}</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit(selectedCase)}
              className="text-xs h-8 px-3"
            >
              Edit
            </Button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-gray-50/40">
          {/* Customer & Assignment Meta */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-white rounded-xl border border-gray-200 shadow-sm text-xs">
            <div>
              <span className="text-gray-500 block mb-0.5">Customer</span>
              <strong className="text-gray-900 text-sm block">{selectedCase.customerName}</strong>
              <div className="text-gray-500 mt-0.5">{selectedCase.customerCompany || 'No company'}</div>
              <div className="text-indigo-600 truncate mt-0.5">{selectedCase.customerEmail}</div>
            </div>
            <div>
              <span className="text-gray-500 block mb-0.5">Assigned To</span>
              <strong className="text-gray-900 text-sm block">{selectedCase.assignedTo}</strong>
              <div className="text-gray-500 mt-0.5">Category: {selectedCase.category}</div>
              <div className="text-gray-400 mt-0.5">Created: {formatDate(selectedCase.createdAt)}</div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-4 text-xs bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Status:</span>
              <select
                value={selectedCase.status}
                onChange={(e) => onQuickUpdate(selectedCase.id, { status: e.target.value as CaseStatus })}
                className={`text-xs border rounded-md px-2.5 py-1 font-medium bg-white outline-none ${getStatusBadge(selectedCase.status)}`}
              >
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Priority:</span>
              <select
                value={selectedCase.priority}
                onChange={(e) => onQuickUpdate(selectedCase.id, { priority: e.target.value as CasePriority })}
                className={`text-xs border rounded-md px-2.5 py-1 font-medium bg-white outline-none ${getPriorityBadge(selectedCase.priority)}`}
              >
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Issue Description */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Issue Description</h4>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
              {selectedCase.description || 'No description provided.'}
            </div>
          </div>

          {/* Resolution if present */}
          {selectedCase.resolution && (
            <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-sm">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Resolution Provided</h4>
              <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-xs text-emerald-900 leading-relaxed whitespace-pre-wrap">
                {selectedCase.resolution}
              </div>
            </div>
          )}

          {/* Case Activity & Comments Thread */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Communication Thread ({selectedCase.comments?.length || 0})
              </h4>
            </div>

            <div className="space-y-3">
              {selectedCase.comments && selectedCase.comments.length > 0 ? (
                selectedCase.comments.map((comm) => (
                  <div 
                    key={comm.id} 
                    className={`p-3 rounded-lg border text-xs ${
                      comm.isInternal 
                        ? 'bg-amber-50/70 border-amber-200' 
                        : comm.role === 'Customer'
                          ? 'bg-gray-50 border-gray-200'
                          : 'bg-indigo-50/50 border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-gray-800">
                        {comm.author}
                        <span className="ml-1.5 text-[11px] font-normal text-gray-500">
                          ({comm.role}{comm.isInternal ? ' • Internal Note' : ''})
                        </span>
                      </span>
                      <span className="text-[11px] text-gray-400">{formatDate(comm.createdAt)}</span>
                    </div>
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{comm.content}</div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">No replies or activity logged yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer: Add Reply */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white space-y-2 flex-shrink-0 z-10">
          <textarea
            rows={2}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={isInternalComment ? "Type internal team note..." : "Type reply to customer..."}
            className="w-full text-xs border border-gray-300 rounded-lg p-2.5 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalComment}
                onChange={(e) => setIsInternalComment(e.target.checked)}
                className="rounded text-amber-600 focus:ring-0"
              />
              <span>Internal note (staff only)</span>
            </label>
            <Button 
              type="submit" 
              disabled={submittingComment || !newComment.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 px-3 text-xs gap-1.5 font-medium"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </Button>
          </div>
        </form>
      </div>
    </>,
    document.body
  );
};
