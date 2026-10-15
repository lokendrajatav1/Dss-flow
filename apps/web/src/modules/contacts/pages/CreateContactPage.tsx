import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { Country, State, City } from 'country-state-city';

const INDUSTRIES = [
  'Information Technology',
  'Manufacturing',
  'Retail & Wholesale',
  'Real Estate & Construction',
  'Finance & Banking',
  'Healthcare & Pharma',
  'Logistics & Transport',
  'Education & Training',
  'Hospitality & Tourism',
  'Services & Consulting',
  'Other'
];

const initialContactFormData = {
  name: '',
  customerType: 'Business' as 'Business' | 'Individual',
  email: '',
  phone: '',
  whatsapp: '',
  companyName: '',
  jobTitle: '',
  industry: '',
  website: '',
  gstin: '',
  country: 'India',
  city: '',
  state: '',
  address: '',
  status: 'Active' as 'Active' | 'Inactive'
};

export function CreateContactPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [formData, setFormData] = useState(initialContactFormData);

  // Country, State, City selectors
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const countries = useMemo(() => Country.getAllCountries(), []);

  const states = useMemo(() => {
    return selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : [];
  }, [selectedCountryCode]);

  const cities = useMemo(() => {
    return (selectedCountryCode && selectedStateCode)
      ? City.getCitiesOfState(selectedCountryCode, selectedStateCode)
      : [];
  }, [selectedCountryCode, selectedStateCode]);

  useEffect(() => {
    if (isEditMode && id) {
      fetchContactDetails();
    }
  }, [id]);

  const fetchContactDetails = async () => {
    try {
      setIsFetching(true);
      const res = await api.get(`/customers/${id}`);
      const contact = res.data;
      const custom = contact.customData || {};
      const countryVal = custom.country || 'India';
      const stateVal = custom.state || '';
      const cityVal = custom.city || '';

      const allCountries = Country.getAllCountries();
      const foundCountry = allCountries.find(
        c => c.name.toLowerCase() === countryVal.toLowerCase() || c.isoCode.toLowerCase() === countryVal.toLowerCase()
      );
      const cCode = foundCountry ? foundCountry.isoCode : 'IN';
      setSelectedCountryCode(cCode);

      if (stateVal) {
        const countryStates = State.getStatesOfCountry(cCode);
        const foundState = countryStates.find(
          s => s.name.toLowerCase() === stateVal.toLowerCase() || s.isoCode.toLowerCase() === stateVal.toLowerCase()
        );
        if (foundState) {
          setSelectedStateCode(foundState.isoCode);
        }
      }

      setFormData({
        name: contact.name || '',
        customerType: contact.customerType || 'Business',
        email: contact.email || '',
        phone: contact.phone || '',
        whatsapp: custom.whatsapp || '',
        companyName: contact.companyName || contact.company || '',
        jobTitle: contact.jobTitle || '',
        industry: contact.industry || '',
        website: contact.website || '',
        gstin: custom.gstin || '',
        country: foundCountry ? foundCountry.name : countryVal,
        city: cityVal,
        state: stateVal,
        address: contact.address || '',
        status: contact.status || 'Active'
      });
    } catch (err: any) {
      console.error('Failed to fetch contact details', err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to load contact.', 'error');
      navigate('/contacts');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCountryChange = (countryIso: string) => {
    const countryObj = Country.getCountryByCode(countryIso);
    setSelectedCountryCode(countryIso);
    setSelectedStateCode('');
    setFormData(prev => ({
      ...prev,
      country: countryObj ? countryObj.name : '',
      state: '',
      city: ''
    }));
  };

  const handleStateChange = (stateIso: string) => {
    const stateObj = State.getStateByCodeAndCountry(stateIso, selectedCountryCode);
    setSelectedStateCode(stateIso);
    setFormData(prev => ({
      ...prev,
      state: stateObj ? stateObj.name : '',
      city: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Validation Error', 'Contact name is required', 'warning');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      customerType: formData.customerType,
      email: formData.email.trim() || null,
      phone: formData.phone.trim() || null,
      companyName: formData.companyName.trim() || null,
      jobTitle: formData.jobTitle.trim() || null,
      industry: formData.industry || null,
      website: formData.website.trim() || null,
      address: formData.address.trim() || null,
      status: formData.status,
      customData: {
        whatsapp: formData.whatsapp.trim() || null,
        gstin: formData.gstin.trim() || null,
        country: formData.country.trim() || 'India',
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
      }
    };

    setIsLoading(true);
    try {
      if (isEditMode && id) {
        await api.put(`/customers/${id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Contact updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/contacts');
      } else {
        await api.post('/customers', payload);
        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Contact Created!',
            text: `Contact "${formData.name}" added successfully. You can now add another contact.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          setFormData(initialContactFormData);
          setSelectedCountryCode('IN');
          setSelectedStateCode('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'New contact added successfully.',
            timer: 1500,
            showConfirmButton: false,
          });
          navigate('/contacts');
        }
      }
    } catch (err: any) {
      console.error('Failed to save contact', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save contact.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading contact details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#f8fafc] overflow-hidden">
      {/* Top Header - Fixed flush at the top, perfectly aligned with form */}
      <div className="h-14 bg-white border-b border-gray-200 shrink-0 z-30">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/contacts')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Contacts"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Contact' : 'Create Contact'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/contacts')}
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

      {/* Form Content Area - Independent Scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={(e) => handleSubmit(e, false)} className="w-full space-y-6 pb-12">
          {/* Main Form Sheet */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-8">
            
            {/* Customer Type Toggle */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contact Classification
              </label>
              <div className="inline-flex rounded-md border border-gray-200 p-1 bg-gray-50">
                {(['Business', 'Individual'] as const).map(type => {
                  const isSelected = formData.customerType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange('customerType', type)}
                      className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${
                        isSelected
                          ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {type === 'Business' ? 'Business (B2B)' : 'Individual (B2C)'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Contact Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="rahul@company.com"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="h-9 text-xs"
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
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    WhatsApp Number
                  </label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={formData.whatsapp}
                    onChange={e => handleChange('whatsapp', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Business & Work Information */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                Business & Professional Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Company / Organization Name
                  </label>
                  <Input
                    placeholder="e.g. Apex Global Tech Ltd"
                    value={formData.companyName}
                    onChange={e => handleChange('companyName', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Job Title / Designation
                  </label>
                  <Input
                    placeholder="e.g. Procurement Director, VP Sales"
                    value={formData.jobTitle}
                    onChange={e => handleChange('jobTitle', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Industry
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-xs bg-white outline-none focus:border-indigo-500"
                    value={formData.industry}
                    onChange={e => handleChange('industry', e.target.value)}
                  >
                    <option value="">Select Industry</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <Input
                    placeholder="e.g. https://apex.com"
                    value={formData.website}
                    onChange={e => handleChange('website', e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GSTIN / Tax ID
                  </label>
                  <Input
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    value={formData.gstin}
                    onChange={e => handleChange('gstin', e.target.value.toUpperCase())}
                    className="h-9 text-xs uppercase font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Location & Address (Powered by country-state-city) */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
                Address & Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full h-9 rounded-md border border-gray-300 px-3 text-xs bg-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    value={selectedStateCode}
                    disabled={!selectedCountryCode}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full h-9 rounded-md border border-gray-300 px-3 text-xs bg-white outline-none focus:border-blue-500 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{selectedCountryCode ? 'Select State' : 'Select Country First'}</option>
                    {states.map(st => (
                      <option key={st.isoCode} value={st.isoCode}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <select
                    value={formData.city}
                    disabled={!selectedStateCode && cities.length === 0}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full h-9 rounded-md border border-gray-300 px-3 text-xs bg-white outline-none focus:border-blue-500 cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">{selectedStateCode ? 'Select City' : 'Select State First'}</option>
                    {formData.city && !cities.some(c => c.name.toLowerCase() === formData.city.toLowerCase()) && (
                      <option value={formData.city}>{formData.city}</option>
                    )}
                    {cities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Office / Billing Address
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Street address, building, plot no, pincode..."
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    className="w-full text-xs p-2.5 rounded-md border border-gray-300 outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
