import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Package,
  Tag,
  Barcode,
  Layers,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  RefreshCw,
  AlertCircle,
  Boxes,
  Percent,
  PlusCircle,
  Copy,
  Check
} from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { PRODUCT_STATUS_COLORS } from '@/lib/constants';

const MySwal = withReactContent(Swal);

export function ViewProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSku, setCopiedSku] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchProductDetails(id);
  }, [id]);

  const fetchProductDetails = async (productId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProduct(res.data);
    } catch (err: any) {
      console.error('Failed to load product details', err);
      MySwal.fire('Error', err?.response?.data?.message || 'Product not found.', 'error');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: `"${product.name}" will be permanently deleted.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/products/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        MySwal.fire('Deleted!', 'Product has been deleted successfully.', 'success');
        navigate('/products');
      } catch (err: any) {
        MySwal.fire('Error', err?.response?.data?.message || 'Failed to delete product.', 'error');
      }
    }
  };

  const handleCopySku = () => {
    if (!product?.sku) return;
    navigator.clipboard.writeText(product.sku);
    setCopiedSku(true);
    setTimeout(() => setCopiedSku(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center max-w-lg mx-auto my-12 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Product Not Found</h2>
        <p className="text-sm text-gray-500">The requested product does not exist or has been deleted.</p>
        <button
          onClick={() => navigate('/products')}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Calculations
  const sellingPrice = parseFloat(product.price) || 0;
  const costPrice = parseFloat(product.costPrice) || 0;
  const profit = sellingPrice > 0 ? sellingPrice - costPrice : 0;
  const profitMarginPercent = sellingPrice > 0 ? Math.round((profit / sellingPrice) * 100) : 0;
  const taxRate = parseFloat(product.taxRate) || 0;
  const taxAmount = (sellingPrice * taxRate) / 100;
  const finalPriceWithTax = sellingPrice + taxAmount;

  // Stock logic
  const isUnlimitedStock = !product.stock || String(product.stock).toLowerCase() === 'unlimited';
  const numericStock = isUnlimitedStock ? null : parseFloat(product.stock);
  const minStock = parseFloat(product.minStock) || 0;
  const isLowStock = numericStock !== null && numericStock <= minStock;
  const isOutOfStock = numericStock !== null && numericStock <= 0;

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            title="Back to Products"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  PRODUCT_STATUS_COLORS[product.status] || 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {product.status || 'Active'}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {product.productType || 'Goods'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
              <span>SKU: <strong className="text-gray-700 font-mono">{product.sku || 'N/A'}</strong></span>
              <span>•</span>
              <span>Category: <strong className="text-gray-700">{product.category || 'General'}</strong></span>
              <span>•</span>
              <span>Created: {new Date(product.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-gray-500" />
            Print Spec Sheet
          </button>
          <button
            type="button"
            onClick={() => navigate(`/products/edit/${product.id}`)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            Edit Product
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Selling Price */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Selling Price</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">
              ₹{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500">/ {product.unit || 'Unit'}</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Excl. {taxRate}% GST</p>
        </div>

        {/* Card 2: Cost Price */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost / Purchase Price</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">
              ₹{costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-xs text-gray-500">/ {product.unit || 'Unit'}</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Base acquisition cost</p>
        </div>

        {/* Card 3: Margin / Profit */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Margin</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-emerald-600">
              {profitMarginPercent}%
            </span>
            <span className="text-xs text-gray-600 font-medium">
              (+₹{profit.toLocaleString(undefined, { minimumFractionDigits: 2 })})
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Net profit per unit</p>
        </div>

        {/* Card 4: Inventory Stock */}
        <div className="bg-white rounded-xl border border-gray-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Stock Availability</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900">
              {isUnlimitedStock ? 'Unlimited' : `${numericStock} ${product.unit || 'Units'}`}
            </span>
          </div>
          <div className="mt-1">
            {isUnlimitedStock ? (
              <span className="text-[11px] font-medium text-emerald-600">Available continuously</span>
            ) : isOutOfStock ? (
              <span className="text-[11px] font-semibold text-rose-600">Out of Stock!</span>
            ) : isLowStock ? (
              <span className="text-[11px] font-semibold text-amber-600">Low Stock Alert (≤ {minStock})</span>
            ) : (
              <span className="text-[11px] font-medium text-emerald-600">Healthy Stock Level</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Basic & Identification Details */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                Product Details & Identification
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div>
                <span className="block text-xs font-medium text-gray-500 mb-0.5">Product Name</span>
                <span className="font-semibold text-gray-900">{product.name}</span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-0.5">SKU / Item Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-gray-800 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-xs">
                    {product.sku || 'N/A'}
                  </span>
                  {product.sku && (
                    <button
                      type="button"
                      onClick={handleCopySku}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Copy SKU"
                    >
                      {copiedSku ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-0.5">Category</span>
                <span className="text-gray-800 font-medium">{product.category || 'General'}</span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-0.5">Product Classification</span>
                <span className="text-gray-800 font-medium">{product.productType || 'Goods'}</span>
              </div>

              <div>
                <span className="block text-xs font-medium text-gray-500 mb-0.5">HSN / SAC Code</span>
                <span className="font-mono text-gray-800">{product.hsnCode || '—'}</span>
              </div>
            </div>

            {/* Description Block */}
            <div className="pt-2 border-t border-gray-100">
              <span className="block text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                Description & Notes
              </span>
              {product.description ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200/60 text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {product.description}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No description provided for this product.</p>
              )}
            </div>
          </div>

          {/* Card: Pricing & Tax Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-600" />
              Tax & Price Composition
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">Base Selling Rate</span>
                <span className="text-lg font-bold text-slate-800">
                  ₹{sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Without GST</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">GST ({taxRate}%)</span>
                <span className="text-lg font-bold text-slate-800">
                  +₹{taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Tax per unit</span>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200">
                <span className="text-xs text-blue-700 font-semibold block">Total Consumer Price</span>
                <span className="text-lg font-bold text-blue-900">
                  ₹{finalPriceWithTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[11px] text-blue-600 block mt-0.5">Inclusive of GST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 1/3 width */}
        <div className="space-y-6">
          {/* Card: Stock & Inventory Management */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Boxes className="w-4 h-4 text-purple-600" />
              Inventory & Tracking
            </h2>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Stock Status:</span>
                <span className="font-semibold text-gray-900">
                  {isUnlimitedStock ? 'Unlimited' : `${numericStock} Available`}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Unit of Measurement:</span>
                <span className="font-semibold text-gray-900">{product.unit || 'Unit'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Min. Reorder Point:</span>
                <span className="font-semibold text-gray-900">{minStock} {product.unit || 'Units'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Stock Condition:</span>
                <span className="font-medium">
                  {isUnlimitedStock ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" /> Reorder Needed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Adequate
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Quick Transaction Actions */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-blue-600" />
              Quick Actions
            </h2>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => navigate('/invoices/create')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs sm:text-sm font-medium text-gray-700 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>+ Create Invoice with this Item</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/quotations/create')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs sm:text-sm font-medium text-gray-700 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>+ Create Quotation</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/sales-orders/create')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-xs sm:text-sm font-medium text-gray-700 transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>+ Create Sales Order</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
