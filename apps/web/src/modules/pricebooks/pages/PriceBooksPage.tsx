import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Tag,
  ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PRICEBOOK_STATUSES, PRICEBOOK_STATUS_COLORS } from '@/lib/constants';

const MySwal = withReactContent(Swal);

export function PriceBooksPage() {
  const navigate = useNavigate();
  const [priceBooks, setPriceBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination, Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPriceBooks();
  }, []);

  const fetchPriceBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/price-books', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.priceBooks || []);
      setPriceBooks(data);
    } catch (err) {
      console.error('Failed to fetch price books', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/price-books/create');
  };

  const handleOpenEditModal = (pb: any) => {
    navigate(`/price-books/edit/${pb.id}`);
  };

  const handleDelete = async (id: string, name?: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: name ? `"${name}" will be permanently deleted.` : 'This price book will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/price-books/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setPriceBooks(prev => prev.filter(pb => pb.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Price book has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete price book.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one price book to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: `Are you sure you want to delete ${selectedIds.length} price books?`,
      text: 'This action cannot be undone!',
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
          selectedIds.map(id => api.delete(`/price-books/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setPriceBooks(prev => prev.filter(pb => !selectedIds.includes(pb.id)));
        setSelectedIds([]);
        MySwal.fire('Deleted!', 'Selected price books have been deleted.', 'success');
      } catch (err) {
        MySwal.fire('Error', 'Failed to delete some price books.', 'error');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = paginatedPriceBooks.map(pb => pb.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = paginatedPriceBooks.map(pb => pb.id);
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Filter Logic
  const filteredPriceBooks = priceBooks.filter(pb => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (pb.name || '').toLowerCase().includes(q) ||
      (pb.description || '').toLowerCase().includes(q) ||
      (pb.itemType || '').toLowerCase().includes(q);

    const isExpired = pb.expiryDate && new Date(pb.expiryDate).setHours(23, 59, 59, 999) < Date.now();

    let matchesStatus = true;
    if (filterStatus === 'all') {
      matchesStatus = true;
    } else if (filterStatus === 'Expired') {
      matchesStatus = Boolean(isExpired);
    } else if (filterStatus === 'Active') {
      matchesStatus = !isExpired && String(pb.status || '').toLowerCase() === 'active';
    } else if (filterStatus === 'Inactive') {
      matchesStatus = String(pb.status || '').toLowerCase() === 'inactive';
    } else {
      matchesStatus = pb.status === filterStatus;
    }

    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredPriceBooks.length / pageSize));
  const paginatedPriceBooks = filteredPriceBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar (matches LeadsPage/CallsPage) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Price Books : {filteredPriceBooks.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Price Book
          </Button>

          <Button
            onClick={fetchPriceBooks}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleBulkDelete}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-9 w-9 p-0 rounded-md"
            title="Bulk Delete Selected"
            disabled={selectedIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search price books..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Filter Status */}
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
            <option value="Expired">Expired</option>
          </select>

          {/* Page Size */}
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

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[35%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedPriceBooks.length > 0 && paginatedPriceBooks.every(pb => selectedIds.includes(pb.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-4 py-3 text-center border-r border-gray-200">PRODUCTS INCLUDED</th>
                <th className="px-4 py-3 border-r border-gray-200">VALID DATES</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Loading price books...
                    </div>
                  </td>
                </tr>
              ) : paginatedPriceBooks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No price books found.
                  </td>
                </tr>
              ) : (
                paginatedPriceBooks.map((pb) => {
                  const itemCount = Array.isArray(pb.items)
                    ? pb.items.length
                    : (typeof pb.itemsJson === 'string' ? JSON.parse(pb.itemsJson || '[]').length : 0);
                  const isChecked = selectedIds.includes(pb.id);

                  const isExpired = pb.expiryDate && new Date(pb.expiryDate).setHours(23, 59, 59, 999) < Date.now();
                  const displayStatus = isExpired ? 'Expired' : (pb.status || 'Active');

                  return (
                    <tr key={pb.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(pb.id, e.target.checked)}
                          />
                          <div>
                            <Link
                              to={`/price-books/view/${pb.id}`}
                              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors block cursor-pointer"
                            >
                              {pb.name}
                            </Link>
                            {pb.description && (
                              <span className="text-xs text-gray-400 block truncate max-w-xs">{pb.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {itemCount} {itemCount === 1 ? 'Product' : 'Products'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500 border-r border-gray-100">
                        {pb.effectiveDate ? new Date(pb.effectiveDate).toLocaleDateString() : 'Immediate'}
                        {pb.expiryDate ? ` - ${new Date(pb.expiryDate).toLocaleDateString()}` : ' (No Expiry)'}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRICEBOOK_STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-800'}`}>
                          {displayStatus}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/price-books/view/${pb.id}`)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(pb)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pb.id, pb.name)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
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
            Showing {filteredPriceBooks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredPriceBooks.length)} of {filteredPriceBooks.length} entries
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
              disabled={currentPage === totalPages || filteredPriceBooks.length === 0}
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
