import React from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, User, Phone, Mail, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any | null;
  pipelineStages?: any[];
  onDealUpdated?: () => void;
  onEditRequested?: (deal: any) => void;
}

export function DealDetailModal({
  isOpen,
  onClose,
  deal,
  onEditRequested
}: DealDetailModalProps) {
  if (!isOpen || !deal) return null;

  const contact = deal.customer || deal.lead;
  const contactName = contact?.name || deal.clientName || '-';
  const contactPhone = contact?.phone;
  const contactEmail = contact?.email;
  const contactCompany = contact?.company || contact?.companyName || deal.companyName;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        
        {/* Header (Exact match with AddDealModal) */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">View Deal</h2>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (Exact match with AddDealModal structure & grid) */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            
            {/* Deal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Deal Name
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-900 flex items-center truncate">
                {deal.title}
              </div>
            </div>

            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Client Name
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center justify-between">
                <span className="truncate">{contactName}</span>
                {contactCompany && (
                  <span className="text-xs text-gray-400 ml-1 truncate">({contactCompany})</span>
                )}
              </div>
            </div>

            {/* Deal Price */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Deal Price
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-semibold text-gray-900 flex items-center">
                ₹{Number(deal.value || 0).toLocaleString('en-IN')}
              </div>
            </div>

            {/* Team Member */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Team Member
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.assignedTo?.name || deal.assignedTo || 'Unassigned'}
              </div>
            </div>

            {/* Deal Stage */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Deal Stage
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm flex items-center">
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {deal.stage?.name || deal.dealStage || 'Unknown'}
                </span>
              </div>
            </div>

            {/* Call Status */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Call Status
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.callStatus || '-'}
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Start Date
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.startDate ? format(new Date(deal.startDate), 'dd MMM yyyy') : '-'}
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                End Date
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'dd MMM yyyy') : '-'}
              </div>
            </div>

            {/* Select Funnel */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Select Funnel
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.funnel?.name || deal.funnelId || '-'}
              </div>
            </div>

            {/* Select Group */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Select Group
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.group?.name || deal.groupId || '-'}
              </div>
            </div>

            {/* Attachment */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Attachment
              </label>
              <div className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm text-gray-800 flex items-center">
                {deal.attachmentUrl ? (
                  <a 
                    href={deal.attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline flex items-center gap-1.5 font-medium truncate"
                  >
                    View Attachment <ExternalLink className="w-3.5 h-3.5 inline" />
                  </a>
                ) : (
                  <span className="text-gray-400">No attachment uploaded</span>
                )}
              </div>
            </div>

            {/* Client Contact Info (Quick Bar if phone/email available) */}
            {(contactPhone || contactEmail) && (
              <div className="md:col-span-3 p-3 bg-white border border-gray-200 rounded-md flex flex-wrap items-center gap-4 text-xs text-gray-700">
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" /> Client Contact:
                </span>
                {contactPhone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" /> {contactPhone}
                  </span>
                )}
                {contactEmail && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-blue-600" /> {contactEmail}
                  </span>
                )}
              </div>
            )}

            {/* About Deal */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-900 mb-1">
                About Deal
              </label>
              <div className="w-full p-3 rounded-md border border-gray-300 bg-white text-sm text-gray-800 whitespace-pre-wrap min-h-[90px]">
                {deal.notes || 'No description added.'}
              </div>
            </div>

          </div>
        </div>

        {/* Footer (Exact match with AddDealModal) */}
        <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl z-10">
          <div className="text-xs text-gray-400">
            {deal.createdAt && `Created: ${format(new Date(deal.createdAt), 'dd MMM yyyy, hh:mm a')}`}
          </div>
          <div className="flex items-center gap-3">
            {onEditRequested && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onClose();
                  onEditRequested(deal);
                }}
                className="border-gray-300 hover:bg-gray-50"
              >
                Edit Deal
              </Button>
            )}
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
            >
              Close
            </Button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
}
