import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Trash2, Edit, Shield, Plus, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function TeamRolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(res.data?.roles || []);
    } catch (err) {
      console.error('Failed to load roles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name?: string, count: number = 0) => {
    if (count > 0) {
      MySwal.fire({
        title: 'Cannot Delete Role',
        text: `There are ${count} active team member(s) assigned to "${name}". Reassign them to another role first.`,
        icon: 'warning',
        confirmButtonColor: '#2563eb'
      });
      return;
    }

    const result = await MySwal.fire({
      title: 'Delete Role?',
      text: name ? `"${name}" will be deleted.` : 'This role will be deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Yes, delete it'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/roles/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setRoles(prev => prev.filter(r => r.id !== id));
        MySwal.fire('Deleted!', 'Role has been deleted.', 'success');
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete role.';
        MySwal.fire('Error', msg, 'error');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar - Exact Match with LeadsPage & DealsListPage */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4 relative">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/team')}
            className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            title="Back to Team Directory"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-[15px] font-semibold text-gray-900">
            Available Roles : {roles.length}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            onClick={() => navigate('/team/roles/create')}
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium cursor-pointer"
          >
            + Add Role
          </Button>

          <Button
            onClick={() => navigate('/team')}
            className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white h-9 px-3 rounded-md text-sm font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Team Directory</span>
          </Button>

          <Button
            onClick={fetchRoles}
            className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Table Container - Exact Match with LeadsPage & DealsListPage */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 border-r border-gray-200">ROLE NAME</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">ASSIGNED MEMBERS</th>
                <th className="px-4 py-3 border-r border-gray-200">PERMISSIONS SUMMARY</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">ROLE TYPE</th>
                <th className="px-4 py-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    Loading roles...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">
                    No roles found.
                  </td>
                </tr>
              ) : (
                roles.map((r) => {
                  const isAdmin = r.isAdmin || r.name.toLowerCase() === 'admin';
                  const isAll = (r.permissions || []).includes('*');
                  const count = isAll ? 'Full Access' : `${(r.permissions || []).length} permissions`;

                  return (
                    <tr key={r.id || r.name} className="hover:bg-gray-50/50 group relative">
                      
                      {/* Role Name */}
                      <td className="px-4 py-3 border-r border-gray-100 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span>{r.name}</span>
                        </div>
                      </td>

                      {/* Assigned Members */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className="font-semibold text-gray-900">{r.userCount || 0}</span>
                        <span className="text-xs text-gray-500 ml-1">member(s)</span>
                      </td>

                      {/* Permissions Summary */}
                      <td className="px-4 py-3 border-r border-gray-100">
                        {isAll ? (
                          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            Full Master Access across all modules
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {(r.permissions || []).slice(0, 4).map((p: string) => (
                              <span key={p} className="text-[11px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                {p.replace('.', ': ')}
                              </span>
                            ))}
                            {(r.permissions || []).length > 4 && (
                              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                +{(r.permissions || []).length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Role Type */}
                      <td className="px-4 py-3 text-center border-r border-gray-100">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isAdmin
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {isAdmin ? 'System Default' : 'Custom'}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/team/roles/edit/${r.id}`)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                            title="Edit Permissions"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {!isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(r.id, r.name, r.userCount || 0)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors cursor-pointer"
                              title="Delete Role"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
