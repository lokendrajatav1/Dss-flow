import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { PRICEBOOK_STATUSES } from '@/lib/constants';
import { ProductSelectDropdown } from '@/components/common/ProductSelectDropdown';

interface PriceBookLineItem {
  id: string;
  productId: string;
  productName: string;
  sku?: string;
  standardPrice: number;
  listPrice: number;
  discountPercent: number;
}

const createEmptyLineItem = (idSuffix = 1): PriceBookLineItem => ({
  id: `item-${Date.now()}-${idSuffix}`,
  productId: '',
  productName: '',
  sku: '',
  standardPrice: 0,
  listPrice: 0,
  discountPercent: 0,
});

export function CreatePriceBookPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Active');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [description, setDescription] = useState('');

  // Items State (default to 1 empty row, matching Sales Order / Quotation)
  const [items, setItems] = useState<PriceBookLineItem[]>([createEmptyLineItem()]);
  const [bulkDiscountInput, setBulkDiscountInput] = useState('');

  // Fetch catalog products
  useEffect(() => {
    api.get('/products')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
        setAvailableProducts(list.filter((p: any) => p.status === 'Active' || !p.status));
      })
      .catch(err => {
        console.error('Failed to fetch products for Price Book', err);
      });
  }, []);

  // Fetch existing price book if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchPriceBookDetails(id);
    }
  }, [id, isEditMode]);

  const fetchPriceBookDetails = async (priceBookId: string) => {
    setIsFetching(true);
    try {
      const res = await api.get(`/price-books/${priceBookId}`);
      const data = res.data;
      if (data) {
        setName(data.name || '');
        setStatus(data.status || 'Active');
        setEffectiveDate(data.effectiveDate ? data.effectiveDate.slice(0, 10) : '');
        setExpiryDate(data.expiryDate ? data.expiryDate.slice(0, 10) : '');
        setDescription(data.description || '');

        const existingItems = Array.isArray(data.items)
          ? data.items
          : (typeof data.itemsJson === 'string' ? JSON.parse(data.itemsJson || '[]') : []);

        if (existingItems.length > 0) {
          setItems(existingItems.map((it: any, idx: number) => ({
            id: `item-${idx + 1}`,
            productId: it.productId || '',
            productName: it.productName || '',
            sku: it.sku || '',
            standardPrice: Number(it.standardPrice) || 0,
            listPrice: Number(it.listPrice) || 0,
            discountPercent: Number(it.discountPercent) || 0,
          })));
        } else {
          setItems([createEmptyLineItem()]);
        }
      }
    } catch (err) {
      console.error('Failed to load price book', err);
      Swal.fire('Error', 'Failed to load price book details.', 'error');
      navigate('/price-books');
    } finally {
      setIsFetching(false);
    }
  };

  // Product selection inside line item row
  const handleProductSelect = (index: number, product: any | null) => {
    setItems(prev => {
      const next = [...prev];
      const current = { ...next[index] };

      if (product) {
        current.productId = product.id;
        current.productName = product.name;
        current.sku = product.sku || '';
        const std = Number(product.price) || 0;
        current.standardPrice = std;
        current.listPrice = std;
        current.discountPercent = 0;
      } else {
        current.productId = '';
        current.productName = '';
        current.sku = '';
        current.standardPrice = 0;
        current.listPrice = 0;
        current.discountPercent = 0;
      }

      next[index] = current;
      return next;
    });
  };

  // Update List Price
  const handleItemPriceChange = (index: number, val: string) => {
    const newPrice = Math.max(0, parseFloat(val) || 0);
    setItems(prev => {
      const next = [...prev];
      const it = { ...next[index] };
      it.listPrice = newPrice;
      if (it.standardPrice > 0) {
        const disc = ((it.standardPrice - newPrice) / it.standardPrice) * 100;
        it.discountPercent = Math.round(disc * 10) / 10;
      } else {
        it.discountPercent = 0;
      }
      next[index] = it;
      return next;
    });
  };

  // Update Discount %
  const handleItemDiscountChange = (index: number, val: string) => {
    const disc = parseFloat(val) || 0;
    setItems(prev => {
      const next = [...prev];
      const it = { ...next[index] };
      it.discountPercent = disc;
      const calcPrice = it.standardPrice * (1 - disc / 100);
      it.listPrice = Math.round(Math.max(0, calcPrice) * 100) / 100;
      next[index] = it;
      return next;
    });
  };

  // Add another line item
  const handleAddItem = () => {
    setItems(prev => [...prev, createEmptyLineItem(prev.length + 1)]);
  };

  // Remove a line item
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      setItems([createEmptyLineItem()]);
      return;
    }
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Add all catalog products
  const handleAddAllProducts = () => {
    if (availableProducts.length === 0) return;
    const existingIds = new Set(items.map(i => i.productId).filter(Boolean));
    const toAdd = availableProducts
      .filter(p => !existingIds.has(p.id))
      .map((p, idx) => {
        const std = Number(p.price) || 0;
        return {
          id: `item-all-${Date.now()}-${idx}`,
          productId: p.id,
          productName: p.name,
          sku: p.sku || '',
          standardPrice: std,
          listPrice: std,
          discountPercent: 0,
        };
      });

    if (toAdd.length === 0) {
      Swal.fire('Info', 'All catalog products are already added.', 'info');
      return;
    }

    setItems(prev => {
      // If first row is empty, replace it
      const cleaned = prev.filter(i => i.productId);
      return [...cleaned, ...toAdd];
    });
  };

  // Bulk discount apply
  const handleApplyBulkDiscount = () => {
    const disc = parseFloat(bulkDiscountInput);
    if (isNaN(disc) || disc < 0 || disc > 100) {
      Swal.fire('Validation Error', 'Please enter a valid percentage between 0 and 100.', 'warning');
      return;
    }

    setItems(prev =>
      prev.map(it => {
        if (!it.productId) return it;
        const calcPrice = it.standardPrice * (1 - disc / 100);
        return {
          ...it,
          discountPercent: disc,
          listPrice: Math.round(Math.max(0, calcPrice) * 100) / 100,
        };
      })
    );
    setBulkDiscountInput('');
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire('Required Field', 'Please enter a price book name.', 'warning');
      return;
    }

    const validItems = items
      .filter(i => i.productId)
      .map(i => ({
        productId: i.productId,
        productName: i.productName,
        sku: i.sku || '',
        standardPrice: Number(i.standardPrice) || 0,
        listPrice: Number(i.listPrice) || 0,
        discountPercent: Number(i.discountPercent) || 0,
      }));

    const avgPrice = validItems.length > 0
      ? validItems.reduce((acc, it) => acc + it.listPrice, 0) / validItems.length
      : 0;

    setIsLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        status: status,
        effectiveDate: effectiveDate || undefined,
        expiryDate: expiryDate || undefined,
        price: avgPrice,
        currency: 'INR',
        itemType: 'product',
        items: validItems,
      };

      if (isEditMode && id) {
        await api.put(`/price-books/${id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Price book updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/price-books');
      } else {
        await api.post('/price-books', payload);
        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: `Price Book "${name}" created successfully.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          setName('');
          setStatus('Active');
          setEffectiveDate('');
          setExpiryDate('');
          setDescription('');
          setItems([createEmptyLineItem()]);
          setBulkDiscountInput('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'New price book created successfully.',
            timer: 1500,
            showConfirmButton: false,
          });
          navigate('/price-books');
        }
      }
    } catch (err: any) {
      console.error('Failed to save price book', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save price book.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const validItemsCount = items.filter(i => i.productId).length;

  const isExpired = Boolean(
    expiryDate && new Date(expiryDate).setHours(23, 59, 59, 999) < Date.now()
  );

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading price book details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#f8fafc] overflow-hidden">
      {/* Top Header - Fixed at top, zero scroll, zero overlapping */}
      <div className="h-14 bg-white border-b border-gray-200 shrink-0 z-30">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/price-books')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Price Books"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Price Book' : 'Create Price Book'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/price-books')}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            {!isEditMode && (
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                Save and New
              </button>
            )}
            <button
              type="button"
              disabled={isLoading}
              onClick={(e) => handleSubmit(e, false)}
              className="px-5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50 min-w-[76px] cursor-pointer"
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content Area - Independent Scroll below fixed header */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={(e) => handleSubmit(e, false)} className="w-full space-y-6 pb-12">
          {/* Main Form Sheet */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-8">
        
        {/* Expired Notice Banner */}
        {isExpired && (
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">
                This Price Book has expired ({expiryDate ? new Date(expiryDate).toLocaleDateString() : ''}).
              </p>
              <p className="text-amber-700 mt-0.5">
                Expired price books are automatically hidden from Quotations, Sales Orders, and Invoices. To reactivate this price book, simply extend the <strong>Expiry Date</strong> below to a future date.
              </p>
            </div>
          </div>
        )}

        {/* Section 1: Price Book Information */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-gray-900">Price Book Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Price Book Name *
              </label>
              <Input
                required
                placeholder="e.g. VIP Wholesale Discount"
                value={name}
                onChange={e => setName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                {PRICEBOOK_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Effective Date
              </label>
              <Input
                type="date"
                value={effectiveDate}
                onChange={e => setEffectiveDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Valid Until (Expiry Date)
              </label>
              <Input
                type="date"
                value={expiryDate}
                onChange={e => setExpiryDate(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Enter description or pricing notes..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm text-gray-800 bg-white border border-gray-300 rounded-md outline-none focus:border-indigo-500 transition-all resize-y min-h-[52px]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Products & Custom Pricing */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Pricing Details
              <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                {validItemsCount} {validItemsCount === 1 ? 'Product' : 'Products'}
              </span>
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <span>Bulk Discount:</span>
                <div className="relative w-20">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    value={bulkDiscountInput}
                    onChange={e => setBulkDiscountInput(e.target.value)}
                    className="w-full h-8 px-2 pr-5 text-center rounded border border-gray-300 text-xs outline-none focus:border-indigo-500"
                  />
                  <span className="absolute right-1.5 top-2 text-gray-400 text-xs pointer-events-none">%</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyBulkDiscount}
                  className="px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                >
                  Apply All
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddAllProducts}
                className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition-colors cursor-pointer"
              >
                + Add All Products ({availableProducts.length})
              </button>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-gray-200 rounded-md overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4 min-w-[280px]">Product / Item</th>
                  <th className="py-2.5 px-3 w-36 text-right">Standard Rate (₹)</th>
                  <th className="py-2.5 px-3 w-36 text-right">List Price (₹)</th>
                  <th className="py-2.5 px-3 w-28 text-center">Discount (%)</th>
                  <th className="py-2.5 px-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-4 align-middle">
                      <ProductSelectDropdown
                        products={availableProducts}
                        selectedProductId={item.productId}
                        selectedProductName={item.productName}
                        placeholder="Select or search item..."
                        onSelectProduct={(product) => handleProductSelect(idx, product)}
                      />
                    </td>

                    <td className="py-2.5 px-3 align-middle text-right text-sm text-gray-600 font-mono">
                      ₹{Number(item.standardPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-2.5 px-3 align-middle text-right">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.listPrice}
                        onChange={e => handleItemPriceChange(idx, e.target.value)}
                        className="w-32 h-8 text-right px-2 rounded border border-gray-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-middle text-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={item.discountPercent ?? 0}
                        onChange={e => handleItemDiscountChange(idx, e.target.value)}
                        className="w-20 h-8 text-center px-1 rounded border border-gray-300 text-sm outline-none focus:border-indigo-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 align-middle text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Delete Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add line item link */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleAddItem}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add another line item
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
);
}
