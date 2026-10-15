import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Calendar,
  Clock,
  ShoppingBag,
  Percent,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PRICEBOOK_STATUS_COLORS } from '@/lib/constants';

const MySwal = withReactContent(Swal);

interface PriceBookItem {
  productId: string;
  productName: string;
  sku?: string;
  standardPrice: number;
  listPrice: number;
  discountPercent: number;
}

export function ViewPriceBookPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [priceBook, setPriceBook] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchPriceBook(id);
  }, [id]);

  const fetchPriceBook = async (priceBookId: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/price-books/${priceBookId}`);
      setPriceBook(res.data);
    } catch (err: any) {
      console.error('Failed to load price book', err);
      MySwal.fire('Error', err?.response?.data?.message || 'Price book not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!priceBook) return;
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `"${priceBook.name}" will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/price-books/${priceBook.id}`);
        MySwal.fire('Deleted!', 'Price book has been deleted.', 'success');
        navigate('/price-books');
      } catch (err: any) {
        MySwal.fire('Error', err?.response?.data?.message || 'Failed to delete price book.', 'error');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading price book details...</p>
      </div>
    );
  }

  if (!priceBook) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Price Book Not Found</h2>
        <p className="text-sm text-gray-500">The requested price book does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/price-books')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Back to Price Books
        </button>
      </div>
    );
  }

  const items: PriceBookItem[] = Array.isArray(priceBook.items)
    ? priceBook.items
    : (typeof priceBook.itemsJson === 'string' ? JSON.parse(priceBook.itemsJson || '[]') : []);

  const isExpired = Boolean(
    priceBook.expiryDate && new Date(priceBook.expiryDate).setHours(23, 59, 59, 999) < Date.now()
  );

  const displayStatus = isExpired ? 'Expired' : (priceBook.status || 'Active');

  // Filter items by search query
  const filteredItems = items.filter(it => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (it.productName || '').toLowerCase().includes(q) ||
      (it.sku || '').toLowerCase().includes(q)
    );
  });

  // Calculate stats
  const totalProducts = items.length;
  const avgDiscount = totalProducts > 0
    ? items.reduce((acc, it) => acc + (Number(it.discountPercent) || 0), 0) / totalProducts
    : 0;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Action Bar (hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/price-books')}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            title="Back to Price Books"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{priceBook.name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Created on {new Date(priceBook.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Print Rate Sheet
          </button>
          <button
            type="button"
            onClick={() => navigate(`/price-books/edit/${priceBook.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-sm cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit Price Book
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            title="Delete Price Book"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expired Notice Banner */}
      {isExpired && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-900">
              This Price Book expired on {new Date(priceBook.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.
            </p>
            <p className="text-rose-700 mt-0.5">
              Expired price books are automatically excluded from new Quotations, Sales Orders, and Invoices.
              To use these rates again, click <strong>"Edit Price Book"</strong> and extend the expiry date.
            </p>
          </div>
        </div>
      )}

      {/* Main Print Header (visible only on print) */}
      <div className="hidden print:block border-b border-gray-300 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{priceBook.name}</h1>
        <p className="text-sm text-gray-600 mt-1">Official Price Book / Rate Sheet</p>
        <div className="flex gap-6 text-xs text-gray-600 mt-2">
          <span>Effective: {priceBook.effectiveDate ? new Date(priceBook.effectiveDate).toLocaleDateString() : 'Immediate'}</span>
          <span>Expiry: {priceBook.expiryDate ? new Date(priceBook.expiryDate).toLocaleDateString() : 'No Expiry'}</span>
          <span>Status: {displayStatus}</span>
        </div>
      </div>

      {/* Price Book Information Card */}
      <div className="bg-white border border-gray-200/80 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-2.5">
          Price Book Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 font-medium block">Price Book Name</span>
            <span className="font-semibold text-gray-900 text-sm mt-0.5 block">{priceBook.name}</span>
          </div>

          <div>
            <span className="text-gray-500 font-medium block">Status</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-1 ${
                PRICEBOOK_STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {displayStatus}
            </span>
          </div>

          <div>
            <span className="text-gray-500 font-medium block">Effective Date</span>
            <span className="text-gray-800 text-sm mt-0.5 block font-medium">
              {priceBook.effectiveDate
                ? new Date(priceBook.effectiveDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Immediate'}
            </span>
          </div>

          <div>
            <span className="text-gray-500 font-medium block">Expiry Date</span>
            <span className={`text-sm mt-0.5 block font-medium ${isExpired ? 'text-rose-600 font-semibold' : 'text-gray-800'}`}>
              {priceBook.expiryDate
                ? new Date(priceBook.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'No Expiry'}
            </span>
          </div>

          {priceBook.description && (
            <div className="sm:col-span-2 md:col-span-4 pt-1">
              <span className="text-gray-500 font-medium block">Description</span>
              <p className="text-gray-700 text-sm mt-0.5 whitespace-pre-wrap">{priceBook.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Products & Custom Pricing Card */}
      <div className="bg-white border border-gray-200/80 rounded-xl shadow-sm overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900">Custom Rates & Products</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {filteredItems.length} {filteredItems.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          <div className="relative w-full sm:w-72 print:hidden">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by product or SKU..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-gray-300 text-xs bg-white placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/75 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4 text-right">Standard Catalog (MRP)</th>
                <th className="py-3 px-4 text-right font-bold text-indigo-900">Price Book Rate</th>
                <th className="py-3 px-4 text-center">Discount</th>
                <th className="py-3 px-4 text-right">Customer Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                    {searchQuery ? `No products matching "${searchQuery}" found in this price book.` : 'No products configured in this price book.'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const std = Number(item.standardPrice) || 0;
                  const list = Number(item.listPrice) || 0;
                  const discount = Number(item.discountPercent) || 0;
                  const savings = Math.max(0, std - list);

                  return (
                    <tr key={item.productId || index} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 text-center text-xs text-gray-400 font-mono">
                        {index + 1}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{item.productName || 'Unnamed Product'}</div>
                        {item.sku && (
                          <div className="text-xs text-gray-400 font-mono mt-0.5">SKU: {item.sku}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-gray-500 text-xs">
                        {savings > 0 ? (
                          <span className="line-through text-gray-400 mr-1.5">
                            ₹{std.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span>₹{std.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-gray-900 text-sm">
                        ₹{list.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {discount > 0 ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            {discount}% OFF
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">0%</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right text-xs font-medium">
                        {savings > 0 ? (
                          <span className="text-emerald-600">
                            Save ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
