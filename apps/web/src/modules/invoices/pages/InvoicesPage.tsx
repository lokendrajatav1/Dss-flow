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
  FileText,
  Printer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  INVOICE_STATUSES,
  INVOICE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
} from '@/lib/constants';

const MySwal = withReactContent(Swal);

const STATUS_COLORS = INVOICE_STATUS_COLORS;

export function InvoicesPage() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination, Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/invoices', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.invoices || []);
      setInvoices(data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/invoices/create');
  };

  const handleOpenEditModal = (inv: any) => {
    navigate(`/invoices/edit/${inv.id}`);
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This invoice will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/invoices/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Invoice has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete invoice.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one invoice to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: `Are you sure you want to delete ${selectedIds.length} invoices?`,
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
          selectedIds.map(id => api.delete(`/invoices/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setInvoices(prev => prev.filter(inv => !selectedIds.includes(inv.id)));
        setSelectedIds([]);
        MySwal.fire('Deleted!', 'Selected invoices have been deleted.', 'success');
      } catch (err) {
        MySwal.fire('Error', 'Failed to delete some invoices.', 'error');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = paginatedInvoices.map(inv => inv.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = paginatedInvoices.map(inv => inv.id);
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
  const filteredInvoices = invoices.filter(invoice => {
    const q = searchQuery.toLowerCase();
    const invNum = (invoice.invoiceNumber || '').toLowerCase();
    const matchesSearch =
      (invoice.id || '').toLowerCase().includes(q) ||
      invNum.includes(q) ||
      (invoice.customer?.name || '').toLowerCase().includes(q) ||
      (invoice.customer?.email || '').toLowerCase().includes(q);

    const matchesStatus = filterStatus === 'all' || String(invoice.status || '').toLowerCase() === String(filterStatus || '').toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Top Bar (matches LeadsPage/CallsPage) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Invoices : {filteredInvoices.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Invoice
          </Button>

          <Button
            onClick={fetchInvoices}
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
              placeholder="Search invoices..."
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
            {INVOICE_STATUSES.map(st => (
              <option key={st} value={st}>
                {INVOICE_STATUS_LABELS[st] || st}
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
                <th className="px-4 py-3 w-[25%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedInvoices.length > 0 && paginatedInvoices.every(inv => selectedIds.includes(inv.id))}
                    />
                    INVOICE ID
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-gray-200">CLIENT</th>
                <th className="px-4 py-3 border-r border-gray-200">DUE DATE</th>
                <th className="px-4 py-3 border-r border-gray-200">AMOUNT</th>
                <th className="px-4 py-3 border-r border-gray-200">PAYMENT METHOD</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                      Loading invoices...
                    </div>
                  </td>
                </tr>
              ) : paginatedInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                paginatedInvoices.map((invoice) => {
                  const isChecked = selectedIds.includes(invoice.id);

                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50/50 group">
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => handleSelectOne(invoice.id, e.target.checked)}
                          />
                          <span
                            className="font-mono text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                            onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                            title="Click to view & print invoice"
                          >
                            {invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8).toUpperCase()}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                        {invoice.customer?.name || 'N/A'}
                      </td>

                      <td className="px-4 py-3 text-gray-500 border-r border-gray-100">
                        {formatDate(invoice.dueDate)}
                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-100">
                        ₹{Number(invoice.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-3 text-gray-600 text-xs border-r border-gray-100">
                        {invoice.paymentMethod || '—'}
                      </td>

                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
                          {invoice.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/invoices/view/${invoice.id}`)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View & Print Document"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(invoice)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
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
            Showing {filteredInvoices.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredInvoices.length)} of {filteredInvoices.length} entries
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
              disabled={currentPage === totalPages || filteredInvoices.length === 0}
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
