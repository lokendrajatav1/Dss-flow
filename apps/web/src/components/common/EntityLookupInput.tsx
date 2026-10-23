import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, User, Building2 } from 'lucide-react';
import api from '@/lib/api';

export interface EntityLookupItem {
  id: string;
  name: string;
  companyName?: string;
  phone?: string;
  email?: string;
  assignedTo?: string | { id: string; name: string };
  type: 'Lead' | 'Contact';
  raw?: any;
}

interface EntityLookupInputProps {
  entityType?: 'Lead' | 'Contact';
  onEntityTypeChange?: (type: 'Lead' | 'Contact') => void;
  onSelect: (item: EntityLookupItem | null) => void;
  selectedItem?: EntityLookupItem | null;
  placeholder?: string;
  className?: string;
}

export function EntityLookupInput({
  entityType = 'Lead',
  onEntityTypeChange,
  onSelect,
  selectedItem = null,
  placeholder = '',
  className = '',
}: EntityLookupInputProps) {
  const [currentType, setCurrentType] = useState<'Lead' | 'Contact'>(entityType);
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [leads, setLeads] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external entityType prop if provided
  useEffect(() => {
    if (entityType) {
      setCurrentType(entityType);
    }
  }, [entityType]);

  // Sync selectedItem display text
  useEffect(() => {
    if (selectedItem) {
      setSearchQuery(selectedItem.name);
    } else {
      setSearchQuery('');
    }
  }, [selectedItem]);

  // Handle outside click to close menus
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsTypeMenuOpen(false);
        setIsDropdownOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch leads and contacts once on mount or focus
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };

        const [leadsRes, contactsRes] = await Promise.allSettled([
          api.get('/leads', { headers }),
          api.get('/customers', { headers }),
        ]);

        if (leadsRes.status === 'fulfilled' && Array.isArray(leadsRes.value.data)) {
          setLeads(leadsRes.value.data);
        }
        if (contactsRes.status === 'fulfilled' && Array.isArray(contactsRes.value.data)) {
          setContacts(contactsRes.value.data);
        }
      } catch (err) {
        console.warn('Failed to load lookup items', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTypeSelect = (type: 'Lead' | 'Contact') => {
    setCurrentType(type);
    setIsTypeMenuOpen(false);
    if (onEntityTypeChange) {
      onEntityTypeChange(type);
    }
    // Clear selection when changing entity type
    if (selectedItem && selectedItem.type !== type) {
      onSelect(null);
      setSearchQuery('');
    }
    setIsDropdownOpen(true);
    inputRef.current?.focus();
  };

  const activePool = currentType === 'Lead' ? leads : contacts;

  const filteredItems = activePool
    .filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (item.name || item.title || '').toLowerCase().includes(q) ||
        (item.companyName || '').toLowerCase().includes(q) ||
        (item.phone || item.whatsappNumber || '').includes(q) ||
        (item.email || '').toLowerCase().includes(q)
      );
    })
    .slice(0, 10);

  const handleSelectRecord = (record: any) => {
    const displayName = record.name || record.title || 'Unknown';
    const mapped: EntityLookupItem = {
      id: record.id,
      name: displayName,
      companyName: record.companyName || '',
      phone: record.phone || record.whatsappNumber || '',
      email: record.email || '',
      assignedTo: record.assignedTo?.name || record.assignedTo || '',
      type: currentType,
      raw: record,
    };
    onSelect(mapped);
    setSearchQuery(displayName);
    setIsDropdownOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const handleSearchClick = () => {
    setIsDropdownOpen((prev) => !prev);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Search Input Box (Pixel-matched to user screenshot) */}
      <div
        className={`flex items-stretch h-[38px] w-full rounded-[6px] bg-white transition-colors border ${
          isFocused || isDropdownOpen
            ? 'border-[#2563eb]'
            : 'border-[#c5cee0] hover:border-[#a0aec0]'
        }`}
      >
        {/* Left Dropdown Button: [ Lead ▼ ] or [ Contact ▼ ] */}
        <div className="relative shrink-0 flex items-center">
          <button
            type="button"
            onClick={() => {
              setIsTypeMenuOpen((prev) => !prev);
              setIsDropdownOpen(false);
            }}
            className="h-full px-3 flex items-center gap-2 text-[14px] text-gray-700 font-normal outline-none select-none hover:bg-gray-50/80 rounded-l-[5px] transition-colors cursor-pointer"
          >
            <span>{currentType}</span>
            {/* Small solid downward triangle ▼ matching screenshot */}
            <svg
              className={`w-2.5 h-2 text-gray-500 fill-current transition-transform duration-150 ${
                isTypeMenuOpen ? 'rotate-180' : ''
              }`}
              viewBox="0 0 10 6"
            >
              <polygon points="0,0 10,0 5,6" />
            </svg>
          </button>

          {/* Type Menu Dropdown: Lead / Contact */}
          {isTypeMenuOpen && (
            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md py-1 min-w-[110px] z-[9999]">
              <button
                type="button"
                onClick={() => handleTypeSelect('Lead')}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  currentType === 'Lead'
                    ? 'text-blue-600 font-medium bg-blue-50/60'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Lead
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('Contact')}
                className={`w-full text-left px-3 py-1.5 text-sm transition-colors cursor-pointer ${
                  currentType === 'Contact'
                    ? 'text-blue-600 font-medium bg-blue-50/60'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Contact
              </button>
            </div>
          )}
        </div>

        {/* Thin vertical separator line */}
        <div
          className={`w-[1px] h-full ${
            isFocused || isDropdownOpen ? 'bg-[#bfdbfe]' : 'bg-[#c5cee0]'
          }`}
        />

        {/* Middle Search Input */}
        <div className="flex-1 flex items-center px-3 min-w-0 bg-white">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            placeholder={placeholder}
            onFocus={() => {
              setIsFocused(true);
              setIsDropdownOpen(true);
            }}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
              if (selectedItem && e.target.value !== selectedItem.name) {
                onSelect(null);
              }
            }}
            className="w-full h-full text-[14px] text-gray-800 outline-none bg-transparent placeholder:text-gray-400"
          />

          {/* Clear button if user has text or selected item */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
              title="Clear"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Right Search Button: Tinted light-blue box with thin magnifying glass 🔍 */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="w-10 h-full flex items-center justify-center bg-[#f0f5ff] hover:bg-[#e4edfd] text-gray-500 rounded-r-[5px] transition-colors shrink-0 cursor-pointer"
          title={`Search ${currentType}s`}
        >
          <Search className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
        </button>
      </div>

      {/* Dropdown Menu Results (Flat, zero-shadow, matching enterprise CRM) */}
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-md max-h-56 overflow-y-auto z-[9999] divide-y divide-gray-100">
          {loading ? (
            <div className="p-3 text-center text-xs text-gray-500">
              Loading {currentType.toLowerCase()}s...
            </div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const displayName = item.name || item.title || 'Unknown';
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectRecord(item)}
                  className={`p-2.5 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-blue-50/70 text-blue-900' : 'hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.companyName ? `${item.companyName} • ` : ''}
                      {item.phone || item.whatsappNumber || 'No phone'}
                      {item.email ? ` • ${item.email}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {currentType}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-gray-500">
              No {currentType.toLowerCase()}s found matching &quot;{searchQuery}&quot;. You can type details below manually.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
