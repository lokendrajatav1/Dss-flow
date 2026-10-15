import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, Mail, Phone, Building2, Users, RefreshCw, Trash2, 
  Edit, Globe, MapPin, Briefcase, MessageSquare, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function ContactsPage() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Bulk Selection & Pagination
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      const list = Array.isArray(res.data) ? res.data : (res.data?.customers || []);
      setContacts(list);
    } catch (err) {
      console.error('Failed to fetch contacts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    navigate('/contacts/create');
  };

  const handleOpenEdit = (contact: any) => {
    navigate(`/contacts/edit/${contact.id}`);
  };

  const handleDelete = async (id: string, name?: string) => {
    const result = await MySwal.fire({
      title: 'Delete Contact?',
      text: name ? `"${name}" will be permanently deleted.` : 'This contact will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setContacts(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Contact has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete contact.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await MySwal.fire({
      title: 'Delete Selected Contacts?',
      text: `Are you sure you want to delete ${selectedIds.length} contact(s)?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete them!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          selectedIds.map(id => api.delete(`/customers/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setContacts(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        MySwal.fire('Deleted!', 'Selected contacts have been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete some contacts.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    const q = searchQuery.toLowerCase().trim();
    const custom = contact.customData || {};
    const matchesSearch = !q || (
      (contact.name || '').toLowerCase().includes(q) ||
      (contact.companyName || contact.company || '').toLowerCase().includes(q) ||
      (contact.email || '').toLowerCase().includes(q) ||
      (contact.phone || '').toLowerCase().includes(q) ||
      (custom.city || '').toLowerCase().includes(q) ||
      (custom.gstin || '').toLowerCase().includes(q)
    );

    const matchesType = filterType === 'all' || (contact.customerType || 'Business') === filterType;
    const matchesStatus = filterStatus === 'all' || (contact.status || 'Active').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredContacts.length / pageSize));
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isAllSelected = paginatedContacts.length > 0 && paginatedContacts.every(c => selectedIds.includes(c.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedContacts.map(c => c.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allIds])));
    } else {
      const paginatedIdSet = new Set(paginatedContacts.map(c => c.id));
      setSelectedIds(selectedIds.filter(id => !paginatedIdSet.has(id)));
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar (matches ProductsPage/VendorsPage/InvoicesPage design) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Contacts : {filteredContacts.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAdd}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Contact
          </Button>

          <Button
            onClick={fetchContacts}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md shadow-none flex items-center justify-center"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-9 w-9 p-0 rounded-md shadow-none flex items-center justify-center disabled:opacity-50 cursor-pointer"
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Box */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="Business">Business (B2B)</option>
            <option value="Individual">Individual (B2C)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Page Size Filter */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[22%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                    CONTACT NAME
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-gray-200">COMPANY & INDUSTRY</th>
                <th className="px-4 py-3 border-r border-gray-200">EMAIL</th>
                <th className="px-4 py-3 border-r border-gray-200">PHONE</th>
                <th className="px-4 py-3 border-r border-gray-200">LOCATION & GST</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">TYPE</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Loading contacts...
                    </div>
                  </td>
                </tr>
              ) : paginatedContacts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-1.5" />
                    <p className="font-medium text-gray-700">No contacts found</p>
                    <p className="text-xs text-gray-400 mt-0.5">Click "+ Add Contact" to add your first client contact.</p>
                  </td>
                </tr>
              ) : (
                paginatedContacts.map((contact) => {
                  const custom = contact.customData || {};
                  const isBusiness = (contact.customerType || 'Business') === 'Business';
                  const isChecked = selectedIds.includes(contact.id);

                  return (
                    <tr
                      key={contact.id}
                      className={`hover:bg-gray-50/50 group transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}
                    >
                      {/* Name with Checkbox and Avatar */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={() => handleSelectRow(contact.id)}
                          />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isBusiness ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {getInitials(contact.name)}
                          </div>
                          <div className="min-w-0">
                            <span
                              onClick={() => handleOpenEdit(contact)}
                              className="font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors block truncate"
                            >
                              {contact.name}
                            </span>
                            {contact.jobTitle && (
                              <span className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
                                <Briefcase className="w-3 h-3 text-gray-400" />
                                {contact.jobTitle}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Company & Industry */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="space-y-0.5">
                          {contact.companyName || contact.company ? (
                            <div className="flex items-center gap-1.5 font-medium text-gray-800">
                              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <span>{contact.companyName || contact.company}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {contact.industry && (
                            <span className="inline-block text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {contact.industry}
                            </span>
                          )}
                          {contact.website && (
                            <div>
                              <a 
                                href={contact.website.startsWith('http') ? contact.website : `https://${contact.website}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3 h-3" />
                                {contact.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-xs border-r border-gray-100">
                        {contact.email ? (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                              {contact.email}
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-xs border-r border-gray-100">
                        <div className="space-y-1">
                          {contact.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              <a href={`tel:${contact.phone}`} className="text-gray-700 hover:underline">
                                {contact.phone}
                              </a>
                            </div>
                          )}
                          {custom.whatsapp && (
                            <div className="flex items-center gap-1.5 text-emerald-600">
                              <MessageSquare className="w-3 h-3 shrink-0" />
                              <a 
                                href={`https://wa.me/${String(custom.whatsapp).replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="hover:underline text-[11px]"
                              >
                                {custom.whatsapp}
                              </a>
                            </div>
                          )}
                          {!contact.phone && !custom.whatsapp && <span className="text-gray-400">—</span>}
                        </div>
                      </td>

                      {/* Location & Tax */}
                      <td className="px-4 py-3 text-xs border-r border-gray-100">
                        <div className="space-y-0.5 text-gray-600">
                          {(custom.city || custom.state || contact.address) ? (
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {[custom.city, custom.state].filter(Boolean).join(', ') || contact.address}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                          {custom.gstin && (
                            <div className="text-[10px] text-gray-500 font-mono">
                              GST: <span className="font-semibold text-gray-700">{custom.gstin}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isBusiness 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {contact.customerType || 'Business'}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            (contact.status || 'Active').toLowerCase() === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {contact.status || 'Active'}
                        </span>
                      </td>

                      {/* Quick Action Icons */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(contact)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Contact"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id, contact.name)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing <span className="font-medium text-gray-700">{filteredContacts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-gray-700">{Math.min(currentPage * pageSize, filteredContacts.length)}</span> of <span className="font-medium text-gray-700">{filteredContacts.length}</span> entries
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-medium ${
                  currentPage === page ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
