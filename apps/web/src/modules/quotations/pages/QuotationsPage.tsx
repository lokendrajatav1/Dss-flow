import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  FileSignature,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  QUOTATION_STATUSES,
  QUOTATION_STATUS_LABELS,
  QUOTATION_STATUS_COLORS,
} from '@/lib/constants';

const MySwal = withReactContent(Swal);

const STATUS_COLORS = QUOTATION_STATUS_COLORS;

export function QuotationsPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination, Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/quotations', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.quotations || []);
      setQuotations(data);
    } catch (err) {
      console.error('Failed to fetch quotations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/quotations/create');
  };

  const handleOpenEditModal = (quote: any) => {
    navigate(`/quotations/edit/${quote.id}`);
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This quotation will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/quotations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setQuotations(prev => prev.filter(q => q.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Quotation has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete quotation.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one quotation to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: `Are you sure you want to delete ${selectedIds.length} quotations?`,
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
          selectedIds.map(id => api.delete(`/quotations/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setQuotations(prev => prev.filter(q => !selectedIds.includes(q.id)));
        setSelectedIds([]);
        MySwal.fire('Deleted!', 'Selected quotations have been deleted.', 'success');
      } catch (err) {
        MySwal.fire('Error', 'Failed to delete some quotations.', 'error');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = paginatedQuotations.map(q => q.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = paginatedQuotations.map(q => q.id);
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
  const filteredQuotations = quotations.filter(quote => {
    const q = searchQuery.toLowerCase();
    let parsed: any = {};
    try {
      if (typeof quote.itemsJson === 'string') parsed = JSON.parse(quote.itemsJson);
      else if (typeof quote.itemsJson === 'object' && quote.itemsJson) parsed = quote.itemsJson;
    } catch { }

    const qNum = quote.quoteNumber || parsed.quoteNumber || '';
    const qSubject = parsed.subject || '';

    const matchesSearch =
      qNum.toLowerCase().includes(q) ||
      qSubject.toLowerCase().includes(q) ||
      (quote.id || '').toLowerCase().includes(q) ||
      (quote.customer?.name || '').toLowerCase().includes(q) ||
      (quote.customer?.email || '').toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'all' || String(quote.status || '').toLowerCase() === String(filterStatus || '').toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredQuotations.length / pageSize));
  const paginatedQuotations = filteredQuotations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Top Bar (matches LeadsPage/CallsPage) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Quotations : {filteredQuotations.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Quotation
          </Button>

          <Button
            onClick={fetchQuotations}
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
              placeholder="Search quotations..."
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
            {QUOTATION_STATUSES.map(st => (
              <option key={st} value={st}>
                {QUOTATION_STATUS_LABELS[st] || st}
              </option>
            ))}
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
                <th className="px-4 py-3 w-[22%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedQuotations.length > 0 && paginatedQuotations.every(q => selectedIds.includes(q.id))}
                    />
                    QUOTE REF / SUBJECT
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-gray-200">CLIENT</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">ITEMS</th>
                <th className="px-4 py-3 border-r border-gray-200">ISSUE DATE</th>
                <th className="px-4 py-3 border-r border-gray-200">VALID UNTIL</th>
                <th className="px-4 py-3 text-right border-r border-gray-200">TOTAL AMOUNT</th>
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
                      Loading quotations...
                    </div>
                  </td>
                </tr>
              ) : paginatedQuotations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                paginatedQuotations.map((quote) => {
                  const isChecked = selectedIds.includes(quote.id);
                  let parsedJson: any = {};
                  try {
                    if (typeof quote.itemsJson === 'string') parsedJson = JSON.parse(quote.itemsJson);
                    else if (typeof quote.itemsJson === 'object' && quote.itemsJson) parsedJson = quote.itemsJson;
                  } catch { }
                  const quoteRef = quote.quoteNumber || parsedJson.quoteNumber || quote.id.slice(0, 10).toUpperCase();
                  const quoteSubject = parsedJson.subject || '';
                  const itemsCount = Array.isArray(parsedJson.items) ? parsedJson.items.length : 1;

                  return (
                    <tr key={quote.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(quote.id, e.target.checked)}
                          />
                          <div>
                            <span
                              className="font-mono text-xs text-indigo-600 font-bold block cursor-pointer hover:underline"
                              onClick={() => navigate(`/quotations/view/${quote.id}`)}
                              title="Click to view & print quotation"
                            >
                              {quoteRef}
                            </span>
                            {quoteSubject && (
                              <span className="text-[11px] text-gray-500 truncate max-w-[180px] block font-normal">
                                {quoteSubject}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                        {quote.customer?.name || parsedJson.customerName || 'N/A'}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500 border-r border-gray-100">
                        {formatDate(quote.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-xs border-r border-gray-100">
                        {formatDate(quote.validUntil)}
                      </td>

                      <td className="px-4 py-3 text-right font-bold text-gray-900 border-r border-gray-100 font-mono">
                        ₹{(quote.totalValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[quote.status] || 'bg-gray-100 text-gray-800'}`}>
                          {quote.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/quotations/view/${quote.id}`)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View & Print Document"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(quote)}
                            className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Edit Quotation"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(quote.id)}
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
            Showing {filteredQuotations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredQuotations.length)} of {filteredQuotations.length} entries
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
              disabled={currentPage === totalPages || filteredQuotations.length === 0}
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
