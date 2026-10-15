import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: any | null;
  onSaved: () => void;
}

export function InvoiceModal({ isOpen, onClose, invoice, onSaved }: InvoiceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    paymentMethod: 'Bank Transfer',
    status: 'unpaid',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      // Fetch customers for dropdown
      api.get('/customers')
        .then(res => {
          const list = Array.isArray(res.data) ? res.data : (res.data?.customers || []);
          setCustomers(list);
        })
        .catch(() => {});

      if (invoice) {
        setFormData({
          customerId: invoice.customerId || '',
          customerName: invoice.customer?.name || '',
          amount: invoice.amount !== undefined ? String(invoice.amount) : '',
          dueDate: invoice.dueDate ? invoice.dueDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
          paymentMethod: invoice.paymentMethod || 'Bank Transfer',
          status: invoice.status || 'unpaid',
          notes: invoice.notes || '',
        });
      } else {
        setFormData({
          customerId: '',
          customerName: '',
          amount: '',
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
          paymentMethod: 'Bank Transfer',
          status: 'unpaid',
          notes: '',
        });
      }
    }
  }, [invoice, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'new') {
      setFormData(prev => ({ ...prev, customerId: '', customerName: '' }));
    } else {
      const selected = customers.find(c => c.id === val);
      setFormData(prev => ({
        ...prev,
        customerId: val,
        customerName: selected ? selected.name : '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim() && !formData.customerId) {
      Swal.fire('Validation Error', 'Client name or selection is required.', 'warning');
      return;
    }

    if (formData.amount === '' || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      Swal.fire('Validation Error', 'Please enter a valid invoice amount.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        customerId: formData.customerId || undefined,
        customerName: formData.customerName.trim(),
        amount: parseFloat(formData.amount) || 0,
        dueDate: formData.dueDate || new Date().toISOString(),
        paymentMethod: formData.paymentMethod,
        status: formData.status,
      };

      if (invoice && invoice.id) {
        await api.put(`/invoices/${invoice.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Invoice updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await api.post('/invoices', payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Invoice generated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save invoice';
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
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
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
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Select Existing Customer */}
              {customers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Select Existing Client
                  </label>
                  <select
                    className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                    value={formData.customerId}
                    onChange={handleSelectCustomer}
                  >
                    <option value="">-- Choose Existing Client --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} {c.companyName ? `(${c.companyName})` : ''}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Client Name Input */}
              <div className={customers.length > 0 ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Client / Company Name *
                </label>
                <Input
                  required
                  placeholder="Enter Client or Company Name"
                  value={formData.customerName}
                  onChange={e => handleChange('customerName', e.target.value)}
                />
              </div>

              {/* Invoice Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Invoice Amount (₹) *
                </label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={e => handleChange('amount', e.target.value)}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Due Date *
                </label>
                <Input
                  required
                  type="date"
                  value={formData.dueDate}
                  onChange={e => handleChange('dueDate', e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Payment Method
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.paymentMethod}
                  onChange={e => handleChange('paymentMethod', e.target.value)}
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                  <option value="UPI">UPI / Instant Pay</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Invoice Status
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
            >
              {isLoading ? 'Saving...' : 'Save Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
