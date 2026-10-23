import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { VENDOR_STATUSES } from '@/lib/constants';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendor?: any | null;
  onSaved: (vendor?: any) => void;
}

const initialFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  taxId: '',
  status: 'Active',
  notes: '',
};

export function VendorModal({ isOpen, onClose, vendor, onSaved }: VendorModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isOpen) {
      if (vendor) {
        setFormData({
          name: vendor.name || '',
          contactPerson: vendor.contactPerson || '',
          email: vendor.email || '',
          phone: vendor.phone || '',
          address: vendor.address || '',
          city: vendor.city || '',
          state: vendor.state || '',
          country: vendor.country || 'India',
          taxId: vendor.taxId || '',
          status: vendor.status || 'Active',
          notes: vendor.notes || '',
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [vendor, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Validation Error', 'Vendor name is required.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        contactPerson: formData.contactPerson.trim() || undefined,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        country: formData.country.trim() || undefined,
        taxId: formData.taxId.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };

      if (vendor && vendor.id) {
        const res = await api.put(`/vendors/${vendor.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Vendor updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        onSaved(res.data);
        onClose();
      } else {
        const res = await api.post('/vendors', payload);
        onSaved(res.data);

        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Vendor Added!',
            text: 'You can now enter another vendor.',
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          setFormData(initialFormData);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Vendor added successfully',
            timer: 1500,
            showConfirmButton: false,
          });
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save vendor';
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
            {vendor ? 'Edit Vendor' : 'Add New Vendor'}
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
              {/* Vendor Company Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Vendor / Supplier Name *
                </label>
                <Input
                  required
                  placeholder="e.g. Acme Industrial Supplies Ltd"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Contact Person
                </label>
                <Input
                  placeholder="Primary representative name"
                  value={formData.contactPerson}
                  onChange={e => handleChange('contactPerson', e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Status
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  {VENDOR_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="vendor@company.com"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>

              {/* Tax ID / GSTIN */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  GST / Tax ID
                </label>
                <Input
                  placeholder="GSTIN / Tax ID"
                  value={formData.taxId}
                  onChange={e => handleChange('taxId', e.target.value)}
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  City
                </label>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={e => handleChange('city', e.target.value)}
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  State / Province
                </label>
                <Input
                  placeholder="State"
                  value={formData.state}
                  onChange={e => handleChange('state', e.target.value)}
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Country
                </label>
                <Input
                  placeholder="Country"
                  value={formData.country}
                  onChange={e => handleChange('country', e.target.value)}
                />
              </div>

              {/* Full Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Complete Address
                </label>
                <Input
                  placeholder="Street, Industrial Area, Building..."
                  value={formData.address}
                  onChange={e => handleChange('address', e.target.value)}
                />
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  placeholder="Payment terms, bank details, delivery lead times..."
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Footer (Matching Screenshot: Cancel, Save and New, Save) */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-white rounded-b-2xl z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            {!vendor && (
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Save and New
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50 min-w-[76px] cursor-pointer"
            >
              {isLoading ? 'Saving...' : (vendor ? 'Update Vendor' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
