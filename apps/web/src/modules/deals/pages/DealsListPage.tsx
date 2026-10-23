import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, RefreshCw, Trash2, Edit, FileText,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { format } from 'date-fns';
import { AddDealModal } from '../components/AddDealModal';
import { EditDealModal } from '../components/EditDealModal';
import { DEAL_STAGES } from '@/lib/constants';

const MySwal = withReactContent(Swal);

export function DealsListPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamMember, setSelectedTeamMember] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);

  useEffect(() => {
    fetchDeals();
    fetchMetadata();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/deals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeals(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch deals', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, pipeRes] = await Promise.all([
        api.get('/users', { headers }).catch(() => ({ data: [] })),
        api.get('/deals/pipelines', { headers }).catch(() => ({ data: [] }))
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      let fetchedStages: any[] = [];
      if (Array.isArray(pipeRes.data) && pipeRes.data.length > 0) {
        if (pipeRes.data[0].stages && pipeRes.data[0].stages.length > 0) {
          fetchedStages = pipeRes.data[0].stages;
        }
      }
      if (fetchedStages.length === 0) {
        const fallbackRes = await api.get('/pipelines', { headers }).catch(() => ({ data: [] }));
        if (Array.isArray(fallbackRes.data) && fallbackRes.data.length > 0) {
          fetchedStages = fallbackRes.data[0].stages || [];
        }
      }
      setStages(fetchedStages);
    } catch (err) {
      console.error('Failed to fetch metadata for filters', err);
    }
  };

  const handleDelete = async (id: string, title?: string) => {
    const result = await MySwal.fire({
      title: 'Delete Deal?',
      text: title ? `"${title}" will be deleted.` : 'This deal will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/deals/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDeals(deals.filter(d => d.id !== id));
        MySwal.fire({ title: 'Deleted!', text: 'Deal has been deleted.', icon: 'success', timer: 1500, showConfirmButton: false });
      } catch (err: any) {
        MySwal.fire('Error', err.response?.data?.message || 'Failed to delete deal.', 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (filteredDeals.length === 0) {
      MySwal.fire('Info', 'No deals available to export.', 'info');
      return;
    }

    const headers = ['DEAL NAME', 'DEAL PRICE', 'MEMBER NAME', 'CLIENT NAME', 'CLIENT NO', 'DATE', 'STAGE'];
    const rows = filteredDeals.map(d => {
      const contact = d.customer || d.lead;
      return [
        `"${(d.title || '').replace(/"/g, '""')}"`,
        d.value || 0,
        `"${(d.assignedTo?.name || 'Unassigned').replace(/"/g, '""')}"`,
        `"${(contact?.name || d.clientName || 'No Contact').replace(/"/g, '""')}"`,
        `"${(contact?.phone || '').replace(/"/g, '""')}"`,
        d.createdAt ? format(new Date(d.createdAt), 'dd MMM yyyy') : '',
        `"${(d.stage?.name || 'Unknown').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `deals_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredDeals = deals.filter(deal => {
    const contact = deal.customer || deal.lead;

    // Search query
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      const matchesSearch = 
        deal.title.toLowerCase().includes(term) ||
        (contact?.name && contact.name.toLowerCase().includes(term)) ||
        (contact?.phone && contact.phone.includes(term)) ||
        (deal.assignedTo?.name && deal.assignedTo.name.toLowerCase().includes(term)) ||
        (deal.stage?.name && deal.stage.name.toLowerCase().includes(term));
      if (!matchesSearch) return false;
    }

    // Team Member
    if (selectedTeamMember && deal.assignedToId !== selectedTeamMember) {
      return false;
    }

    // Stage
    if (selectedStage) {
      const sel = selectedStage.toLowerCase();
      const stageName = (deal.stage?.name || '').toLowerCase();
      const matchesStage = 
        deal.stageId === selectedStage ||
        stageName === sel ||
        (sel === 'deal won' && stageName === 'won') ||
        (sel === 'deal lost' && stageName === 'lost');
      if (!matchesStage) return false;
    }

    // Start Date
    if (startDate) {
      const dealDate = deal.createdAt ? new Date(deal.createdAt) : null;
      if (dealDate && dealDate < new Date(startDate)) return false;
    }

    // End Date
    if (endDate) {
      const dealDate = deal.createdAt ? new Date(deal.createdAt) : null;
      const endD = new Date(endDate);
      endD.setHours(23, 59, 59, 999);
      if (dealDate && dealDate > endD) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDeals.length / pageSize));
  const paginatedDeals = filteredDeals.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar (exact match with LeadsPage design) */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Deals : {filteredDeals.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* + Add Deal */}
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Deal
          </Button>

          {/* Export CSV / Excel Button */}
          <Button
            onClick={handleExportCSV}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md"
            title="Export CSV / Excel"
          >
            <FileText className="w-4 h-4" />
          </Button>

          {/* Refresh Button */}
          <Button
            onClick={() => { fetchDeals(); fetchMetadata(); }}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search deals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-44 lg:w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Select Team Member Dropdown */}
          <select
            value={selectedTeamMember}
            onChange={(e) => {
              setSelectedTeamMember(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="">Select Team Member</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* All Stage Dropdown */}
          <select
            value={selectedStage}
            onChange={(e) => {
              setSelectedStage(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="">All Stage</option>
            {DEAL_STAGES.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* From Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            title="From Date"
            className="h-9 border border-gray-200 rounded-md px-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
          />

          {/* To Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            title="To Date"
            className="h-9 border border-gray-200 rounded-md px-2.5 text-sm text-gray-700 outline-none focus:border-blue-500 bg-white cursor-pointer"
          />
        </div>
      </div>

      {/* Table (exact match with LeadsPage design) */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                {/* 1. DEAL NAME */}
                <th className="px-4 py-3 border-r border-gray-200">DEAL NAME</th>

                {/* 2. DEAL PRICE */}
                <th className="px-4 py-3 text-center border-r border-gray-200">DEAL PRICE</th>

                {/* 3. MEMBER NAME */}
                <th className="px-4 py-3 text-center border-r border-gray-200">MEMBER NAME</th>

                {/* 4. CLIENT NAME */}
                <th className="px-4 py-3 text-center border-r border-gray-200">CLIENT NAME</th>

                {/* 5. CLIENT NO */}
                <th className="px-4 py-3 text-center border-r border-gray-200">CLIENT NO</th>

                {/* 6. DATE */}
                <th className="px-4 py-3 text-center border-r border-gray-200">DATE</th>

                {/* 7. STAGE */}
                <th className="px-4 py-3 text-center border-r border-gray-200">STAGE</th>

                {/* 8. ACTION */}
                <th className="px-4 py-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading deals...
                    </div>
                  </td>
                </tr>
              ) : paginatedDeals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">No Deals Found</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first deal using "+ Add Deal"</p>
                  </td>
                </tr>
              ) : (
                paginatedDeals.map((deal) => {
                  const contact = deal.customer || deal.lead;
                  const phone = contact?.phone;
                  const email = contact?.email;

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50/50 group relative group/row">
                      {/* DEAL NAME */}
                      <td className="px-4 py-3 border-r border-gray-100 font-medium text-gray-800">
                        {deal.title}
                      </td>

                      {/* DEAL PRICE */}
                      <td className="px-4 py-3 text-center border-r border-gray-100 font-semibold text-gray-800">
                        ₹{Number(deal.value || 0).toLocaleString('en-IN')}
                      </td>

                      {/* MEMBER NAME */}
                      <td className="px-4 py-3 text-center border-r border-gray-100 text-xs text-gray-700">
                        {deal.assignedTo?.name || 'Unassigned'}
                      </td>

                      {/* CLIENT NAME */}
                      <td className="px-4 py-3 text-center border-r border-gray-100 text-xs text-gray-700">
                        {contact?.name || deal.clientName || '-'}
                      </td>

                      {/* CLIENT NO */}
                      <td className="px-4 py-3 text-center border-r border-gray-100 text-xs font-mono text-gray-700">
                        {phone || '-'}
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 text-center border-r border-gray-100 text-xs text-gray-600">
                        {deal.createdAt ? format(new Date(deal.createdAt), 'dd MMM yyyy') : (deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'dd MMM yyyy') : '-')}
                      </td>

                      {/* STAGE */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {(() => {
                          const s = (deal.stage?.name || '').toLowerCase();
                          let badgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
                          if (s.includes('won')) badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                          else if (s.includes('lost')) badgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
                          else if (s.includes('negotiation')) badgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
                          else if (s.includes('awaiting approval')) badgeClass = 'bg-purple-50 text-purple-700 border-purple-200';
                          else if (s.includes('proposal sent')) badgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';

                          return (
                            <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${badgeClass}`}>
                              {deal.stage?.name || 'Unknown'}
                            </span>
                          );
                        })()}
                      </td>

                      {/* ACTION (Edit, Delete) */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white shadow-sm">
                            {/* Edit Action */}
                            <button
                              onClick={() => { setSelectedDeal(deal); setIsEditModalOpen(true); }}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-none border-0 block transition-colors"
                              title="Edit Deal"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Delete Action */}
                            <button
                              onClick={() => handleDelete(deal.id, deal.title)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-none border-0 block transition-colors"
                              title="Delete Deal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (exact match with LeadsPage) */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {filteredDeals.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredDeals.length)} of {filteredDeals.length} entries
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
              disabled={currentPage === totalPages || filteredDeals.length === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddDealModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        stages={stages}
        onDealAdded={fetchDeals}
      />

      <EditDealModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDeal(null);
        }}
        stages={stages}
        deal={selectedDeal}
        onDealUpdated={fetchDeals}
      />
    </div>
  );
}
