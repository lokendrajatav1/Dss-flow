import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CALL_STATUSES, LEAD_SOURCES, LEAD_PRIORITIES } from '@/lib/constants';
import api from '@/lib/api';

export interface LeadFilterState {
  searchQuery: string;
  filterFromDate: string;
  filterToDate: string;
  filterFollowupFromDate: string;
  filterFollowupToDate: string;
  filterCallStatus: string;
  filterSource: string;
  filterAssignee: string;
  filterPriority: string;
  filterUnassigned: boolean;
}

export const initialFilterState: LeadFilterState = {
  searchQuery: '',
  filterFromDate: '',
  filterToDate: '',
  filterFollowupFromDate: '',
  filterFollowupToDate: '',
  filterCallStatus: 'all',
  filterSource: 'all',
  filterAssignee: 'all',
  filterPriority: 'all',
  filterUnassigned: false,
};

interface LeadFilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: LeadFilterState;
  setFilters: React.Dispatch<React.SetStateAction<LeadFilterState>>;
}

export const LeadFilterSidebar: React.FC<LeadFilterSidebarProps> = ({
  isOpen,
  onClose,
  filters,
  setFilters
}) => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
          setUsers(res.data);
        } catch (err) {
          console.error('Failed to load users for filter', err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (field: keyof LeadFilterState, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFilters(initialFilterState);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-[90] transition-opacity backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[350px] bg-white shadow-2xl z-[100] flex flex-col transform transition-transform duration-300 ease-in-out slide-in-from-right">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-lg">Filters</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-full p-1 transition-colors">
            <Plus className="w-4 h-4 rotate-45" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Enter Keyword</label>
            <input 
              type="text" 
              placeholder="Search Name.." 
              value={filters.searchQuery}
              onChange={(e) => handleChange('searchQuery', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white placeholder:text-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">From Date</label>
              <input 
                type="date"
                value={filters.filterFromDate}
                onChange={(e) => handleChange('filterFromDate', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">To Date</label>
              <input 
                type="date"
                value={filters.filterToDate}
                onChange={(e) => handleChange('filterToDate', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Follow-up From Date</label>
              <input 
                type="date"
                value={filters.filterFollowupFromDate}
                onChange={(e) => handleChange('filterFollowupFromDate', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Follow-up To Date</label>
              <input 
                type="date"
                value={filters.filterFollowupToDate}
                onChange={(e) => handleChange('filterFollowupToDate', e.target.value)}
                className="w-full h-9 border border-gray-300 rounded-sm px-2 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Call Status</label>
            <select
              value={filters.filterCallStatus}
              onChange={(e) => handleChange('filterCallStatus', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
            >
              <option value="all">Select Call Status</option>
              {CALL_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Lead Source</label>
            <select
              value={filters.filterSource}
              onChange={(e) => handleChange('filterSource', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
            >
              <option value="all">Select Source</option>
              {LEAD_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Team Members</label>
            <select
              value={filters.filterAssignee}
              onChange={(e) => handleChange('filterAssignee', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
            >
              <option value="all">Select Member</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">Select Star Rated</label>
            <select
              value={filters.filterPriority}
              onChange={(e) => handleChange('filterPriority', e.target.value)}
              className="w-full h-9 border border-gray-300 rounded-sm px-3 text-sm outline-none focus:border-blue-500 bg-white text-gray-700"
            >
              <option value="all">Select</option>
              <option value="starred">Star Rated</option>
              <option value="unstarred">No Star Rated</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 pb-2">
            <label className="block text-[14px] font-semibold text-gray-800">Not Assign Lead</label>
            <button 
              onClick={() => handleChange('filterUnassigned', !filters.filterUnassigned)}
              className={`w-[42px] h-6 rounded-full transition-colors relative ${filters.filterUnassigned ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${filters.filterUnassigned ? 'translate-x-[18px]' : ''}`}></div>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center gap-3">
          <Button
            onClick={handleReset}
            className="flex-1 bg-[#4bc0c0] hover:bg-[#36a2eb] text-white h-10 rounded font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-[#007bff] hover:bg-[#0056b3] text-white h-10 rounded font-semibold"
          >
            Search
          </Button>
        </div>
      </div>
    </>
  );
};
