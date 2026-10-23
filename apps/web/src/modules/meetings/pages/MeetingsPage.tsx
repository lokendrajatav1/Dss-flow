import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter, FileText, RefreshCw, Trash2, Search, MoreVertical,
  Star, Eye, Edit, Bell, Phone, Video,
  ChevronLeft, ChevronRight, User, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { MEETING_PLATFORMS, MEETING_STATUSES } from '@/lib/constants';
import { SetReminderModal } from '@/modules/leads/components/SetReminderModal';
import { Meeting } from '../types';
import { AddMeetingModal } from '../components/AddMeetingModal';
import { EditMeetingModal } from '../components/EditMeetingModal';
import { ViewMeetingModal } from '../components/ViewMeetingModal';

const MySwal = withReactContent(Swal);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.148 1.603 5.928L.18 23.361l5.545-1.455c1.721.956 3.659 1.464 5.679 1.464h.01C18.615 23.37 24 17.985 24 11.34 24 8.113 22.743 5.08 20.463 2.797 18.18 5.513 15.249 0 12.031 0zm.01 19.397c-1.802 0-3.567-.484-5.114-1.401l-.367-.217-3.799.997.994-3.702-.239-.38a9.497 9.497 0 0 1-1.45-5.07c0-5.246 4.269-9.516 9.516-9.516 2.54 0 4.928.99 6.723 2.784a9.518 9.518 0 0 1 2.783 6.721c0 5.247-4.269 9.516-9.516 9.516zm5.222-7.142c-.287-.143-1.696-.837-1.96-.933-.263-.093-.456-.143-.65.093-.19.237-.743.934-.91 1.127-.167.19-.335.215-.623.071-.287-.143-1.21-.446-2.306-1.422-.852-.76-1.428-1.7-1.595-1.986-.167-.287-.018-.442.126-.584.13-.129.287-.335.43-.502.143-.167.19-.287.287-.478.096-.19.048-.36-.024-.502-.072-.143-.65-1.569-.89-2.147-.234-.564-.473-.487-.65-.497-.167-.008-.36-.008-.55-.008-.19 0-.5.071-.763.36-.263.287-1.004.981-1.004 2.392s1.028 2.774 1.171 2.964c.143.19 2.022 3.085 4.898 4.327.685.296 1.219.473 1.636.606.688.218 1.314.187 1.808.113.553-.083 1.696-.693 1.936-1.363.239-.67.239-1.244.167-1.363-.071-.12-.263-.19-.55-.333z" />
  </svg>
);

const timeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};

export function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingIds, setSelectedMeetingIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [hostFilter, setHostFilter] = useState('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);


  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMoreId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    fetchMeetingsData();
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

  const fetchMeetingsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/meetings', { headers: { Authorization: `Bearer ${token}` } });
      const fetchedMeetings = Array.isArray(res.data) ? res.data : [];
      setMeetings(fetchedMeetings);
    } catch (err) {
      console.error('Failed to fetch meetings', err);
    } finally {
      setLoading(false);
    }
  };

  const availableMembers = teamMembers;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedMeetingIds(paginatedMeetings.map(m => m.id));
    } else {
      setSelectedMeetingIds([]);
    }
  };

  const handleSelectMeeting = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMeetingIds([...selectedMeetingIds, id]);
    } else {
      setSelectedMeetingIds(selectedMeetingIds.filter(item => item !== id));
    }
  };

  const togglePriority = async (meeting: Meeting) => {
    const nextPriority = meeting.priority === 'High' ? 'Normal' : 'High';
    setMeetings(prev => prev.map(m => m.id === meeting.id ? { ...m, priority: nextPriority } : m));
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put(`/meetings/${meeting.id}`, { priority: nextPriority }, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (err) {
      console.error('Failed to update priority', err);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m));
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put(`/meetings/${id}`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      }
      MySwal.fire({ title: 'Updated!', text: `Meeting status set to ${newStatus}`, icon: 'success', timer: 1000, showConfirmButton: false });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchMeetingsData();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Delete Meeting?',
      text: 'Are you sure you want to delete this meeting from the database?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      setMeetings(prev => prev.filter(m => m.id !== id));
      setSelectedMeetingIds(prev => prev.filter(item => item !== id));
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.delete(`/meetings/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        }
        MySwal.fire({ title: 'Deleted!', text: 'Meeting deleted successfully', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (err) {
        console.error('Failed to delete meeting', err);
        fetchMeetingsData();
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMeetingIds.length === 0) return;
    const result = await MySwal.fire({
      title: `Delete ${selectedMeetingIds.length} Meetings?`,
      text: 'Are you sure you want to delete all selected records from the database?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete all'
    });

    if (result.isConfirmed) {
      const idsToDelete = [...selectedMeetingIds];
      setMeetings(prev => prev.filter(m => !idsToDelete.includes(m.id)));
      setSelectedMeetingIds([]);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.post('/meetings/bulk-delete', { ids: idsToDelete }, { headers: { Authorization: `Bearer ${token}` } });
        }
        MySwal.fire({ title: 'Deleted!', text: 'Selected meeting records deleted.', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (err) {
        console.error('Failed to bulk delete meetings', err);
        fetchMeetingsData();
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Client Name', 'Company', 'Email', 'Phone', 'Date', 'Time', 'Duration', 'Platform', 'Host', 'Status'];
    const rows = filteredMeetings.map(m => [
      `"${m.title}"`,
      `"${m.clientName}"`,
      `"${m.clientCompany}"`,
      `"${m.clientEmail}"`,
      `"${m.clientPhone || ''}"`,
      `"${m.date}"`,
      `"${m.time}"`,
      `"${m.duration}"`,
      `"${m.type}"`,
      `"${m.host}"`,
      `"${m.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `meetings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReminderForMeeting = (m: Meeting) => {
    const rawId = m.id.replace('lead-meeting-', '');
    const leadObj = {
      id: rawId,
      name: m.clientName,
      title: m.title,
      companyName: m.clientCompany,
      phone: m.clientPhone || '',
      email: m.clientEmail,
      callStatus: m.status === 'Completed' ? 'Connected' : 'Scheduled',
      notes: m.agenda || '',
      nextFollowUp: m.dateTime ? new Date(m.dateTime).toISOString() : (m.date ? new Date(m.date).toISOString() : undefined),
      assignedToId: m.host
    };
    setSelectedLead(leadObj);
    setIsReminderModalOpen(true);
  };

  const formatDate = (dateString: string, timeStr?: string) => {
    if (!dateString) return '-';
    try {
      if (dateString.includes('T')) {
        const d = new Date(dateString);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
          d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      }
      const d = new Date(dateString);
      const formatted = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return timeStr ? `${formatted} ${timeStr}` : formatted;
    } catch {
      return dateString;
    }
  };

  // Filter Logic
  const filteredMeetings = meetings.filter(m => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(q) ||
      m.clientName.toLowerCase().includes(q) ||
      m.clientCompany.toLowerCase().includes(q) ||
      m.host.toLowerCase().includes(q) ||
      (m.agenda || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchesPlatform = platformFilter === 'all' || m.type === platformFilter;
    const matchesHost = hostFilter === 'all' || m.host === hostFilter;

    return matchesSearch && matchesStatus && matchesPlatform && matchesHost;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredMeetings.length / pageSize));
  const paginatedMeetings = filteredMeetings.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar - 1:1 Matching LeadsPage Top Bar */}
      <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Meetings : {filteredMeetings.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Meeting
          </Button>

          {/* Filter Button */}
          <Button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Filter Meetings"
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
            onClick={fetchMeetingsData}
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
            disabled={selectedMeetingIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search meetings..."
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
            <span className="text-xs font-medium text-gray-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {MEETING_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => { setPlatformFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Platforms</option>
              {MEETING_PLATFORMS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Host:</span>
            <select
              value={hostFilter}
              onChange={(e) => { setHostFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Hosts</option>
              {availableMembers.map((m: any) => (
                <option key={m.id} value={m.name || m.email}>{m.name || m.email}</option>
              ))}
            </select>
          </div>

          {(statusFilter !== 'all' || platformFilter !== 'all' || hostFilter !== 'all') && (
            <button
              onClick={() => { setStatusFilter('all'); setPlatformFilter('all'); setHostFilter('all'); }}
              className="text-xs text-blue-600 hover:underline ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Table - 1:1 Matching LeadsPage Table Structure */}
      <div className="bg-white rounded-md border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-hidden">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-50 border-b border-gray-100 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[45%]">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      onChange={handleSelectAll}
                      checked={paginatedMeetings.length > 0 && paginatedMeetings.every(m => selectedMeetingIds.includes(m.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-4 py-3 text-center">SCHEDULED ↓</th>
                <th className="px-4 py-3 text-center">STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMeetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50/50 group relative group/row">
                  {/* Name Column with Checkbox, Star, Details */}
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedMeetingIds.includes(meeting.id)}
                          onChange={(e) => handleSelectMeeting(meeting.id, e.target.checked)}
                        />
                        <span 
                          title={meeting.priority === 'High' ? 'High Priority' : 'Mark as High Priority'}
                          onClick={(e) => { e.stopPropagation(); togglePriority(meeting); }}
                          className="inline-flex cursor-pointer"
                        >
                          <Star 
                            className={`w-4 h-4 transition-colors ${meeting.priority === 'High' ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} 
                          />
                        </span>

                        <div className="relative group/name">
                          {meeting.leadId ? (
                            <Link
                              to={`/clients/${meeting.leadId}`}
                              className="font-medium text-gray-900 hover:text-blue-600 hover:underline cursor-pointer"
                              title="Open 360° Client Profile"
                            >
                              {meeting.clientName}
                            </Link>
                          ) : (
                            <span 
                              onClick={() => {
                                setSelectedMeeting(meeting);
                                setIsViewModalOpen(true);
                              }}
                              className="font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                            >
                              {meeting.clientName}
                            </span>
                          )}
                          <span className="text-xs text-gray-400 ml-2 font-normal">
                            ({meeting.clientCompany})
                          </span>

                          {/* Hover Popover */}
                          <div className="hidden group-hover/name:flex absolute left-0 top-full mt-2 group-last/row:top-auto group-last/row:bottom-full group-last/row:mb-2 w-72 bg-white border border-gray-200 rounded-lg z-[60] p-4 flex-col gap-2.5">
                            <div className="absolute -top-1.5 group-last/row:top-auto group-last/row:-bottom-1.5 left-4 w-3 h-3 bg-white border-t border-l group-last/row:border-t-0 group-last/row:border-l-0 group-last/row:border-b group-last/row:border-r border-gray-200 transform rotate-45"></div>
                            
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                <span>{meeting.clientName}</span>
                              </div>
                              {meeting.leadId && (
                                <Link
                                  to={`/clients/${meeting.leadId}`}
                                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                  title="View 360° Profile"
                                >
                                  Profile <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                            <p className="text-xs text-gray-700 font-medium">{meeting.title}</p>
                            
                            <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                              <p>Company: <strong className="text-gray-700">{meeting.clientCompany}</strong></p>
                              {meeting.clientEmail && <p>Email: <span className="font-mono text-gray-700">{meeting.clientEmail}</span></p>}
                              <p>Platform: <strong>{meeting.type}</strong> • Duration: <strong>{meeting.duration}</strong></p>
                              <p>Host: <strong>{meeting.host}</strong></p>
                              {meeting.agenda && <p className="text-gray-600 italic mt-1">"{meeting.agenda}"</p>}
                            </div>

                            <div className="flex items-center justify-between mt-1 border-t border-gray-100 pt-2">
                              <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {timeAgo(meeting.createdAt)}
                              </span>
                              {meeting.leadId && (
                                <Link
                                  to={`/clients/${meeting.leadId}`}
                                  className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  View 360° Profile <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Name Cell Action Cluster: Eye, Edit, Bell, MoreVertical */}
                      <div className="flex items-center gap-1.5">
                        {/* Eye Button -> View Details */}
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:text-blue-600 bg-white"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button -> Edit Meeting */}
                        <button
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                          title="Edit Meeting"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Bell Button (Purple) -> Open Existing SetReminderModal */}
                        <button
                          onClick={() => openReminderForMeeting(meeting)}
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
                              setOpenMoreId(openMoreId === meeting.id ? null : meeting.id);
                            }}
                            className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                            title="More Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {openMoreId === meeting.id && (
                            <div 
                              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-md p-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setOpenMoreId(null);
                                  setSelectedMeeting(meeting);
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
                                  setSelectedMeeting(meeting);
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
                                  openReminderForMeeting(meeting);
                                }}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                title="Set Reminder"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              {meeting.clientPhone && (
                                <a
                                  href={`https://wa.me/${meeting.clientPhone.replace(/[^0-9]/g, '')}`}
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
                                  handleDelete(meeting.id);
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

                  {/* Scheduled Date Column */}
                  <td className="px-4 py-3 text-gray-500 text-center">
                    {formatDate(meeting.dateTime || meeting.date, meeting.time)}
                  </td>

                  {/* Status Dropdown Select - 1:1 Matching LeadsPage callStatus select */}
                  <td className="px-4 py-3 text-center">
                    <select
                      value={meeting.status}
                      onChange={(e) => updateStatus(meeting.id, e.target.value)}
                      className={`h-8 px-2 border rounded text-sm outline-none cursor-pointer
                        ${meeting.status === 'Scheduled' ? 'border-blue-500 text-blue-700' :
                          meeting.status === 'Completed' ? 'border-green-500 text-green-700 font-medium' :
                          'border-gray-300 text-gray-700'}
                      `}
                    >
                      {MEETING_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Quick Action Column - Exact Segmented Box from LeadsPage */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white">
                        {/* Video / Join Meeting Link */}
                        {meeting.meetingLink ? (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 hover:bg-gray-50 text-indigo-600 rounded-none border-0 block"
                            title="Join Meeting Link"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Meeting Link">
                            <Video className="w-4 h-4" />
                          </button>
                        )}

                        {/* Phone */}
                        {meeting.clientPhone ? (
                          <a
                            href={`tel:${meeting.clientPhone}`}
                            className="p-1.5 hover:bg-gray-50 text-blue-600 rounded-none border-0 block"
                            title={`Call ${meeting.clientPhone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                            <Phone className="w-4 h-4" />
                          </button>
                        )}

                        {/* WhatsApp */}
                        {meeting.clientPhone ? (
                          <a
                            href={`https://wa.me/${meeting.clientPhone.replace(/[^0-9]/g, '')}`}
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

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(meeting.id)}
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

              {paginatedMeetings.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No meetings found. Click "+ Add Meeting" to schedule one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar - 1:1 Matching LeadsPage */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {filteredMeetings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredMeetings.length)} of {filteredMeetings.length} entries
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
              disabled={currentPage === totalPages || filteredMeetings.length === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Meeting Modal Component */}
      <ViewMeetingModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        onSetReminder={(meeting) => openReminderForMeeting(meeting)}
      />

      {/* Add Meeting Modal Component */}
      <AddMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (newMeeting) => {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const hostMember = availableMembers.find(m => m.name === newMeeting.host || m.email === newMeeting.host);
              await api.post('/meetings', {
                title: newMeeting.title,
                clientName: newMeeting.clientName,
                clientCompany: newMeeting.clientCompany,
                clientEmail: newMeeting.clientEmail,
                clientPhone: newMeeting.clientPhone,
                dateTime: newMeeting.dateTime,
                duration: newMeeting.duration,
                type: newMeeting.type,
                meetingLink: newMeeting.meetingLink,
                hostId: hostMember?.id,
                host: newMeeting.host,
                status: newMeeting.status,
                priority: newMeeting.priority,
                agenda: newMeeting.agenda
              }, { headers: { Authorization: `Bearer ${token}` } });
              fetchMeetingsData();
            }
          } catch (e) {
            console.error('Failed to create meeting', e);
          }
        }}
        availableMembers={availableMembers}
      />

      {/* Edit Meeting Modal Component */}
      <EditMeetingModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedMeeting(null);
        }}
        meeting={selectedMeeting}
        onSave={async (updatedMeeting) => {
          setMeetings(prev => prev.map(m => m.id === updatedMeeting.id ? updatedMeeting : m));
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const hostMember = availableMembers.find(m => m.name === updatedMeeting.host || m.email === updatedMeeting.host);
              await api.put(`/meetings/${updatedMeeting.id}`, {
                title: updatedMeeting.title,
                clientName: updatedMeeting.clientName,
                clientCompany: updatedMeeting.clientCompany,
                clientEmail: updatedMeeting.clientEmail,
                clientPhone: updatedMeeting.clientPhone,
                dateTime: updatedMeeting.dateTime,
                duration: updatedMeeting.duration,
                type: updatedMeeting.type,
                meetingLink: updatedMeeting.meetingLink,
                hostId: hostMember?.id,
                host: updatedMeeting.host,
                status: updatedMeeting.status,
                priority: updatedMeeting.priority,
                agenda: updatedMeeting.agenda
              }, { headers: { Authorization: `Bearer ${token}` } });
              fetchMeetingsData();
            }
          } catch (e) {
            console.error('Failed to update meeting', e);
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
            fetchMeetingsData();
            setIsReminderModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
