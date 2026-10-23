import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Trash2,
  RefreshCw,
  Edit,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { ProductCategory } from '../types';
import { AddCategoryModal } from '../components/AddCategoryModal';
import { EditCategoryModal } from '../components/EditCategoryModal';

export function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: ProductCategory) => {
    if (cat.productCount > 0) {
      Swal.fire({
        title: 'Cannot Delete Category',
        text: `"${cat.name}" is currently assigned to ${cat.productCount} product(s). Please reassign those products first.`,
        icon: 'warning',
        confirmButtonColor: '#4f46e5',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Category?',
      text: `Are you sure you want to delete "${cat.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/categories/${cat.id}`);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `Category "${cat.name}" deleted`,
          showConfirmButton: false,
          timer: 2000,
        });
        fetchCategories();
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete category.';
        Swal.fire('Error', msg, 'error');
      }
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (cat.name || '').toLowerCase().includes(q) ||
      (cat.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Bar (Standard CRM Layout) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Categories : {filteredCategories.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium cursor-pointer"
          >
            + Add Category
          </Button>

          <Button
            onClick={fetchCategories}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-60 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-indigo-500 bg-white"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Clean Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200 w-1/3">Category Name</th>
                <th className="px-4 py-3 border-r border-gray-200">Description</th>
                <th className="px-4 py-3 border-r border-gray-200 text-center w-36">Linked Products</th>
                <th className="px-4 py-3 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Loading categories...
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-700">
                      {searchQuery ? `No category matching "${searchQuery}"` : 'No categories found.'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Click "+ Add Category" to create your first category.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-900">
                      {cat.name}
                    </td>

                    <td className="px-4 py-3 border-r border-gray-100 text-gray-500 truncate max-w-xs">
                      {cat.description || '—'}
                    </td>

                    <td className="px-4 py-3 border-r border-gray-100 text-center">
                      <button
                        type="button"
                        onClick={() => navigate('/products')}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                        title="View products in this category"
                      >
                        {cat.productCount} product(s)
                      </button>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(cat)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AddCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchCategories}
      />

      {/* Edit Modal */}
      <EditCategoryModal
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={fetchCategories}
      />
    </div>
  );
}
