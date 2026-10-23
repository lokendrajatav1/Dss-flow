import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, UserPlus, Shield, MoreVertical, Mail, Trash2, Edit2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { InviteUserModal } from './InviteUserModal';
import { EditUserModal } from './EditUserModal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export function TeamManagementTab() {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const res = await axios.get(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      const res = await axios.post(`${API_URL}/users`, data, { headers: { Authorization: `Bearer ${token}` } });
      setMembers([...members, res.data]);
      MySwal.fire({
        title: 'Success!',
        text: 'Team member added successfully',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to add team member', 'error');
      throw err;
    }
  };

  const handleDeleteUser = async (id: string) => {
    const result = await MySwal.fire({
      title: 'Remove Team Member?',
      text: "They will lose access to the CRM.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, remove them'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      await axios.delete(`${API_URL}/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(members.filter(m => m.id !== id));
      MySwal.fire('Removed!', 'Team member has been removed.', 'success');
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to remove user', 'error');
    }
  };

  const handleUpdateUser = async (data: any) => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await axios.put(`${API_URL}/users/${data.id}`, data, { headers: { Authorization: `Bearer ${token}` } });
      
      setMembers(members.map(m => m.id === data.id ? { ...m, ...res.data } : m));
      MySwal.fire('Updated!', 'Team member updated successfully.', 'success');
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to update user', 'error');
      throw err;
    }
  };

  const filtered = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-500 text-sm">Invite sales agents and manage their access levels.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 h-9">
          <UserPlus className="w-4 h-4 mr-2" /> Add Member
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name or email..." 
              className="pl-9 h-9 text-sm bg-white" 
            />
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white border-b border-gray-100">
              <th className="px-6 py-3 text-left font-semibold text-gray-500">User</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-500">Calling Extension / Phone</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-500">Role</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-500">Status</th>
              <th className="px-6 py-3 text-right font-semibold text-gray-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading team members...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No team members found.</td>
              </tr>
            ) : (
              filtered.map(member => (
                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {member.phone ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded">
                        <Phone className="w-3 h-3 text-indigo-500" />
                        {member.phone}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                      member.role?.name === 'Manager' || member.role?.name === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {(member.role?.name === 'Manager' || member.role?.name === 'Admin') && <Shield className="w-3 h-3" />}
                      {member.role?.name || 'Sales Rep'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (openActionId === member.id) {
                          setOpenActionId(null);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            top: rect.bottom + 4,
                            left: rect.right - 144
                          });
                          setOpenActionId(member.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {openActionId === member.id && createPortal(
                      <div 
                        className="fixed w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[9999]"
                        style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
                      >
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          <button
                            onClick={() => {
                              setOpenActionId(null);
                              setUserToEdit(member);
                              setIsEditModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> Edit Details
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteUser(member.id);
                              setOpenActionId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" /> Remove
                          </button>
                        </div>
                      </div>,
                      document.body
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <InviteUserModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleInviteUser}
      />
      
      <EditUserModal 
        isOpen={isEditModalOpen}
        user={userToEdit}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
}
