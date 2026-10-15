import { useState, useRef, useEffect } from 'react';
import { User, Check, Plus, X, Building2, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface ContactSelectDropdownProps {
  contacts: any[];
  selectedContactId: string;
  onSelectContact: (contact: any | null) => void;
  onContactCreated?: (newContact: any) => void;
  placeholder?: string;
  className?: string;
}

export function ContactSelectDropdown({
  contacts,
  selectedContactId,
  onSelectContact,
  onContactCreated,
  placeholder = 'Search or select contact...',
  className = '',
}: ContactSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter contacts by query
  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q)
    );
  });

  const initialContactFormData = {
    name: '',
    email: '',
    phone: '',
    companyName: '',
    jobTitle: '',
    industry: '',
    address: '',
    customerType: 'Business',
  };

  // Modal form data
  const [formData, setFormData] = useState(initialContactFormData);

  const handleCreateContact = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setModalLoading(true);
    try {
      const res = await api.post('/customers', formData);
      const newContact = res.data;

      if (onContactCreated) {
        onContactCreated(newContact);
      }

      if (isSaveAndNew) {
        setFormData(initialContactFormData);
        Swal.fire({
          title: 'Contact Created!',
          text: `"${newContact.name}" created. You can now enter another contact.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      } else {
        onSelectContact(newContact);
        setIsModalOpen(false);
        setFormData(initialContactFormData);

        Swal.fire({
          title: 'Contact Created!',
          text: `"${newContact.name}" created and selected.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create contact';
      Swal.fire('Error', msg, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleSelect = (contact: any) => {
    onSelectContact(contact);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectContact(null);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input Box with Right Avatar Icon */}
      <div
        onClick={() => setIsOpen(true)}
        className={`flex items-stretch h-10 w-full rounded-md border bg-white cursor-pointer transition-all shadow-sm ${
          isOpen ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="text"
          value={isOpen ? searchQuery : (selectedContact ? `${selectedContact.name}${selectedContact.companyName ? ` (${selectedContact.companyName})` : ''}` : '')}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedContact ? selectedContact.name : placeholder}
          className="flex-1 min-w-0 px-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
        />

        {/* Clear Button if contact is selected */}
        {selectedContact && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear selection"
            className="px-2 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Right Avatar Button Container (Matching Screenshot) */}
        <div className="w-10 flex-none flex items-center justify-center bg-slate-50/80 border-l border-gray-200 text-gray-600 rounded-r-md">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 bg-white">
            <User className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Dropdown Popover (Exact Match to Screenshot) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-gray-200 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Contacts List or "No Contact found." */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {filteredContacts.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium text-slate-500">
                No Contact found.
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = contact.id === selectedContactId;
                return (
                  <div
                    key={contact.id}
                    onClick={() => handleSelect(contact)}
                    className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        <span>{contact.name}</span>
                        {contact.companyName && (
                          <span className="text-xs text-gray-400 font-normal">
                            ({contact.companyName})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                        {contact.email && <span>{contact.email}</span>}
                        {contact.phone && <span>{contact.phone}</span>}
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Bottom Action: "New Contact" (Matching Screenshot) */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsModalOpen(true);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Contact
          </button>
        </div>
      )}

      {/* Add New Contact Modal */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
              <h2 className="text-lg font-semibold text-gray-900">Add New Contact</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Type Selection */}
                <div className="flex gap-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Business"
                      checked={formData.customerType === 'Business'}
                      onChange={() => setFormData({ ...formData, customerType: 'Business' })}
                      className="text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">🏢 Business (B2B)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="Individual"
                      checked={formData.customerType === 'Individual'}
                      onChange={() => setFormData({ ...formData, customerType: 'Individual' })}
                      className="text-indigo-600 focus:ring-indigo-600 w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-900">👤 Individual (B2C)</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-9 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="pl-9 text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-9 text-sm"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  {formData.customerType === 'Business' && (
                    <>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Company / Organization</label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="pl-9 text-sm"
                            placeholder="ABC Pvt Ltd"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Job Title / Designation</label>
                        <div className="relative">
                          <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <Input
                            value={formData.jobTitle}
                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                            className="pl-9 text-sm"
                            placeholder="Manager"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Address / Location</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-9 text-sm"
                        placeholder="City, State, Country"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-white rounded-b-2xl z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={modalLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={modalLoading}
                  onClick={(e) => handleCreateContact(e, true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Save and New
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50 min-w-[76px] cursor-pointer"
                >
                  {modalLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
