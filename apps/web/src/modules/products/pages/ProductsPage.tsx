import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  RefreshCw,
  Trash2,
  Edit,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate, Link } from 'react-router-dom';
import {
  PRODUCT_STATUSES,
  PRODUCT_STATUS_COLORS,
} from '@/lib/constants';

const MySwal = withReactContent(Swal);
const STATUS_COLORS = PRODUCT_STATUS_COLORS;

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['all']);

  // Search, Filter, Pagination, Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
    api.get('/categories')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((c: any) => c.name);
          setCategoryOptions(['all', ...Array.from(new Set(names))]);
        }
      })
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/products', { headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data) ? res.data : (res.data?.products || []);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    navigate('/products/create');
  };

  const handleOpenEditModal = (product: any) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDelete = async (id: string, name?: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: name ? `"${name}" will be permanently deleted.` : 'This product will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setProducts(prev => prev.filter(p => p.id !== id));
        setSelectedProductIds(prev => prev.filter(item => item !== id));
        MySwal.fire('Deleted!', 'Product has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete product.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProductIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one product to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: `Are you sure you want to delete ${selectedProductIds.length} products?`,
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
          selectedProductIds.map(id => api.delete(`/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setProducts(prev => prev.filter(p => !selectedProductIds.includes(p.id)));
        setSelectedProductIds([]);
        MySwal.fire('Deleted!', 'Selected products have been deleted.', 'success');
      } catch (err) {
        MySwal.fire('Error', 'Failed to delete some products.', 'error');
      }
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = paginatedProducts.map(p => p.id);
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = paginatedProducts.map(p => p.id);
      setSelectedProductIds(prev => prev.filter(id => !visibleIds.includes(id)));
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, id]);
    } else {
      setSelectedProductIds(prev => prev.filter(item => item !== id));
    }
  };

  // Filter Logic
  const filteredProducts = products.filter(product => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (product.name || '').toLowerCase().includes(q) ||
      (product.sku || '').toLowerCase().includes(q) ||
      (product.description || '').toLowerCase().includes(q) ||
      (product.category || '').toLowerCase().includes(q);

    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar (matches LeadsPage/CallsPage design) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Products : {filteredProducts.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={handleOpenAddModal}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Product
          </Button>

          <Button
            onClick={fetchProducts}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleBulkDelete}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-9 w-9 p-0 rounded-md"
            title="Bulk Delete Selected"
            disabled={selectedProductIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search products..."
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
            {PRODUCT_STATUSES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Filter Category */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            {categoryOptions.map(c => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>

          {/* Page Size Dropdown */}
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

      {/* Table (matches LeadsPage/CallsPage table structure) */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[30%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProductIds.includes(p.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-4 py-3 border-r border-gray-200">SKU</th>
                <th className="px-4 py-3 border-r border-gray-200">CATEGORY / TYPE</th>
                <th className="px-4 py-3 border-r border-gray-200">PRICE</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">STOCK</th>
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
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => {
                  const curr = '₹';
                  const isChecked = selectedProductIds.includes(product.id);

                  return (
                    <tr key={product.id} className="hover:bg-gray-50/50 group">
                      {/* Name with Checkbox */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isChecked}
                            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                          />
                          <div>
                            <Link
                              to={`/products/view/${product.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 transition-colors block"
                            >
                              {product.name}
                            </Link>
                            {product.description && (
                              <span className="text-xs text-gray-400 block truncate max-w-xs">{product.description}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 border-r border-gray-100">
                        {product.sku || '—'}
                      </td>

                      {/* Category & Type */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <span className="text-gray-900 font-medium block">{product.category || 'General'}</span>
                        <span className="text-xs text-gray-400 block">{product.productType || 'Goods'}</span>
                      </td>

                      {/* Price */}
                      <td className="px-4 py-3 font-semibold text-gray-900 border-r border-gray-100">
                        {curr}{(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        <span className="text-xs text-gray-400 font-normal ml-1">/{product.unit || 'Unit'}</span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="text-gray-700 text-xs font-medium">
                          {product.stock !== undefined && product.stock !== '' ? product.stock : 'Unlimited'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[product.status] || 'bg-gray-100 text-gray-800'}`}>
                          {product.status || 'Active'}
                        </span>
                      </td>

                      {/* Quick Action Icons */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/products/view/${product.id}`)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                            title="View Product Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
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
            Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} entries
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
              disabled={currentPage === totalPages || filteredProducts.length === 0}
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
