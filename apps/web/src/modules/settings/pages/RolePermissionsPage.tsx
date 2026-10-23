import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';

export interface PermissionItem {
  id: string;
  label: string;
  description: string;
}

export interface PermissionModule {
  module: string;
  label: string;
  description: string;
  permissions: PermissionItem[];
}

export function RolePermissionsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<PermissionModule[]>([]);
  const [presets, setPresets] = useState<Record<string, string[]>>({});

  useEffect(() => {
    loadCatalogAndRole();
  }, [id]);

  const loadCatalogAndRole = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [catalogRes, rolesRes] = await Promise.all([
        api.get('/roles/catalog', { headers }),
        api.get('/roles', { headers })
      ]);

      if (catalogRes.data?.modules) {
        setCatalog(catalogRes.data.modules);
      }
      if (catalogRes.data?.presets) {
        setPresets(catalogRes.data.presets);
      }

      if (isEditMode && id && rolesRes.data?.roles) {
        const found = rolesRes.data.roles.find((r: any) => r.id === id);
        if (found) {
          setName(found.name || '');
          setSelectedPermissions(found.permissions || []);
        } else {
          Swal.fire('Error', 'Role not found', 'error');
          navigate('/team/roles');
        }
      } else if (!isEditMode) {
        setName('');
        const defaultPerms = catalogRes.data?.presets?.['Sales Rep'] || [];
        setSelectedPermissions(defaultPerms);
      }
    } catch (err) {
      console.error('Failed to load role catalog', err);
      Swal.fire('Error', 'Failed to load permissions catalog', 'error');
    } finally {
      setIsFetching(false);
    }
  };

  const isAllAdmin = selectedPermissions.includes('*');

  const toggleAllAdmin = () => {
    if (isAllAdmin) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(['*']);
    }
  };

  const togglePermission = (permId: string) => {
    if (isAllAdmin) {
      const allIds = catalog.flatMap(m => m.permissions.map(p => p.id));
      setSelectedPermissions(allIds.filter(pid => pid !== permId));
      return;
    }

    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const isPermissionChecked = (permId: string) => {
    if (isAllAdmin) return true;
    return selectedPermissions.includes(permId);
  };

  const applyPreset = (presetName: string) => {
    const presetPerms = presets[presetName];
    if (presetPerms) {
      setSelectedPermissions([...presetPerms]);
      if (!name) {
        setName(presetName);
      }
    }
  };

  const toggleModuleAll = (mod: PermissionModule) => {
    if (isAllAdmin) {
      const allIds = catalog.flatMap(m => m.permissions.map(p => p.id));
      const modIds = new Set(mod.permissions.map(p => p.id));
      setSelectedPermissions(allIds.filter(pid => !modIds.has(pid)));
      return;
    }

    const modPermIds = mod.permissions.map(p => p.id);
    const allModChecked = modPermIds.every(pid => selectedPermissions.includes(pid));

    if (allModChecked) {
      setSelectedPermissions(selectedPermissions.filter(pid => !modPermIds.includes(pid)));
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...modPermIds]));
      setSelectedPermissions(merged);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire('Required', 'Please enter a role name.', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      if (isEditMode) {
        await api.put(`/roles/${id}`, {
          name: name.trim(),
          permissions: selectedPermissions
        }, { headers });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Role permissions updated successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await api.post('/roles', {
          name: name.trim(),
          permissions: selectedPermissions
        }, { headers });
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Role created successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      }

      navigate('/team/roles');
    } catch (err: any) {
      console.error('Failed to save role', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save role.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-7 h-7 text-indigo-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading permissions catalog...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-[#f8fafc] overflow-hidden">
      
      {/* Top Header - Exact Match with CreateContactPage */}
      <div className="h-14 bg-white border-b border-gray-200 shrink-0 z-30">
        <div className="w-full h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/team/roles')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Roles"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? `Edit Role: ${name}` : 'Create Role & Permissions'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/team/roles')}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading || !name.trim()}
              onClick={handleSubmit}
              className="px-5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50 min-w-[76px] cursor-pointer"
            >
              {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
            </button>
          </div>
        </div>
      </div>

      {/* Form Content Area - Independent Scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto space-y-6 pb-12">
          
          {/* Card 1: Basic Role Definition */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Role Details & Presets
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sales Manager, Telecaller, Support Executive"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  disabled={name.toLowerCase() === 'admin'}
                />
                {name.toLowerCase() === 'admin' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Administrator role retains full master authority.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(presets).map((pName) => (
                    <button
                      key={pName}
                      type="button"
                      onClick={() => applyPreset(pName)}
                      className="px-2.5 py-1 text-xs font-medium rounded border border-gray-300 bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors cursor-pointer"
                    >
                      {pName}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={toggleAllAdmin}
                    className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer ${
                      isAllAdmin
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    Full Access (Admin)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Permissions Table */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Module Permissions Matrix
            </h2>

            <div className="space-y-4">
              {catalog.map((mod) => {
                const modPermIds = mod.permissions.map(p => p.id);
                const allChecked = !isAllAdmin && modPermIds.every(pid => selectedPermissions.includes(pid));

                return (
                  <div key={mod.module} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {/* Module Header Bar */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                          {mod.label}
                        </h3>
                        <p className="text-[11px] text-gray-500">
                          {mod.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleModuleAll(mod)}
                        disabled={isAllAdmin}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {allChecked ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Checkbox Grid */}
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {mod.permissions.map((perm) => {
                        const checked = isPermissionChecked(perm.id);

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-3 p-2.5 rounded border transition-colors cursor-pointer ${
                              checked
                                ? 'bg-blue-50/40 border-blue-200 text-gray-900'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold leading-tight text-gray-900">
                                {perm.label}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                {perm.description}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-500">
              {isAllAdmin ? 'Full Access Granted' : `${selectedPermissions.length} active permissions selected`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/team/roles')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? 'Saving...' : (isEditMode ? 'Update' : 'Save')}
              </button>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}
