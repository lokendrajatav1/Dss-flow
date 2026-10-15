import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LEAD_SOURCES, CALL_STATUSES } from '@/lib/constants';
import { Country, State, City } from 'country-state-city';
import api from '@/lib/api';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leadId: string, leadData: any) => Promise<void> | void;
  lead: any | null;
  type?: string;
}

export function EditLeadModal({ isOpen, onClose, onSubmit, lead, type = 'lead' }: EditLeadModalProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    clientName: '',
    companyName: '',
    phone: '',
    alternatePhone: '',
    whatsappNumber: '',
    email: '',
    jobTitle: '',
    country: '',
    state: '',
    city: '',
    industry: '',
    facebookUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    websiteUrl: '',
    address: '',
    leadType: '',
    source: '',
    notes: '',
    groupId: '',
    funnelId: '',
    assignedToId: '',
    callStatus: 'Untouched',
    feedback: '',
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    nextFollowUp: ''
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [funnels, setFunnels] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          const headers = { Authorization: `Bearer ${token}` };

          const [usersRes, groupsRes, funnelsRes] = await Promise.all([
            api.get('/users', { headers }),
            api.get('/leads/groups', { headers }),
            api.get('/leads/funnels', { headers })
          ]);

          setUsers(usersRes.data);
          setGroups(groupsRes.data);
          setFunnels(funnelsRes.data);
        } catch (err) {
          console.error('Failed to load initial data', err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && lead) {
      setFormData({
        name: lead.name || '',
        displayName: lead.displayName || '',
        clientName: lead.clientName || '',
        companyName: lead.companyName || '',
        phone: lead.phone || '',
        alternatePhone: lead.alternatePhone || '',
        whatsappNumber: lead.whatsappNumber || '',
        email: lead.email || '',
        jobTitle: lead.jobTitle || '',
        country: lead.country || '',
        state: lead.state || '',
        city: lead.city || '',
        industry: lead.industry || '',
        facebookUrl: lead.facebookUrl || '',
        twitterUrl: lead.twitterUrl || '',
        linkedinUrl: lead.linkedinUrl || '',
        websiteUrl: lead.websiteUrl || '',
        address: lead.address || '',
        leadType: lead.leadType || type || 'lead',
        source: lead.source || '',
        notes: lead.notes || '',
        groupId: lead.groupId || '',
        funnelId: lead.funnelId || '',
        assignedToId: lead.assignedToId || '',
        callStatus: lead.callStatus || 'Untouched',
        feedback: lead.feedback || '',
        date: lead.createdAt ? new Date(new Date(lead.createdAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
        nextFollowUp: lead.nextFollowUp ? new Date(new Date(lead.nextFollowUp).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
      });

      let cCode = '';
      if (lead.country) {
        const found = Country.getAllCountries().find(c => c.name === lead.country);
        if (found) cCode = found.isoCode;
      }
      setSelectedCountryCode(cCode);

      let sCode = '';
      if (lead.state && cCode) {
        const found = State.getStatesOfCountry(cCode).find(s => s.name === lead.state);
        if (found) sCode = found.isoCode;
      }
      setSelectedStateCode(sCode);
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(lead.id, formData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">Edit {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Contact Name *</label>
                <Input required placeholder="Enter Contact Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Display Name</label>
                <Input placeholder="Display Name" value={formData.displayName} onChange={e => handleChange('displayName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Client Name</label>
                <Input placeholder="Enter Client Name" value={formData.clientName} onChange={e => handleChange('clientName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Company Name</label>
                <Input placeholder="Company Name" value={formData.companyName} onChange={e => handleChange('companyName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Job Title</label>
                <Input placeholder="Job Title" value={formData.jobTitle} onChange={e => handleChange('jobTitle', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Industry</label>
                <Input placeholder="Industry" value={formData.industry} onChange={e => handleChange('industry', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Contact Number *</label>
                <Input required placeholder="Enter Contact Number" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Alternate Contact Number</label>
                <Input placeholder="Enter Alternate Number" value={formData.alternatePhone} onChange={e => handleChange('alternatePhone', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">WhatsApp Number</label>
                <Input placeholder="Enter WhatsApp Number" value={formData.whatsappNumber} onChange={e => handleChange('whatsappNumber', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email Address</label>
                <Input type="email" placeholder="Enter Email Address" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Country</label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm"
                  value={selectedCountryCode}
                  onChange={e => {
                    const code = e.target.value;
                    const name = Country.getCountryByCode(code)?.name || '';
                    setSelectedCountryCode(code);
                    setSelectedStateCode('');
                    setFormData(prev => ({ ...prev, country: name, state: '', city: '' }));
                  }}
                >
                  <option value="">Select Country</option>
                  {Country.getAllCountries().map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">State</label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={selectedStateCode}
                  disabled={!selectedCountryCode}
                  onChange={e => {
                    const code = e.target.value;
                    const name = State.getStateByCodeAndCountry(code, selectedCountryCode)?.name || '';
                    setSelectedStateCode(code);
                    setFormData(prev => ({ ...prev, state: name, city: '' }));
                  }}
                >
                  <option value="">Select State</option>
                  {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).map(s => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">City</label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={formData.city}
                  disabled={!selectedStateCode}
                  onChange={e => handleChange('city', e.target.value)}
                >
                  <option value="">Select City</option>
                  {selectedStateCode && City.getCitiesOfState(selectedCountryCode, selectedStateCode).map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Address</label>
                <Input placeholder="Enter Address" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Facebook Url</label>
                <Input placeholder="Facebook Url" value={formData.facebookUrl} onChange={e => handleChange('facebookUrl', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Twitter Url</label>
                <Input placeholder="Twitter Url" value={formData.twitterUrl} onChange={e => handleChange('twitterUrl', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Linkedin Url</label>
                <Input placeholder="Linkedin Url" value={formData.linkedinUrl} onChange={e => handleChange('linkedinUrl', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Website Url</label>
                <Input placeholder="Website Url" value={formData.websiteUrl} onChange={e => handleChange('websiteUrl', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Lead Source</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300  text-sm" value={formData.source} onChange={e => handleChange('source', e.target.value)}>
                  <option value="">Select Source</option>
                  {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Select Group</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300  text-sm" value={formData.groupId} onChange={e => handleChange('groupId', e.target.value)}>
                  <option value="">Select Group</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Select Funnel</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300  text-sm" value={formData.funnelId} onChange={e => handleChange('funnelId', e.target.value)}>
                  <option value="">Select Funnel</option>
                  {funnels.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">Note</label>
                <textarea
                  className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm"
                  placeholder="Enter Note"
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                />
              </div>

              <div className="md:col-span-3 flex justify-center mt-4 mb-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showAdvanced && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Team Member</label>
                    <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300  text-sm" value={formData.assignedToId} onChange={e => handleChange('assignedToId', e.target.value)}>
                      <option value="">Select Team</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Call Status</label>
                    <select className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300  text-sm" value={formData.callStatus} onChange={e => handleChange('callStatus', e.target.value)}>
                      <option value="">Select Call Status</option>
                      {CALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="hidden md:block"></div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Please give your feedback</label>
                    <textarea
                      className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm"
                      placeholder="Feedback..."
                      value={formData.feedback}
                      onChange={e => handleChange('feedback', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Date</label>
                    <input
                      type="datetime-local"
                      value={formData.date}
                      onChange={e => handleChange('date', e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Follow-up Date</label>
                    <input
                      type="datetime-local"
                      value={formData.nextFollowUp || ''}
                      onChange={e => handleChange('nextFollowUp', e.target.value)}
                      className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-white rounded-b-2xl z-10">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : 'Update'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
