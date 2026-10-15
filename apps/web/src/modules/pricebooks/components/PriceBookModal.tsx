import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Tag, Percent, ShoppingBag, ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { PRICEBOOK_STATUSES } from '@/lib/constants';

interface PriceBookItem {
  productId: string;
  productName: string;
  sku?: string;
  standardPrice: number;
  listPrice: number;
  discountPercent?: number;
}

interface PriceBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceBook?: any | null;
  onSaved: () => void;
}

export function PriceBookModal({ isOpen, onClose, priceBook, onSaved }: PriceBookModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    effectiveDate: '',
    expiryDate: '',
  });

  // Selected Products inside this Price Book
  const [items, setItems] = useState<PriceBookItem[]>([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [bulkDiscountInput, setBulkDiscountInput] = useState('');

  // Fetch available products from catalog
  useEffect(() => {
    if (isOpen) {
      const fetchCatalog = async () => {
        setLoadingProducts(true);
        try {
          const res = await api.get('/products');
          const list = Array.isArray(res.data) ? res.data : (res.data?.products || []);
          setAvailableProducts(list.filter((p: any) => p.status === 'Active' || !p.status));
        } catch (err) {
          console.error('Failed to fetch products catalog for Price Book', err);
        } finally {
          setLoadingProducts(false);
        }
      };
      fetchCatalog();
    }
  }, [isOpen]);

  // Populate data when editing or opening
  useEffect(() => {
    if (priceBook) {
      setFormData({
        name: priceBook.name || '',
        description: priceBook.description || '',
        status: priceBook.status || 'Active',
        effectiveDate: priceBook.effectiveDate ? priceBook.effectiveDate.slice(0, 10) : '',
        expiryDate: priceBook.expiryDate ? priceBook.expiryDate.slice(0, 10) : '',
      });
      // Set items
      const existingItems = Array.isArray(priceBook.items)
        ? priceBook.items
        : (typeof priceBook.itemsJson === 'string' ? JSON.parse(priceBook.itemsJson || '[]') : []);
      setItems(existingItems);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active',
        effectiveDate: '',
        expiryDate: '',
      });
      setItems([]);
    }
    setSelectedProductToAdd('');
    setBulkDiscountInput('');
  }, [priceBook, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add a specific product to the Price Book
  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const prod = availableProducts.find(p => p.id === selectedProductToAdd);
    if (!prod) return;

    if (items.some(it => it.productId === prod.id)) {
      Swal.fire('Already Added', 'This product is already in the price book.', 'info');
      return;
    }

    const stdPrice = Number(prod.price) || 0;
    setItems(prev => [
      ...prev,
      {
        productId: prod.id,
        productName: prod.name,
        sku: prod.sku || '',
        standardPrice: stdPrice,
        listPrice: stdPrice,
        discountPercent: 0,
      }
    ]);
    setSelectedProductToAdd('');
  };

  // Add ALL catalog products at once
  const handleAddAllProducts = () => {
    if (availableProducts.length === 0) return;
    const existingIds = new Set(items.map(i => i.productId));
    const toAdd: PriceBookItem[] = availableProducts
      .filter(p => !existingIds.has(p.id))
      .map(p => {
        const stdPrice = Number(p.price) || 0;
        return {
          productId: p.id,
          productName: p.name,
          sku: p.sku || '',
          standardPrice: stdPrice,
          listPrice: stdPrice,
          discountPercent: 0,
        };
      });

    if (toAdd.length === 0) {
      Swal.fire('Info', 'All catalog products are already added.', 'info');
      return;
    }

    setItems(prev => [...prev, ...toAdd]);
  };

  // Remove a product from this Price Book
  const handleRemoveProduct = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  // Update custom list price for an item
  const handleItemPriceChange = (index: number, newPriceVal: string) => {
    const newPrice = Math.max(0, parseFloat(newPriceVal) || 0);
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

  // Update discount % for an item
  const handleItemDiscountChange = (index: number, newDiscVal: string) => {
    const disc = parseFloat(newDiscVal) || 0;
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

  // Apply Bulk Discount % to All Items in the Price Book
  const handleApplyBulkDiscount = () => {
    const disc = parseFloat(bulkDiscountInput);
    if (isNaN(disc) || disc < 0 || disc > 100) {
      Swal.fire('Invalid Discount', 'Please enter a valid percentage between 0 and 100.', 'warning');
      return;
    }

    setItems(prev =>
      prev.map(it => {
        const calcPrice = it.standardPrice * (1 - disc / 100);
        return {
          ...it,
          discountPercent: disc,
          listPrice: Math.round(Math.max(0, calcPrice) * 100) / 100,
        };
      })
    );
    setBulkDiscountInput('');
    Swal.fire({
      icon: 'success',
      title: 'Applied!',
      text: `Applied ${disc}% discount to all products in this price book.`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Validation Error', 'Price Book Name is required.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const avgPrice = items.length > 0
        ? items.reduce((acc, it) => acc + (Number(it.listPrice) || 0), 0) / items.length
        : 0;

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        status: formData.status,
        effectiveDate: formData.effectiveDate || undefined,
        expiryDate: formData.expiryDate || undefined,
        price: avgPrice,
        currency: 'INR',
        itemType: 'product',
        items: items,
      };

      if (priceBook && priceBook.id) {
        await api.put(`/price-books/${priceBook.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Price book updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        onSaved();
        onClose();
      } else {
        await api.post('/price-books', payload);
        onSaved();

        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Price book created. You can now add another.',
            timer: 1500,
            showConfirmButton: false,
          });
          setFormData({
            name: '',
            description: '',
            status: 'Active',
            effectiveDate: '',
            expiryDate: '',
          });
          setItems([]);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'Price book created successfully',
            timer: 1500,
            showConfirmButton: false,
          });
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Error saving price book', err);
      const msg = err.response?.data?.message || 'Failed to save price book.';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingProducts = availableProducts.filter(p => !items.some(i => i.productId === p.id));

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {priceBook ? 'Edit Price Book' : 'New Price Book'}
              </h2>
              <p className="text-xs text-gray-500">
                Configure custom pricing catalogues for wholesale, retail, or tier-based clients.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form id="pricebook-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* General Information Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Price Book Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price Book Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  required
                  placeholder="e.g. Wholesale Tier / Enterprise Clients"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  className="w-full h-9 px-3 rounded-md border border-gray-200 text-xs bg-white outline-none focus:border-indigo-500 cursor-pointer"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  {PRICEBOOK_STATUSES.map(curr => (
                    <option key={curr} value={curr}>{curr}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Special discounted pricing for wholesale buyers and distributors."
                  className="w-full px-3 py-2 rounded-md border border-gray-200 text-xs bg-white outline-none focus:border-indigo-500 transition-all resize-y min-h-[50px]"
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Effective From
                </label>
                <Input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={e => handleChange('effectiveDate', e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Valid Until / Expiry Date
                </label>
                <Input
                  type="date"
                  value={formData.expiryDate}
                  onChange={e => handleChange('expiryDate', e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Product Pricing Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  Products & Custom Prices ({items.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set specific selling rates for products when this price book is selected in orders or quotations.
                </p>
              </div>

              {availableProducts.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllProducts}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto hover:underline"
                >
                  + Add All Catalog Products
                </button>
              )}
            </div>

            {/* Product Addition & Bulk Tool Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-gray-50/70 p-3 rounded-lg border border-gray-100">
              {/* Product Selector */}
              <div className="lg:col-span-7 flex gap-2">
                <select
                  value={selectedProductToAdd}
                  onChange={e => setSelectedProductToAdd(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-md border border-gray-200 text-xs bg-white outline-none focus:border-indigo-500"
                >
                  <option value="">
                    {loadingProducts
                      ? 'Loading catalog products...'
                      : remainingProducts.length > 0
                        ? '-- Choose product to add --'
                        : 'All catalog products already added'}
                  </option>
                  {remainingProducts.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.sku ? `(${p.sku})` : ''} - MRP: ₹{Number(p.price || 0).toLocaleString()}
                    </option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={handleAddProduct}
                  disabled={!selectedProductToAdd}
                  className="bg-indigo-600 hover:bg-indigo-700 h-9 px-3 text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>

              {/* Quick Bulk Discount Tool */}
              <div className="lg:col-span-5 flex items-center gap-2 justify-end border-t lg:border-t-0 lg:border-l border-gray-200 pt-2 lg:pt-0 lg:pl-3">
                <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap">
                  Bulk %:
                </span>
                <div className="relative w-20">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    placeholder="10"
                    value={bulkDiscountInput}
                    onChange={e => setBulkDiscountInput(e.target.value)}
                    className="h-8 text-xs pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">%</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyBulkDiscount}
                  disabled={items.length === 0 || !bulkDiscountInput}
                  className="h-8 px-2.5 text-xs text-indigo-700 hover:bg-indigo-50 border-indigo-200 whitespace-nowrap"
                >
                  Apply All
                </Button>
              </div>
            </div>

            {/* Items Table */}
            {items.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-lg">
                <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">No products added yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Select a product from the dropdown above to define its custom selling price, or click "Add All Catalog Products".
                </p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3 min-w-[200px]">Product / Item</th>
                      <th className="py-2.5 px-3 w-32 text-right">Standard MRP</th>
                      <th className="py-2.5 px-3 w-36 text-right">Price Book Rate (₹)</th>
                      <th className="py-2.5 px-3 w-28 text-center">Discount %</th>
                      <th className="py-2.5 px-2 w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, idx) => (
                      <tr key={item.productId} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-gray-900 block">{item.productName}</span>
                          {item.sku && <span className="text-[11px] text-gray-400 font-mono">SKU: {item.sku}</span>}
                        </td>

                        <td className="py-2.5 px-3 text-right text-gray-500 font-mono">
                          ₹{Number(item.standardPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="relative inline-block w-32">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.listPrice}
                              onChange={e => handleItemPriceChange(idx, e.target.value)}
                              className="h-8 pl-6 pr-2 text-right text-xs font-mono font-semibold"
                            />
                          </div>
                        </td>

                        <td className="py-2.5 px-3 text-center">
                          <div className="relative inline-block w-20">
                            <Input
                              type="number"
                              step="0.1"
                              value={item.discountPercent || 0}
                              onChange={e => handleItemDiscountChange(idx, e.target.value)}
                              className="h-8 pr-5 text-center text-xs font-mono"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                          </div>
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(item.productId)}
                            className="p-1 text-gray-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove from Price Book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-gray-900">{items.length}</span> products configured in this price book
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 px-4 text-xs"
            >
              Cancel
            </Button>

            {!priceBook && (
              <Button
                type="button"
                variant="outline"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="h-9 px-4 text-xs text-indigo-700 border-indigo-200 hover:bg-indigo-50"
              >
                Save & New
              </Button>
            )}

            <Button
              type="submit"
              form="pricebook-form"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-5 text-xs font-medium shadow-xs"
            >
              {isLoading ? 'Saving...' : priceBook ? 'Update Price Book' : 'Save Price Book'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
