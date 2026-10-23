import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import {
  PRODUCT_UNITS,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
  TAX_RATES,
} from '@/lib/constants';
import { CategorySelectDropdown } from '@/components/common/CategorySelectDropdown';

const initialProductFormData = {
  name: '',
  sku: '',
  category: '',
  productType: 'Goods',
  price: '',
  costPrice: '',
  currency: 'INR',
  taxRate: 18,
  hsnCode: '',
  stock: 'Unlimited',
  unit: 'Unit',
  minStock: '10',
  status: 'Active',
  description: '',
};

export function CreateProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  // Form State
  const [formData, setFormData] = useState(initialProductFormData);

  useEffect(() => {
    if (isEditMode && id) {
      fetchProductDetails(id);
    } else {
      setFormData(initialProductFormData);
    }
  }, [id, isEditMode]);

  const fetchProductDetails = async (productId: string) => {
    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      if (data) {
        setFormData({
          name: data.name || '',
          sku: data.sku || '',
          category: data.category || '',
          productType: data.productType || 'Goods',
          price: data.price !== undefined ? String(data.price) : '',
          costPrice: data.costPrice !== undefined ? String(data.costPrice) : '',
          currency: data.currency || 'INR',
          taxRate: data.taxRate !== undefined ? Number(data.taxRate) : 18,
          hsnCode: data.hsnCode || '',
          stock: data.stock || 'Unlimited',
          unit: data.unit || 'Unit',
          minStock: data.minStock !== undefined ? String(data.minStock) : '10',
          status: data.status || 'Active',
          description: data.description || '',
        });
      }
    } catch (err) {
      console.error('Failed to load product details', err);
      Swal.fire('Error', 'Failed to load product details.', 'error');
      navigate('/products');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSku = () => {
    const prefix = formData.productType === 'Service' ? 'SRV' : 'PRD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    handleChange('sku', `${prefix}-${rand}`);
  };

  // Calculations
  const sellingPrice = parseFloat(formData.price) || 0;
  const costPrice = parseFloat(formData.costPrice) || 0;
  const grossProfit = sellingPrice > 0 ? sellingPrice - costPrice : 0;
  const marginPercent = sellingPrice > 0 ? Math.round((grossProfit / sellingPrice) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire('Required Field', 'Please enter a product name.', 'warning');
      return;
    }

    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      Swal.fire('Validation Error', 'Please enter a valid selling price.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim() || undefined,
        category: formData.category,
        productType: formData.productType,
        price: parseFloat(formData.price) || 0,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : 0,
        currency: formData.currency,
        taxRate: Number(formData.taxRate) || 0,
        hsnCode: formData.hsnCode.trim() || null,
        stock: formData.stock.trim() || 'Unlimited',
        unit: formData.unit,
        minStock: formData.minStock ? parseInt(formData.minStock) : 0,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      if (isEditMode && id) {
        await api.put(`/products/${id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Product updated successfully.',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate('/products');
      } else {
        await api.post('/products', payload);
        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Product Created!',
            text: `Product "${formData.name}" added successfully. You can now add another item.`,
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          setFormData(initialProductFormData);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Created!',
            text: 'New product added successfully.',
            timer: 1500,
            showConfirmButton: false,
          });
          navigate('/products');
        }
      }
    } catch (err: any) {
      console.error('Failed to save product', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save product.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#f8fafc] overflow-hidden">
      {/* Top Header - Fixed flush at the top, perfectly aligned with form */}
      <div className="h-14 bg-white border-b border-gray-200 shrink-0 z-30">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Products"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Create Product'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/products')}
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

      {/* Form Content Area - Independent Scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={(e) => handleSubmit(e, false)} className="w-full space-y-6 pb-12">
          {/* Main Form Sheet */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-8">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Product Information</h2>
            </div>

            {/* Section 1: Product Type Toggle */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Item Classification
              </label>
              <div className="inline-flex rounded-md border border-gray-200 p-1 bg-gray-50">
                {PRODUCT_TYPES.map(type => {
                  const isSelected = formData.productType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleChange('productType', type)}
                      className={`px-4 py-1.5 text-xs font-medium rounded transition-colors ${isSelected
                          ? 'bg-white text-indigo-700 shadow-sm font-semibold'
                          : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                      {type === 'Goods' ? 'Physical Goods' : 'Service / Digital'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: General Information */}
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-gray-900">General Information</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Product / Item Name *
                  </label>
                  <Input
                    required
                    placeholder="e.g. Enterprise Cloud License or Industrial Steel Valve"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-700">
                      SKU (Item Code)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      Auto Generate
                    </button>
                  </div>
                  <Input
                    placeholder="e.g. PRD-8941"
                    value={formData.sku}
                    onChange={e => handleChange('sku', e.target.value)}
                    className="h-9 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <CategorySelectDropdown
                    value={formData.category}
                    onChange={cat => handleChange('category', cat)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Unit of Measurement
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                    value={formData.unit}
                    onChange={e => handleChange('unit', e.target.value)}
                  >
                    {PRODUCT_UNITS.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                  >
                    {PRODUCT_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Pricing & Taxation */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Pricing & Taxation</h2>
                {sellingPrice > 0 && costPrice > 0 && (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                    Gross Margin: ₹{grossProfit.toLocaleString()} ({marginPercent}%)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Selling Price (Rate) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">₹</span>
                    <Input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={e => handleChange('price', e.target.value)}
                      className="h-9 pl-7 text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Cost Price (Purchase Rate)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-medium">₹</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={e => handleChange('costPrice', e.target.value)}
                      className="h-9 pl-7 text-sm font-mono"
                    />
                  </div>
                </div>



                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tax Rate (GST %)
                  </label>
                  <select
                    className="w-full h-9 px-3 rounded-md border border-gray-300 text-sm bg-white outline-none focus:border-indigo-500"
                    value={formData.taxRate}
                    onChange={e => handleChange('taxRate', Number(e.target.value))}
                  >
                    {TAX_RATES.map(rate => (
                      <option key={rate} value={rate}>
                        {rate === 0 ? '0% (Exempt / Nil)' : `${rate}% GST`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    HSN / SAC Code
                  </label>
                  <Input
                    placeholder="e.g. 998314 or 8471"
                    value={formData.hsnCode}
                    onChange={e => handleChange('hsnCode', e.target.value)}
                    className="h-9 text-sm font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Inventory Tracking */}
            {formData.productType === 'Goods' && (
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-gray-900">Inventory & Stock Tracking</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Initial Stock / Quantity
                    </label>
                    <Input
                      placeholder="e.g. 100 or Unlimited"
                      value={formData.stock}
                      onChange={e => handleChange('stock', e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Low Stock Alert Threshold
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formData.minStock}
                      onChange={e => handleChange('minStock', e.target.value)}
                      className="h-9 text-sm"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      System triggers low stock warning when inventory drops below this value.
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 5: Description & Specifications */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700">
                Description & Specifications
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm outline-none focus:border-indigo-500 placeholder:text-gray-400"
                placeholder="Enter technical specifications, warranty terms, or notes about this product..."
                value={formData.description}
                onChange={e => handleChange('description', e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

