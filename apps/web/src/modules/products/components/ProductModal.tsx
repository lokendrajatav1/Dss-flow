import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any | null;
  onSaved?: (savedProduct?: any) => void;
}

import {
  PRODUCT_UNITS,
  PRODUCT_TAX_RATE_OPTIONS,
  PRODUCT_STATUSES,
  PRODUCT_TYPES,
} from '@/lib/constants';
import { CategorySelectDropdown } from '@/components/common/CategorySelectDropdown';

const UNITS = PRODUCT_UNITS;
const TAX_RATES = PRODUCT_TAX_RATE_OPTIONS;

const initialProductFormData = {
  name: '',
  sku: '',
  category: '',
  productType: 'Goods',
  price: '',
  costPrice: '',
  currency: 'INR',
  taxRate: '18',
  hsnCode: '',
  stock: 'Unlimited',
  unit: 'Unit',
  minStock: '10',
  status: 'Active',
  description: '',
};

export function ProductModal({ isOpen, onClose, product, onSaved }: ProductModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState(initialProductFormData);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || '',
        productType: product.productType || 'Goods',
        price: product.price !== undefined ? String(product.price) : '',
        costPrice: product.costPrice !== undefined ? String(product.costPrice) : '',
        currency: product.currency || 'INR',
        taxRate: product.taxRate !== undefined ? String(product.taxRate) : '18',
        hsnCode: product.hsnCode || '',
        stock: product.stock !== undefined ? String(product.stock) : 'Unlimited',
        unit: product.unit || 'Unit',
        minStock: product.minStock !== undefined ? String(product.minStock) : '10',
        status: product.status || 'Active',
        description: product.description || '',
      });
      if (product.costPrice || product.hsnCode || product.minStock) {
        setShowAdvanced(true);
      }
    } else {
      setFormData(initialProductFormData);
      setShowAdvanced(false);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateSku = () => {
    const prefix = formData.productType === 'Service' ? 'SRV' : formData.productType === 'Subscription' ? 'SUB' : 'PRD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    handleChange('sku', `${prefix}-${rand}`);
  };

  const handleSubmit = async (e: React.FormEvent, isSaveAndNew = false) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      Swal.fire('Validation Error', 'Product / Service Name is required.', 'warning');
      return;
    }

    if (formData.price === '' || isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      Swal.fire('Validation Error', 'Please enter a valid price.', 'warning');
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
        taxRate: parseFloat(formData.taxRate) || 0,
        hsnCode: formData.hsnCode.trim() || null,
        stock: formData.stock.trim() || 'Unlimited',
        unit: formData.unit,
        minStock: formData.minStock ? parseInt(formData.minStock) : 0,
        status: formData.status,
        description: formData.description.trim() || null,
      };

      if (product && product.id) {
        await api.put(`/products/${product.id}`, payload);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Product updated successfully',
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        const res = await api.post('/products', payload);
        if (onSaved) onSaved(res.data);

        if (isSaveAndNew) {
          Swal.fire({
            icon: 'success',
            title: 'Product Created!',
            text: `"${res.data.name}" added. You can now add another item.`,
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: 'top-end',
          });
          setFormData(initialProductFormData);
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Product created successfully',
            timer: 1500,
            showConfirmButton: false,
          });
          onClose();
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to save product';
      Swal.fire('Error', msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex-none flex items-center justify-between p-4 border-b border-gray-100 bg-white rounded-t-2xl z-20">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product / Service Name *
                </label>
                <Input
                  required
                  placeholder="Enter Product / Service Name"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>

              {/* SKU */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Product Code / SKU
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Auto Generate
                  </button>
                </div>
                <Input
                  placeholder="e.g. PRD-1001"
                  value={formData.sku}
                  onChange={e => handleChange('sku', e.target.value)}
                />
              </div>

              {/* Product Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Item Type
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.productType}
                  onChange={e => {
                    const type = e.target.value;
                    handleChange('productType', type);
                    if (type === 'Service' || type === 'Subscription') {
                      handleChange('stock', 'Unlimited');
                    }
                  }}
                >
                  <option value="Goods">Physical Goods</option>
                  <option value="Service">Service</option>
                  <option value="Subscription">Subscription / SaaS</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Category
                </label>
                <CategorySelectDropdown
                  value={formData.category}
                  onChange={cat => handleChange('category', cat)}
                  heightClass="h-10"
                />
              </div>

              {/* Unit of Measurement */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Unit
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.unit}
                  onChange={e => handleChange('unit', e.target.value)}
                >
                  {UNITS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              {/* Selling Price */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Selling Price (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="pl-7"
                    value={formData.price}
                    onChange={e => handleChange('price', e.target.value)}
                  />
                </div>
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Stock / Quantity
                </label>
                <Input
                  placeholder="e.g. 50 or Unlimited"
                  value={formData.stock}
                  onChange={e => handleChange('stock', e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Status
                </label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value)}
                >
                  {PRODUCT_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full min-h-[80px] p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                  placeholder="Enter product description or specifications..."
                  value={formData.description}
                  onChange={e => handleChange('description', e.target.value)}
                />
              </div>

              {/* Advanced Fields Toggle (matches AddLeadModal pattern) */}
              <div className="md:col-span-3 flex justify-center mt-2 mb-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  {showAdvanced ? 'Hide Additional Details' : 'Show Additional Details (Cost, Tax, HSN)'}
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showAdvanced && (
                <>
                  {/* Cost Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Cost Price (Purchase Rate)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={e => handleChange('costPrice', e.target.value)}
                    />
                  </div>

                  {/* Tax Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Tax / GST Rate
                    </label>
                    <select
                      className="w-full h-10 px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 text-sm bg-white"
                      value={formData.taxRate}
                      onChange={e => handleChange('taxRate', e.target.value)}
                    >
                      {TAX_RATES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* HSN / SAC Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      HSN / SAC Code
                    </label>
                    <Input
                      placeholder="e.g. 998314 or 8471"
                      value={formData.hsnCode}
                      onChange={e => handleChange('hsnCode', e.target.value)}
                    />
                  </div>

                  {/* Low Stock Alert Threshold */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Low Stock Threshold
                    </label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="10"
                      value={formData.minStock}
                      onChange={e => handleChange('minStock', e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer (Matching Screenshot: Cancel, Save and New, Save) */}
          <div className="flex-none p-4 border-t border-gray-100 flex items-center justify-end gap-2.5 bg-white rounded-b-2xl z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
            >
              Cancel
            </button>
            {!product && (
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                Save and New
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50 min-w-[76px] cursor-pointer"
            >
              {isLoading ? 'Saving...' : (product ? 'Update' : 'Save')}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
