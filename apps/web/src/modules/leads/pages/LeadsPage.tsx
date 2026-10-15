import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus, Filter, FileText, RefreshCw, Trash2, Search, MoreVertical,
  Star, Globe, Flame, Edit, Bell, Mail, Phone, Eye, Undo, Save,
  ChevronLeft, ChevronRight, User, Calendar, Megaphone
} from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { AddLeadModal } from '../components/AddLeadModal';
import { EditLeadModal } from '../components/EditLeadModal';
import { SetReminderModal } from '../components/SetReminderModal';
import { LeadFilterSidebar, LeadFilterState, initialFilterState } from '../components/LeadFilterSidebar';
import { CALL_STATUSES, LEAD_SOURCES, LEAD_PRIORITIES } from '@/lib/constants';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.148 1.603 5.928L.18 23.361l5.545-1.455c1.721.956 3.659 1.464 5.679 1.464h.01C18.615 23.37 24 17.985 24 11.34 24 8.113 22.743 5.08 20.463 2.797 18.18 5.513 15.249 0 12.031 0zm.01 19.397c-1.802 0-3.567-.484-5.114-1.401l-.367-.217-3.799.997.994-3.702-.239-.38a9.497 9.497 0 0 1-1.45-5.07c0-5.246 4.269-9.516 9.516-9.516 2.54 0 4.928.99 6.723 2.784a9.518 9.518 0 0 1 2.783 6.721c0 5.247-4.269 9.516-9.516 9.516zm5.222-7.142c-.287-.143-1.696-.837-1.96-.933-.263-.093-.456-.143-.65.093-.19.237-.743.934-.91 1.127-.167.19-.335.215-.623.071-.287-.143-1.21-.446-2.306-1.422-.852-.76-1.428-1.7-1.595-1.986-.167-.287-.018-.442.126-.584.13-.129.287-.335.43-.502.143-.167.19-.287.287-.478.096-.19.048-.36-.024-.502-.072-.143-.65-1.569-.89-2.147-.234-.564-.473-.487-.65-.497-.167-.008-.36-.008-.55-.008-.19 0-.5.071-.763.36-.263.287-1.004.981-1.004 2.392s1.028 2.774 1.171 2.964c.143.19 2.022 3.085 4.898 4.327.685.296 1.219.473 1.636.606.688.218 1.314.187 1.808.113.553-.083 1.696-.693 1.936-1.363.239-.67.239-1.244.167-1.363-.071-.12-.263-.19-.55-.333z" />
  </svg>
);

const MySwal = withReactContent(Swal);

const getBadgeStyle = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return {
    backgroundColor: `hsl(${h}, 85%, 90%)`,
    color: `hsl(${h}, 70%, 25%)`,
    borderColor: `hsl(${h}, 75%, 85%)`
  };
};

const timeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export function LeadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentType = searchParams.get('is_type') || 'lead'; // 'lead', 'client', 'deal'
  
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [pendingCallStatus, setPendingCallStatus] = useState<string | undefined>(undefined);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
  const [openPhonePopupId, setOpenPhonePopupId] = useState<string | null>(null);
  const [openEmailPopupId, setOpenEmailPopupId] = useState<string | null>(null);
  const [openWhatsappPopupId, setOpenWhatsappPopupId] = useState<string | null>(null);

  // Search, Filter, Pagination, and Selection States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Advanced Filter States
  const [filters, setFilters] = useState<LeadFilterState>(initialFilterState);

  useEffect(() => {
    fetchLeads();
    // when type changes, refetch
  }, [currentType]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMoreId(null);
      setOpenPhonePopupId(null);
      setOpenEmailPopupId(null);
      setOpenWhatsappPopupId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/leads', { headers: { Authorization: `Bearer ${token}` } });
      setLeads(res.data);
    } catch (err) {
      console.error(`Failed to fetch leads`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/leads', data, { headers: { Authorization: `Bearer ${token}` } });
      setLeads([res.data, ...leads]);
      setIsModalOpen(false);
      MySwal.fire({ title: 'Success!', text: `${currentType} added successfully`, icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      MySwal.fire('Error', `Failed to add ${currentType}.`, 'error');
    }
  };

  const handleEditSubmit = async (id: string, data: any) => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.put(`/leads/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(leads.map(l => l.id === id ? res.data : l));
      setIsEditModalOpen(false);
      MySwal.fire({ title: 'Success!', text: 'Lead updated successfully', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      MySwal.fire('Error', 'Failed to update lead.', 'error');
    }
  };

  const updateCallStatus = async (leadId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/leads/${leadId}`, { callStatus: status }, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(leads.map(l => l.id === leadId ? { ...l, callStatus: status } : l));
    } catch (err) {
      MySwal.fire('Error', 'Failed to update status.', 'error');
    }
  };

  const handleCallStatusSelect = async (lead: any, status: string) => {
    // 1. Immediately update status in UI and DB
    await updateCallStatus(lead.id, status);

    // 2. If it's a scheduled callback or meeting, open the reminder modal for setting follow-up date/time
    if (status === 'Callback Scheduled' || status === 'Call Back Later' || status === 'Meeting Scheduled') {
      setSelectedLead({ ...lead, callStatus: status });
      setPendingCallStatus(status);
      setIsReminderModalOpen(true);
    }
  };

  const togglePriority = async (lead: any) => {
    try {
      const newPriority = lead.priority === 'High' ? 'Medium' : 'High';
      const token = localStorage.getItem('token');
      await api.put(`/leads/${lead.id}`, { priority: newPriority }, { headers: { Authorization: `Bearer ${token}` } });
      setLeads(leads.map(l => l.id === lead.id ? { ...l, priority: newPriority } : l));
    } catch (err) {
      MySwal.fire('Error', 'Failed to update priority.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setLeads(leads.filter(l => l.id !== id));
        setSelectedLeadIds(selectedLeadIds.filter(selectedId => selectedId !== id));
        MySwal.fire('Deleted!', `${currentType} has been deleted.`, 'success');
      } catch (err) {
        MySwal.fire('Error', `Failed to delete ${currentType}.`, 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeadIds.length === 0) {
      MySwal.fire('Info', 'Please select at least one lead to delete.', 'info');
      return;
    }

    const result = await MySwal.fire({
      title: `Are you sure you want to delete ${selectedLeadIds.length} leads?`,
      text: "This action cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete them!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await Promise.all(
          selectedLeadIds.map(id => api.delete(`/leads/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        setLeads(leads.filter(l => !selectedLeadIds.includes(l.id)));
        setSelectedLeadIds([]);
        MySwal.fire('Deleted!', 'Selected leads have been deleted.', 'success');
      } catch (err) {
        MySwal.fire('Error', 'Failed to delete some leads.', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      MySwal.fire('Info', 'No leads available to export.', 'info');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company Name', 'Call Status', 'Priority', 'Source', 'Created At'];
    const rows = filteredLeads.map(l => [
      `"${l.name || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.companyName || ''}"`,
      `"${l.callStatus || 'Untouched'}"`,
      `"${l.priority || 'Medium'}"`,
      `"${l.source || 'Manual'}"`,
      `"${l.createdAt ? new Date(l.createdAt).toISOString() : ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const visibleIds = paginatedLeads.map(l => l.id);
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIds = paginatedLeads.map(l => l.id);
      setSelectedLeadIds(prev => prev.filter(id => !visibleIds.includes(id)));
    }
  };

  const handleSelectLead = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(prev => [...prev, id]);
    } else {
      setSelectedLeadIds(prev => prev.filter(leadId => leadId !== id));
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Filter Logic
  const filteredLeads = leads.filter(lead => {
    // Check if the lead belongs to the current tab
    const isCurrentType = (lead.leadType === currentType) || (currentType === 'lead' && (!lead.leadType || lead.leadType === 'lead'));
    if (!isCurrentType) return false;

    const matchesSearch =
      (lead.name || lead.title || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (lead.email || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (lead.phone || '').toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      (lead.companyName || '').toLowerCase().includes(filters.searchQuery.toLowerCase());

    const matchesCallStatus = filters.filterCallStatus === 'all' || lead.callStatus === filters.filterCallStatus;
    const matchesSource = filters.filterSource === 'all' || lead.source === filters.filterSource;

    let matchesPriority = true;
    if (filters.filterPriority === 'starred') {
      matchesPriority = lead.priority === 'High' || lead.priority === 'Urgent';
    } else if (filters.filterPriority === 'unstarred') {
      matchesPriority = lead.priority !== 'High' && lead.priority !== 'Urgent';
    }

    let matchesDate = true;
    if (filters.filterFromDate && lead.createdAt) {
      matchesDate = matchesDate && new Date(lead.createdAt) >= new Date(filters.filterFromDate);
    }
    if (filters.filterToDate && lead.createdAt) {
      const to = new Date(filters.filterToDate);
      to.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(lead.createdAt) <= to;
    }
    
    let matchesFollowup = true;
    if (filters.filterFollowupFromDate && lead.nextFollowup) {
      matchesFollowup = matchesFollowup && new Date(lead.nextFollowup) >= new Date(filters.filterFollowupFromDate);
    }
    if (filters.filterFollowupToDate && lead.nextFollowup) {
      const to = new Date(filters.filterFollowupToDate);
      to.setHours(23, 59, 59, 999);
      matchesFollowup = matchesFollowup && new Date(lead.nextFollowup) <= to;
    }
    
    const matchesAssignee = filters.filterAssignee === 'all' || lead.assignedToId === filters.filterAssignee;
    const matchesUnassigned = filters.filterUnassigned ? !lead.assignedToId : true;

    return matchesSearch && matchesCallStatus && matchesPriority && matchesSource && matchesDate && matchesFollowup && matchesAssignee && matchesUnassigned;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available {currentType.charAt(0).toUpperCase() + currentType.slice(1)}s : {filteredLeads.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium">
            + Add Leads
          </Button>

          {/* Filter Button */}
          <Button
            onClick={() => setShowFilterDropdown(true)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Filter Leads"
          >
            <Filter className="w-4 h-4" />
          </Button>

          <LeadFilterSidebar 
            isOpen={showFilterDropdown} 
            onClose={() => setShowFilterDropdown(false)} 
            filters={filters} 
            setFilters={setFilters} 
          />

          <Button
            onClick={handleExportCSV}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Export CSV"
          >
            <FileText className="w-4 h-4" />
          </Button>

          <Button
            onClick={fetchLeads}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            onClick={handleBulkDelete}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-9 w-9 p-0 rounded-md"
            title="Bulk Delete Selected"
            disabled={selectedLeadIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Page Size Dropdown */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <Button variant="outline" className="h-9 w-9 p-0 rounded-md border-gray-200 bg-gray-50 text-gray-600">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[45%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.includes(l.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-4 py-3 text-center border-r border-gray-200">CREATED ↓</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">CALL STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 group relative group/row">
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedLeadIds.includes(lead.id)}
                          onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
                        />
                        <span 
                          title={lead.priority === 'High' || lead.priority === 'Urgent' ? 'High Priority' : 'Mark as High Priority'}
                          onClick={(e) => { e.stopPropagation(); togglePriority(lead); }}
                          className="inline-flex cursor-pointer"
                        >
                          <Star 
                            className={`w-4 h-4 transition-colors ${lead.priority === 'High' || lead.priority === 'Urgent' ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} 
                          />
                        </span>
                        <div className="relative group/name">
                          <Link to={`/clients/${lead.id}`} className="text-gray-700 font-medium hover:text-blue-600 hover:underline">{lead.name || lead.title || 'Unknown'}</Link>
                          
                          {/* Hover Popover */}
                          <div className="hidden group-hover/name:flex absolute left-0 top-full mt-2 group-last/row:top-auto group-last/row:bottom-full group-last/row:mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[60] p-4 flex-col gap-3">
                            <div className="absolute -top-1.5 group-last/row:top-auto group-last/row:-bottom-1.5 left-4 w-3 h-3 bg-white border-t border-l group-last/row:border-t-0 group-last/row:border-l-0 group-last/row:border-b group-last/row:border-r border-gray-200 transform rotate-45"></div>
                            
                            <div className="flex items-center gap-3 text-sm">
                              <User className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                              <span className="font-semibold text-gray-800">{lead.name || lead.title || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Bell className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                              <span className="font-semibold text-gray-800">{lead.callStatus || 'Untouched'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span className="text-gray-600">{formatDate(lead.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <User className="w-4 h-4 text-slate-500" />
                              <span className="text-gray-600">{lead.assignedTo?.name || lead.name || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Megaphone className="w-4 h-4 text-slate-500" />
                              <span className="text-gray-600">0</span>
                            </div>
                            
                            <div className="mt-1">
                              <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {timeAgo(lead.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Source Icon */}
                        {lead.source && (
                          <span title={`Source: ${lead.source}`} className="flex items-center ml-1">
                            {lead.source.toLowerCase() === 'facebook' ? (
                              <FaFacebook className="w-4 h-4 text-blue-600" />
                            ) : lead.source.toLowerCase() === 'whatsapp' ? (
                              <WhatsAppIcon className="w-4 h-4 text-green-500" />
                            ) : lead.source.toLowerCase() === 'website' ? (
                              <Globe className="w-4 h-4 text-blue-500" />
                            ) : (
                              <span 
                                style={getBadgeStyle(lead.source)}
                                className="inline-flex items-center justify-center text-[10px] leading-none font-semibold px-2 py-1.5 rounded border whitespace-nowrap"
                              >
                                {lead.source}
                              </span>
                            )}
                          </span>
                        )}

                        {/* Hot Lead Icon */}
                        {(lead.priority === 'Urgent' || lead.callStatus === 'Interested') && (
                          <span className="bg-red-50 p-0.5 rounded text-red-500" title="Hot Lead (Urgent / Interested)">
                            <Flame className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => { setSelectedLead(lead); setIsEditModalOpen(true); }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedLead(lead); setIsReminderModalOpen(true); }}
                          className="p-1 border border-purple-600 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMoreId(openMoreId === lead.id ? null : lead.id);
                            }}
                            className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {/* Hover Menu */}
                          {openMoreId === lead.id && (
                            <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-lg rounded-md p-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in duration-150">
                              <Link to={`/clients/${lead.id}`} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded flex items-center" title="View"><Eye className="w-4 h-4" /></Link>
                              {lead.email && (
                                <Link to={`/email?composeTo=${lead.email}`} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Email"><Mail className="w-4 h-4" /></Link>
                              )}
                              <button onClick={() => { setOpenMoreId(null); setSelectedLead(lead); setIsReminderModalOpen(true); }} className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Reminder"><Bell className="w-4 h-4" /></button>
                              {lead.phone && (
                                <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-orange-500 hover:bg-orange-50 rounded" title="WhatsApp"><WhatsAppIcon className="w-4 h-4 text-green-500" /></a>
                              )}
                              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Undo"><Undo className="w-4 h-4" /></button>
                              <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Save"><Save className="w-4 h-4" /></button>
                              <button onClick={() => handleDelete(lead.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Delete"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-500 text-center border-r border-gray-100">
                    {formatDate(lead.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-center border-r border-gray-100">
                    <select
                      value={lead.callStatus || 'Untouched'}
                      onChange={(e) => handleCallStatusSelect(lead, e.target.value)}
                      className={`h-8 px-2 border rounded text-sm outline-none cursor-pointer
                        ${(lead.callStatus || 'Untouched') === 'Untouched' ? 'border-green-500 text-gray-700' : 'border-gray-300 text-gray-700'}
                      `}
                    >
                      {CALL_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white">
                        {lead.email ? (
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenEmailPopupId(openEmailPopupId === lead.id ? null : lead.id);
                                setOpenPhonePopupId(null);
                                setOpenWhatsappPopupId(null);
                                setOpenMoreId(null);
                              }}
                              className="p-1.5 hover:bg-gray-50 text-teal-600 rounded-none border-0 block" 
                              title="Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            {openEmailPopupId === lead.id && (
                              <div 
                                className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-lg rounded-md p-1.5 flex items-center gap-2 z-50 animate-in fade-in zoom-in duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-3.5 h-3.5 text-gray-700 ml-1" />
                                <span className="text-[13px] text-gray-800 font-medium font-mono max-w-[200px] truncate" title={lead.email}>{lead.email}</span>
                                
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(lead.email!);
                                    Swal.fire({ title: 'Copied!', text: 'Email copied to clipboard', icon: 'success', timer: 1000, showConfirmButton: false });
                                    setOpenEmailPopupId(null);
                                  }}
                                  className="w-7 h-7 rounded bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors flex-shrink-0"
                                  title="Copy"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </button>

                                <Link 
                                  to={`/email?composeTo=${lead.email}`}
                                  className="w-7 h-7 rounded bg-teal-500 hover:bg-teal-600 flex items-center justify-center text-white transition-colors mr-0.5 flex-shrink-0"
                                  title="Compose Email"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </Link>

                                {/* Right Arrow Triangle */}
                                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-200 rotate-45 pointer-events-none"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Email">
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        {lead.phone ? (
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenPhonePopupId(openPhonePopupId === lead.id ? null : lead.id);
                                setOpenEmailPopupId(null);
                                setOpenWhatsappPopupId(null);
                                setOpenMoreId(null);
                              }}
                              className="p-1.5 hover:bg-gray-50 text-red-500 rounded-none border-0 block" 
                              title="Phone"
                            >
                              <Phone className="w-4 h-4" />
                            </button>

                            {openPhonePopupId === lead.id && (
                              <div 
                                className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-lg rounded-md p-1.5 flex items-center gap-2 z-50 animate-in fade-in zoom-in duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone className="w-3.5 h-3.5 text-gray-700 ml-1" />
                                <span className="text-[13px] text-gray-800 font-medium font-mono">{lead.phone}</span>
                                
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(lead.phone!);
                                    Swal.fire({ title: 'Copied!', text: 'Phone number copied to clipboard', icon: 'success', timer: 1000, showConfirmButton: false });
                                    setOpenPhonePopupId(null);
                                  }}
                                  className="w-7 h-7 rounded bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors"
                                  title="Copy"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </button>

                                <a 
                                  href={`tel:${lead.phone}`}
                                  onClick={() => {
                                    setSelectedLead(lead);
                                    setPendingCallStatus(lead.callStatus && lead.callStatus !== 'Untouched' ? lead.callStatus : 'Connected');
                                    setIsReminderModalOpen(true);
                                  }}
                                  className="w-7 h-7 rounded bg-purple-500 hover:bg-purple-600 flex items-center justify-center text-white transition-colors mr-0.5"
                                  title="Call & Log Outcome"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>

                                {/* Right Arrow Triangle */}
                                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-200 rotate-45 pointer-events-none"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                            <Phone className="w-4 h-4" />
                          </button>
                        )}
                        {(lead.whatsappNumber || lead.phone) ? (
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenWhatsappPopupId(openWhatsappPopupId === lead.id ? null : lead.id);
                                setOpenEmailPopupId(null);
                                setOpenPhonePopupId(null);
                                setOpenMoreId(null);
                              }}
                              className="p-1.5 hover:bg-gray-50 text-green-500 rounded-none border-0 block" 
                              title="WhatsApp"
                            >
                              <WhatsAppIcon className="w-4 h-4" />
                            </button>

                            {openWhatsappPopupId === lead.id && (
                              <div 
                                className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-lg rounded-md p-1.5 flex items-center gap-2 z-50 animate-in fade-in zoom-in duration-150"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5 text-gray-700 ml-1" />
                                <span className="text-[13px] text-gray-800 font-medium font-mono">{lead.whatsappNumber || lead.phone}</span>
                                
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText((lead.whatsappNumber || lead.phone)!);
                                    Swal.fire({ title: 'Copied!', text: 'WhatsApp number copied to clipboard', icon: 'success', timer: 1000, showConfirmButton: false });
                                    setOpenWhatsappPopupId(null);
                                  }}
                                  className="w-7 h-7 rounded bg-blue-500 hover:bg-blue-600 flex items-center justify-center text-white transition-colors flex-shrink-0"
                                  title="Copy"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                </button>

                                <a 
                                  href={`https://wa.me/${(lead.whatsappNumber || lead.phone)!.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-7 h-7 rounded bg-[#25D366] hover:bg-[#1ebe5d] flex items-center justify-center text-white transition-colors mr-0.5 flex-shrink-0"
                                  title="Chat on WhatsApp"
                                >
                                  <WhatsAppIcon className="w-3.5 h-3.5" />
                                </a>

                                {/* Right Arrow Triangle */}
                                <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-t border-gray-200 rotate-45 pointer-events-none"></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No WhatsApp">
                            <WhatsAppIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 hover:bg-gray-50 text-red-500" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedLeads.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No leads found. Click "+ Add Leads" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {filteredLeads.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredLeads.length)} of {filteredLeads.length} entries
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="h-8 px-2 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
            </Button>
            <span className="px-2 text-xs font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || filteredLeads.length === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubmit}
        type={currentType}
      />

      <EditLeadModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedLead(null); }}
        onSubmit={handleEditSubmit}
        lead={selectedLead}
        type={currentType}
      />

      <SetReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => { 
          setIsReminderModalOpen(false); 
          setSelectedLead(null); 
          setPendingCallStatus(undefined); 
        }}
        lead={selectedLead}
        initialCallStatus={pendingCallStatus}
        onSaved={fetchLeads}
      />
    </div>
  );
}
