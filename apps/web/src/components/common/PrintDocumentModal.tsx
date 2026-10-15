import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';

export interface PrintItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxRate?: number;
  amount: number;
}

export interface PrintDocumentData {
  type: 'quotation' | 'invoice' | 'sales-order' | 'purchase-order';
  documentNumber: string;
  referenceNumber?: string;
  date: string;
  validUntilOrDueDate?: string;
  status?: string;

  // Company details
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyGstin?: string;

  // Party details (Client or Vendor)
  partyType?: 'Client' | 'Vendor';
  partyName: string;
  contactPerson?: string;
  partyEmail?: string;
  partyPhone?: string;
  billingAddress?: string;
  shippingAddress?: string;

  // Line items
  items: PrintItem[];

  // Totals
  subtotal: number;
  totalDiscount?: number;
  totalTax?: number;
  shippingCharges?: number;
  adjustment?: number;
  grandTotal: number;

  // Notes & terms
  customerNotes?: string;
  termsAndConditions?: string;
}

interface PrintDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintDocumentData | null;
}

export function PrintDocumentModal({ isOpen, onClose, data }: PrintDocumentModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const typeLabels = {
    quotation: 'COMMERCIAL QUOTATION',
    invoice: 'TAX INVOICE',
    'sales-order': 'SALES ORDER',
    'purchase-order': 'PURCHASE ORDER',
  };

  const docTitle = typeLabels[data.type] || 'DOCUMENT';
  const isPurchase = data.type === 'purchase-order';

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-document-content, #print-document-content * {
            visibility: visible;
          }
          #print-document-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Modal Toolbar (hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-gray-800 text-sm">
              Print Preview — {data.documentNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-200/60 transition-colors cursor-pointer"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Document */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white print:p-0" id="print-document-content" ref={printAreaRef}>
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{docTitle}</h1>
                <p className="text-sm font-mono font-bold text-indigo-600 mt-1">{data.documentNumber}</p>
                {data.referenceNumber && (
                  <p className="text-xs text-gray-500 mt-0.5">Ref: {data.referenceNumber}</p>
                )}
              </div>

              <div className="text-left sm:text-right">
                {data.companyName && <h2 className="text-lg font-bold text-gray-900">{data.companyName}</h2>}
                {data.companyAddress && <p className="text-xs text-gray-500 mt-0.5">{data.companyAddress}</p>}
                {(data.companyEmail || data.companyPhone) && (
                  <p className="text-xs text-gray-500">
                    {data.companyEmail}{data.companyEmail && data.companyPhone ? ' | ' : ''}{data.companyPhone}
                  </p>
                )}
                {data.companyGstin && <p className="text-xs text-gray-500 font-mono">GSTIN: {data.companyGstin}</p>}
              </div>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Issue Date:</span>
                <span className="font-semibold text-gray-800">{data.date || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">
                  {data.type === 'invoice' ? 'Due Date:' : 'Valid Until:'}
                </span>
                <span className="font-semibold text-gray-800">{data.validUntilOrDueDate || '—'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Status:</span>
                <span className="font-semibold uppercase text-gray-800">{data.status || 'Active'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Currency:</span>
                <span className="font-semibold text-gray-800">INR (₹)</span>
              </div>
            </div>
          </div>

          {/* Party Details (Bill To / Ship To) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 mb-6 border-b border-gray-100 text-xs">
            <div>
              <p className="font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                {isPurchase ? 'Vendor Details (Billed From):' : 'Billed To (Client):'}
              </p>
              <p className="text-sm font-bold text-gray-900">{data.partyName || '—'}</p>
              {data.contactPerson && data.contactPerson !== data.partyName && (
                <p className="text-gray-600">Attn: {data.contactPerson}</p>
              )}
              {data.partyEmail && <p className="text-gray-600">{data.partyEmail}</p>}
              {data.partyPhone && <p className="text-gray-600">{data.partyPhone}</p>}
              {data.billingAddress && (
                <p className="text-gray-600 mt-1 whitespace-pre-line">{data.billingAddress}</p>
              )}
            </div>

            {data.shippingAddress && (
              <div>
                <p className="font-bold text-gray-400 uppercase tracking-wider mb-1.5">Shipping Address:</p>
                <p className="text-gray-700 whitespace-pre-line">{data.shippingAddress}</p>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item & Description</th>
                  <th className="py-2.5 px-3 text-right w-24">Rate (₹)</th>
                  <th className="py-2.5 px-3 text-center w-16">Qty</th>
                  <th className="py-2.5 px-3 text-right w-20">Disc (%)</th>
                  <th className="py-2.5 px-3 text-right w-20">GST (%)</th>
                  <th className="py-2.5 px-3 text-right w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-gray-400">
                      No items specified
                    </td>
                  </tr>
                ) : (
                  data.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40">
                      <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-gray-900 block">{item.name}</span>
                        {item.description && (
                          <span className="text-[11px] text-gray-500 block">{item.description}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-700">
                        ₹{Number(item.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-medium text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                        {item.discountPercent ? `${item.discountPercent}%` : '0%'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-600">
                        {item.taxRate ? `${item.taxRate}%` : '0%'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-gray-900">
                        ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-72 space-y-2 text-xs border border-gray-100 p-4 rounded-xl bg-gray-50/50">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-gray-800">
                  ₹{Number(data.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {Number(data.totalDiscount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono font-medium">
                    -₹{Number(data.totalDiscount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {Number(data.totalTax || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>GST / Tax:</span>
                  <span className="font-mono font-medium text-gray-800">
                    +₹{Number(data.totalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {Number(data.shippingCharges || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span className="font-mono font-medium text-gray-800">
                    +₹{Number(data.shippingCharges || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {Number(data.adjustment || 0) !== 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Adjustment:</span>
                  <span className="font-mono font-medium text-gray-800">
                    ₹{Number(data.adjustment || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Grand Total:</span>
                <span className="font-mono text-indigo-600">
                  ₹{Number(data.grandTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          {(data.customerNotes || data.termsAndConditions) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-200 text-xs text-gray-600">
              {data.customerNotes ? (
                <div>
                  <p className="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-1">Customer Notes:</p>
                  <p className="whitespace-pre-line text-gray-600">{data.customerNotes}</p>
                </div>
              ) : <div></div>}

              {data.termsAndConditions ? (
                <div>
                  <p className="font-bold text-gray-800 uppercase text-[10px] tracking-wider mb-1">Terms & Conditions:</p>
                  <p className="whitespace-pre-line text-gray-600">{data.termsAndConditions}</p>
                </div>
              ) : <div></div>}
            </div>
          )}

          {/* Authorized Signature Stamp Box */}
          <div className="flex justify-between items-end pt-12 mt-6 border-t border-gray-100 text-xs text-gray-500">
            <div>
              <p className="italic">This is a computer-generated document and requires no physical signature.</p>
            </div>
            <div className="text-center">
              <div className="w-44 border-b border-gray-400 mb-1"></div>
              <p className="font-bold text-gray-800">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
