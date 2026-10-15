import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Search, RefreshCw, Trash2, Filter, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

import {
  PAYMENT_STATUSES,
  PAYMENT_STATUS_COLORS,
  PAYMENT_TYPES,
  PAYMENT_METHODS,
} from '@/lib/constants';

const STATUS_OPTIONS = ['all', ...PAYMENT_STATUSES];
const TYPE_OPTIONS = ['all', ...PAYMENT_TYPES];
const METHOD_OPTIONS = ['all', ...PAYMENT_METHODS];

export function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/payments', { headers: { Authorization: `Bearer ${token}` } });
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This payment record will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/payments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setPayments(payments.filter(p => p.id !== id));
        MySwal.fire('Deleted!', 'Payment has been deleted.', 'success');
      } catch (err) {
        MySwal.fire('Error', 'Failed to delete payment.', 'error');
      }
    }
  };

  // Filter Logic
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      (payment.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesType = filterType === 'all' || payment.type === filterType;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;

    return matchesSearch && matchesStatus && matchesType && matchesMethod;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredPayments.length / pageSize);
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Summary stats
  const totalCollected = payments.filter(p => p.type === 'in' && p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);
  const failedPayments = payments.filter(p => p.status === 'Failed').reduce((sum, p) => sum + p.amount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Record Payment</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total Collected</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalCollected.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Pending Payments</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₹{pendingPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500">Failed/Refunded</p>
          <p className="text-3xl font-bold text-red-600 mt-2">₹{failedPayments.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-3 border-b border-gray-100 flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-indigo-500 bg-white cursor-pointer"
          >
            {TYPE_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Types' : s === 'in' ? 'Income' : 'Expense'}</option>
            ))}
          </select>

          <select
            value={filterMethod}
            onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-indigo-500 bg-white cursor-pointer"
          >
            {METHOD_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Methods' : s}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-indigo-500 bg-white cursor-pointer"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-indigo-500 bg-white cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <Button onClick={fetchPayments} className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 w-9 p-0 rounded-md" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button onClick={() => handleDelete('')} className="bg-red-500 hover:bg-red-600 text-white h-9 w-9 p-0 rounded-md" title="Delete Selected">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200 font-bold">Transaction ID</th>
                <th className="px-4 py-3 border-r border-gray-200 font-bold">Client / Entity</th>
                <th className="px-4 py-3 border-r border-gray-200 font-bold">Method</th>
                <th className="px-4 py-3 border-r border-gray-200 font-bold">Date</th>
                <th className="px-4 py-3 border-r border-gray-200 font-bold">Amount</th>
                <th className="px-4 py-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading payments...</td>
                </tr>
              ) : paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No payments found.</td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 border-r border-gray-100 font-bold text-indigo-600 flex items-center gap-2">
                      {payment.type === 'in' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-500" />
                      )}
                      {payment.id}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">{payment.customer?.name || 'N/A'}</td>
                    <td className="px-4 py-3 border-r border-gray-100 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5" /> {payment.method}
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-gray-500">{formatDate(payment.date)}</td>
                    <td className={`px-4 py-3 border-r border-gray-100 font-medium ${payment.type === 'in' ? 'text-gray-900' : 'text-red-600'}`}>
                      {payment.type === 'in' ? '+' : '-'}₹{payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        PAYMENT_STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {filteredPayments.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length} entries
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
              disabled={currentPage === totalPages || filteredPayments.length === 0}
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
