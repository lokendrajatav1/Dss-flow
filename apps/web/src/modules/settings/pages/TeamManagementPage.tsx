import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, RefreshCw, Trash2, Edit, FileText,
  ChevronLeft, ChevronRight, Phone, Mail, Shield, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useDialer } from '@/context/TelephonyContext';

const MySwal = withReactContent(Swal);

export function TeamManagementPage() {
  const navigate = useNavigate();
  const { startCall } = useDialer();

  const [members, setMembers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeamData();
  }, []);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users', { headers }),
        api.get('/roles', { headers }).catch(() => ({ data: { roles: [] } }))
      ]);

      setMembers(Array.isArray(usersRes.data) ? usersRes.data : []);
      if (rolesRes.data?.roles) {
        setRoles(rolesRes.data.roles);
      }
    } catch (err) {
      console.error('Failed to fetch team data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name?: string) => {
    const result = await MySwal.fire({
      title: 'Remove Team Member?',
      text: name ? `"${name}" will lose access to the CRM.` : 'This team member will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, remove them'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setMembers(prev => prev.filter(m => m.id !== id));
        MySwal.fire('Removed!', 'Team member has been removed.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to remove team member.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  const handleExportCSV = () => {
    if (members.length === 0) return;

    const headers = ['Name', 'Email', 'Extension / Phone', 'Role', 'Status'];
    const rows = filteredMembers.map(m => [
      `"${(m.name || '').replace(/"/g, '""')}"`,
      `"${(m.email || '').replace(/"/g, '""')}"`,
      `"${(m.phone || '').replace(/"/g, '""')}"`,
      `"${(m.role?.name || 'Sales Rep').replace(/"/g, '""')}"`,
      '"Active"'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `team_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDialAgent = (name: string, phone: string) => {
    if (!phone) return;
    startCall({
      name: `Agent: ${name}`,
      phone: phone.trim(),
      sourceType: 'call'
    });
  };

  // Filter members
  const filteredMembers = members.filter(member => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches = 
        (member.name || '').toLowerCase().includes(q) ||
        (member.email || '').toLowerCase().includes(q) ||
        (member.phone || '').includes(q) ||
        (member.role?.name || '').toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (selectedRole !== 'all') {
      if ((member.role?.name || '') !== selectedRole) return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / pageSize));
  const paginatedMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar - Exact Match with LeadsPage & DealsListPage */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Team Members : {filteredMembers.length}
        </h2>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* + Add Member Button (Emerald #10b981) */}
          <Button
            onClick={() => navigate('/team/create')}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium cursor-pointer"
          >
            + Add Member
          </Button>

          {/* Roles & Permissions Button (Blue #2563eb) */}
          <Button
            onClick={() => navigate('/team/roles')}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 cursor-pointer"
            title="Roles & Permissions"
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions</span>
          </Button>

          {/* Export CSV Button */}
          <Button
            onClick={handleExportCSV}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 w-9 p-0 rounded-md cursor-pointer"
            title="Export CSV"
          >
            <FileText className="w-4 h-4" />
          </Button>

          {/* Refresh Button (Cyan #38bdf8) */}
          <Button
            onClick={fetchTeamData}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          {/* Search Input */}
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search team..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-44 lg:w-48 h-9 border border-gray-200 rounded-md pl-8 pr-2 text-sm outline-none focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Role Filter Dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-sm outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value="all">All Roles</option>
            {roles.map((r: any) => (
              <option key={r.id || r.name} value={r.name}>{r.name}</option>
            ))}
          </select>

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

      {/* Table Container - Exact Match with LeadsPage & DealsListPage */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200">NAME & EMAIL</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">CALLING EXTENSION (TATA TRUNK)</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">ROLE</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">STATUS</th>
                <th className="px-4 py-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Loading team members...
                  </td>
                </tr>
              ) : paginatedMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No team members found.
                  </td>
                </tr>
              ) : (
                paginatedMembers.map((member) => {
                  const roleName = member.role?.name || 'Sales Rep';
                  const isAdmin = roleName.toLowerCase() === 'admin';

                  return (
                    <tr key={member.id} className="hover:bg-gray-50/50 group relative">
                      
                      {/* Name & Email */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">{member.name}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{member.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Calling Extension / Phone */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        {member.phone ? (
                          <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                            <Phone className="w-3 h-3 text-indigo-500" />
                            <span>{member.phone}</span>
                            <button
                              type="button"
                              onClick={() => handleDialAgent(member.name, member.phone)}
                              className="ml-1 text-emerald-600 hover:text-emerald-800 p-0.5 rounded cursor-pointer"
                              title="Test Dial via CRM"
                            >
                              <Phone className="w-3 h-3 fill-emerald-600" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not Assigned</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-700'
                            : roleName.includes('Manager')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {isAdmin && <Shield className="w-3 h-3" />}
                          {roleName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/team/edit/${member.id}`)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit Member"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(member.id, member.name)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                            title="Remove Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar - Exact Match with LeadsPage & DealsListPage */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {filteredMembers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
            {Math.min(currentPage * pageSize, filteredMembers.length)} of {filteredMembers.length} team members
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="h-8 w-8 p-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
