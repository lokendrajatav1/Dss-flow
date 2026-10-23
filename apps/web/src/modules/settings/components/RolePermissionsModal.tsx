import { useState, useEffect } from 'react';
import { X, Shield, Check, Info, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

export interface RoleData {
  id?: string;
  name: string;
  permissions: string[];
  userCount?: number;
  isAdmin?: boolean;
}

interface RolePermissionsModalProps {
  isOpen: boolean;
  role: RoleData | null;
  catalog: PermissionModule[];
  presets: Record<string, string[]>;
  onClose: () => void;
  onSave: (roleData: { id?: string; name: string; permissions: string[] }) => Promise<void>;
}

export function RolePermissionsModal({
  isOpen,
  role,
  catalog,
  presets,
  onClose,
  onSave
}: RolePermissionsModalProps) {
  const [name, setName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFilterModule, setActiveFilterModule] = useState<string>('all');

  useEffect(() => {
    if (role) {
      setName(role.name || '');
      setSelectedPermissions(role.permissions || []);
    } else {
      setName('');
      setSelectedPermissions(presets['Sales Rep'] || []);
    }
  }, [role, presets]);

  if (!isOpen) return null;

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
      // Expand * to all permissions except the one being toggled off
      const allIds = catalog.flatMap(m => m.permissions.map(p => p.id));
      setSelectedPermissions(allIds.filter(id => id !== permId));
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
      if (!name || name === 'New Role') {
        setName(presetName);
      }
    }
  };

  const toggleModuleAll = (mod: PermissionModule) => {
    if (isAllAdmin) {
      // Remove all perms of this module
      const allIds = catalog.flatMap(m => m.permissions.map(p => p.id));
      const modIds = new Set(mod.permissions.map(p => p.id));
      setSelectedPermissions(allIds.filter(id => !modIds.has(id)));
      return;
    }

    const modPermIds = mod.permissions.map(p => p.id);
    const allModChecked = modPermIds.every(id => selectedPermissions.includes(id));

    if (allModChecked) {
      setSelectedPermissions(selectedPermissions.filter(id => !modPermIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...modPermIds]));
      setSelectedPermissions(merged);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        id: role?.id,
        name: name.trim(),
        permissions: selectedPermissions
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredModules = activeFilterModule === 'all'
    ? catalog
    : catalog.filter(m => m.module === activeFilterModule);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {role ? `Edit Role: ${role.name}` : 'Create Custom Role & Permissions'}
              </h2>
              <p className="text-xs text-slate-500">
                Configure module-by-module CRUD access and permissions for your team.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            
            {/* Row 1: Role Name & Presets */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Senior Telecaller, Team Lead, Sales Rep"
                  className="h-10 text-sm font-medium"
                  disabled={role?.name.toLowerCase() === 'admin'}
                />
                {role?.name.toLowerCase() === 'admin' && (
                  <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    Default Administrator role always maintains master system authority.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Quick Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(presets).map((presetName) => (
                    <button
                      key={presetName}
                      type="button"
                      onClick={() => applyPreset(presetName)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-colors cursor-pointer"
                    >
                      {presetName}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={toggleAllAdmin}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      isAllAdmin
                        ? 'bg-purple-600 text-white border-purple-700'
                        : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    👑 Full Access (SuperAdmin)
                  </button>
                </div>
              </div>
            </div>

            {/* Warning if SuperAdmin Active */}
            {isAllAdmin && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2.5 text-purple-900 text-xs">
                <AlertCircle className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  <strong>Full Master Access Enabled:</strong> Users with this role have unrestricted CRUD permission across all modules, telephony lines, reports, and settings.
                </span>
              </div>
            )}

            {/* Module Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setActiveFilterModule('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  activeFilterModule === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Modules ({catalog.length})
              </button>
              {catalog.map((m) => (
                <button
                  key={m.module}
                  type="button"
                  onClick={() => setActiveFilterModule(m.module)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                    activeFilterModule === m.module
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Granular CRUD Permissions Matrix */}
            <div className="space-y-4">
              {filteredModules.map((mod) => {
                const modPermIds = mod.permissions.map(p => p.id);
                const allModChecked = !isAllAdmin && modPermIds.every(id => selectedPermissions.includes(id));
                const someModChecked = !isAllAdmin && modPermIds.some(id => selectedPermissions.includes(id));

                return (
                  <div
                    key={mod.module}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    {/* Module Header Bar */}
                    <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">
                          {mod.label}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          {mod.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleModuleAll(mod)}
                        disabled={isAllAdmin}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer ${
                          isAllAdmin
                            ? 'text-slate-400 cursor-not-allowed'
                            : allModChecked
                            ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                            : someModChecked
                            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {allModChecked || isAllAdmin ? 'Clear Module' : 'Select All'}
                      </button>
                    </div>

                    {/* Permissions Checkbox Grid */}
                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {mod.permissions.map((perm) => {
                        const checked = isPermissionChecked(perm.id);

                        return (
                          <label
                            key={perm.id}
                            className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer select-none ${
                              checked
                                ? 'bg-indigo-50/50 border-indigo-200 text-slate-900'
                                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePermission(perm.id)}
                              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold leading-tight">
                                {perm.label}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
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

          {/* Footer Bar */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              {isAllAdmin ? (
                <span className="font-bold text-purple-700">👑 SuperAdmin (All Permissions Granted)</span>
              ) : (
                <span>
                  <strong>{selectedPermissions.length}</strong> active permission(s) selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-xs"
              >
                {isSaving ? 'Saving Role...' : 'Save Role & Permissions'}
              </Button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
