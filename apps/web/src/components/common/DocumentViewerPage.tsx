import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  Edit,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  FileText,
  User
} from 'lucide-react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';

export interface DocumentViewerProps {
  type: 'invoice' | 'quotation' | 'sales-order' | 'purchase-order';
}

export function DocumentViewerPage({ type }: DocumentViewerProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [docData, setDocData] = useState<any>(null);
  const [companySettings, setCompanySettings] = useState<any>(null);

  const config = {
    invoice: {
      title: 'Tax Invoice',
      label: 'Invoice',
      listPath: '/invoices',
      editPath: (docId: string) => `/invoices/edit/${docId}`,
      apiEndpoint: `/invoices/${id}`,
      numPrefix: 'INV',
    },
    quotation: {
      title: 'Quotation',
      label: 'Quotation',
      listPath: '/quotations',
      editPath: (docId: string) => `/quotations/edit/${docId}`,
      apiEndpoint: `/quotations/${id}`,
      numPrefix: 'QT',
    },
    'sales-order': {
      title: 'Sales Order',
      label: 'Sales Order',
      listPath: '/sales-orders',
      editPath: (docId: string) => `/sales-orders/edit/${docId}`,
      apiEndpoint: `/sales-orders/${id}`,
      numPrefix: 'SO',
    },
    'purchase-order': {
      title: 'Purchase Order',
      label: 'Purchase Order',
      listPath: '/purchase-orders',
      editPath: (docId: string) => `/purchase-orders/edit/${docId}`,
      apiEndpoint: `/purchase-orders/${id}`,
      numPrefix: 'PO',
    },
  }[type];

  useEffect(() => {
    if (!id) return;
    fetchDocument();
  }, [id, type]);

  const fetchDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const [docRes, settingsRes] = await Promise.all([
        api.get(config.apiEndpoint),
        api.get('/settings/workspace-settings').catch(() => ({ data: null }))
      ]);
      setDocData(docRes.data);
      if (settingsRes?.data) {
        setCompanySettings(settingsRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load document', err);
      setError(err?.response?.data?.message || 'Failed to load document details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-12 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          Loading {config.label}...
        </div>
      </div>
    );
  }

  if (error || !docData) {
    return (
      <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-gray-900 mb-1">Document Not Found</h2>
        <p className="text-sm text-gray-500 mb-5">{error || 'Could not load document details.'}</p>
        <button
          onClick={() => navigate(config.listPath)}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
        >
          Back to {config.label}s
        </button>
      </div>
    );
  }

  // Parse payload from notes or itemsJson
  let meta: any = {};
  try {
    const rawData = docData.notes || docData.itemsJson;
    if (typeof rawData === 'string' && (rawData.startsWith('{') || rawData.startsWith('['))) {
      meta = JSON.parse(rawData);
    } else if (typeof rawData === 'object' && rawData !== null) {
      meta = rawData;
    }
  } catch {}

  const isPurchase = type === 'purchase-order';
  const partyObj = isPurchase ? docData.vendor : docData.customer;

  const docNumber =
    docData.invoiceNumber ||
    docData.quoteNumber ||
    docData.orderNumber ||
    docData.poNumber ||
    meta.invoiceNumber ||
    meta.quoteNumber ||
    meta.orderNumber ||
    meta.poNumber ||
    `${config.numPrefix}-${docData.id?.slice(0, 8).toUpperCase()}`;

  const docDate = formatDate(docData.createdAt || meta.invoiceDate || meta.quoteDate || meta.orderDate);
  const dueDate = formatDate(docData.dueDate || docData.validUntil || meta.dueDate || meta.validUntil);
  const referenceNumber = docData.referenceNumber || meta.referenceNumber || '—';
  const paymentTerms = meta.paymentTerms || docData.paymentTerms || companySettings?.paymentTerms || '—';

  const partyName = partyObj?.name || meta.customerName || meta.vendorName || '—';
  const partyEmail = partyObj?.email || meta.customerEmail || meta.vendorEmail || '—';
  const partyPhone = partyObj?.phone || meta.customerPhone || meta.vendorPhone || '—';
  const contactPerson = meta.contactPerson || partyObj?.contactPerson || (partyName !== '—' ? partyName : '—');
  const billingAddress = meta.billingAddress || docData.billingAddress || '—';
  const shippingAddress = meta.shippingAddress || docData.shippingAddress || billingAddress;

  // Clean terms: strip any legacy mock text like HDFC Bank
  const rawTerms = meta.termsAndConditions || docData.termsAndConditions || '';
  const cleanTerms = rawTerms
    .split('\n')
    .filter((line: string) => !line.includes('HDFC Bank') && !line.includes('50200012345678') && !line.includes('HDFC0000123'))
    .join('\n')
    .trim();

  // Real Company Name
  const resolvedCompanyName = companySettings?.companyName || companySettings?.company?.name || '';

  // Items
  let items: any[] = [];
  if (Array.isArray(meta.items) && meta.items.length > 0) {
    items = meta.items;
  } else if (Array.isArray(docData.lineItems) && docData.lineItems.length > 0) {
    items = docData.lineItems;
  } else if (Number(docData.amount || docData.totalAmount || docData.totalValue || 0) > 0) {
    items = [
      {
        name: docData.description || 'Item 1',
        description: '',
        quantity: 1,
        unitPrice: Number(docData.amount || docData.totalAmount || docData.totalValue || 0),
        discountPercent: 0,
        taxRate: 0,
        amount: Number(docData.amount || docData.totalAmount || docData.totalValue || 0),
      }
    ];
  }

  // Financial Totals
  const subtotal = Number(meta.subtotal ?? docData.subtotal ?? docData.amount ?? docData.totalAmount ?? docData.totalValue ?? 0);
  const totalDiscount = Number(meta.totalDiscount ?? docData.discountAmount ?? 0);
  const totalTax = Number(meta.totalTax ?? docData.taxAmount ?? 0);
  const shippingCharges = Number(meta.shippingCharges ?? 0);
  const adjustment = Number(meta.adjustment ?? 0);
  const grandTotal = Number(docData.amount ?? docData.totalAmount ?? docData.totalValue ?? meta.grandTotal ?? 0);

  const status = (docData.status || 'Draft').toUpperCase();

  const getStatusBadgeClass = (st: string) => {
    switch (st) {
      case 'PAID':
      case 'ACCEPTED':
      case 'APPROVED':
      case 'RECEIVED':
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'SENT':
      case 'INVOICED':
      case 'ORDERED':
      case 'PENDING':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'OVERDUE':
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          nav, header, aside, .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          @page {
            size: A4 portrait;
            margin: 15mm 15mm;
          }
        }
      `}</style>

      {/* Top Action Bar (Matches Create/Edit Pages in the CRM) */}
      <div className="no-print flex flex-wrap items-center justify-between bg-white p-3.5 rounded-lg border border-gray-200/80 shadow-xs gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(config.listPath)}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            title={`Back to ${config.label}s`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-semibold text-gray-900">
              {config.label} <span className="font-mono text-gray-600 font-bold">{docNumber}</span>
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(status)}`}>
              {status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(config.listPath)}
            className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => navigate(config.editPath(docData.id))}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <Edit className="w-4 h-4 text-gray-500" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Main Content Area (Clean CRM Card Design) */}
      <div className="print-area space-y-4">
        {/* Real Company Header (From Settings DB) */}
        {resolvedCompanyName && (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{resolvedCompanyName}</h2>
              {companySettings?.address && (
                <p className="text-xs text-gray-500 mt-1">
                  {companySettings.address}
                  {companySettings.city ? `, ${companySettings.city}` : ''}
                  {companySettings.state ? `, ${companySettings.state}` : ''}
                  {companySettings.pincode ? ` - ${companySettings.pincode}` : ''}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
                {companySettings?.phone && <span>Phone: {companySettings.phone}</span>}
                {companySettings?.email && <span>Email: {companySettings.email}</span>}
                {companySettings?.gstNumber && (
                  <span className="font-semibold text-gray-700">GSTIN: {companySettings.gstNumber}</span>
                )}
                {companySettings?.panNumber && (
                  <span className="font-semibold text-gray-700">PAN: {companySettings.panNumber}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs rounded uppercase tracking-wider">
                {config.title}
              </span>
            </div>
          </div>
        )}

        {/* Top Details Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Contact / Customer Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <User className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">
                  {isPurchase ? 'Vendor Details' : 'Customer Details'}
                </h3>
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="font-bold text-gray-900 text-base">{partyName}</p>
                {contactPerson && contactPerson !== partyName && (
                  <p className="text-xs text-gray-600">
                    <span className="text-gray-400 font-medium">Attn:</span> {contactPerson}
                  </p>
                )}
                <p className="text-xs text-gray-600">
                  <span className="text-gray-400 font-medium">Email:</span> {partyEmail}
                </p>
                <p className="text-xs text-gray-600">
                  <span className="text-gray-400 font-medium">Phone:</span> {partyPhone}
                </p>
                {billingAddress && billingAddress !== '—' && (
                  <p className="text-xs text-gray-600 pt-1">
                    <span className="text-gray-400 font-medium block mb-0.5">Billing Address:</span>
                    <span className="whitespace-pre-line">{billingAddress}</span>
                  </p>
                )}
                {shippingAddress && shippingAddress !== billingAddress && shippingAddress !== '—' && (
                  <p className="text-xs text-gray-600 pt-1">
                    <span className="text-gray-400 font-medium block mb-0.5">Shipping Address:</span>
                    <span className="whitespace-pre-line">{shippingAddress}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Document Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <FileText className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">{config.label} Information</h3>
              </div>

              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">{config.label} Number</span>
                  <span className="font-mono font-semibold text-gray-900 text-sm">{docNumber}</span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${getStatusBadgeClass(status)}`}>
                    {status}
                  </span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">Date</span>
                  <span className="font-medium text-gray-800 text-xs">{docDate}</span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">
                    {type === 'quotation' ? 'Valid Until' : 'Due Date'}
                  </span>
                  <span className="font-medium text-gray-800 text-xs">{dueDate}</span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">Reference No.</span>
                  <span className="font-mono text-gray-700 text-xs">{referenceNumber}</span>
                </div>

                <div>
                  <span className="block text-xs font-medium text-gray-500 mb-0.5">Payment Terms</span>
                  <span className="text-gray-700 text-xs">{paymentTerms}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Line Items</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 text-center w-12">#</th>
                  <th className="py-3 px-4">Item & Description</th>
                  <th className="py-3 px-4 text-right w-28">Rate (₹)</th>
                  <th className="py-3 px-4 text-center w-20">Qty</th>
                  <th className="py-3 px-4 text-center w-24">Discount</th>
                  <th className="py-3 px-4 text-center w-20">Tax %</th>
                  <th className="py-3 px-4 text-right w-32">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {items.map((item, index) => {
                  const qty = Number(item.quantity) || 1;
                  const unitPrice = Number(item.unitPrice) || 0;
                  const disc = Number(item.discountPercent) || 0;
                  const tax = Number(item.taxRate) || 0;
                  const gross = qty * unitPrice;
                  const discounted = gross - (gross * disc) / 100;
                  const taxAmount = (discounted * tax) / 100;
                  const lineTotal = Number(item.amount) || discounted + taxAmount;

                  return (
                    <tr key={index} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 text-center font-mono text-gray-400">{index + 1}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-gray-900 text-sm">{item.name || 'Item'}</p>
                        {item.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        )}
                        {item.hsnCode && (
                          <p className="text-[11px] font-mono text-gray-400 mt-0.5">HSN: {item.hsnCode}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-700">
                        ₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-center font-medium text-gray-800">{qty}</td>
                      <td className="py-3.5 px-4 text-center text-gray-600">
                        {disc > 0 ? `${disc}%` : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600">
                        {tax > 0 ? `${tax}%` : '0%'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-gray-900">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Notes Card */}
        <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Left Column: Notes & Terms & Real Bank Details */}
            <div className="space-y-4">
              {companySettings && (companySettings.bankName || companySettings.accountNumber || companySettings.upiId) && (
                <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200/80 text-xs text-gray-700 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-1">
                    Bank Payment Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {companySettings.bankName && (
                      <p><span className="text-gray-400">Bank:</span> {companySettings.bankName}</p>
                    )}
                    {companySettings.accountName && (
                      <p><span className="text-gray-400">A/C Name:</span> {companySettings.accountName}</p>
                    )}
                    {companySettings.accountNumber && (
                      <p><span className="text-gray-400">A/C No:</span> <span className="font-mono font-semibold text-gray-900">{companySettings.accountNumber}</span></p>
                    )}
                    {companySettings.ifscCode && (
                      <p><span className="text-gray-400">IFSC:</span> <span className="font-mono font-semibold text-gray-900">{companySettings.ifscCode}</span></p>
                    )}
                    {companySettings.upiId && (
                      <p className="sm:col-span-2 pt-0.5"><span className="text-gray-400">UPI ID:</span> <span className="font-mono font-semibold text-blue-600">{companySettings.upiId}</span></p>
                    )}
                  </div>
                </div>
              )}

              {meta.customerNotes && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Customer Notes
                  </h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[48px] whitespace-pre-line">
                    {meta.customerNotes}
                  </p>
                </div>
              )}

              {cleanTerms && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Terms & Conditions
                  </h4>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[48px] whitespace-pre-line">
                    {cleanTerms}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Financial Summary */}
            <div className="bg-gray-50/70 rounded-xl p-5 border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 pb-2 border-b border-gray-200">
                Summary
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    ₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono font-semibold">
                      -₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {totalTax > 0 ? (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST):</span>
                    <span className="font-mono font-semibold text-gray-800">
                      ₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between text-gray-500">
                    <span>Tax (GST):</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                )}

                {shippingCharges > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Charges:</span>
                    <span className="font-mono text-gray-800">
                      ₹{shippingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {adjustment !== 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Adjustment:</span>
                    <span className="font-mono text-gray-800">
                      ₹{adjustment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-gray-900">Grand Total:</span>
                  <span className="font-mono font-bold text-lg text-blue-600">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
