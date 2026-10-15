import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolutionCategory, SolutionStatus } from '../types';

interface SolutionModalProps {
  isOpen: boolean;
  isEditMode: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  submitting: boolean;
  categories: SolutionCategory[];
  statuses: SolutionStatus[];
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  isOpen,
  isEditMode,
  onClose,
  onSubmit,
  formData,
  setFormData,
  submitting,
  categories,
  statuses,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Solution Article' : 'New Solution Article'}
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
                  Article Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. How to Resolve WhatsApp Webhook Signature Mismatches"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Category</label>
                <select
                  value={formData.category || categories[0]}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, category: e.target.value as SolutionCategory }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Status</label>
                <select
                  value={formData.status || 'Published'}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value as SolutionStatus }))}
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">Quick Summary / Overview</label>
                <input
                  type="text"
                  value={formData.summary || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of what this solution covers..."
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">Problem / Symptoms Description</label>
                <textarea
                  rows={2}
                  value={formData.problem || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, problem: e.target.value }))}
                  placeholder="Describe the exact error or customer issue..."
                  className="w-full p-2.5 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Steps to Resolve <span className="text-gray-400 font-normal">(one step per line)</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={formData.stepsText || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, stepsText: e.target.value }))}
                  placeholder={"1. Open CRM Settings > Integrations\n2. Re-enter WhatsApp Verify Token\n3. Click Save & Verify"}
                  className="w-full font-mono text-xs border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Tips & Gotchas <span className="text-gray-400 font-normal">(one tip per line)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.tipsText || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, tipsText: e.target.value }))}
                  placeholder="Check NTP server time synchronization&#10;Verify firewall port 443"
                  className="w-full text-xs border border-gray-300 rounded-md p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">
                  Tags <span className="text-gray-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  value={formData.tagsText || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, tagsText: e.target.value }))}
                  placeholder="whatsapp, webhook, api, error"
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-900 mb-1">Author / Contributor</label>
                <input
                  type="text"
                  value={formData.author || ''}
                  onChange={(e) => setFormData((prev: any) => ({ ...prev, author: e.target.value }))}
                  placeholder="Enter author name..."
                  className="w-full h-10 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 px-4 text-xs">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px] h-9 text-xs font-medium"
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Article' : 'Publish Solution'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
