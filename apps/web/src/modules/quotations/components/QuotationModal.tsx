import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Copy, FileText, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface LineItem {
  id: string;
  productId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxRate: number;
  amount: number;
}

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation?: any | null;
  onSaved: () => void;
}

export function QuotationModal({ isOpen, onClose, quotation, onSaved }: QuotationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Section collapse state for clean UX
  const [showAddressSection, setShowAddressSection] = useState(false);
  const [showTermsSection, setShowTermsSection] = useState(false);

  // Form State
  const [quoteNumber, setQuoteNumber] = useState('');
  const [subject, setSubject] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
  );
  const [status, setStatus] = useState('draft');

  // Address
  const [billingAddress, setBillingAddress] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [billingZip, setBillingZip] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingZip, setShippingZip] = useState('');

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: 'item-1',
      productId: '',
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      discountPercent: 0,
      taxRate: 18,
      amount: 0,
    },
  ]);

  // Adjustments & Totals
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [customerNotes, setCustomerNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Fetch customers & products
      api.get('/customers')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.customers || []);
          setCustomers(list);
        })
        .catch(() => {});

      api.get('/products')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
          setProducts(list);
        })
        .catch(() => {});

      if (quotation) {
        // Edit mode
        let parsedJson: any = {};
        try {
          if (typeof quotation.itemsJson === 'string') {
            parsedJson = JSON.parse(quotation.itemsJson);
          } else if (typeof quotation.itemsJson === 'object' && quotation.itemsJson !== null) {
            parsedJson = quotation.itemsJson;
          }
        } catch {
          parsedJson = {};
        }

        setQuoteNumber(parsedJson.quoteNumber || quotation.id?.slice(0, 8)?.toUpperCase() || `QT-${Date.now().toString().slice(-5)}`);
        setSubject(parsedJson.subject || 'Commercial Quotation');
        setCustomerId(quotation.customerId || '');
        setCustomerName(quotation.customer?.name || parsedJson.customerName || '');
        setContactPerson(parsedJson.contactPerson || '');
        setCustomerEmail(quotation.customer?.email || parsedJson.customerEmail || '');
        setCustomerPhone(quotation.customer?.phone || parsedJson.customerPhone || '');
        setValidUntil(quotation.validUntil ? quotation.validUntil.slice(0, 10) : new Date().toISOString().slice(0, 10));
        setStatus(quotation.status || 'draft');

        setBillingAddress(parsedJson.billingAddress || '');
        setBillingCity(parsedJson.billingCity || '');
        setBillingState(parsedJson.billingState || '');
        setBillingZip(parsedJson.billingZip || '');
        setShippingAddress(parsedJson.shippingAddress || '');
        setShippingCity(parsedJson.shippingCity || '');
        setShippingState(parsedJson.shippingState || '');
        setShippingZip(parsedJson.shippingZip || '');

        if (Array.isArray(parsedJson.items) && parsedJson.items.length > 0) {
          setItems(parsedJson.items);
        } else {
          setItems([
            {
              id: 'item-1',
              productId: '',
              name: 'General Product / Service',
              description: '',
              quantity: 1,
              unitPrice: quotation.totalValue || 0,
              discountPercent: 0,
              taxRate: 0,
              amount: quotation.totalValue || 0,
            },
          ]);
        }

        setShippingCharges(parsedJson.shippingCharges || 0);
        setAdjustment(parsedJson.adjustment || 0);
        setCustomerNotes(parsedJson.customerNotes || '');
        if (parsedJson.termsAndConditions) {
          setTermsAndConditions(parsedJson.termsAndConditions);
        }
      } else {
        // Create mode
        setQuoteNumber('QT-0001');
        api.get('/quotations/next-number')
          .then(res => {
            if (res.data?.data?.nextNumber) {
              setQuoteNumber(res.data.data.nextNumber);
            }
          })
          .catch(() => {});
        setSubject('Commercial Proposal');
        setCustomerId('');
        setCustomerName('');
        setContactPerson('');
        setCustomerEmail('');
        setCustomerPhone('');
        setValidUntil(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
        setStatus('draft');
        setBillingAddress('');
        setBillingCity('');
        setBillingState('');
        setBillingZip('');
        setShippingAddress('');
        setShippingCity('');
        setShippingState('');
        setShippingZip('');
        setItems([
          {
            id: `item-${Date.now()}`,
            productId: '',
            name: '',
            description: '',
            quantity: 1,
            unitPrice: 0,
            discountPercent: 0,
            taxRate: 18,
            amount: 0,
          },
        ]);
        setShippingCharges(0);
        setAdjustment(0);
        setCustomerNotes('');
        setTermsAndConditions('');
      }
    }
  }, [quotation, isOpen]);

  if (!isOpen) return null;

  // Handle client select
  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setCustomerId('');
      return;
    }
    const selected = customers.find(c => c.id === val);
    if (selected) {
      setCustomerId(selected.id);
      setCustomerName(selected.name);
      setCustomerEmail(selected.email || '');
      setCustomerPhone(selected.phone || '');
      setBillingAddress(selected.address || '');
      setShippingAddress(selected.address || '');
    }
  };

  // Copy billing to shipping
  const handleCopyBillingAddress = () => {
    setShippingAddress(billingAddress);
    setShippingCity(billingCity);
    setShippingState(billingState);
    setShippingZip(billingZip);
  };

  // Line item manipulation
  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        productId: '',
        name: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxRate: 18,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      Swal.fire('Notice', 'A quotation must contain at least one line item.', 'info');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    setItems(prev => {
      const next = [...prev];
      const current = { ...next[index] };

      if (field === 'productId') {
        const prod = products.find(p => p.id === val);
        if (prod) {
          current.productId = prod.id;
          current.name = prod.name;
          current.description = prod.description || '';
          current.unitPrice = Number(prod.price) || 0;
          current.taxRate = Number(prod.taxRate) || 18;
        } else {
          current.productId = '';
        }
      } else {
        (current as any)[field] = val;
      }

      // Re-calculate line item amount
      const qty = Math.max(0, Number(current.quantity) || 0);
      const price = Math.max(0, Number(current.unitPrice) || 0);
      const disc = Math.max(0, Math.min(100, Number(current.discountPercent) || 0));
      const tax = Math.max(0, Number(current.taxRate) || 0);

      const discountedPrice = price * (1 - disc / 100);
      const taxAmount = discountedPrice * (tax / 100);
      current.amount = Math.round((qty * (discountedPrice + taxAmount)) * 100) / 100;

      next[index] = current;
      return next;
    });
  };

  // Totals Calculation
  const subtotal = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return acc + qty * price;
  }, 0);

  const totalDiscount = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    return acc + (qty * price * (disc / 100));
  }, 0);

  const totalTax = items.reduce((acc, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discountPercent) || 0;
    const discounted = (qty * price) - (qty * price * (disc / 100));
    const tax = Number(item.taxRate) || 0;
    return acc + (discounted * (tax / 100));
  }, 0);

  const grandTotal = Math.max(
    0,
    Math.round((subtotal - totalDiscount + totalTax + Number(shippingCharges || 0) + Number(adjustment || 0)) * 100) / 100
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() && !customerId) {
      Swal.fire('Validation Error', 'Client or company name is required.', 'warning');
      return;
    }

    if (items.some(item => !item.name.trim())) {
      Swal.fire('Validation Error', 'All line items must have a product or item name.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const itemsPayload = {
        quoteNumber,
        subject,
        customerName: customerName.trim(),
        contactPerson: contactPerson.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        billingAddress: billingAddress.trim(),
        billingCity: billingCity.trim(),
        billingState: billingState.trim(),
        billingZip: billingZip.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity: shippingCity.trim(),
        shippingState: shippingState.trim(),
        shippingZip: shippingZip.trim(),
        items,
        subtotal,
        totalDiscount,
        totalTax,
        shippingCharges: Number(shippingCharges) || 0,
        adjustment: Number(adjustment) || 0,
        grandTotal,
        customerNotes: customerNotes.trim(),
        termsAndConditions: termsAndConditions.trim(),
      };

      const payload = {
        customerId: customerId || undefined,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        totalValue: grandTotal,
        validUntil: validUntil || undefined,
        status,
        itemsJson: JSON.stringify(itemsPayload),
      };

      if (quotation && quotation.id) {
        await api.put(`/quotations/${quotation.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Quotation updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post('/quotations', payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Quotation created successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save quotation';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-black/50 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-none">
                {quotation ? `Edit Quotation (${quoteNumber})` : 'Create Commercial Quotation'}
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Professional itemised proposal with taxes, discounts, and terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 bg-gray-50/40 text-sm">
            {/* Section 1: Quote Meta & Customer Information */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                1. Quotation & Client Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* Quote Number */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quote Number
                  </label>
                  <Input
                    readOnly
                    value={quoteNumber}
                    className="h-9 font-mono text-xs bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200 select-all"
                  />
                </div>

                {/* Subject / Title */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Subject / Proposal Title *
                  </label>
                  <Input
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="e.g. Enterprise Cloud ERP Implementation"
                    className="h-9"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full h-9 px-2 rounded-md border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Existing Customer Select */}
                {customers.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Choose Saved Client
                    </label>
                    <select
                      className="w-full h-9 px-2 rounded-md border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                      value={customerId}
                      onChange={handleSelectCustomer}
                    >
                      <option value="">-- Or enter custom name below --</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} {c.companyName ? `(${c.companyName})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Customer Name */}
                <div className={customers.length > 0 ? '' : 'md:col-span-2'}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Client / Company Name *
                  </label>
                  <Input
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Acme Corporation Ltd"
                    className="h-9"
                  />
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Attention / Contact Person
                  </label>
                  <Input
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="John Doe (Director)"
                    className="h-9"
                  />
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valid Until Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                    className="h-9"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Client Email
                  </label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    placeholder="billing@acme.com"
                    className="h-9"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Client Phone
                  </label>
                  <Input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="h-9"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Collapsible Address Details */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAddressSection(!showAddressSection)}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  2. Billing & Shipping Address
                  {billingAddress && <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium">Added</span>}
                </span>
                {showAddressSection ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {showAddressSection && (
                <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Billing Address */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-800">Billing Address</h4>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs outline-none focus:border-indigo-500"
                      placeholder="Street address, building, suite..."
                      value={billingAddress}
                      onChange={e => setBillingAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={billingCity}
                        onChange={e => setBillingCity(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="State"
                        value={billingState}
                        onChange={e => setBillingState(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Pincode/Zip"
                        value={billingZip}
                        onChange={e => setBillingZip(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-gray-800">Shipping Address</h4>
                      <button
                        type="button"
                        onClick={handleCopyBillingAddress}
                        className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium"
                      >
                        <Copy className="w-3 h-3" /> Same as Billing
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs outline-none focus:border-indigo-500"
                      placeholder="Delivery warehouse or office location..."
                      value={shippingAddress}
                      onChange={e => setShippingAddress(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="City"
                        value={shippingCity}
                        onChange={e => setShippingCity(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="State"
                        value={shippingState}
                        onChange={e => setShippingState(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Pincode/Zip"
                        value={shippingZip}
                        onChange={e => setShippingZip(e.target.value)}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Itemised Line Items Table (Core of a CRM Quote) */}
            <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    3. Line Items (Products & Services)
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Pick catalog products or specify custom deliverables with rate, discount & GST
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs h-8 px-2.5 rounded-md flex items-center gap-1 shadow-none font-medium"
                >
                  <Plus className="w-3.5 h-3.5" /> + Add Line Item
                </Button>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[11px]">
                    <tr>
                      <th className="py-2.5 px-3 min-w-[200px]">Item / Product</th>
                      <th className="py-2.5 px-2 min-w-[140px]">Description</th>
                      <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                      <th className="py-2.5 px-2 w-28 text-right">Price (₹)</th>
                      <th className="py-2.5 px-2 w-20 text-center">Disc (%)</th>
                      <th className="py-2.5 px-2 w-20 text-center">Tax (%)</th>
                      <th className="py-2.5 px-3 w-32 text-right">Total (₹)</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        {/* Product selection or custom name */}
                        <td className="py-2 px-3 align-top">
                          <div className="space-y-1">
                            {products.length > 0 && (
                              <select
                                className="w-full h-8 px-2 rounded border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                                value={item.productId || ''}
                                onChange={e => handleItemChange(idx, 'productId', e.target.value)}
                              >
                                <option value="">-- Select from Catalog --</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} (₹{p.price})
                                  </option>
                                ))}
                              </select>
                            )}
                            <input
                              type="text"
                              required
                              placeholder="Item name / service name *"
                              value={item.name}
                              onChange={e => handleItemChange(idx, 'name', e.target.value)}
                              className="w-full h-8 px-2 rounded border border-gray-300 text-xs outline-none focus:border-indigo-500"
                            />
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-2 px-2 align-top">
                          <textarea
                            rows={2}
                            placeholder="Specifications or scope..."
                            value={item.description}
                            onChange={e => handleItemChange(idx, 'description', e.target.value)}
                            className="w-full px-2 py-1 rounded border border-gray-300 text-xs outline-none focus:border-indigo-500"
                          />
                        </td>

                        {/* Quantity */}
                        <td className="py-2 px-2 align-top text-center">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-16 h-8 text-center px-1 rounded border border-gray-300 text-xs outline-none focus:border-indigo-500"
                          />
                        </td>

                        {/* Unit Price */}
                        <td className="py-2 px-2 align-top text-right">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-24 h-8 text-right px-2 rounded border border-gray-300 text-xs outline-none focus:border-indigo-500"
                          />
                        </td>

                        {/* Discount % */}
                        <td className="py-2 px-2 align-top text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.discountPercent}
                            onChange={e => handleItemChange(idx, 'discountPercent', e.target.value)}
                            className="w-16 h-8 text-center px-1 rounded border border-gray-300 text-xs outline-none focus:border-indigo-500"
                          />
                        </td>

                        {/* Tax % */}
                        <td className="py-2 px-2 align-top text-center">
                          <select
                            value={item.taxRate}
                            onChange={e => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                            className="w-16 h-8 text-center px-1 rounded border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>

                        {/* Row Total */}
                        <td className="py-2 px-3 align-top text-right font-semibold text-gray-900 pt-3">
                          ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Remove Row */}
                        <td className="py-2 px-2 align-top text-center pt-2.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1"
                            title="Remove Line Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary Calculation Card */}
              <div className="flex flex-col md:flex-row justify-between items-start pt-2 gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <span>Showing {items.length} line item(s)</span>
                </div>

                <div className="w-full md:w-80 bg-gray-50 p-3.5 rounded-lg border border-gray-200/80 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-amber-600 font-medium">
                      <span>Total Item Discount:</span>
                      <span>-₹{totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Applicable Tax (GST):</span>
                    <span>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Shipping / Freight:</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={shippingCharges}
                      onChange={e => setShippingCharges(parseFloat(e.target.value) || 0)}
                      className="w-24 h-7 text-right px-2 rounded border border-gray-300 text-xs bg-white"
                    />
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Adjustment / Rounding:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={adjustment}
                      onChange={e => setAdjustment(parseFloat(e.target.value) || 0)}
                      className="w-24 h-7 text-right px-2 rounded border border-gray-300 text-xs bg-white"
                    />
                  </div>

                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                    <span>Grand Total:</span>
                    <span className="text-indigo-600 font-mono">
                      ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Collapsible Terms & Conditions and Notes */}
            <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTermsSection(!showTermsSection)}
                className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  4. Commercial Terms & Customer Notes
                </span>
                {showTermsSection ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>

              {showTermsSection && (
                <div className="p-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Customer Notes / Remarks
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs outline-none focus:border-indigo-500"
                      placeholder="Special notes or greetings visible on customer proposal..."
                      value={customerNotes}
                      onChange={e => setCustomerNotes(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Terms & Conditions
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-xs outline-none focus:border-indigo-500"
                      value={termsAndConditions}
                      onChange={e => setTermsAndConditions(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
            <div className="text-xs text-gray-500">
              Total Payable:{' '}
              <span className="font-bold text-indigo-700 text-sm font-mono">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="h-9 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px] h-9 text-xs font-medium"
              >
                {isLoading ? 'Saving...' : (quotation ? 'Update Quotation' : 'Save Quotation')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
