import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import api from '@/lib/api';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

export function PipelinePage() {
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [currentAssignPipeline, setCurrentAssignPipeline] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    details: '',
    groupId: '',
    attribute: '',
    type: 'DEAL'
  });

  const fetchPipelines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await api.get('/pipelines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPipelines(res.data);
    } catch (error) {
      console.error('Error fetching pipelines', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/leads/groups', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (error) {
      console.error('Error fetching groups', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  useEffect(() => {
    fetchPipelines();
    fetchGroups();
    fetchUsers();
  }, []);

  const handleOpenModal = (pipeline?: any) => {
    if (pipeline) {
      setEditMode(true);
      setCurrentId(pipeline.id);
      setFormData({
        name: pipeline.name || '',
        details: pipeline.details || '',
        groupId: pipeline.groupId || '',
        attribute: pipeline.attribute || '',
        type: pipeline.type || 'DEAL'
      });
    } else {
      setEditMode(false);
      setCurrentId('');
      setFormData({
        name: '',
        details: '',
        groupId: '',
        attribute: '',
        type: 'DEAL'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenAssignModal = (pipeline: any) => {
    setCurrentAssignPipeline(pipeline);
    setSelectedUsers(pipeline.assignedUsers?.map((u: any) => u.id) || []);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssign = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/pipelines/${currentAssignPipeline.id}/assign`, { userIds: selectedUsers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Success', 'Team assigned successfully', 'success');
      setIsAssignModalOpen(false);
      fetchPipelines();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to assign team', 'error');
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Swal.fire('Error', 'Pipeline Name is required', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (editMode) {
        await api.put(`/pipelines/${currentId}`, formData, { headers });
        Swal.fire('Success', 'Pipeline updated successfully', 'success');
      } else {
        await api.post('/pipelines', formData, { headers });
        Swal.fire('Success', 'Pipeline created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchPipelines();
    } catch (error: any) {
      Swal.fire('Error', error.response?.data?.message || 'Failed to save pipeline', 'error');
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
        await api.delete(`/pipelines/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Pipeline has been deleted.', 'success');
        fetchPipelines();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete pipeline', 'error');
      }
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto p-4 md:p-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md shadow-sm border border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Pipelines</h1>
        <Button onClick={() => handleOpenModal()} className="bg-[#007bff] hover:bg-blue-700 text-white rounded shadow-sm px-4">
          + Add Pipeline
        </Button>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs font-bold text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3">PIPELINE NAME</th>
                <th className="px-4 py-3">TYPE</th>
                <th className="px-4 py-3">GROUP NAME</th>
                <th className="px-4 py-3 text-center">LEADS</th>
                <th className="px-4 py-3 text-center">ASSIGN TEAM</th>
                <th className="px-4 py-3 text-center">CREATED</th>
                <th className="px-4 py-3 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : pipelines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 12h2v5H7zm4-3h2v8h-2zm4-4h2v12h-2z"/></svg>
                      </div>
                      <p className="font-semibold text-gray-700">No Pipelines Found</p>
                      <p className="text-sm text-gray-400 mt-1">Create your first pipeline to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pipelines.map((pipeline) => (
                  <tr key={pipeline.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-4 text-gray-700 font-medium">{pipeline.name}</td>
                    <td className="px-4 py-4 text-gray-600">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pipeline.type === 'DEAL' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {pipeline.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600">{pipeline.group?.name || '-'}</td>
                    <td className="px-4 py-4 text-center text-gray-600">0</td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleOpenAssignModal(pipeline)}
                          className="h-8 w-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium hover:bg-gray-100 transition-colors"
                        >
                          +{pipeline.assignedUsers?.length || 0}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {format(new Date(pipeline.createdAt), 'do MMM, yyyy')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link to={`/pipeline/${pipeline.id}`} className="p-1.5 bg-[#4ade80] rounded text-white hover:bg-green-500 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleOpenModal(pipeline)} className="p-1.5 bg-[#8b5cf6] rounded text-white hover:bg-purple-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(pipeline.id)} className="p-1.5 bg-[#ef4444] rounded text-white hover:bg-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pipelines.length > 0 && (
          <div className="flex justify-end p-4 border-t border-gray-100 bg-white">
            <div className="flex rounded border border-gray-200">
              <button className="px-3 py-1.5 text-sm text-blue-500 bg-white hover:bg-gray-50 disabled:opacity-50">Prev</button>
              <button className="px-3 py-1.5 text-sm text-white bg-[#6366f1]">1</button>
              <button className="px-3 py-1.5 text-sm text-blue-500 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Info Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">{editMode ? 'Edit Pipeline' : 'Pipeline Info'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-900 hover:text-gray-600 transition-colors font-bold">
                <X className="h-5 w-5 stroke-[3]" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide">Pipeline Name</label>
                <Input
                  placeholder="Enter Pipeline Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 border-gray-200 bg-gray-50/50"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide">Details</label>
                <Input
                  placeholder="Details"
                  value={formData.details}
                  onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                  className="h-10 border-gray-200 bg-gray-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide">Type</label>
                <select
                  className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="DEAL">Deal</option>
                  <option value="LEAD">Lead</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide">Select Group (Optional)</label>
                <select
                  className="w-full h-10 border border-gray-200 rounded-md px-3 text-sm bg-gray-50/50 outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.groupId}
                  onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                >
                  <option value="">Choose Group</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wide">Attributes</label>
                <Input
                  placeholder="Comma-separated attributes"
                  value={formData.attribute}
                  onChange={(e) => setFormData({ ...formData, attribute: e.target.value })}
                  className="h-10 border-gray-200 bg-gray-50/50"
                />
                <p className="text-[10px] text-gray-500 mt-1">Comma-separated attributes to partition pipeline stages</p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleSave}
                  className="w-full h-10 bg-[#007bff] hover:bg-blue-700 text-white font-semibold text-sm rounded"
                >
                  SAVE
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Team Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Assign Team</h2>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Team Members</label>
                <Select
                  isMulti
                  placeholder="Select users..."
                  options={users.map(u => ({ value: u.id, label: u.name }))}
                  value={users.filter(u => selectedUsers.includes(u.id)).map(u => ({ value: u.id, label: u.name }))}
                  onChange={(selected) => setSelectedUsers((selected as any[]).map(s => s.value))}
                  className="react-select-container text-sm"
                  classNamePrefix="react-select"
                />
                {selectedUsers.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">No team members assigned yet.</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAssign}
                  className="bg-[#007bff] hover:bg-blue-700 text-white shadow-sm"
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