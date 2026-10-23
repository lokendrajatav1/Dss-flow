import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { ProductCategory } from '../types';

interface EditCategoryModalProps {
  isOpen: boolean;
  category: ProductCategory | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}: EditCategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setDescription(category.description || '');
      setErrorMsg('');
    }
  }, [category]);

  if (!isOpen || !category) return null;

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = name.trim();
    if (!trimmed) {
      setErrorMsg('Category name cannot be blank.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await api.put(`/categories/${category.id}`, {
        name: trimmed,
        description: description.trim(),
      });

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Category updated successfully!',
        showConfirmButton: false,
        timer: 2000,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update category.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Edit className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">Edit Category</h3>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 text-xs bg-red-50 text-red-600 border border-red-200 rounded-lg">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <Input
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              onKeyDown={handleKeyDown}
              className="text-sm h-10"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-sm h-10"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              className="text-xs h-9 px-4 rounded-lg cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading || !name.trim()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-9 px-4 rounded-lg shadow-xs flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
