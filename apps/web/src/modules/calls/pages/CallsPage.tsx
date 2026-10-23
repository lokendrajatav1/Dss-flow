import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Filter, FileText, RefreshCw, Trash2, Search,
  Star, Eye, Edit, Bell, Phone, Mail, User, ExternalLink,
  ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, PhoneMissed,
  Copy, Check, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CALL_DIRECTIONS, CALL_OUTCOMES, CALL_TYPES, CALL_RESULTS } from '@/lib/constants';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { SetReminderModal } from '@/modules/leads/components/SetReminderModal';
import { CallItem } from '../types';
import { AddCallModal } from '../components/AddCallModal';
import { EditCallModal } from '../components/EditCallModal';
import { ViewCallModal } from '../components/ViewCallModal';
import { useDialer } from '@/context/TelephonyContext';
import { PAGE_SIZES, DEFAULT_FILTERS } from '../constants';

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

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Connected':
      return 'bg-emerald-50 text-emerald-700';
    case 'Callback Scheduled':
      return 'bg-purple-50 text-purple-700';
    case 'Busy':
      return 'bg-amber-50 text-amber-700';
    case 'No Answer':
    case 'Not Answered':
      return 'bg-rose-50 text-rose-700';
    case 'Left Voicemail':
      return 'bg-indigo-50 text-indigo-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const getOutcomeBadgeClass = (outcome: string) => {
  switch (outcome) {
    case 'Interested':
    case 'Closed Won':
      return 'bg-emerald-50 text-emerald-700';
    case 'Follow-up Required':
      return 'bg-indigo-50 text-indigo-700';
    case 'Not Interested':
    case 'Closed Lost':
      return 'bg-rose-50 text-rose-700';
    case 'Left Voicemail':
      return 'bg-purple-50 text-purple-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

export function CallsPage() {
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCallIds, setSelectedCallIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Filters
  const [directionFilter, setDirectionFilter] = useState<string>(DEFAULT_FILTERS.direction);
  const [outcomeFilter, setOutcomeFilter] = useState<string>(DEFAULT_FILTERS.outcome);
  const [assignedToFilter, setAssignedToFilter] = useState<string>(DEFAULT_FILTERS.assignedTo);

  // Modals state
  const { startCall } = useDialer();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedCall, setSelectedCall] = useState<CallItem | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  useEffect(() => {
    fetchCallsData();
  }, [currentPage, pageSize, searchQuery, directionFilter, outcomeFilter, assignedToFilter]);

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

      const params: any = {
        page: currentPage,
        limit: pageSize
      };
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (directionFilter !== 'all') params.direction = directionFilter;
      if (outcomeFilter !== 'all') params.outcome = outcomeFilter;
      if (assignedToFilter !== 'all') params.agentId = assignedToFilter;

      const res = await api.get('/calls', {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.calls) {
        setCalls(res.data.calls);
        setTotalCalls(res.data.pagination?.total || res.data.calls.length);
        setTotalPages(res.data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch calls:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableMembers = teamMembers;

  const handleSelectAll = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCallIds(calls.map(c => c.id));
    } else {
      setSelectedCallIds([]);
    }
  }, [calls]);

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
  }, []);

  const updateCallStatus = async (id: string, newStatus: string) => {
    setCalls(prev => prev.map(c => c.id === id ? { ...c, callStatus: newStatus } : c));
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put(`/calls/${id}`, { callStatus: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      console.warn('Failed to persist call status:', e);
    }
    MySwal.fire({ title: 'Updated!', text: `Call status set to ${newStatus}`, icon: 'success', timer: 1000, showConfirmButton: false });
  };

  const updateCallOutcome = async (id: string, newOutcome: string) => {
    const call = calls.find(c => c.id === id);
    setCalls(prev => prev.map(c => c.id === id ? { ...c, outcome: newOutcome } : c));
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put(`/calls/${id}`, { outcome: newOutcome }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (e) {
      console.warn('Failed to persist outcome:', e);
    }

    if (newOutcome === 'Requested call back' && call) {
      openReminderForCall(call);
    } else {
      MySwal.fire({ title: 'Updated!', text: `Call result set to "${newOutcome}"`, icon: 'success', timer: 1000, showConfirmButton: false });
    }
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
        if (token) {
          await api.delete(`/calls/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        }
      } catch (e) {
        console.warn('Delete backend error:', e);
      }
      setCalls(calls.filter(c => c.id !== id));
      setSelectedCallIds(selectedCallIds.filter(item => item !== id));
      setTotalCalls(prev => Math.max(0, prev - 1));
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            await api.post('/calls/bulk-delete', { ids: selectedCallIds }, { headers: { Authorization: `Bearer ${token}` } });
          }
        } catch (e) {
          console.warn('Bulk delete error:', e);
        }
        setCalls(calls.filter(c => !selectedCallIds.includes(c.id)));
        setTotalCalls(prev => Math.max(0, prev - selectedCallIds.length));
        setSelectedCallIds([]);
        MySwal.fire({ title: 'Deleted!', text: 'Selected call records deleted.', icon: 'success', timer: 1200, showConfirmButton: false });
      }
    });
  };

  const handleExportCSV = () => {
    const headers = ['Contact Name', 'Company', 'Phone', 'Email', 'Call Type', 'Call Result', 'Duration', 'Agent', 'Date'];
    const rows = calls.map(c => [
      `"${c.name}"`,
      `"${c.companyName}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.direction}"`,
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

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 1500);
  };

  const openReminderForCall = (call: CallItem) => {
    const rawId = call.leadId || call.id;
    const leadObj = {
      id: rawId,
      name: call.name,
      title: call.name,
      companyName: call.companyName,
      phone: call.phone,
      email: call.email,
      callStatus: call.callStatus || '',
      notes: call.notes || '',
      nextFollowUp: call.nextFollowUp ? new Date(call.nextFollowUp).toISOString() : (call.dateTime ? new Date(call.dateTime).toISOString() : undefined),
      assignedToId: call.assignedTo
    };
    setSelectedCall(call);
    setSelectedLead(leadObj);
    setIsReminderModalOpen(true);
  };

  const formatDate = (dateString?: string) => {
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
      {/* Top Bar - 1:1 Matching LeadsPage / Other Pages */}
      <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Calls : {totalCalls}
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
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Filter Dropdown Row */}
      {showFilterDropdown && (
        <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Call Type:</span>
            <select
              value={directionFilter}
              onChange={(e) => { setDirectionFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Call Types</option>
              {CALL_DIRECTIONS.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Call Result:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => { setOutcomeFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Call Results</option>
              {CALL_OUTCOMES.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {availableMembers.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Assignee:</span>
              <select
                value={assignedToFilter}
                onChange={(e) => { setAssignedToFilter(e.target.value); setCurrentPage(1); }}
                className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
              >
                <option value="all">All Team Members</option>
                {availableMembers.map((m: any) => (
                  <option key={m.id} value={m.id}>{m.name || m.email}</option>
                ))}
              </select>
            </div>
          )}

          {(directionFilter !== 'all' || outcomeFilter !== 'all' || assignedToFilter !== 'all') && (
            <button
              onClick={() => {
                setDirectionFilter('all');
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

      {/* Table - 1:1 Matching Structure & Styling of Other CRM Pages */}
      <div className="bg-white rounded-md border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[26%]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={calls.length > 0 && calls.every(c => selectedCallIds.includes(c.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-3 py-3">PHONE</th>
                <th className="px-3 py-3 text-center">CALL TYPE</th>
                <th className="px-3 py-3 text-center">CALL RESULT</th>
                <th className="px-3 py-3 text-center">DURATION</th>
                <th className="px-4 py-3 text-center">DATE & TIME ↓</th>
                <th className="px-3 py-3 text-center">RECORDING</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50/50 group relative">
                  {/* Name Column */}
                  <td className="px-4 py-3">
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

                      {call.leadId ? (
                        <Link
                          to={`/clients/${call.leadId}`}
                          className="text-gray-900 font-medium hover:text-blue-600 hover:underline cursor-pointer"
                          title="Open 360° Client Profile"
                        >
                          {call.name || 'Unnamed Contact'}
                        </Link>
                      ) : (
                        <span
                          onClick={() => {
                            setSelectedCall(call);
                            setIsViewModalOpen(true);
                          }}
                          className="text-gray-700 font-medium hover:text-blue-600 cursor-pointer"
                        >
                          {call.name || 'Unnamed Contact'}
                        </span>
                      )}
                      {call.companyName && (
                        <span className="text-xs text-gray-400 font-normal">
                          ({call.companyName})
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Phone Column */}
                  <td className="px-3 py-3">
                    {call.phone ? (
                      <div className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-800 bg-gray-50 px-2.5 py-1 rounded">
                        <span>{call.phone}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(call.phone, e)}
                          className="text-gray-400 hover:text-gray-700 transition-colors"
                          title="Copy Phone Number"
                        >
                          {copiedPhone === call.phone ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs italic">-</span>
                    )}
                  </td>

                  {/* Call Type */}
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      call.direction === 'Inbound'
                        ? 'bg-emerald-50 text-emerald-700'
                        : call.direction === 'Missed'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {call.direction === 'Inbound' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                      ) : call.direction === 'Missed' ? (
                        <PhoneMissed className="w-3.5 h-3.5 text-rose-600" />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      {call.direction || 'Outbound'}
                    </span>
                  </td>

                  {/* Call Result Dropdown Select - 1:1 Matching LeadsPage */}
                  <td className="px-3 py-3 text-center">
                    <select
                      value={call.outcome || '-None-'}
                      onChange={(e) => updateCallOutcome(call.id, e.target.value)}
                      className="h-8 px-2 border border-gray-300 rounded text-sm outline-none cursor-pointer bg-white text-gray-700"
                    >
                      {CALL_OUTCOMES.map(outcome => (
                        <option key={outcome} value={outcome}>{outcome}</option>
                      ))}
                    </select>
                  </td>

                  {/* Duration */}
                  <td className="px-3 py-3 text-center">
                    <span className="font-mono text-xs text-gray-700 bg-gray-50 px-2.5 py-1 rounded">
                      {call.duration || '00:00'}
                    </span>
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3 text-center">
                    <div className="text-xs text-gray-700 font-medium">
                      {formatDate(call.dateTime || call.createdAt)}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {timeAgo(call.dateTime || call.createdAt)}
                    </div>
                  </td>

                  {/* Recording */}
                  <td className="px-3 py-3 text-center">
                    {call.recordingUrl ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCall(call);
                          setIsViewModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium cursor-pointer transition-colors"
                        title="Listen to call recording"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Audio</span>
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>

                  {/* Quick Action - Exact Segmented Box from LeadsPage */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white">
                        {call.phone ? (
                          <button
                            type="button"
                            onClick={() => {
                              startCall({
                                id: call.id,
                                name: call.name,
                                phone: call.phone,
                                companyName: call.companyName,
                                email: call.email,
                                sourceType: 'call'
                              });
                            }}
                            className="p-1.5 hover:bg-gray-50 text-blue-600 rounded-none border-0 block cursor-pointer"
                            title={`Call via In-App Dialer: ${call.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </button>
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
                            <WhatsAppIcon className="w-4 h-4 text-green-500" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                            <WhatsAppIcon className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openReminderForCall(call)}
                          className="p-1.5 hover:bg-purple-50 text-purple-600 rounded-none border-0 block"
                          title="Set Reminder"
                        >
                          <Bell className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCall(call);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-none border-0 block"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCall(call);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 hover:bg-gray-50 text-gray-600 rounded-none border-0 block"
                          title="Edit Call Log"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
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

              {calls.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No calls found. Click "+ Add Call" to log one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar - 1:1 Matching LeadsPage */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {totalCalls === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, totalCalls)} of {totalCalls} entries
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
              disabled={currentPage === totalPages || totalCalls === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
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
          try {
            const token = localStorage.getItem('token');
            if (token) {
              await api.post('/calls', newCall, { headers: { Authorization: `Bearer ${token}` } });
              fetchCallsData();
            }
          } catch (e) {
            console.error('Failed to log call', e);
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
        onSave={async (updatedCall) => {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              await api.put(`/calls/${updatedCall.id}`, updatedCall, { headers: { Authorization: `Bearer ${token}` } });
              fetchCallsData();
            }
          } catch (e) {
            console.error('Failed to update call', e);
          }
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

export default CallsPage;
