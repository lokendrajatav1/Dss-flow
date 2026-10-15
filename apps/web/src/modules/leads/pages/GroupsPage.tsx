import { useState, useEffect } from 'react';
import { Plus, Search, Filter, FileText, RefreshCw, Trash2, MoreVertical, Edit, Users, Image as ImageIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import api from '@/lib/api';
import Swal from 'sweetalert2';

export function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState('');
  const [groupName, setGroupName] = useState('');

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get('/leads/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (error) {
      console.error('Error fetching groups', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleOpenModal = (group?: any) => {
    if (group) {
      setEditMode(true);
      setCurrentGroupId(group.id);
      setGroupName(group.name);
    } else {
      setEditMode(false);
      setCurrentGroupId('');
      setGroupName('');
    }
    setIsModalOpen(true);
  };

  const handleSaveGroup = async () => {
    if (!groupName.trim()) {
      Swal.fire('Error', 'Group Name is required', 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editMode) {
        await api.put(`/leads/groups/${currentGroupId}`, { name: groupName }, { headers });
        Swal.fire('Success', 'Group updated successfully', 'success');
      } else {
        await api.post('/leads/groups', { name: groupName }, { headers });
        Swal.fire('Success', 'Group created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchGroups();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save group', 'error');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/leads/groups/${id}`, { active: !currentStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchGroups();
    } catch (error) {
      console.error('Error toggling status', error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/leads/groups/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Group has been deleted.', 'success');
        fetchGroups();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete group', 'error');
      }
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'Active') return g.active;
    if (activeTab === 'Inactive') return !g.active;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filteredGroups.length / pageSize));
  const paginatedGroups = filteredGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar matching LeadsPage */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Group : {groups.length}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search groups..." 
              className="pl-9 bg-gray-50 border-gray-200 h-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="h-9 border border-gray-200 rounded-md px-2 text-xs outline-none focus:border-blue-500 bg-white cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <Button onClick={() => handleOpenModal()} className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-4 rounded-md text-sm font-medium shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Group
          </Button>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-lg border border-gray-100 shadow-sm w-max mb-4">
        {['All', 'Active', 'Inactive'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab as any);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeTab === tab 
                ? 'bg-gray-50 text-gray-900 shadow-sm border border-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeTab === tab ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {tab === 'All' ? groups.length : tab === 'Active' ? groups.filter(g => g.active).length : groups.filter(g => !g.active).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[45%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    GROUP NAME
                  </div>
                </th>
                <th className="px-4 py-3 text-center border-r border-gray-200">TOTAL LEADS</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">CREATED ↓</th>
                <th className="px-4 py-3 text-center border-r border-gray-200">STATUS</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paginatedGroups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No groups found
                  </td>
                </tr>
              ) : (
                paginatedGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50/50 group relative">
                    <td className="px-4 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-gray-700 font-medium ml-2">{group.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center">
                      <span className="text-gray-600 font-medium">{group.leads?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center text-xs text-gray-600">
                      {format(new Date(group.createdAt), 'dd-MM-yyyy hh:mm a')}
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center">
                      <button 
                        onClick={() => handleToggleStatus(group.id, group.active)}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus:outline-none ${group.active ? 'bg-[#10b981]' : 'bg-gray-300'}`}
                      >
                        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${group.active ? 'translate-x-2' : '-translate-x-2'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleOpenModal(group)}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(group.id)}
                          className="p-1 border border-gray-200 rounded text-red-500 hover:bg-red-50 bg-white"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-white">
          <div>
            Showing {filteredGroups.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredGroups.length)} of {filteredGroups.length} entries
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
              disabled={currentPage === totalPages || filteredGroups.length === 0}
              className="h-8 px-2 text-xs"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editMode ? 'Edit Group' : 'Group Details'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-center">
                <div className="h-28 w-28 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-blue-500 cursor-pointer transition-colors relative overflow-hidden">
                  <ImageIcon className="h-8 w-8 mb-1" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Group Name</label>
                <Input 
                  placeholder="Enter Group Name" 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-10 border-gray-200"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setIsModalOpen(false)} 
                  className="h-9 px-4"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveGroup} 
                  className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
