import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, User, Mail, Phone, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import {
  SALES_ORDER_STATUSES,
  SALES_ORDER_STATUS_LABELS,
  TAX_RATES,
  formatToLocalDateTime,
  parseToLocalDateTime,
} from '@/lib/constants';
import { ContactSelectDropdown } from '@/components/common/ContactSelectDropdown';
import { ProductSelectDropdown } from '@/components/common/ProductSelectDropdown';

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

export function CreateSalesOrderPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [priceBooks, setPriceBooks] = useState<any[]>([]);

  // Order Meta
  const [orderNumber, setOrderNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [priceBookId, setPriceBookId] = useState('');
  const [status, setStatus] = useState('pending');
  const [orderDate, setOrderDate] = useState(() => formatToLocalDateTime());
  const [validUntil, setValidUntil] = useState(() =>
    formatToLocalDateTime(new Date(Date.now() + 30 * 86400000))
  );

  // Customer Details
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Addresses
  const [showAddress, setShowAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

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
      taxRate: 0,
      amount: 0,
    },
  ]);

  // Adjustments & Totals
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [adjustment, setAdjustment] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [termsAndConditions, setTermsAndConditions] = useState('');

  useEffect(() => {
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

    api.get('/price-books')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.priceBooks || []);
        setPriceBooks(list.filter((pb: any) => {
          const isActive = String(pb.status || '').toLowerCase() === 'active';
          const isNotExpired = !pb.expiryDate || new Date(pb.expiryDate).setHours(23, 59, 59, 999) >= Date.now();
          return isActive && isNotExpired;
        }));
      })
      .catch(() => {});

    if (!isEditMode) {
      api.get('/sales-orders/next-number')
        .then(res => {
          if (res.data?.nextNumber) {
            setOrderNumber(res.data.nextNumber);
          }
        })
        .catch(() => {});
    }

    if (isEditMode && id) {
      api.get(`/sales-orders/${id}`)
        .then(res => {
          const so = res.data;
          let parsedNotes: any = {};
          try {
            if (typeof so.notes === 'string' && so.notes.startsWith('{')) {
              parsedNotes = JSON.parse(so.notes);
            }
          } catch {}

          const resolvedNumber = so.orderNumber || parsedNotes.orderNumber || (so.id ? `SO-${so.id.slice(0, 8).toUpperCase()}` : 'SO-0001');
          setOrderNumber(resolvedNumber);
          setReferenceNumber(parsedNotes.referenceNumber || '');
          setStatus(so.status || 'pending');
          setPriceBookId(so.priceBookId || '');
          setOrderDate(so.createdAt ? parseToLocalDateTime(so.createdAt) : formatToLocalDateTime());
          setValidUntil(so.validUntil ? parseToLocalDateTime(so.validUntil) : formatToLocalDateTime(new Date(Date.now() + 30 * 86400000)));

          setCustomerId(so.customerId || '');
          setCustomerName(so.customer?.name || parsedNotes.customerName || '');
          setContactPerson(parsedNotes.contactPerson || '');
          setCustomerEmail(so.customer?.email || parsedNotes.customerEmail || '');
          setCustomerPhone(so.customer?.phone || parsedNotes.customerPhone || '');

          setBillingAddress(so.billingAddress || parsedNotes.billingAddress || '');
          setShippingAddress(so.shippingAddress || parsedNotes.shippingAddress || '');
          if (so.billingAddress || so.shippingAddress || parsedNotes.billingAddress) {
            setShowAddress(true);
          }

          if (Array.isArray(parsedNotes.items) && parsedNotes.items.length > 0) {
            setItems(parsedNotes.items);
          } else {
            setItems([
              {
                id: 'item-1',
                productId: '',
                name: 'Product / Item',
                description: '',
                quantity: 1,
                unitPrice: so.subtotal || so.totalAmount || 0,
                discountPercent: 0,
                taxRate: 0,
                amount: so.totalAmount || 0,
              },
            ]);
          }

          setShippingCharges(parsedNotes.shippingCharges || 0);
          setAdjustment(parsedNotes.adjustment || 0);
          setNotes(parsedNotes.rawNotes || (typeof so.notes === 'string' && !so.notes.startsWith('{') ? so.notes : ''));
          setTermsAndConditions(parsedNotes.termsAndConditions || '');
        })
        .catch(() => {
          Swal.fire('Error', 'Failed to load sales order details.', 'error');
          navigate('/sales-orders');
        })
        .finally(() => {
          setIsFetching(false);
        });
    }
  }, [id, isEditMode, navigate]);

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
      if (selected.address) {
        setBillingAddress(selected.address);
        setShippingAddress(selected.address);
        setShowAddress(true);
      }
    }
  };

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
        taxRate: 0,
        amount: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      Swal.fire('Notice', 'Order must have at least one line item.', 'info');
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductSelect = (index: number, product: any | null) => {
    setItems(prev => {
      const next = [...prev];
      const current = { ...next[index] };

      if (product) {
        current.productId = product.id;
        current.name = product.name;
        current.description = product.description || '';
        const selectedPb = priceBooks.find(pb => pb.id === priceBookId);
        const pbItem = selectedPb?.items?.find((it: any) => it.productId === product.id);
        current.unitPrice = pbItem ? Number(pbItem.listPrice) : (Number(product.price) || 0);
        current.taxRate = (product.taxRate !== undefined && product.taxRate !== null && !isNaN(Number(product.taxRate)))
          ? Number(product.taxRate)
          : 0;
      } else {
        current.productId = '';
        current.name = '';
        current.description = '';
        current.unitPrice = 0;
        current.discountPercent = 0;
        current.taxRate = 0;
      }

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

  const handlePriceBookChange = (newPbId: string) => {
    setPriceBookId(newPbId);

    if (!newPbId) {
      // Restore standard catalog prices when resetting to Standard Pricing
      setItems(prev =>
        prev.map(item => {
          if (!item.productId) return item;
          const prod = products.find(p => p.id === item.productId);
          if (prod) {
            const stdPrice = Number(prod.price) || 0;
            const qty = Math.max(0, Number(item.quantity) || 0);
            const disc = Math.max(0, Math.min(100, Number(item.discountPercent) || 0));
            const tax = Math.max(0, Number(item.taxRate) || 0);
            const discountedPrice = stdPrice * (1 - disc / 100);
            const taxAmount = discountedPrice * (tax / 100);
            return {
              ...item,
              unitPrice: stdPrice,
              amount: Math.round(qty * (discountedPrice + taxAmount) * 100) / 100
            };
          }
          return item;
        })
      );
      return;
    }

    const selectedPb = priceBooks.find(pb => pb.id === newPbId);
    if (!selectedPb || !Array.isArray(selectedPb.items)) return;

    setItems(prev =>
      prev.map(item => {
        if (!item.productId) return item;
        const pbItem = selectedPb.items.find((it: any) => it.productId === item.productId);
        if (pbItem) {
          const newUnitPrice = Number(pbItem.listPrice);
          const qty = Math.max(0, Number(item.quantity) || 0);
          const disc = Math.max(0, Math.min(100, Number(item.discountPercent) || 0));
          const tax = Math.max(0, Number(item.taxRate) || 0);
          const discountedPrice = newUnitPrice * (1 - disc / 100);
          const taxAmount = discountedPrice * (tax / 100);
          return {
            ...item,
            unitPrice: newUnitPrice,
            amount: Math.round(qty * (discountedPrice + taxAmount) * 100) / 100
          };
        }
        return item;
      })
    );
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
          
          const selectedPb = priceBooks.find(pb => pb.id === priceBookId);
          const pbItem = selectedPb?.items?.find((it: any) => it.productId === prod.id);
          current.unitPrice = pbItem ? Number(pbItem.listPrice) : (Number(prod.price) || 0);
          current.taxRate = (prod.taxRate !== undefined && prod.taxRate !== null && !isNaN(Number(prod.taxRate)))
            ? Number(prod.taxRate)
            : 0;
        } else {
          current.productId = '';
          current.name = '';
          current.description = '';
          current.unitPrice = 0;
          current.discountPercent = 0;
          current.taxRate = 0;
        }
      } else {
        (current as any)[field] = val;
      }

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

  const handleSave = async (targetStatus?: string, isSaveAndNew = false) => {
    if (!customerId && !customerName.trim()) {
      Swal.fire('Validation Error', 'Please select a contact from the dropdown or click "+ New Contact" to create one.', 'warning');
      return;
    }

    if (items.some(item => !item.name.trim())) {
      Swal.fire('Validation Error', 'Please enter item name for all rows.', 'warning');
      return;
    }

    const finalStatus = targetStatus || status;

    setIsLoading(true);
    try {
      const metaPayload = {
        orderNumber,
        referenceNumber,
        customerName: customerName.trim(),
        contactPerson: contactPerson.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        billingAddress: billingAddress.trim(),
        shippingAddress: shippingAddress.trim(),
        items,
        subtotal,
        totalDiscount,
        totalTax,
        shippingCharges: Number(shippingCharges) || 0,
        adjustment: Number(adjustment) || 0,
        grandTotal,
        rawNotes: notes.trim(),
        termsAndConditions: termsAndConditions.trim(),
      };

      const payload = {
        customerId: customerId || undefined,
        customerName: customerName.trim(),
        priceBookId: priceBookId || undefined,
        status: finalStatus,
        validUntil: validUntil ? new Date(validUntil).toISOString() : undefined,
        subtotal,
        taxAmount: totalTax,
        discountAmount: totalDiscount,
        totalAmount: grandTotal,
        shippingAddress: shippingAddress.trim() || undefined,
        billingAddress: billingAddress.trim() || undefined,
        notes: JSON.stringify(metaPayload),
      };

      if (isEditMode && id) {
        await api.put(`/sales-orders/${id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Sales Order Updated',
          text: `Sales Order ${orderNumber} updated successfully.`,
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/sales-orders');
      } else {
        await api.post('/sales-orders', payload);
        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Sales Order Created!',
            text: `Sales Order ${orderNumber} saved! You can now create another one.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          api.get('/sales-orders/next-number').then(res => {
            if (res.data?.nextNumber) setOrderNumber(res.data.nextNumber);
          }).catch(() => {});
          setReferenceNumber('');
          setCustomerId('');
          setCustomerName('');
          setContactPerson('');
          setCustomerEmail('');
          setCustomerPhone('');
          setBillingAddress('');
          setShippingAddress('');
          setShowAddress(false);
          setItems([
            {
              id: 'item-1',
              productId: '',
              name: '',
              description: '',
              quantity: 1,
              unitPrice: 0,
              discountPercent: 0,
              taxRate: 0,
              amount: 0,
            },
          ]);
          setShippingCharges(0);
          setAdjustment(0);
          setTermsAndConditions('');
          setNotes('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Sales Order Created',
            text: `Sales Order ${orderNumber} created successfully.`,
            timer: 1500,
            showConfirmButton: false,
          });
          navigate('/sales-orders');
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save sales order';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-sm text-gray-500">Loading order...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#f8fafc] overflow-hidden">
      {/* Top Header - Fixed at top, zero scroll, zero overlapping */}
      <div className="h-14 bg-white border-b border-gray-200 shrink-0 z-30">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/sales-orders')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Sales Orders"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Sales Order' : 'Create Sales Order'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/sales-orders')}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            {!isEditMode && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleSave(status, true)}
                className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Save and New
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleSave(status, false)}
              className="px-5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50 min-w-[76px] cursor-pointer"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content Area - Independent Scroll below fixed header */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="w-full space-y-6 pb-12">
          {/* Main Document Paper Sheet */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-8">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Sales Order Information</h2>
        </div>
        {/* Top Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-2">
          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Contact Details</h3>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Contact
              </label>
              <ContactSelectDropdown
                contacts={customers}
                selectedContactId={customerId}
                onSelectContact={(contact) => {
                  if (contact) {
                    setCustomerId(contact.id);
                    if (contact.customerType === 'Business' && contact.companyName) {
                      setCustomerName(contact.companyName);
                      setContactPerson(contact.name || '');
                    } else {
                      setCustomerName(contact.name || '');
                      setContactPerson(contact.name || '');
                    }
                    setCustomerEmail(contact.email || '');
                    setCustomerPhone(contact.phone || '');
                    if (contact.address) {
                      setBillingAddress(contact.address);
                      setShippingAddress(contact.address);
                      setShowAddress(true);
                    }
                  } else {
                    setCustomerId('');
                    setCustomerName('');
                    setContactPerson('');
                    setCustomerEmail('');
                    setCustomerPhone('');
                  }
                }}
                onContactCreated={(newContact) => {
                  setCustomers((prev) => [newContact, ...prev]);
                }}
              />
            </div>

            {/* Selected Contact Details Card */}
            {customerId || customerName ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {(customerName || contactPerson || 'C').charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">
                        {customerName}
                      </div>
                      {contactPerson && contactPerson !== customerName && (
                        <div className="text-gray-500 text-xs truncate">
                          Attn: {contactPerson}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Selected Contact
                  </span>
                </div>

                {(customerEmail || customerPhone) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-600 pt-2 border-t border-slate-200/70">
                    {customerEmail && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{customerEmail}</span>
                      </div>
                    )}
                    {customerPhone && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{customerPhone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50/70 border border-dashed border-amber-300 rounded-lg text-xs text-amber-800 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Please select a contact from the dropdown or click <strong>"+ New Contact"</strong> to add one.</span>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setShowAddress(!showAddress)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {showAddress ? '- Hide Address Details' : '+ Add Billing & Shipping Address'}
              </button>
            </div>

            {showAddress && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Billing Address
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs outline-none focus:border-indigo-500"
                    placeholder="Billing street, city, state, pin..."
                    value={billingAddress}
                    onChange={e => setBillingAddress(e.target.value)}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                      Shipping Address
                    </label>
                    <button
                      type="button"
                      onClick={() => setShippingAddress(billingAddress)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800"
                    >
                      Copy Billing
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    className="w-full px-3 py-1.5 rounded-md border border-gray-300 text-xs outline-none focus:border-indigo-500"
                    placeholder="Shipping / Delivery address..."
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Meta */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Order Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Sales Order #
                </label>
                <Input
                  readOnly
                  value={orderNumber}
                  className="h-9 text-sm font-mono bg-gray-50 text-gray-700 cursor-not-allowed border-gray-200 select-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Reference #
                </label>
                <Input
                  placeholder="PO / Quote Ref"
                  value={referenceNumber}
                  onChange={e => setReferenceNumber(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Order Date
                </label>
                <Input
                  type="datetime-local"
                  value={orderDate}
                  onChange={e => setOrderDate(e.target.value)}
                  className="h-9 text-sm relative pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2.5 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <Input
                  type="datetime-local"
                  value={validUntil}
                  onChange={e => setValidUntil(e.target.value)}
                  className="h-9 text-sm relative pr-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2.5 [&::-webkit-calendar-picker-indicator]:top-1/2 [&::-webkit-calendar-picker-indicator]:-translate-y-1/2 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:m-0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Order Status
                </label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {SALES_ORDER_STATUSES.map(st => (
                    <option key={st} value={st}>
                      {SALES_ORDER_STATUS_LABELS[st] || st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Price Book
                </label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                  value={priceBookId}
                  onChange={e => handlePriceBookChange(e.target.value)}
                >
                  <option value="">-- Standard Pricing --</option>
                  {priceBooks
                    .filter(pb => {
                      if (pb.id === priceBookId) return true;
                      const isActive = String(pb.status || '').toLowerCase() === 'active';
                      const isNotExpired = !pb.expiryDate || new Date(pb.expiryDate).setHours(23, 59, 59, 999) >= Date.now();
                      return isActive && isNotExpired;
                    })
                    .map(pb => {
                      const isExpired = pb.expiryDate && new Date(pb.expiryDate).setHours(23, 59, 59, 999) < Date.now();
                      const count = Array.isArray(pb.items) ? pb.items.length : 0;
                      return (
                        <option key={pb.id} value={pb.id}>
                          {pb.name} ({count} {count === 1 ? 'Product' : 'Products'}){isExpired ? ' (Expired)' : ''}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Ordered Items</h3>

          <div className="border border-gray-200 rounded-md overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4 min-w-[260px]">Item</th>
                  <th className="py-2.5 px-3 w-24 text-center">Quantity</th>
                  <th className="py-2.5 px-3 w-32 text-right">Rate (₹)</th>
                  <th className="py-2.5 px-3 w-28 text-center">Discount (%)</th>
                  <th className="py-2.5 px-3 w-28 text-center">Tax (GST)</th>
                  <th className="py-2.5 px-4 w-36 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 align-top">
                      <div className="space-y-1.5">
                        <ProductSelectDropdown
                          products={products}
                          selectedProductId={item.productId}
                          selectedProductName={item.name}
                          placeholder="Select or search item..."
                          onSelectProduct={(product) => handleProductSelect(idx, product)}
                          onProductCreated={(newProduct) => {
                            setProducts((prev) => [newProduct, ...prev]);
                          }}
                        />
                        <textarea
                          rows={2}
                          placeholder="Description"
                          value={item.description}
                          onChange={e => handleItemChange(idx, 'description', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-md border border-gray-300 text-xs text-gray-700 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y min-h-[48px]"
                        />
                      </div>
                    </td>

                    <td className="py-2.5 px-3 align-top text-center">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-20 h-8 text-center px-1 rounded border border-gray-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-top text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="w-28 h-8 text-right px-2 rounded border border-gray-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-top text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.discountPercent}
                        onChange={e => handleItemChange(idx, 'discountPercent', e.target.value)}
                        className="w-20 h-8 text-center px-1 rounded border border-gray-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-top text-center">
                      <select
                        value={item.taxRate}
                        onChange={e => handleItemChange(idx, 'taxRate', Number(e.target.value))}
                        className="w-20 h-8 text-center px-1 rounded border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                      >
                        {TAX_RATES.map(rate => (
                          <option key={rate} value={rate}>{rate}%</option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2.5 px-4 align-top text-right font-medium text-gray-900 pt-3">
                      ₹{Number(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-2.5 px-3 align-top text-center pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add another line item
            </button>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end pt-2 pb-6 border-b border-gray-100">
          <div className="w-full md:w-96 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-100">
            <div className="flex items-center justify-between p-3 px-4">
              <span className="text-xs font-medium text-gray-600">Sub Total (Rs.)</span>
              <input
                type="text"
                readOnly
                value={subtotal ? subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 0}
                className="w-44 h-9 px-3 rounded-md border border-indigo-200/60 bg-slate-50/70 text-right text-xs font-semibold text-gray-800 outline-none cursor-default"
              />
            </div>

            <div className="flex items-center justify-between p-3 px-4">
              <span className="text-xs font-medium text-gray-600">Discount (Rs.)</span>
              <input
                type="text"
                readOnly
                value={totalDiscount ? totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 0}
                className="w-44 h-9 px-3 rounded-md border border-indigo-200/60 bg-slate-50/70 text-right text-xs font-semibold text-gray-800 outline-none cursor-default"
              />
            </div>

            <div className="flex items-center justify-between p-3 px-4">
              <span className="text-xs font-medium text-gray-600">Tax (Rs.)</span>
              <input
                type="text"
                readOnly
                value={totalTax ? totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 0}
                className="w-44 h-9 px-3 rounded-md border border-indigo-200/60 bg-slate-50/70 text-right text-xs font-semibold text-gray-800 outline-none cursor-default"
              />
            </div>

            <div className="flex items-center justify-between p-3 px-4">
              <span className="text-xs font-medium text-gray-600">Adjustment (Rs.)</span>
              <input
                type="number"
                step="0.01"
                placeholder=""
                value={adjustment === 0 ? '' : adjustment}
                onChange={e => setAdjustment(e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                className="w-44 h-9 px-3 rounded-md border border-gray-300 bg-white text-right text-xs font-medium text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-3 px-4 bg-slate-50/30">
              <span className="text-xs font-semibold text-gray-700">Grand Total (Rs.)</span>
              <input
                type="text"
                readOnly
                value={grandTotal ? grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : 0}
                className="w-44 h-9 px-3 rounded-md border border-indigo-200/60 bg-slate-50/70 text-right text-xs font-bold text-gray-900 outline-none cursor-default"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions Section (Matching User Screenshot) */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Terms and Conditions</h3>
          <div className="flex items-start gap-6">
            <label className="w-44 sm:w-48 text-right pt-2 text-[13px] font-normal text-gray-500 shrink-0 select-none">
              Terms and Conditions
            </label>
            <div className="flex-1 max-w-4xl">
              <textarea
                rows={2}
                placeholder=""
                value={termsAndConditions}
                onChange={e => setTermsAndConditions(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y min-h-[52px]"
              />
            </div>
          </div>
        </div>

        {/* Description Information Section (Matching User Screenshot) */}
        <div className="pt-6">
          <h3 className="text-[15px] font-semibold text-gray-900 mb-4">Description Information</h3>
          <div className="flex items-start gap-6">
            <label className="w-44 sm:w-48 text-right pt-2 text-[13px] font-normal text-gray-500 shrink-0 select-none">
              Description
            </label>
            <div className="flex-1 max-w-4xl">
              <textarea
                rows={2}
                placeholder=""
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y min-h-[52px]"
              />
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
);
}
