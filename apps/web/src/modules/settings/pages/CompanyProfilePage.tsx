import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  UploadCloud,
  FileSignature,
  Trash2,
  Loader2,
  MapPin,
  Phone,
  CreditCard,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Country, State, City } from 'country-state-city';
import api from '@/lib/api';
import Swal from 'sweetalert2';

export const INDIAN_STATES = State.getStatesOfCountry('IN').map(s => s.name);

interface CompanyProfilePageProps {
  settings?: any;
  onRefresh?: () => void;
}

export function CompanyProfilePage({ settings: propSettings, onRefresh }: CompanyProfilePageProps = {}) {
  const [formData, setFormData] = useState({
    companyName: '',
    domain: '',
    logo: '',
    signature: '',
    gstNumber: '',
    panNumber: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    country: 'India',
    city: '',
    state: '',
    pincode: '',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    paymentTerms: 'Due on Receipt',
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: ''
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const [saving, setSaving] = useState(false);

  const populateForm = (data: any) => {
    if (!data) return;

    // Resolve Country Code
    const rawCountry = data.country || 'India';
    let countryObj = Country.getAllCountries().find(
      c => c.name.toLowerCase() === rawCountry.toLowerCase() || c.isoCode.toLowerCase() === rawCountry.toLowerCase()
    );
    if (!countryObj) {
      countryObj = Country.getCountryByCode('IN');
    }
    const countryCode = countryObj ? countryObj.isoCode : 'IN';
    setSelectedCountryCode(countryCode);

    // Resolve State Code
    let stateCode = '';
    const rawState = data.state || '';
    if (rawState) {
      const statesInCountry = State.getStatesOfCountry(countryCode);
      const foundState = statesInCountry.find(
        s => s.name.toLowerCase() === rawState.toLowerCase() || s.isoCode.toLowerCase() === rawState.toLowerCase()
      );
      if (foundState) {
        stateCode = foundState.isoCode;
      }
    }
    setSelectedStateCode(stateCode);

    setFormData({
      companyName: data.companyName || data.company?.name || '',
      domain: data.domain || data.company?.domain || '',
      logo: data.logo || '',
      signature: data.signature || data.sign || '',
      gstNumber: data.gstNumber || '',
      panNumber: data.panNumber || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      address: data.address || '',
      country: countryObj ? countryObj.name : rawCountry,
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
      currency: data.currency || 'INR (₹)',
      timezone: data.timezone || 'Asia/Kolkata (IST)',
      paymentTerms: data.paymentTerms || 'Due on Receipt',
      bankName: data.bankName || '',
      accountName: data.accountName || '',
      accountNumber: data.accountNumber || '',
      ifscCode: data.ifscCode || '',
      upiId: data.upiId || ''
    });
  };

  useEffect(() => {
    if (propSettings) {
      populateForm(propSettings);
    } else {
      // Standalone page mode: fetch own settings
      const fetchWorkspaceSettings = async () => {
        try {
          const res = await api.get('/companies/me');
          populateForm(res.data);
        } catch (err) {
          console.error('Failed to load company profile settings', err);
        }
      };
      fetchWorkspaceSettings();
    }
  }, [propSettings]);

  // Dynamic lists from country-state-city
  const countries = useMemo(() => Country.getAllCountries(), []);

  const states = useMemo(() => {
    return selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  }, [selectedCountryCode]);

  const cities = useMemo(() => {
    return (selectedCountryCode && selectedStateCode)
      ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
      : [];
  }, [selectedCountryCode, selectedStateCode]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (countryIsoCode: string) => {
    const countryObj = Country.getCountryByCode(countryIsoCode);
    setSelectedCountryCode(countryIsoCode);
    setSelectedStateCode('');
    setFormData(prev => ({
      ...prev,
      country: countryObj ? countryObj.name : '',
      state: '',
      city: ''
    }));
  };

  const handleStateChange = (stateIsoCode: string) => {
    const stateObj = State.getStateByCodeAndCountry(stateIsoCode, selectedCountryCode);
    setSelectedStateCode(stateIsoCode);
    setFormData(prev => ({
      ...prev,
      state: stateObj ? stateObj.name : '',
      city: ''
    }));
  };

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSign, setUploadingSign] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (field: 'logo' | 'signature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      Swal.fire('Invalid File', 'Please upload an image file (PNG, JPG, SVG, WebP).', 'warning');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire('File Too Large', 'Please upload an image smaller than 5MB.', 'warning');
      return;
    }

    const setUploading = field === 'logo' ? setUploadingLogo : setUploadingSign;
    setUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        // Upload to Cloudinary via backend endpoint (credentials stay strictly on backend!)
        const res = await api.post('/companies/upload', {
          file: base64Data,
          folder: field === 'logo' ? 'logos' : 'signatures'
        });
        if (res.data?.url) {
          setFormData(prev => ({ ...prev, [field]: res.data.url }));
        } else {
          setFormData(prev => ({ ...prev, [field]: base64Data }));
        }
      } catch (err) {
        console.warn('Backend Cloudinary upload endpoint fallback to base64', err);
        // Fallback: save base64 (backend updateMyCompany will auto-upload to Cloudinary on save)
        setFormData(prev => ({ ...prev, [field]: base64Data }));
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const handleRemoveImage = (field: 'logo' | 'signature') => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      Swal.fire('Required', 'Please enter your Company / Business Name.', 'warning');
      return;
    }

    setSaving(true);
    try {
      await api.put('/companies/me', formData);
      Swal.fire({
        title: 'Saved Successfully!',
        text: 'Your business profile and document details have been updated.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to save settings', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-gray-50 overflow-hidden">
      {/* Top Header - Always Fixed at top, zero scroll */}
      <div className="h-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-between shrink-0 z-30">
        <h1 className="text-xl font-bold text-gray-900">Company & Business Profile</h1>
        <Button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-10 text-sm font-semibold rounded-lg shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
        >
          {saving ? 'Saving...' : 'Save Company Profile'}
        </Button>
      </div>

      {/* Scrollable Form Body */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">

      {/* 0. Company Branding (Logo & Signature) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Company Logo & Signature</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <input
              type="file"
              ref={logoInputRef}
              onChange={(e) => handleFileUpload('logo', e)}
              accept="image/*"
              className="hidden"
            />
            {formData.logo ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-20 h-16 bg-white border border-gray-200 rounded-md p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={formData.logo}
                      alt="Company Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 truncate">Logo Uploaded</p>
                    <p className="text-xs text-gray-500">Appears on invoices and quotes</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="text-xs h-8"
                  >
                    {uploadingLogo ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingLogo}
                    onClick={() => handleRemoveImage('logo')}
                    className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingLogo && logoInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
              >
                {uploadingLogo ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {uploadingLogo ? 'Uploading to Cloudinary...' : 'Click to upload Company Logo'}
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG, SVG, WebP up to 5MB</span>
              </div>
            )}
          </div>

          {/* Signature Box */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Authorized Signature
            </label>
            <input
              type="file"
              ref={signInputRef}
              onChange={(e) => handleFileUpload('signature', e)}
              accept="image/*"
              className="hidden"
            />
            {formData.signature ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-24 h-16 bg-white border border-gray-200 rounded-md p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={formData.signature}
                      alt="Authorized Signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div className="truncate">
                    <p className="text-sm font-medium text-gray-800 truncate">Signature Uploaded</p>
                    <p className="text-xs text-gray-500">Appears on invoices and orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingSign}
                    onClick={() => signInputRef.current?.click()}
                    className="text-xs h-8"
                  >
                    {uploadingSign ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={uploadingSign}
                    onClick={() => handleRemoveImage('signature')}
                    className="text-xs h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadingSign && signInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors text-center"
              >
                {uploadingSign ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                ) : (
                  <FileSignature className="w-8 h-8 text-gray-400 mb-2" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {uploadingSign ? 'Uploading to Cloudinary...' : 'Click to upload Authorized Signature'}
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG with transparent background recommended</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Basic Identity */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company / Business Name <span className="text-rose-500">*</span>
            </label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="e.g. Acme Technologies Pvt Ltd"
              className="h-10 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Workspace Domain
            </label>
            <Input
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
              placeholder="e.g. mycompany.crm.com"
              className="h-10 text-sm bg-gray-50 text-gray-500"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              GSTIN / VAT Number
            </label>
            <Input
              value={formData.gstNumber}
              onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
              placeholder="e.g. 23AAAAA0000A1Z5"
              className="h-10 text-sm font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              PAN Number
            </label>
            <Input
              value={formData.panNumber}
              onChange={(e) => handleChange('panNumber', e.target.value.toUpperCase())}
              placeholder="e.g. ABCDE1234F"
              className="h-10 text-sm font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* 2. Registered Address (Powered by country-state-city) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Registered Business Address</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Street / Building Address
            </label>
            <Input
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. 102, Silver Arcade, Ring Road"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Country
            </label>
            <select
              value={selectedCountryCode}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer shadow-xs"
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              State / Union Territory (for GST Calculation)
            </label>
            <select
              value={selectedStateCode}
              disabled={!selectedCountryCode}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xs"
            >
              <option value="">{selectedCountryCode ? 'Select State / UT' : 'Select Country First'}</option>
              {states.map(st => (
                <option key={st.isoCode} value={st.isoCode}>{st.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              City
            </label>
            <select
              value={formData.city}
              disabled={!selectedStateCode}
              onChange={(e) => handleChange('city', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xs"
            >
              <option value="">{selectedStateCode ? 'Select City' : 'Select State First'}</option>
              {/* If city was saved previously and not in list, keep it available */}
              {formData.city && !cities.some(c => c.name.toLowerCase() === formData.city.toLowerCase()) && (
                <option value={formData.city}>{formData.city}</option>
              )}
              {cities.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Pincode / Postal Code
            </label>
            <Input
              value={formData.pincode}
              onChange={(e) => handleChange('pincode', e.target.value)}
              placeholder="e.g. 452001"
              className="h-10 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Official Website
            </label>
            <Input
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="e.g. https://mycompany.com"
              className="h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Official Contact Info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Official Contact Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Business Phone Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Business Email Address
            </label>
            <Input
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="e.g. billing@mycompany.com"
              className="h-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Bank Account & Payment Details */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Bank & Payment Details</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bank Name
            </label>
            <Input
              value={formData.bankName}
              onChange={(e) => handleChange('bankName', e.target.value)}
              placeholder="e.g. HDFC Bank / State Bank of India"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Account Holder Name
            </label>
            <Input
              value={formData.accountName}
              onChange={(e) => handleChange('accountName', e.target.value)}
              placeholder="e.g. Acme Technologies Pvt Ltd"
              className="h-10 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bank Account Number
            </label>
            <Input
              value={formData.accountNumber}
              onChange={(e) => handleChange('accountNumber', e.target.value)}
              placeholder="e.g. 50200012345678"
              className="h-10 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              IFSC Code
            </label>
            <Input
              value={formData.ifscCode}
              onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
              placeholder="e.g. HDFC0001234"
              className="h-10 text-sm font-mono uppercase"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              UPI ID / VPA
            </label>
            <Input
              value={formData.upiId}
              onChange={(e) => handleChange('upiId', e.target.value)}
              placeholder="e.g. company@okhdfcbank"
              className="h-10 text-sm font-mono max-w-md"
            />
          </div>
        </div>
      </div>

      {/* 5. Document Defaults & Dropdowns */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-semibold text-gray-900">Document Defaults & Preferences</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Default Payment Terms
            </label>
            <select
              value={formData.paymentTerms}
              onChange={(e) => handleChange('paymentTerms', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer shadow-xs"
            >
              <option value="Due on Receipt">Due on Receipt</option>
              <option value="Net 15 Days">Net 15 Days</option>
              <option value="Net 30 Days">Net 30 Days</option>
              <option value="Net 45 Days">Net 45 Days</option>
              <option value="Net 60 Days">Net 60 Days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Timezone
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 px-3.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors cursor-pointer shadow-xs"
            >
              <option value="Asia/Kolkata (IST)">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York (EST)">America/New_York (EST)</option>
              <option value="Europe/London (GMT)">Europe/London (GMT)</option>
              <option value="Asia/Dubai (GST)">Asia/Dubai (GST)</option>
            </select>
          </div>
        </div>
      </div>
      </div>

    </form>
  );
}
