import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { VendorSelectDropdown } from '@/components/common/VendorSelectDropdown';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: any | null;
  onSaved: () => void;
}

export function PurchaseOrderModal({ isOpen, onClose, order, onSaved }: PurchaseOrderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vendorId: '',
    vendorName: '',
    status: 'pending',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    subtotal: '',
    taxAmount: '0',
    discountAmount: '0',
    totalAmount: '',
    shippingAddress: '',
    billingAddress: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Load vendors
      api.get('/vendors')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.vendors || []);
          setVendors(list);
        })
        .catch(() => {});

      if (order) {
        setFormData({
          vendorId: order.vendorId || '',
          vendorName: order.vendor?.name || '',
          status: order.status || 'pending',
          validUntil: order.validUntil ? order.validUntil.slice(0, 10) : new Date().toISOString().slice(0, 10),
          subtotal: order.subtotal !== undefined ? String(order.subtotal) : String(order.totalAmount || ''),
          taxAmount: order.taxAmount !== undefined ? String(order.taxAmount) : '0',
          discountAmount: order.discountAmount !== undefined ? String(order.discountAmount) : '0',
          totalAmount: order.totalAmount !== undefined ? String(order.totalAmount) : '',
          shippingAddress: order.shippingAddress || '',
          billingAddress: order.billingAddress || '',
          notes: order.notes || '',
        });
      } else {
        setFormData({
          vendorId: '',
          vendorName: '',
          status: 'pending',
          validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
          subtotal: '',
          taxAmount: '0',
          discountAmount: '0',
          totalAmount: '',
          shippingAddress: '',
          billingAddress: '',
          notes: '',
        });
      }
    }
  }, [order, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'subtotal' || field === 'taxAmount' || field === 'discountAmount') {
        const sub = parseFloat(field === 'subtotal' ? value : prev.subtotal) || 0;
        const tax = parseFloat(field === 'taxAmount' ? value : prev.taxAmount) || 0;
        const disc = parseFloat(field === 'discountAmount' ? value : prev.discountAmount) || 0;
        next.totalAmount = Math.max(0, sub + tax - disc).toFixed(2);
      }
      return next;
    });
  };

  const handleSelectVendor = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const selected = vendors.find(v => v.id === val);
    setFormData(prev => ({
      ...prev,
      vendorId: val,
      vendorName: selected ? selected.name : prev.vendorName,
      billingAddress: selected?.address || prev.billingAddress,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendorName.trim() && !formData.vendorId) {
      Swal.fire('Validation Error', 'Vendor name or selection is required.', 'warning');
      return;
    }

    const sub = parseFloat(formData.subtotal) || 0;
    const tot = parseFloat(formData.totalAmount) || sub;
    if (tot <= 0) {
      Swal.fire('Validation Error', 'Please enter a valid order amount.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        vendorId: formData.vendorId || undefined,
        vendorName: formData.vendorName.trim(),
        status: formData.status,
        validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : undefined,
        subtotal: sub || tot,
        taxAmount: parseFloat(formData.taxAmount) || 0,
        discountAmount: parseFloat(formData.discountAmount) || 0,
        totalAmount: tot,
        shippingAddress: formData.shippingAddress.trim() || undefined,
        billingAddress: formData.billingAddress.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      if (order && order.id) {
        await api.put(`/purchase-orders/${order.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Purchase order updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post('/purchase-orders', payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Purchase order created successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save purchase order';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">
            {order ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Select Existing Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Select Vendor
                </label>
                <VendorSelectDropdown
                  vendors={vendors}
                  selectedVendorId={formData.vendorId}
                  onSelectVendor={(v) => {
                    if (v) {
                      setFormData(prev => ({
                        ...prev,
                        vendorId: v.id,
                        vendorName: v.name || '',
                        vendorEmail: v.email || '',
                        vendorPhone: v.phone || '',
                        billingAddress: v.address || prev.billingAddress,
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        vendorId: '',
                        vendorName: '',
                        vendorEmail: '',
                        vendorPhone: '',
                      }));
                    }
                  }}
                  onVendorCreated={(newV) => {
                    setVendors(prev => [newV, ...prev]);
                  }}
                />
              </div>

              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Vendor Name / Company *
                </label>
                <Input
                  required
                  placeholder="Enter Vendor Name"
                  value={formData.vendorName}
                  onChange={e => handleChange('vendorName', e.target.value)}
                />
              </div>

              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Order Status
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="ordered">Ordered</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Valid Until / Expected Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Expected Delivery Date
                </label>
                <Input
                  type="date"
                  value={formData.validUntil}
                  onChange={e => handleChange('validUntil', e.target.value)}
                />
              </div>

              {/* Subtotal */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Subtotal (₹) *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.subtotal}
                  onChange={e => handleChange('subtotal', e.target.value)}
                />
              </div>

              {/* Tax Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tax Amount (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.taxAmount}
                  onChange={e => handleChange('taxAmount', e.target.value)}
                />
              </div>

              {/* Discount Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Discount (₹)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.discountAmount}
                  onChange={e => handleChange('discountAmount', e.target.value)}
                />
              </div>

              {/* Total Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Total Amount (₹) *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.totalAmount}
                  onChange={e => handleChange('totalAmount', e.target.value)}
                />
              </div>

              {/* Billing Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Vendor Billing Address
                </label>
                <Input
                  placeholder="Enter vendor billing address"
                  value={formData.billingAddress}
                  onChange={e => handleChange('billingAddress', e.target.value)}
                />
              </div>

              {/* Shipping Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Delivery / Receiving Warehouse Address
                </label>
                <Input
                  placeholder="Enter warehouse or delivery location"
                  value={formData.shippingAddress}
                  onChange={e => handleChange('shippingAddress', e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  placeholder="Terms, PO reference, delivery notes..."
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[130px]"
            >
              {isLoading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
