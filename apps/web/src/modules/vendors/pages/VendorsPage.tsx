import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import { VENDOR_STATUSES, VENDOR_STATUS_COLORS } from '@/lib/constants';

const MySwal = withReactContent(Swal);

export function VendorsPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination, Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/vendors', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.vendors || []);
      setVendors(data);
    } catch (err) {
      console.error('Failed to fetch vendors', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/vendors/create');
  };

  const handleOpenEditModal = (vendor: any) => {
    navigate(`/vendors/edit/${vendor.id}`);
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This vendor will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/vendors/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setVendors(prev => prev.filter(v => v.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Vendor has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete vendor.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one vendor to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: 'Delete Selected Vendors?',
      text: `Are you sure you want to delete ${selectedIds.length} vendor(s)?`,
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
          selectedIds.map(id => api.delete(`/vendors/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setVendors(prev => prev.filter(v => !selectedIds.includes(v.id)));
        setSelectedIds([]);
        MySwal.fire('Deleted!', 'Selected vendors have been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete some vendors.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedVendors.map(v => v.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allIds])));
    } else {
      const paginatedIdSet = new Set(paginatedVendors.map(v => v.id));
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

  const filteredVendors = vendors.filter(vendor => {
    const name = (vendor.name || '').toLowerCase();
    const contact = (vendor.contactPerson || '').toLowerCase();
    const email = (vendor.email || '').toLowerCase();
    const phone = (vendor.phone || '').toLowerCase();
    const city = (vendor.city || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      name.includes(query) ||
      contact.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      city.includes(query);
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredVendors.length / pageSize) || 1;
  const paginatedVendors = filteredVendors.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isAllSelected = paginatedVendors.length > 0 && paginatedVendors.every(v => selectedIds.includes(v.id));

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Vendors : {filteredVendors.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Vendor
          </Button>

          <Button
            onClick={fetchVendors}
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
              placeholder="Search vendors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-blue-500 transition-colors"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

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
            {VENDOR_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
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

      {/* Table Container */}
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
                    VENDOR NAME
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-gray-200">CONTACT PERSON</th>
                <th className="px-4 py-3 border-r border-gray-200">EMAIL</th>
                <th className="px-4 py-3 border-r border-gray-200">PHONE</th>
                <th className="px-4 py-3 border-r border-gray-200">LOCATION</th>
                <th className="px-4 py-3 border-r border-gray-200">TAX ID / GST</th>
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
                      Loading vendors...
                    </div>
                  </td>
                </tr>
              ) : paginatedVendors.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No vendors found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedVendors.map((vendor) => {
                  const isChecked = selectedIds.includes(vendor.id);
                  return (
                    <tr
                      key={vendor.id}
                      className={`hover:bg-gray-50/50 group transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={() => handleSelectRow(vendor.id)}
                          />
                          <span
                            onClick={() => handleOpenEditModal(vendor)}
                            className="font-semibold text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                          >
                            {vendor.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                        {vendor.contactPerson || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs border-r border-gray-100">
                        {vendor.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs border-r border-gray-100">
                        {vendor.phone || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs border-r border-gray-100">
                        {[vendor.city, vendor.state].filter(Boolean).join(', ') || vendor.country || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-mono text-xs border-r border-gray-100">
                        {vendor.taxId || '—'}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            VENDOR_STATUS_COLORS[vendor.status] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {vendor.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(vendor)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Vendor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(vendor.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Vendor"
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
            Showing {filteredVendors.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredVendors.length)} of {filteredVendors.length} entries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 text-xs font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || filteredVendors.length === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
