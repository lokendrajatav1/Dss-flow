import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, X, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import api from '@/lib/api';
import Swal from 'sweetalert2';

export function FunnelsPage() {
  const [funnels, setFunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentFunnelId, setCurrentFunnelId] = useState('');
  const [funnelName, setFunnelName] = useState('');

  const fetchFunnels = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get('/leads/funnels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFunnels(res.data);
    } catch (error) {
      console.error('Error fetching funnels', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunnels();
  }, []);

  const handleOpenModal = (funnel?: any) => {
    if (funnel) {
      setEditMode(true);
      setCurrentFunnelId(funnel.id);
      setFunnelName(funnel.name);
    } else {
      setEditMode(false);
      setCurrentFunnelId('');
      setFunnelName('');
    }
    setIsModalOpen(true);
  };

  const handleSaveFunnel = async () => {
    if (!funnelName.trim()) {
      Swal.fire('Error', 'Funnel Name is required', 'error');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editMode) {
        await api.put(`/leads/funnels/${currentFunnelId}`, { name: funnelName }, { headers });
        Swal.fire('Success', 'Funnel updated successfully', 'success');
      } else {
        await api.post('/leads/funnels', { name: funnelName }, { headers });
        Swal.fire('Success', 'Funnel created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchFunnels();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save funnel', 'error');
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
        await api.delete(`/leads/funnels/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Funnel has been deleted.', 'success');
        fetchFunnels();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete funnel', 'error');
      }
    }
  };

  const filteredFunnels = funnels.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.max(1, Math.ceil(filteredFunnels.length / pageSize));
  const paginatedFunnels = filteredFunnels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Top Bar matching LeadsPage */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-gray-900">
          Available Funnels : {funnels.length}
        </h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search funnels..." 
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
          <Button onClick={fetchFunnels} className="bg-[#38bdf8] hover:bg-[#0ea5e9] text-white h-9 w-9 p-0 rounded-md shadow-sm hidden md:flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleOpenModal()} className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-4 rounded-md text-sm font-medium shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add Funnel
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-visible">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-[11px] font-bold text-gray-700 uppercase bg-gray-100 border-b border-gray-200 tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[50%] border-r border-gray-200">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                    FUNNEL NAME
                  </div>
                </th>
                <th className="px-4 py-3 text-center border-r border-gray-200">CREATED ↓</th>
                <th className="px-4 py-3 text-center">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paginatedFunnels.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No funnels found
                  </td>
                </tr>
              ) : (
                paginatedFunnels.map((funnel) => (
                  <tr key={funnel.id} className="hover:bg-gray-50/50 group relative">
                    <td className="px-4 py-3 border-r border-gray-100">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                        <span className="text-gray-700 font-medium ml-2">{funnel.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 border-r border-gray-100 text-center text-xs text-gray-600">
                      {format(new Date(funnel.createdAt), 'dd-MM-yyyy hh:mm a')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => handleOpenModal(funnel)}
                          className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(funnel.id)}
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
            Showing {filteredFunnels.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredFunnels.length)} of {filteredFunnels.length} entries
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
              disabled={currentPage === totalPages || filteredFunnels.length === 0}
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
              <h2 className="text-lg font-bold text-gray-900">{editMode ? 'Edit Funnel' : 'Add Funnel'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Funnel Name</label>
                <Input 
                  placeholder="e.g. Facebook Ads, Website Lead" 
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
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
                  onClick={handleSaveFunnel} 
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
