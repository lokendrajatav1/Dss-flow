import { useState, useRef, useEffect } from 'react';
import { Store, Check, Plus, X } from 'lucide-react';
import { VendorModal } from '@/modules/vendors/components/VendorModal';

interface VendorSelectDropdownProps {
  vendors: any[];
  selectedVendorId: string;
  onSelectVendor: (vendor: any | null) => void;
  onVendorCreated?: (newVendor: any) => void;
  placeholder?: string;
  className?: string;
}

export function VendorSelectDropdown({
  vendors,
  selectedVendorId,
  onSelectVendor,
  onVendorCreated,
  placeholder = 'Search or select vendor...',
  className = '',
}: VendorSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedVendor = vendors.find((v) => v.id === selectedVendorId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter vendors by query
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (v.name || '').toLowerCase().includes(q) ||
      (v.contactPerson || '').toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.phone || '').toLowerCase().includes(q) ||
      (v.city || '').toLowerCase().includes(q)
    );
  });

  const handleSelect = (vendor: any) => {
    onSelectVendor(vendor);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectVendor(null);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input Box with Right Store/Vendor Icon */}
      <div
        onClick={() => setIsOpen(true)}
        className={`flex items-stretch h-10 w-full rounded-md border bg-white cursor-pointer transition-all shadow-sm ${
          isOpen ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          type="text"
          value={
            isOpen
              ? searchQuery
              : selectedVendor
              ? `${selectedVendor.name}${selectedVendor.city ? ` (${selectedVendor.city})` : ''}`
              : ''
          }
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedVendor ? selectedVendor.name : placeholder}
          className="flex-1 min-w-0 px-3 text-sm text-gray-900 bg-transparent outline-none placeholder:text-gray-400"
        />

        {/* Clear Button if vendor is selected */}
        {selectedVendor && (
          <button
            type="button"
            onClick={handleClear}
            title="Clear selection"
            className="px-2 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Right Store/Vendor Button Container */}
        <div className="w-10 flex-none flex items-center justify-center bg-slate-50/80 border-l border-gray-200 text-gray-600 rounded-r-md">
          <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 bg-white">
            <Store className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-lg shadow-xl border border-gray-200 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Vendors List or "No Vendor found." */}
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {filteredVendors.length === 0 ? (
              <div className="py-8 text-center text-sm font-medium text-slate-500">
                No Vendor found.
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const isSelected = vendor.id === selectedVendorId;
                return (
                  <div
                    key={vendor.id}
                    onClick={() => handleSelect(vendor)}
                    className={`px-4 py-2.5 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'hover:bg-gray-50 text-gray-800'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">
                        <span>{vendor.name}</span>
                        {vendor.city && (
                          <span className="text-xs text-gray-400 font-normal">
                            ({vendor.city})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                        {vendor.contactPerson && <span>Rep: {vendor.contactPerson}</span>}
                        {vendor.phone && <span>{vendor.phone}</span>}
                        {vendor.email && <span>{vendor.email}</span>}
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

          {/* Bottom Action: "New Vendor" */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsModalOpen(true);
            }}
            className="w-full text-left px-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Vendor
          </button>
        </div>
      )}

      {/* Separate Reusable Vendor Modal Component */}
      <VendorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={(newVendor) => {
          if (newVendor) {
            if (onVendorCreated) {
              onVendorCreated(newVendor);
            }
            onSelectVendor(newVendor);
          }
        }}
      />
    </div>
  );
}
