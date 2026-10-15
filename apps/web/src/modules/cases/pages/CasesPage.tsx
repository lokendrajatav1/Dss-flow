import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  FileText, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Edit, 
  ChevronLeft, 
  ChevronRight, 
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SupportCase, CasePriority, CaseStatus, CaseCategory } from '../types';
import { CaseDrawer } from '../components/CaseDrawer';
import { CaseModal } from '../components/CaseModal';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '@/context/AuthContext';

const MySwal = withReactContent(Swal);

import { CASE_CATEGORIES, CASE_PRIORITIES, CASE_STATUSES } from '@/lib/constants';

const CATEGORIES = CASE_CATEGORIES as unknown as CaseCategory[];
const PRIORITIES = CASE_PRIORITIES as unknown as CasePriority[];
const STATUSES = CASE_STATUSES as unknown as CaseStatus[];

export function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<SupportCase | null>(null);
  const [editingCase, setEditingCase] = useState<SupportCase | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New Case Form state
  const [formData, setFormData] = useState({
    subject: '',
    customerName: '',
    customerEmail: '',
    customerCompany: '',
    category: 'Technical Support' as CaseCategory,
    priority: 'Medium' as CasePriority,
    status: 'Open' as CaseStatus,
    assignedTo: user?.name || '',
    description: '',
  });

  // Fetch Cases from API (using /cases with fallback /support/cases)
  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter !== 'all') params.priority = priorityFilter;
      if (categoryFilter !== 'all') params.category = categoryFilter;

      const res = await api.get('/cases', { params });
      setCases(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch cases from API', err);
      MySwal.fire('Error', err.response?.data?.message || 'Failed to load support cases.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, priorityFilter, categoryFilter]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Keep selectedCase in sync
  useEffect(() => {
    if (selectedCase) {
      const found = cases.find(c => c.id === selectedCase.id);
      if (found) setSelectedCase(found);
    }
  }, [cases]);

  // Bulk selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCaseIds(cases.map(c => c.id));
    } else {
      setSelectedCaseIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCaseIds(prev => [...prev, id]);
    } else {
      setSelectedCaseIds(prev => prev.filter(item => item !== id));
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedCaseIds.length === 0) return;
    const confirm = await MySwal.fire({
      title: `Delete ${selectedCaseIds.length} Cases?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete them'
    });

    if (confirm.isConfirmed) {
      try {
        await api.post('/cases/bulk-delete', { ids: selectedCaseIds });
        setSelectedCaseIds([]);
        fetchCases();
        MySwal.fire('Deleted!', 'Selected cases have been deleted.', 'success');
      } catch (err: any) {
        MySwal.fire('Error', err.response?.data?.message || 'Failed to delete cases.', 'error');
      }
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (cases.length === 0) {
      MySwal.fire('No Data', 'No cases to export.', 'info');
      return;
    }
    const headers = ['Case #', 'Subject', 'Customer', 'Email', 'Company', 'Category', 'Priority', 'Status', 'Assigned To', 'Created At'];
    const rows = cases.map(c => [
      c.caseNumber,
      `"${c.subject.replace(/"/g, '""')}"`,
      `"${c.customerName.replace(/"/g, '""')}"`,
      c.customerEmail,
      `"${(c.customerCompany || '').replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.status,
      c.assignedTo,
      c.createdAt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Create Case
  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.customerName.trim()) {
      MySwal.fire('Validation Error', 'Subject and customer name are required.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/cases', formData);
      setIsModalOpen(false);
      setFormData({
        subject: '',
        customerName: '',
        customerEmail: '',
        customerCompany: '',
        category: 'Technical Support',
        priority: 'Medium',
        status: 'Open',
        assignedTo: user?.name || '',
        description: '',
      });
      fetchCases();
      MySwal.fire('Success', 'Support case created.', 'success');
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to create case.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Case
  const handleEditCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase) return;

    try {
      setSubmitting(true);
      await api.put(`/cases/${editingCase.id}`, editingCase);
      setIsEditModalOpen(false);
      setEditingCase(null);
      fetchCases();
      MySwal.fire('Updated', 'Case details updated.', 'success');
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to update case.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Single Case
  const handleDeleteCase = async (id: string, num: string) => {
    const confirm = await MySwal.fire({
      title: `Delete Case ${num}?`,
      text: 'Are you sure you want to delete this case?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/cases/${id}`);
        if (selectedCase?.id === id) setSelectedCase(null);
        fetchCases();
        MySwal.fire('Deleted!', 'Case removed from server.', 'success');
      } catch (err: any) {
        MySwal.fire('Error', err.response?.data?.message || 'Failed to delete case.', 'error');
      }
    }
  };

  // Quick Status/Priority update
  const handleQuickUpdate = async (id: string, payload: Partial<SupportCase>) => {
    try {
      await api.put(`/cases/${id}`, payload);
      fetchCases();
    } catch (err: any) {
      console.error('Quick update failed', err);
    }
  };

  // Add Comment
  const handleAddComment = async (caseId: string, comment: string, isInternal: boolean) => {
    try {
      const res = await api.post(`/cases/${caseId}/comments`, {
        author: 'Support Agent',
        role: 'Agent',
        content: comment,
        isInternal
      });
      setSelectedCase(res.data);
      fetchCases();
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to post reply.', 'error');
    }
  };

  const getPriorityBadge = (p: CasePriority) => {
    switch (p) {
      case 'Urgent': return 'bg-red-50 text-red-700 border-red-200';
      case 'High': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Low': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (s: CaseStatus) => {
    switch (s) {
      case 'New': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Open': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Pending Customer': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Escalated': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Closed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(cases.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCases = cases.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3 relative">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Available Cases : {cases.length}
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border-l border-gray-200 pl-3">
            <span>Open: <strong>{cases.filter(c => c.status === 'Open' || c.status === 'In Progress').length}</strong></span>
            <span>•</span>
            <span>Escalated: <strong className="text-rose-600">{cases.filter(c => c.status === 'Escalated' || c.priority === 'Urgent').length}</strong></span>
            <span>•</span>
            <span>Closed: <strong className="text-emerald-600">{cases.filter(c => c.status === 'Closed').length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Case
          </Button>

          <Button 
            variant="outline"
            onClick={handleExportCSV}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 h-9 px-3 rounded-md text-sm font-medium gap-1"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>

          <Button 
            variant="outline" 
            onClick={fetchCases}
            className="border-sky-400 text-sky-600 hover:bg-sky-50 h-9 px-3 rounded-md text-sm font-medium gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          {selectedCaseIds.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleBulkDelete}
              className="border-red-500 text-red-600 hover:bg-red-50 h-9 px-3 rounded-md text-sm font-medium gap-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete ({selectedCaseIds.length})</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by case #, subject, customer, email, agent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none"
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none"
        >
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedCaseIds.length > 0 && selectedCaseIds.length === cases.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-3">Case ID</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned To</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      <span>Loading cases from API...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    No support cases found. Click <strong>+ Add Case</strong> to create one.
                  </td>
                </tr>
              ) : (
                paginatedCases.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/75 transition-colors">
                    <td className="p-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedCaseIds.includes(c.id)}
                        onChange={(e) => handleSelectOne(c.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="p-3 font-semibold text-blue-600 whitespace-nowrap">
                      {c.caseNumber}
                    </td>

                    <td className="p-3 max-w-xs">
                      <div 
                        onClick={() => setSelectedCase(c)}
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                      >
                        {c.subject}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {c.category} {c.comments?.length > 0 && `• ${c.comments.length} message(s)`}
                      </div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{c.customerName}</div>
                      <div className="text-xs text-gray-500">{c.customerCompany || c.customerEmail}</div>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={c.priority}
                        onChange={(e) => handleQuickUpdate(c.id, { priority: e.target.value as CasePriority })}
                        className={`text-xs border rounded px-1.5 py-0.5 font-medium cursor-pointer ${getPriorityBadge(c.priority)}`}
                      >
                        {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </td>

                    <td className="p-3 whitespace-nowrap">
                      <select
                        value={c.status}
                        onChange={(e) => handleQuickUpdate(c.id, { status: e.target.value as CaseStatus })}
                        className={`text-xs border rounded-full px-2 py-0.5 font-medium cursor-pointer ${getStatusBadge(c.status)}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>

                    <td className="p-3 whitespace-nowrap text-gray-700">
                      {c.assignedTo}
                    </td>

                    <td className="p-3 whitespace-nowrap text-xs text-gray-500">
                      {formatDate(c.createdAt)}
                    </td>

                    <td className="p-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setSelectedCase(c)}
                        title="View Details"
                        className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCase(c);
                          setIsEditModalOpen(true);
                        }}
                        title="Edit Case"
                        className="p-1 text-gray-500 hover:text-amber-600 rounded hover:bg-gray-100"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCase(c.id, c.caseNumber)}
                        title="Delete Case"
                        className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 bg-gray-50">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries (Showing {cases.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, cases.length)} of {cases.length})</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <CaseDrawer
        selectedCase={selectedCase}
        onClose={() => setSelectedCase(null)}
        onEdit={(c) => {
          setEditingCase(c);
          setIsEditModalOpen(true);
        }}
        onQuickUpdate={handleQuickUpdate}
        onAddComment={handleAddComment}
        priorities={PRIORITIES}
        statuses={STATUSES}
        getPriorityBadge={getPriorityBadge}
        getStatusBadge={getStatusBadge}
        formatDate={formatDate}
      />

      {/* Add Modal */}
      <CaseModal
        isOpen={isModalOpen}
        isEditMode={false}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateCase}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        categories={CATEGORIES}
        priorities={PRIORITIES}
        statuses={STATUSES}
      />

      {/* Edit Modal */}
      <CaseModal
        isOpen={isEditModalOpen}
        isEditMode={true}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditCase}
        formData={editingCase || {}}
        setFormData={setEditingCase}
        submitting={submitting}
        categories={CATEGORIES}
        priorities={PRIORITIES}
        statuses={STATUSES}
      />
    </div>
  );
}
