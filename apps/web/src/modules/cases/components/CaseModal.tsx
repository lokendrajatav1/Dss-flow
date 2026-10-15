import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportCase, CasePriority, CaseStatus, CaseCategory } from '../types';

interface CaseModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
  categories: CaseCategory[];
  priorities: CasePriority[];
  statuses: CaseStatus[];
}

export const CaseModal: React.FC<CaseModalProps> = ({
  isOpen,
  isEditMode,
  onClose,
  onSubmit,
  formData,
  setFormData,
  submitting,
  categories,
  priorities,
  statuses,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? `Edit Case: ${formData.caseNumber || formData.subject}` : 'Create Support Case'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Subject / Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. WhatsApp webhook failing on campaign replies"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, customerName: e.target.value }))}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Customer Email</label>
                <input
                  type="email"
                  value={formData.customerEmail || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="rajesh@company.com"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={formData.customerCompany || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, customerCompany: e.target.value }))}
                  placeholder="e.g. TechFlow Solutions"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Category</label>
                <select
                  value={formData.category || categories[0]}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value as CaseCategory }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Priority</label>
                <select
                  value={formData.priority || 'Medium'}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, priority: e.target.value as CasePriority }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
                <select
                  value={formData.status || 'Open'}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value as CaseStatus }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">Assigned Agent</label>
                <input
                  type="text"
                  value={formData.assignedTo || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, assignedTo: e.target.value }))}
                  placeholder="Enter agent name or leave unassigned..."
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">Issue Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the issue reported by the customer..."
                  className="w-full p-2.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              {isEditMode && (
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-emerald-800 mb-1">Resolution Summary</label>
                  <textarea
                    rows={2}
                    value={formData.resolution || ''}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, resolution: e.target.value }))}
                    placeholder="Provide resolution details when closing case..."
                    className="w-full p-2.5 text-sm rounded-md border border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-emerald-50/40"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting} className="h-9 px-4 text-xs">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px] h-9 text-xs font-medium flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-1 h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : isEditMode ? 'Update Case' : 'Create Case'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
