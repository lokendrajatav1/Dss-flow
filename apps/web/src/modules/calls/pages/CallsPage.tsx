import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Filter, FileText, RefreshCw, Trash2, Search, MoreVertical,
  Star, Eye, Edit, Bell, Phone, Mail,
  ChevronLeft, ChevronRight, User, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CALL_STATUSES, CALL_DIRECTIONS, CALL_OUTCOMES } from '@/lib/constants';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { SetReminderModal } from '@/modules/leads/components/SetReminderModal';
import { CallItem } from '../types';
import { AddCallModal } from '../components/AddCallModal';
import { EditCallModal } from '../components/EditCallModal';
import { ViewCallModal } from '../components/ViewCallModal';
import {
  PAGE_SIZES,
  DEFAULT_FILTERS,
  LEGACY_MOCK_CALL_IDS,
  DEFAULT_CALL_DURATIONS,
  DEFAULT_CALL_OUTCOMES,
  CALLS_STORAGE_KEY
} from '../constants';

const MySwal = withReactContent(Swal);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.148 1.603 5.928L.18 23.361l5.545-1.455c1.721.956 3.659 1.464 5.679 1.464h.01C18.615 23.37 24 17.985 24 11.34 24 8.113 22.743 5.08 20.463 2.797 18.18 5.513 15.249 0 12.031 0zm.01 19.397c-1.802 0-3.567-.484-5.114-1.401l-.367-.217-3.799.997.994-3.702-.239-.38a9.497 9.497 0 0 1-1.45-5.07c0-5.246 4.269-9.516 9.516-9.516 2.54 0 4.928.99 6.723 2.784a9.518 9.518 0 0 1 2.783 6.721c0 5.247-4.269 9.516-9.516 9.516zm5.222-7.142c-.287-.143-1.696-.837-1.96-.933-.263-.093-.456-.143-.65.093-.19.237-.743.934-.91 1.127-.167.19-.335.215-.623.071-.287-.143-1.21-.446-2.306-1.422-.852-.76-1.428-1.7-1.595-1.986-.167-.287-.018-.442.126-.584.13-.129.287-.335.43-.502.143-.167.19-.287.287-.478.096-.19.048-.36-.024-.502-.072-.143-.65-1.569-.89-2.147-.234-.564-.473-.487-.65-.497-.167-.008-.36-.008-.55-.008-.19 0-.5.071-.763.36-.263.287-1.004.981-1.004 2.392s1.028 2.774 1.171 2.964c.143.19 2.022 3.085 4.898 4.327.685.296 1.219.473 1.636.606.688.218 1.314.187 1.808.113.553-.083 1.696-.693 1.936-1.363.239-.67.239-1.244.167-1.363-.071-.12-.263-.19-.55-.333z" />
  </svg>
);

export const timeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

const INITIAL_CALLS: CallItem[] = [];

export function CallsPage() {
  const [calls, setCalls] = useState<CallItem[]>(() => {
    const saved = localStorage.getItem(CALLS_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Exclude legacy mock call records
        const filtered = Array.isArray(parsed) ? parsed.filter(c => !LEGACY_MOCK_CALL_IDS.includes(c.id)) : [];
        return filtered;
      } catch (e) { /* ignore */ }
    }
    return INITIAL_CALLS;
  });

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCallIds, setSelectedCallIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  // Filters
  const [directionFilter, setDirectionFilter] = useState(DEFAULT_FILTERS.direction);
  const [statusFilter, setStatusFilter] = useState(DEFAULT_FILTERS.status);
  const [outcomeFilter, setOutcomeFilter] = useState(DEFAULT_FILTERS.outcome);
  const [assignedToFilter, setAssignedToFilter] = useState(DEFAULT_FILTERS.assignedTo);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(calls));
  }, [calls]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMoreId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    fetchCallsData();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setTeamMembers(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch team members', err);
    }
  };

  const fetchCallsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const [leadsRes, activitiesRes] = await Promise.allSettled([
        api.get('/leads', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/activities', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const leads = leadsRes.status === 'fulfilled' && Array.isArray(leadsRes.value.data) ? leadsRes.value.data : [];
      const activities = activitiesRes.status === 'fulfilled' && Array.isArray(activitiesRes.value.data) ? activitiesRes.value.data : [];

      const fetchedCalls: CallItem[] = [];

      // 1. Process Activity log records (type: 'CALL')
      activities
        .filter((act: any) => act.type === 'CALL')
        .forEach((act: any) => {
          const lead = act.lead || {};
          let status = 'Connected';
          if (act.title?.includes('Busy')) status = 'Busy';
          else if (act.title?.includes('No Answer')) status = 'No Answer';
          else if (act.title?.includes('Left Voicemail')) status = 'Left Voicemail';
          else if (act.title?.includes('Interested')) status = 'Interested';
          else if (act.title?.includes('Follow Up')) status = 'Follow Up Needed';
          else if (lead.callStatus) status = lead.callStatus;

          fetchedCalls.push({
            id: `act-call-${act.id}`,
            leadId: lead.id || act.leadId || undefined,
            name: lead.name || act.metadata?.name || 'Contact',
            companyName: lead.companyName || act.metadata?.companyName || 'Lead Organization',
            phone: lead.phone || lead.whatsappNumber || act.metadata?.phone || '',
            email: lead.email || '',
            direction: act.metadata?.direction || 'Outbound',
            callStatus: status,
            outcome: status === 'Interested' ? 'Interested' : (status === 'Connected' ? 'Follow-up Required' : 'Busy'),
            duration: act.metadata?.duration || '03:15',
            assignedTo: act.performedBy?.name || 'Unassigned',
            notes: act.description || act.title || 'Logged call activity.',
            priority: 'Normal',
            createdAt: act.createdAt || new Date().toISOString(),
            dateTime: act.metadata?.activityDate ? act.metadata.activityDate.slice(0, 16) : act.createdAt?.slice(0, 16)
          });
        });

      // 2. Process Leads that have an active callStatus
      leads
        .filter((l: any) => l.callStatus && l.callStatus !== 'Untouched')
        .forEach((l: any) => {
          const alreadyLogged = fetchedCalls.some(c => c.phone && c.phone === l.phone);
          if (!alreadyLogged) {
            fetchedCalls.push({
              id: `lead-call-${l.id}`,
              leadId: l.id,
              name: l.name || l.title || 'Lead Contact',
              companyName: l.companyName || 'Lead Organization',
              phone: l.phone || l.whatsappNumber || '',
              email: l.email || '',
              direction: 'Outbound',
              callStatus: l.callStatus || 'Connected',
              outcome: l.feedback?.includes('Interested') || l.callStatus === 'Interested' ? 'Interested' : 'Follow-up Required',
              duration: '03:30',
              assignedTo: l.assignedTo?.name || 'Unassigned',
              notes: l.notes || l.feedback || 'Logged via CRM Leads Pipeline.',
              priority: l.priority === 'High' || l.priority === 'Urgent' ? 'High' : 'Normal',
              createdAt: l.updatedAt || new Date().toISOString(),
              dateTime: l.updatedAt ? l.updatedAt.slice(0, 16) : undefined
            });
          }
        });

      if (fetchedCalls.length > 0) {
        setCalls(prev => {
          const fetchedIds = new Set(fetchedCalls.map(c => c.id));
          const localOnly = prev.filter(c => !fetchedIds.has(c.id) && !c.id.startsWith('lead-call-') && !c.id.startsWith('act-call-'));
          return [...fetchedCalls, ...localOnly];
        });
      }
    } catch (err) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const availableMembers = teamMembers;

  // Memoized filtered calls calculation
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.name.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.assignedTo.toLowerCase().includes(q) ||
        c.notes.toLowerCase().includes(q);

      const matchesDirection = directionFilter === 'all' || c.direction === directionFilter;
      const matchesStatus = statusFilter === 'all' || c.callStatus === statusFilter;
      const matchesOutcome = outcomeFilter === 'all' || c.outcome === outcomeFilter;
      const matchesAssignee = assignedToFilter === 'all' || c.assignedTo === assignedToFilter;

      return matchesSearch && matchesDirection && matchesStatus && matchesOutcome && matchesAssignee;
    });
  }, [calls, searchQuery, directionFilter, statusFilter, outcomeFilter, assignedToFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredCalls.length / pageSize));
  const paginatedCalls = useMemo(() => {
    return filteredCalls.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredCalls, currentPage, pageSize]);

  // Memoized event handlers
  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCallIds(paginatedCalls.map(c => c.id));
    } else {
      setSelectedCallIds([]);
    }
  }, [paginatedCalls]);

  const handleSelectCall = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedCallIds(prev => [...prev, id]);
    } else {
      setSelectedCallIds(prev => prev.filter(item => item !== id));
    }
  }, []);

  const togglePriority = useCallback((call: CallItem) => {
    const nextPriority = call.priority === 'High' ? 'Normal' : 'High';
    setCalls(prev => prev.map(c => c.id === call.id ? { ...c, priority: nextPriority } : c));
  }, [setCalls]);

  const updateCallStatus = async (id: string, newStatus: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, callStatus: newStatus } : c));
    try {
      const token = localStorage.getItem('token');
      const target = calls.find(c => c.id === id);
      const leadId = target?.leadId || (id.startsWith('lead-call-') ? id.replace('lead-call-', '') : null);
      if (leadId && token) {
        await api.put(`/leads/${leadId}`, { callStatus: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      console.warn('Failed to persist call status:', e);
    }
    MySwal.fire({ title: 'Updated!', text: `Call status set to ${newStatus}`, icon: 'success', timer: 1000, showConfirmButton: false });
  };

  const updateCallOutcome = async (id: string, newOutcome: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, outcome: newOutcome } : c));
    try {
      const token = localStorage.getItem('token');
      const target = calls.find(c => c.id === id);
      const leadId = target?.leadId || (id.startsWith('lead-call-') ? id.replace('lead-call-', '') : null);
      if (leadId && token) {
        await api.put(`/leads/${leadId}`, { feedback: newOutcome }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      console.warn('Failed to persist outcome:', e);
    }
    MySwal.fire({ title: 'Updated!', text: `Call outcome set to ${newOutcome}`, icon: 'success', timer: 1000, showConfirmButton: false });
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Delete Call Log?',
      text: 'Are you sure you want to delete this call record?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (id.startsWith('act-call-') && token) {
          const actId = id.replace('act-call-', '');
          await api.delete(`/activities/${actId}`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => { });
        }
      } catch (e) {
        console.warn('Delete backend error:', e);
      }
      setCalls(calls.filter(c => c.id !== id));
      setSelectedCallIds(selectedCallIds.filter(item => item !== id));
      MySwal.fire({ title: 'Deleted!', text: 'Call log deleted successfully', icon: 'success', timer: 1200, showConfirmButton: false });
    }
  };

  const handleBulkDelete = () => {
    if (selectedCallIds.length === 0) return;
    MySwal.fire({
      title: `Delete ${selectedCallIds.length} Call Logs?`,
      text: 'Are you sure you want to delete all selected records?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete all'
    }).then(result => {
      if (result.isConfirmed) {
        setCalls(calls.filter(c => !selectedCallIds.includes(c.id)));
        setSelectedCallIds([]);
        MySwal.fire({ title: 'Deleted!', text: 'Selected call records deleted.', icon: 'success', timer: 1200, showConfirmButton: false });
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['Contact Name', 'Company', 'Phone', 'Email', 'Direction', 'Call Status', 'Outcome', 'Duration', 'Agent', 'Date'];
    const rows = filteredCalls.map(c => [
      `"${c.name}"`,
      `"${c.companyName}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.direction}"`,
      `"${c.callStatus}"`,
      `"${c.outcome}"`,
      `"${c.duration}"`,
      `"${c.assignedTo}"`,
      `"${c.dateTime || c.createdAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `calls_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReminderForCall = (call: CallItem) => {
    const rawId = call.leadId || (call.id.startsWith('lead-call-') ? call.id.replace('lead-call-', '') : call.id);
    const leadObj = {
      id: rawId,
      name: call.name,
      title: `Call: ${call.name}`,
      companyName: call.companyName,
      phone: call.phone,
      email: call.email,
      callStatus: call.callStatus || 'Connected',
      notes: call.notes || '',
      nextFollowUp: call.nextFollowUp ? new Date(call.nextFollowUp).toISOString() : (call.dateTime ? new Date(call.dateTime).toISOString() : undefined),
      assignedToId: call.assignedTo
    };
    setSelectedCall(call);
    setSelectedLead(leadObj);
    setIsReminderModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dateString;
    }
  };


  return (
    <div className="space-y-4">
      {/* Top Bar - 1:1 Matching LeadsPage Top Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Calls : {filteredCalls.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Call
          </Button>

          {/* Filter Button */}
          <Button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Filter Calls"
          >
            <Filter className="w-4 h-4" />
          </Button>

          {/* Export CSV Button */}
          <Button
            onClick={handleExportCSV}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Export CSV"
          >
            <FileText className="w-4 h-4" />
          </Button>

          {/* Refresh Button */}
          <Button
            onClick={fetchCallsData}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Bulk Delete Button */}
          <Button
            onClick={handleBulkDelete}
            className="bg-[#ef4444] hover:bg-[#dc2626] text-white h-9 w-9 p-0 rounded-md"
            title="Bulk Delete Selected"
            disabled={selectedCallIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search calls..."
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
            {PAGE_SIZES.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Dropdown Row */}
      {showFilterDropdown && (
        <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Direction:</span>
            <select
              value={directionFilter}
              onChange={(e) => { setDirectionFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Directions</option>
              {CALL_DIRECTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {CALL_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Outcomes</option>
              {CALL_OUTCOMES.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Assignee:</span>
            <select
              value={assignedToFilter}
              onChange={(e) => { setAssignedToFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Team Members</option>
              {availableMembers.map((m: any) => (
                <option key={m.id} value={m.name || m.email}>{m.name || m.email}</option>
              ))}
            </select>
          </div>

          {(directionFilter !== 'all' || statusFilter !== 'all' || outcomeFilter !== 'all' || assignedToFilter !== 'all') && (
            <button
              onClick={() => {
                setDirectionFilter('all');
                setStatusFilter('all');
                setOutcomeFilter('all');
                setAssignedToFilter('all');
              }}
              className="text-xs text-blue-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Table - 1:1 Matching LeadsPage Table Structure */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible min-h-[400px]">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-50 border-b border-gray-100 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[26%]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedCalls.length > 0 && paginatedCalls.every(c => selectedCallIds.includes(c.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-3 py-3 text-center">DIRECTION</th>
                <th className="px-3 py-3 text-center">CALL STATUS</th>
                <th className="px-3 py-3 text-center">OUTCOME</th>
                <th className="px-3 py-3 text-center">DURATION</th>
                <th className="px-4 py-3 text-center">DATE & TIME ↓</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50/50 group relative">
                  {/* Name Column with Checkbox, Star, Details */}
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedCallIds.includes(call.id)}
                          onChange={(e) => handleSelectCall(call.id, e.target.checked)}
                        />
                        <span
                          title={call.priority === 'High' ? 'High Priority' : 'Mark as High Priority'}
                          onClick={(e) => { e.stopPropagation(); togglePriority(call); }}
                          className="inline-flex cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${call.priority === 'High' ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                          />
                        </span>

                        <div className="relative group/name">
                          <span
                            onClick={() => {
                              setSelectedCall(call);
                              setIsViewModalOpen(true);
                            }}
                            className="text-gray-700 font-medium hover:text-blue-600 cursor-pointer"
                          >
                            {call.name}
                          </span>
                          <span className="text-xs text-gray-400 ml-2 font-normal">
                            ({call.companyName})
                          </span>

                          {/* Hover Popover */}
                          <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl opacity-0 invisible group-hover/name:opacity-100 group-hover/name:visible transition-all duration-200 z-[60] p-4 flex flex-col gap-2.5">
                            <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                              <User className="w-4 h-4 text-indigo-600" />
                              <span>{call.name}</span>
                            </div>

                            <p className="text-xs text-gray-600 font-medium">{call.companyName}</p>

                            <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                              <p>Phone: <span className="font-mono text-gray-800 font-medium">{call.phone}</span></p>
                              {call.email && <p>Email: <span className="font-mono text-gray-700">{call.email}</span></p>}
                              <p>Direction: <strong>{call.direction}</strong> • Duration: <strong>{call.duration}</strong></p>
                              <p>Outcome: <strong>{call.outcome}</strong></p>
                              <p>Agent: <strong>{call.assignedTo}</strong></p>
                              {call.notes && <p className="text-gray-600 italic mt-1">"{call.notes}"</p>}
                            </div>

                            <div className="mt-1">
                              <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {timeAgo(call.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Name Cell Action Cluster: Eye, Edit, Bell, MoreVertical */}
                      <div className="flex items-center gap-1.5">
                        {/* Eye Button -> View Details */}
                        <button
                          onClick={() => {
                            setSelectedCall(call);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:text-blue-600 bg-white"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button -> Edit Call */}
                        <button
                          onClick={() => {
                            setSelectedCall(call);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                          title="Edit Call"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Bell Button (Purple) -> Open Existing SetReminderModal */}
                        <button
                          onClick={() => openReminderForCall(call)}
                          className="p-1 border border-purple-600 bg-purple-600 text-white rounded hover:bg-purple-700"
                          title="Set Reminder"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMoreId(openMoreId === call.id ? null : call.id);
                            }}
                            className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                            title="More Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {openMoreId === call.id && (
                            <div
                              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-lg rounded-md p-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setOpenMoreId(null);
                                  setSelectedCall(call);
                                  setIsViewModalOpen(true);
                                }}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMoreId(null);
                                  setSelectedCall(call);
                                  setIsEditModalOpen(true);
                                }}
                                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  setOpenMoreId(null);
                                  openReminderForCall(call);
                                }}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                title="Set Reminder"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              {call.phone && (
                                <a
                                  href={`https://wa.me/${call.phone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="WhatsApp"
                                >
                                  <WhatsAppIcon className="w-4 h-4" />
                                </a>
                              )}

                              <button
                                onClick={() => {
                                  setOpenMoreId(null);
                                  handleDelete(call.id);
                                }}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Direction Badge */}
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${call.direction === 'Inbound'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                      {call.direction === 'Inbound' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {call.direction || 'Outbound'}
                    </span>
                  </td>

                  {/* Call Status Dropdown Select */}
                  <td className="px-3 py-3 text-center">
                    <select
                      value={call.callStatus || 'Untouched'}
                      onChange={(e) => updateCallStatus(call.id, e.target.value)}
                      className={`h-8 px-2 border rounded text-xs font-medium outline-none cursor-pointer bg-white transition-colors
                        ${call.callStatus === 'Connected' ? 'border-green-500 text-green-700 bg-green-50/50' :
                          call.callStatus === 'Callback Scheduled' ? 'border-purple-500 text-purple-700 bg-purple-50/50' :
                            call.callStatus === 'Busy' ? 'border-amber-500 text-amber-700 bg-amber-50/50' :
                              call.callStatus === 'No Answer' || call.callStatus === 'Not Answered' ? 'border-red-500 text-red-700 bg-red-50/50' :
                                'border-gray-300 text-gray-700'}
                      `}
                    >
                      {CALL_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>

                  {/* Outcome Dropdown Select */}
                  <td className="px-3 py-3 text-center">
                    <select
                      value={call.outcome || 'Follow-up Required'}
                      onChange={(e) => updateCallOutcome(call.id, e.target.value)}
                      className={`h-8 px-2 border rounded text-xs font-medium outline-none cursor-pointer bg-white transition-colors
                        ${call.outcome === 'Interested' || call.outcome === 'Closed Won' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' :
                          call.outcome === 'Follow-up Required' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50' :
                            call.outcome === 'Not Interested' ? 'border-rose-500 text-rose-700 bg-rose-50/50' :
                              'border-gray-300 text-gray-700'}
                      `}
                    >
                      {CALL_OUTCOMES.map(outcome => (
                        <option key={outcome} value={outcome}>{outcome}</option>
                      ))}
                    </select>
                  </td>

                  {/* Duration Column */}
                  <td className="px-3 py-3 text-center">
                    <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                      {call.duration || '00:00'}
                    </span>
                  </td>

                  {/* Date Column */}
                  <td className="px-4 py-3 text-gray-500 text-center text-xs">
                    {formatDate(call.dateTime || call.createdAt)}
                  </td>

                  {/* Quick Action Column - Exact Segmented Box from LeadsPage */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white">
                        {call.phone ? (
                          <a
                            href={`tel:${call.phone}`}
                            className="p-1.5 hover:bg-gray-50 text-blue-600 rounded-none border-0 block"
                            title={`Call ${call.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                            <Phone className="w-4 h-4" />
                          </button>
                        )}

                        {call.phone ? (
                          <a
                            href={`https://wa.me/${call.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 hover:bg-gray-50 text-green-600 rounded-none border-0 block"
                            title="WhatsApp"
                          >
                            <WhatsAppIcon className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                            <WhatsAppIcon className="w-4 h-4" />
                          </button>
                        )}

                        {call.email ? (
                          <a
                            href={`mailto:${call.email}`}
                            className="p-1.5 hover:bg-gray-50 text-teal-600 rounded-none border-0 block"
                            title="Send Email"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Email">
                            <Mail className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(call.id)}
                          className="p-1.5 hover:bg-gray-50 text-red-500 rounded-none border-0 block"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}

              {paginatedCalls.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No calls found. Click "+ Add Call" to log one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls - 1:1 Matching LeadsPage */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 rounded-b-md">
            <div className="text-xs text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredCalls.length)} of {filteredCalls.length} calls
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <span className="text-xs font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* View Call Details Modal Component */}
      <ViewCallModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedCall(null);
        }}
        call={selectedCall}
        onSetReminder={(call) => openReminderForCall(call)}
      />

      {/* Add Call Modal Component */}
      <AddCallModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (newCall) => {
          setCalls(prev => [newCall, ...prev]);
          try {
            const token = localStorage.getItem('token');
            if (token) {
              await api.post('/activities', {
                type: 'CALL',
                title: `Call logged: ${newCall.callStatus}`,
                description: newCall.notes,
                metadata: {
                  name: newCall.name,
                  companyName: newCall.companyName,
                  phone: newCall.phone,
                  duration: newCall.duration,
                  direction: newCall.direction
                }
              }, { headers: { Authorization: `Bearer ${token}` } });
            }
          } catch (e) {
            console.error('Failed to log call activity', e);
          }
        }}
        availableMembers={availableMembers}
      />

      {/* Edit Call Modal Component */}
      <EditCallModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCall(null);
        }}
        call={selectedCall}
        onSave={(updatedCall) => {
          setCalls(calls.map(c => c.id === updatedCall.id ? updatedCall : c));
        }}
        availableMembers={availableMembers}
      />

      {/* Set Reminder Modal */}
      {isReminderModalOpen && selectedLead && (
        <SetReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          lead={selectedLead}
          onSaved={() => {
            fetchCallsData();
            setIsReminderModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
