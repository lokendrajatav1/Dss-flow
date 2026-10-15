import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { VENDOR_STATUSES } from '@/lib/constants';

const initialVendorFormData = {
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

export function CreateVendorPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  // Form State
  const [formData, setFormData] = useState(initialVendorFormData);

  useEffect(() => {
    if (isEditMode && id) {
      fetchVendorDetails(id);
    } else {
      setFormData(initialVendorFormData);
    }
  }, [id, isEditMode]);

  const fetchVendorDetails = async (vendorId: string) => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/vendors/${vendorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      if (data) {
        setFormData({
          name: data.name || '',
          contactPerson: data.contactPerson || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'India',
          taxId: data.taxId || '',
          status: data.status || 'Active',
          notes: data.notes || '',
        });
      }
    } catch (err) {
      console.error('Failed to load vendor details', err);
      Swal.fire('Error', 'Failed to load vendor details.', 'error');
      navigate('/vendors');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire('Required Field', 'Please enter vendor / supplier name.', 'warning');
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
        country: formData.country.trim() || 'India',
        taxId: formData.taxId.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      };

      if (isEditMode && id) {
        await api.put(`/vendors/${id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Vendor updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/vendors');
      } else {
        await api.post('/vendors', payload);
        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Vendor Created!',
            text: `Vendor "${formData.name}" added successfully. You can now add another vendor.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          setFormData(initialVendorFormData);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'New vendor registered successfully.',
            timer: 1500,
            showConfirmButton: false,
          });
          navigate('/vendors');
        }
      }
    } catch (err: any) {
      console.error('Failed to save vendor', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save vendor.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading vendor details...</p>
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
              onClick={() => navigate('/vendors')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Vendors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Vendor' : 'Create Vendor'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/vendors')}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            {!isEditMode && (
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Save and New
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleSubmit(e, false)}
              className="px-5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50 min-w-[76px] cursor-pointer"
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content Area - Independent Scroll below fixed header */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={(e) => handleSubmit(e, false)} className="w-full space-y-6 pb-12">
          {/* Main Form Sheet */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-8">
        
        {/* Section 1: Basic Vendor Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Vendor Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vendor / Supplier Name *
              </label>
              <Input
                required
                placeholder="e.g. Acme Industrial Supplies Ltd"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Primary Contact Person
              </label>
              <Input
                placeholder="Representative name"
                value={formData.contactPerson}
                onChange={e => handleChange('contactPerson', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="vendor@company.com"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phone / Mobile Number
              </label>
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Vendor Status
              </label>
              <select
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                value={formData.status}
                onChange={e => handleChange('status', e.target.value)}
              >
                {VENDOR_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Tax & Compliance */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Tax & Compliance</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                GSTIN / Tax ID
              </label>
              <Input
                placeholder="e.g. 27ABCDE1234F1Z5"
                value={formData.taxId}
                onChange={e => handleChange('taxId', e.target.value)}
                className="h-9 text-sm font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Address & Location */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Address & Warehouse Location</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Street Address / Facility
              </label>
              <Input
                placeholder="Plot no, Industrial area, Landmark..."
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                City
              </label>
              <Input
                placeholder="e.g. Mumbai, Ahmedabad"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                State / Province
              </label>
              <Input
                placeholder="e.g. Maharashtra, Gujarat"
                value={formData.state}
                onChange={e => handleChange('state', e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Country
              </label>
              <Input
                placeholder="India"
                value={formData.country}
                onChange={e => handleChange('country', e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Commercial Notes & Terms */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Payment Terms & Notes
          </label>
          <textarea
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm outline-none focus:border-indigo-500 placeholder:text-gray-400"
            placeholder="Payment terms (e.g. Net 30, Advance), bank IFSC details, or vendor remarks..."
            value={formData.notes}
            onChange={e => handleChange('notes', e.target.value)}
          />
        </div>
          </div>
        </form>
      </div>
    </div>
  );
}

