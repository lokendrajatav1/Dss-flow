import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Package, Check, Plus, X, ChevronDown } from 'lucide-react';
import { ProductModal } from '@/modules/products/components/ProductModal';

interface ProductSelectDropdownProps {
  products: any[];
  selectedProductId?: string;
  selectedProductName?: string;
  onSelectProduct: (product: any | null) => void;
  onProductCreated?: (newProduct: any) => void;
  placeholder?: string;
  className?: string;
  priceType?: 'price' | 'costPrice';
}

export function ProductSelectDropdown({
  products,
  selectedProductId,
  selectedProductName = '',
  onSelectProduct,
  onProductCreated,
  placeholder = 'Search or select item...',
  className = '',
  priceType = 'price',
}: ProductSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || (
    selectedProductName ? products.find((p) => p.name === selectedProductName) : null
  );

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(rect.width, 280),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (product: any) => {
    onSelectProduct(product);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectProduct(null);
    setSearchQuery('');
  };

  const displayTitle = selectedProduct
    ? selectedProduct.name
    : (selectedProductName || '');

  return (
    <div className={`relative ${className}`}>
      {/* Search / Select Input Box (Matching User Screenshot) */}
      <div
        ref={triggerRef}
        onClick={() => {
          setIsOpen(true);
          updatePosition();
        }}
        className={`flex items-center h-9 w-full rounded-md border bg-white cursor-pointer transition-all ${
          isOpen ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="text"
          value={isOpen ? searchQuery : displayTitle}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) {
              setIsOpen(true);
              updatePosition();
            }
          }}
          onFocus={() => {
            setIsOpen(true);
            updatePosition();
          }}
          placeholder={displayTitle || placeholder}
          className="flex-1 min-w-0 px-2.5 text-xs text-gray-900 bg-transparent outline-none placeholder:text-gray-400 font-medium"
        />

        {/* Clear Button if product is selected */}
        {(selectedProduct || displayTitle) && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear selection"
            className="p-1 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Green dot indicator (as in user screenshot) */}
        {(selectedProduct || displayTitle) ? (
          <span
            className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mx-1.5"
            title="Active Item"
          />
        ) : (
          <div className="pr-2 flex items-center text-gray-400">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Dropdown Popover Portalled to document.body */}
      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              zIndex: 9999,
            }}
            className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          >
            {/* Products List or Empty State */}
            <div className="max-h-56 overflow-y-auto divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <div className="py-6 text-center text-xs font-medium text-slate-500">
                  No Product found.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isSelected = product.id === selectedProductId || product.name === displayTitle;
                  const priceValue =
                    priceType === 'costPrice'
                      ? (product.costPrice ?? product.price ?? 0)
                      : (product.price ?? 0);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelect(product)}
                      className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-xs font-medium truncate flex items-center gap-1.5">
                          <span className="truncate">{product.name}</span>
                          {product.category && (
                            <span className="text-[10px] text-gray-400 font-normal shrink-0">
                              • {product.category}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="font-semibold text-indigo-600">₹{priceValue}</span>
                          {product.sku && <span className="text-gray-400">SKU: {product.sku}</span>}
                          {product.taxRate ? (
                            <span className="text-gray-400">GST: {product.taxRate}%</span>
                          ) : null}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                    </div>
                  );
                })
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Bottom Action: "+ New Product" */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setIsModalOpen(true);
              }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Product
            </button>
          </div>,
          document.body
        )}

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(newProduct) => {
          if (newProduct) {
            if (onProductCreated) {
              onProductCreated(newProduct);
            }
            onSelectProduct(newProduct);
          }
        }}
      />
    </div>
  );
}
