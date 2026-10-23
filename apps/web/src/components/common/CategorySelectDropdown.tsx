import { useState, useRef, useEffect } from 'react';
import { Folder, Check, Plus, X } from 'lucide-react';
import api from '@/lib/api';
import { AddCategoryModal } from '@/modules/categories/components/AddCategoryModal';

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  color?: string;
  productCount?: number;
}

interface CategorySelectDropdownProps {
  value: string;
  onChange: (categoryName: string) => void;
  onCategoryCreated?: (newCategory: any) => void;
  placeholder?: string;
  className?: string;
  heightClass?: string;
}

export function CategorySelectDropdown({
  value,
  onChange,
  onCategoryCreated,
  placeholder = 'Select Category',
  className = '',
  heightClass = 'h-9',
}: CategorySelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter categories by query
  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q)
    );
  });

  const selectedCategory = categories.find((c) => c.name.toLowerCase() === (value || '').toLowerCase());

  const handleSelect = (categoryName: string) => {
    onChange(categoryName);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input Box with Right Folder Icon (Matches Account/Vendor dropdown pattern) */}
      <div
        onClick={() => setIsOpen(true)}
        className={`flex items-stretch ${heightClass} w-full rounded-md border bg-white cursor-pointer transition-all shadow-xs ${
          isOpen ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <div className="flex-1 flex items-center min-w-0 px-3">
          <input
            type="text"
            value={isOpen ? searchQuery : (value || '')}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={isOpen ? (value ? `Current: ${value}` : 'Search category...') : (value || placeholder)}
            className="w-full text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400 cursor-pointer"
          />
        </div>

        {/* Clear Button if category is selected */}
        {value && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear selection"
            className="px-2 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Right Category Icon Container */}
        <div className="w-9 flex-none flex items-center justify-center bg-slate-50/80 border-l border-gray-200 text-gray-500 rounded-r-md">
          <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 bg-white">
            <Folder className="w-3 h-3 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Categories List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="py-6 text-center text-xs font-medium text-slate-500">
                Loading categories...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-5 px-3 text-center">
                <p className="text-xs font-medium text-slate-600">
                  {searchQuery ? `No category matching "${searchQuery}"` : 'No Category found.'}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Click "+ Add Category" below to create one
                </p>
              </div>
            ) : (
              filteredCategories.map((category) => {
                const isSelected = (value || '').toLowerCase() === category.name.toLowerCase();
                return (
                  <div
                    key={category.id}
                    onClick={() => handleSelect(category.name)}
                    className={`px-3.5 py-2 cursor-pointer transition-colors flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-indigo-50/70 text-indigo-900 font-semibold'
                        : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{category.name}</span>
                      {category.productCount !== undefined && category.productCount > 0 && (
                        <span className="text-[10px] text-gray-400 font-normal">
                          ({category.productCount})
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Bottom Action: Fixed single plus button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(false);
              setIsModalOpen(true);
            }}
            className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/60 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            Add Category
          </button>
        </div>
      )}

      {/* Modal to Add New Category */}
      <AddCategoryModal
        isOpen={isModalOpen}
        initialName={searchQuery}
        onClose={() => setIsModalOpen(false)}
        onSuccess={async (newCat) => {
          await fetchCategories();
          if (newCat && newCat.name) {
            onChange(newCat.name);
            if (onCategoryCreated) {
              onCategoryCreated(newCat);
            }
          }
        }}
      />
    </div>
  );
}
