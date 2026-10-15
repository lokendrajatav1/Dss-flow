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
  SALES_ORDER_STATUSES,
  SALES_ORDER_STATUS_LABELS,
  SALES_ORDER_STATUS_COLORS,
} from '@/lib/constants';

const MySwal = withReactContent(Swal);

const STATUS_COLORS = SALES_ORDER_STATUS_COLORS;

export function SalesOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, Pagination, Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/sales-orders', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.salesOrders || []);
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch sales orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/sales-orders/create');
  };

  const handleOpenEditModal = (order: any) => {
    navigate(`/sales-orders/edit/${order.id}`);
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This sales order will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/sales-orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setOrders(prev => prev.filter(o => o.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Sales order has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete sales order.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one sales order to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: 'Delete Selected Orders?',
      text: `Are you sure you want to delete ${selectedIds.length} sales order(s)?`,
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
          selectedIds.map(id => api.delete(`/sales-orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
        setSelectedIds([]);
        MySwal.fire('Deleted!', 'Selected sales orders have been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete some sales orders.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = paginatedOrders.map(o => o.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...allIds])));
    } else {
      const paginatedIdSet = new Set(paginatedOrders.map(o => o.id));
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

  const filteredOrders = orders.filter(order => {
    const custName = (order.customer?.name || '').toLowerCase();
    const orderId = (order.id || '').toLowerCase();
    const orderNumber = (order.orderNumber || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = custName.includes(query) || orderId.includes(query) || orderNumber.includes(query);
    const matchesStatus = filterStatus === 'all' || String(order.status || '').toLowerCase() === String(filterStatus || '').toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const isAllSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.includes(o.id));

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Sales Orders : {filteredOrders.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Sales Order
          </Button>

          <Button
            onClick={fetchOrders}
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
              placeholder="Search orders..."
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
            {SALES_ORDER_STATUSES.map(st => (
              <option key={st} value={st}>
                {SALES_ORDER_STATUS_LABELS[st] || st}
              </option>
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
                    SO NUMBER
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-gray-200">CUSTOMER</th>
                <th className="px-4 py-3 border-r border-gray-200">PRICE BOOK</th>
                <th className="px-4 py-3 border-r border-gray-200">CREATED DATE</th>
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
                      Loading sales orders...
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No sales orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isChecked = selectedIds.includes(order.id);
                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50/50 group transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}
                    >
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={() => handleSelectRow(order.id)}
                          />
                          <span
                            className="font-mono text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                            onClick={() => navigate(`/sales-orders/view/${order.id}`)}
                            title="Click to view & print sales order"
                          >
                            {order.orderNumber || (order.id ? `SO-${order.id.slice(0, 8).toUpperCase()}` : 'SO-0001')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 border-r border-gray-100">
                        {order.customer?.name || 'Direct Customer'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs border-r border-gray-100">
                        {order.priceBook?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 border-r border-gray-100">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-500 border-r border-gray-100">
                        {formatDate(order.validUntil)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 border-r border-gray-100">
                        ₹{Number(order.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                            STATUS_COLORS[String(order.status || '').toLowerCase()] || STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {SALES_ORDER_STATUS_LABELS[String(order.status || '').toLowerCase()] || order.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/sales-orders/view/${order.id}`)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            title="View & Print Document"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(order)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Order"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Order"
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
            Showing {filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} entries
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
              disabled={currentPage === totalPages || filteredOrders.length === 0}
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
