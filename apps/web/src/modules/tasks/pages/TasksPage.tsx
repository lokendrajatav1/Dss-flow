import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Filter, FileText, RefreshCw, Trash2, Search, MoreVertical,
  Star, Eye, Edit, Bell, Phone, Check,
  ChevronLeft, ChevronRight, User, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { TASK_PRIORITIES, TASK_STATUSES } from '@/lib/constants';
import { SetReminderModal } from '@/modules/leads/components/SetReminderModal';
import { TaskItem } from '../types';
import { AddTaskModal } from '../components/AddTaskModal';
import { EditTaskModal } from '../components/EditTaskModal';
import { ViewTaskModal } from '../components/ViewTaskModal';

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

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
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
    fetchTasksData();
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

  const fetchTasksData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await api.get('/tasks', { headers: { Authorization: `Bearer ${token}` } });
      const dbTasks = Array.isArray(res.data) ? res.data : [];

      const fetchedTasks: TaskItem[] = dbTasks.map((t: any) => {
        const lead = t.lead || {};
        const dtString = t.dueDate ? t.dueDate.slice(0, 16) : undefined;
        const datePart = dtString ? dtString.split('T')[0] : '';
        const timePart = dtString && dtString.includes('T') ? dtString.split('T')[1].slice(0, 5) : '14:00';
        const rawPriority = (t.priority || 'Medium').toLowerCase();
        const formattedPriority = rawPriority.charAt(0).toUpperCase() + rawPriority.slice(1);

        return {
          id: t.id,
          title: t.title || 'Task',
          clientName: lead.name || 'General Client',
          companyName: lead.companyName || 'Organization',
          dueDate: datePart,
          dueTime: timePart,
          dueDateTime: dtString,
          status: t.status === 'COMPLETED' ? 'Completed' : t.status === 'CANCELLED' ? 'Cancelled' : 'Pending',
          priority: formattedPriority as any,
          assignedTo: t.assignedTo?.name || 'Unassigned',
          description: t.description || '',
          phone: lead.phone || lead.whatsappNumber || '',
          leadId: t.leadId || lead.id || undefined,
          createdAt: t.createdAt || new Date().toISOString()
        };
      });

      setTasks(fetchedTasks);
    } catch (err) {
      console.error('Failed to fetch tasks', err);
    } finally {
      setLoading(false);
    }
  };

  const availableMembers = teamMembers;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedTaskIds(paginatedTasks.map(t => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleSelectTask = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds([...selectedTaskIds, id]);
    } else {
      setSelectedTaskIds(selectedTaskIds.filter(item => item !== id));
    }
  };

  const togglePriority = (task: TaskItem) => {
    const nextPriority = task.priority === 'High' ? 'Medium' : task.priority === 'Medium' ? 'Low' : 'High';
    setTasks(tasks.map(t => t.id === task.id ? { ...t, priority: nextPriority } : t));
  };

  const toggleComplete = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: nextStatus } : t));

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put(`/tasks/${id}/status`, { status: nextStatus === 'Completed' ? 'COMPLETED' : 'PENDING' }, { headers: { Authorization: `Bearer ${token}` } });
      }
      MySwal.fire({ 
        title: nextStatus === 'Completed' ? 'Task Completed!' : 'Marked as Pending', 
        icon: 'success', 
        timer: 1000, 
        showConfirmButton: false 
      });
    } catch (err) {
      console.error('Failed to sync task status', err);
      fetchTasksData();
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.put(`/tasks/${id}/status`, { status: newStatus.toUpperCase() }, { headers: { Authorization: `Bearer ${token}` } });
      }
      MySwal.fire({ title: 'Updated!', text: `Status set to ${newStatus}`, icon: 'success', timer: 1000, showConfirmButton: false });
    } catch (err) {
      console.error('Failed to update status', err);
      fetchTasksData();
    }
  };

  const handleDelete = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Delete Task?',
      text: 'Are you sure you want to delete this task from the database?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete'
    });

    if (result.isConfirmed) {
      setTasks(prev => prev.filter(t => t.id !== id));
      setSelectedTaskIds(prev => prev.filter(item => item !== id));
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.delete(`/tasks/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        }
        MySwal.fire({ title: 'Deleted!', text: 'Task deleted successfully', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (err) {
        console.error('Failed to delete task', err);
        fetchTasksData();
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    const result = await MySwal.fire({
      title: `Delete ${selectedTaskIds.length} Tasks?`,
      text: 'Are you sure you want to delete all selected tasks from the database?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete all'
    });

    if (result.isConfirmed) {
      const idsToDelete = [...selectedTaskIds];
      setTasks(prev => prev.filter(t => !idsToDelete.includes(t.id)));
      setSelectedTaskIds([]);
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await api.post('/tasks/bulk-delete', { ids: idsToDelete }, { headers: { Authorization: `Bearer ${token}` } });
        }
        MySwal.fire({ title: 'Deleted!', text: 'Selected tasks deleted.', icon: 'success', timer: 1200, showConfirmButton: false });
      } catch (err) {
        console.error('Failed to bulk delete tasks', err);
        fetchTasksData();
      }
    }
  };

  const handleExportCSV = () => {
    const headers = ['Task Title', 'Client Name', 'Company', 'Due Date', 'Due Time', 'Status', 'Priority', 'Assignee', 'Phone', 'Created Date'];
    const rows = filteredTasks.map(t => [
      `"${t.title}"`,
      `"${t.clientName}"`,
      `"${t.companyName}"`,
      `"${t.dueDate}"`,
      `"${t.dueTime}"`,
      `"${t.status}"`,
      `"${t.priority}"`,
      `"${t.assignedTo}"`,
      `"${t.phone || ''}"`,
      `"${t.createdAt}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tasks_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReminderForTask = (task: TaskItem) => {
    const rawId = task.id.replace('lead-task-', '');
    const leadObj = {
      id: rawId,
      name: task.clientName || task.title,
      title: task.title,
      companyName: task.companyName,
      phone: task.phone || '',
      callStatus: task.status === 'Completed' ? 'Connected' : 'Untouched',
      notes: task.description || '',
      nextFollowUp: task.dueDateTime ? new Date(task.dueDateTime).toISOString() : (task.dueDate ? new Date(task.dueDate).toISOString() : undefined),
      assignedToId: task.assignedTo
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
  const filteredTasks = tasks.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.title.toLowerCase().includes(q) ||
      t.clientName.toLowerCase().includes(q) ||
      t.companyName.toLowerCase().includes(q) ||
      t.assignedTo.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === 'all' || t.assignedTo === assigneeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar - 1:1 Matching LeadsPage Top Bar */}
      <div className="bg-white p-3 rounded-md border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Tasks : {filteredTasks.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Task
          </Button>

          {/* Filter Button */}
          <Button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Filter Tasks"
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
            onClick={fetchTasksData}
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
            disabled={selectedTaskIds.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search tasks..."
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
              {TASK_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Priorities</option>
              {TASK_PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => { setAssigneeFilter(e.target.value); setCurrentPage(1); }}
              className="h-8 border border-gray-200 rounded px-2 text-xs outline-none bg-white cursor-pointer"
            >
              <option value="all">All Assignees</option>
              {availableMembers.map((m: any) => (
                <option key={m.id} value={m.name || m.email}>{m.name || m.email}</option>
              ))}
            </select>
          </div>

          {(statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all') && (
            <button
              onClick={() => { setStatusFilter('all'); setPriorityFilter('all'); setAssigneeFilter('all'); }}
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
                      checked={paginatedTasks.length > 0 && paginatedTasks.every(t => selectedTaskIds.includes(t.id))}
                    />
                    NAME
                  </div>
                </th>
                <th className="px-4 py-3 text-center">DUE DATE ↓</th>
                <th className="px-4 py-3 text-center">STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50/50 group relative group/row">
                  {/* Name Column with Checkbox, Star, Details */}
                  <td className="px-4 py-3 border-r border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={(e) => handleSelectTask(task.id, e.target.checked)}
                        />
                        <span 
                          title={task.priority === 'High' ? 'High Priority' : 'Mark as High Priority'}
                          onClick={(e) => { e.stopPropagation(); togglePriority(task); }}
                          className="inline-flex cursor-pointer"
                        >
                          <Star 
                            className={`w-4 h-4 transition-colors ${task.priority === 'High' ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`} 
                          />
                        </span>

                        <div className="relative group/name">
                          <span 
                            onClick={() => {
                              setSelectedTask(task);
                              setIsViewModalOpen(true);
                            }}
                            className="font-medium text-gray-700 hover:text-blue-600 cursor-pointer"
                          >
                            {task.title}
                          </span>
                          {task.clientName && (
                            task.leadId ? (
                              <Link
                                to={`/clients/${task.leadId}`}
                                className="text-xs text-gray-400 ml-2 font-normal hover:text-blue-600 hover:underline cursor-pointer"
                                title="Open 360° Client Profile"
                              >
                                ({task.clientName})
                              </Link>
                            ) : (
                              <span className="text-xs text-gray-400 ml-2 font-normal">
                                ({task.clientName})
                              </span>
                            )
                          )}

                          {/* Hover Popover */}
                          <div className="hidden group-hover/name:flex absolute left-0 top-full mt-2 group-last/row:top-auto group-last/row:bottom-full group-last/row:mb-2 w-72 bg-white border border-gray-200 rounded-lg z-[60] p-4 flex-col gap-2.5">
                            <div className="absolute -top-1.5 group-last/row:top-auto group-last/row:-bottom-1.5 left-4 w-3 h-3 bg-white border-t border-l group-last/row:border-t-0 group-last/row:border-l-0 group-last/row:border-b group-last/row:border-r border-gray-200 transform rotate-45"></div>
                            
                            <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-indigo-600" />
                                <span>{task.title}</span>
                              </div>
                              {task.leadId && (
                                <Link
                                  to={`/clients/${task.leadId}`}
                                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5"
                                  title="View 360° Profile"
                                >
                                  Profile <ExternalLink className="w-3 h-3" />
                                </Link>
                              )}
                            </div>

                            <p className="text-xs text-gray-700 font-medium">
                              Client: {task.clientName || '-'} {task.companyName ? `(${task.companyName})` : ''}
                            </p>
                            
                            <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                              <p>Due: <strong>{formatDate(task.dueDateTime || task.dueDate, task.dueTime)}</strong></p>
                              <p>Priority: <strong className={task.priority === 'High' ? 'text-red-600' : 'text-gray-700'}>{task.priority}</strong></p>
                              <p>Assignee: <strong>{task.assignedTo}</strong></p>
                              {task.description && <p className="text-gray-600 italic mt-1">"{task.description}"</p>}
                            </div>

                            <div className="flex items-center justify-between mt-1 border-t border-gray-100 pt-2">
                              <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                {timeAgo(task.createdAt)}
                              </span>
                              {task.leadId && (
                                <Link
                                  to={`/clients/${task.leadId}`}
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
                            setSelectedTask(task);
                            setIsViewModalOpen(true);
                          }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:text-blue-600 bg-white"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button -> Edit Task */}
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                          title="Edit Task"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Bell Button (Purple) -> Open Existing SetReminderModal */}
                        <button
                          onClick={() => openReminderForTask(task)}
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
                              setOpenMoreId(openMoreId === task.id ? null : task.id);
                            }}
                            className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                            title="More Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {openMoreId === task.id && (
                            <div 
                              className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-md p-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in duration-150"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={() => {
                                  setOpenMoreId(null);
                                  setSelectedTask(task);
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
                                  setSelectedTask(task);
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
                                  openReminderForTask(task);
                                }}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                title="Set Reminder"
                              >
                                <Bell className="w-4 h-4" />
                              </button>

                              {task.phone && (
                                <a
                                  href={`https://wa.me/${task.phone.replace(/[^0-9]/g, '')}`}
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
                                  handleDelete(task.id);
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

                  {/* Due Date Column */}
                  <td className="px-4 py-3 text-gray-500 text-center">
                    {formatDate(task.dueDateTime || task.dueDate, task.dueTime)}
                  </td>

                  {/* Status Dropdown Select - 1:1 Matching LeadsPage callStatus select */}
                  <td className="px-4 py-3 text-center">
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task.id, e.target.value)}
                      className={`h-8 px-2 border rounded text-sm outline-none cursor-pointer
                        ${task.status === 'Completed' ? 'border-green-500 text-green-700 font-medium' :
                          task.status === 'In Progress' ? 'border-blue-500 text-blue-700' :
                          task.status === 'Cancelled' ? 'border-red-500 text-red-700' :
                          'border-amber-500 text-amber-700'}
                      `}
                    >
                      {TASK_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>

                  {/* Quick Action Column - Exact Segmented Box from LeadsPage */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white">
                        {/* Complete Button */}
                        <button
                          onClick={() => toggleComplete(task.id)}
                          className={`p-1.5 hover:bg-gray-50 rounded-none border-0 block ${
                            task.status === 'Completed' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-emerald-600'
                          }`}
                          title={task.status === 'Completed' ? 'Mark as Pending' : 'Mark as Complete'}
                        >
                          <Check className="w-4 h-4" />
                        </button>

                        {/* Phone */}
                        {task.phone ? (
                          <a
                            href={`tel:${task.phone}`}
                            className="p-1.5 hover:bg-gray-50 text-blue-600 rounded-none border-0 block"
                            title={`Call ${task.phone}`}
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                        ) : (
                          <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                            <Phone className="w-4 h-4" />
                          </button>
                        )}

                        {/* WhatsApp */}
                        {task.phone ? (
                          <a
                            href={`https://wa.me/${task.phone.replace(/[^0-9]/g, '')}`}
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
                          onClick={() => handleDelete(task.id)}
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

              {paginatedTasks.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No tasks found. Click "+ Add Task" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar - 1:1 Matching LeadsPage */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {filteredTasks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredTasks.length)} of {filteredTasks.length} entries
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
              disabled={currentPage === totalPages || filteredTasks.length === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* View Task Details Modal Component */}
      <ViewTaskModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSetReminder={(task) => openReminderForTask(task)}
      />

      {/* Add Task Modal Component */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={async (newTask) => {
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const hostMember = availableMembers.find(m => m.name === newTask.assignedTo || m.email === newTask.assignedTo);
              await api.post('/tasks', {
                title: newTask.title,
                description: newTask.description,
                dueDate: newTask.dueDateTime ? new Date(newTask.dueDateTime).toISOString() : new Date().toISOString(),
                priority: newTask.priority?.toUpperCase() || 'MEDIUM',
                status: newTask.status?.toUpperCase() || 'PENDING',
                assignedToId: hostMember?.id
              }, { headers: { Authorization: `Bearer ${token}` } });
              fetchTasksData();
            }
          } catch (e) {
            console.error('Failed to persist task', e);
          }
        }}
        availableMembers={availableMembers}
      />

      {/* Edit Task Modal Component */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSave={async (updatedTask) => {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          try {
            const token = localStorage.getItem('token');
            if (token) {
              const hostMember = availableMembers.find(m => m.name === updatedTask.assignedTo || m.email === updatedTask.assignedTo);
              await api.put(`/tasks/${updatedTask.id}`, {
                title: updatedTask.title,
                description: updatedTask.description,
                dueDate: updatedTask.dueDateTime ? new Date(updatedTask.dueDateTime).toISOString() : new Date().toISOString(),
                priority: updatedTask.priority?.toUpperCase() || 'MEDIUM',
                status: updatedTask.status?.toUpperCase() || 'PENDING',
                assignedToId: hostMember?.id
              }, { headers: { Authorization: `Bearer ${token}` } });
              fetchTasksData();
            }
          } catch (e) {
            console.error('Failed to update task', e);
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
            fetchTasksData();
            setIsReminderModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
