import { useState } from 'react';
import {
  Shield, Plus, Check, X, Users, Edit2, Lock,
  ChevronRight, Search, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Grouped modules
const MODULE_GROUPS = [
  {
    label: 'Core CRM',
    modules: [
      { key: 'leads', label: 'Leads' },
      { key: 'customers', label: 'Customers' },
      { key: 'deals', label: 'Deals' },
      { key: 'pipeline', label: 'Pipeline' },
      { key: 'tasks', label: 'Tasks' },
      { key: 'contacts', label: 'Contacts' },
    ],
  },
  {
    label: 'Communication',
    modules: [
      { key: 'whatsapp', label: 'WhatsApp' },
      { key: 'inbox', label: 'Inbox' },
      { key: 'campaigns', label: 'Campaigns' },
    ],
  },
  {
    label: 'Intelligence',
    modules: [
      { key: 'ai', label: 'AI Assistant' },
      { key: 'automation', label: 'Automation' },
      { key: 'workflows', label: 'Workflows' },
      { key: 'reports', label: 'Reports' },
    ],
  },
  {
    label: 'Finance',
    modules: [
      { key: 'quotations', label: 'Quotations' },
      { key: 'invoices', label: 'Invoices' },
      { key: 'payments', label: 'Payments' },
      { key: 'products', label: 'Products' },
    ],
  },
  {
    label: 'Administration',
    modules: [
      { key: 'team', label: 'Team' },
      { key: 'documents', label: 'Documents' },
      { key: 'integrations', label: 'Integrations' },
      { key: 'settings', label: 'Settings' },
      { key: 'billing', label: 'Billing' },
    ],
  },
];

const ALL_MODULES = MODULE_GROUPS.flatMap(g => g.modules);
type Action = 'view' | 'create' | 'edit' | 'delete';
const ACTIONS: { key: Action; label: string; color: string }[] = [
  { key: 'view', label: 'View', color: 'text-indigo-600' },
  { key: 'create', label: 'Create', color: 'text-emerald-600' },
  { key: 'edit', label: 'Edit', color: 'text-amber-600' },
  { key: 'delete', label: 'Delete', color: 'text-red-600' },
];

type ModulePermissions = Record<Action, boolean>;
type RolePermissions = Record<string, ModulePermissions>;

interface Role {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  color: string;
  dotColor: string;
  isSystem: boolean;
  permissions: RolePermissions;
}

function makePerms(overrides: Partial<Record<string, Partial<ModulePermissions>>>): RolePermissions {
  const defaults: ModulePermissions = { view: false, create: false, edit: false, delete: false };
  return Object.fromEntries(
    ALL_MODULES.map(m => [m.key, { ...defaults, ...(overrides[m.key] ?? {}) }])
  );
}

const allTrue = Object.fromEntries(ALL_MODULES.map(m => [m.key, { view: true, create: true, edit: true, delete: true }]));

const INITIAL_ROLES: Role[] = [
  {
    id: 'companyadmin',
    name: 'Company Admin',
    description: 'Full access to all company features',
    memberCount: 2,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    dotColor: 'bg-indigo-600',
    isSystem: true,
    permissions: makePerms(allTrue),
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Manage team data, leads, deals, and reports',
    memberCount: 5,
    color: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    dotColor: 'bg-indigo-400',
    isSystem: false,
    permissions: makePerms({
      leads: { view: true, create: true, edit: true, delete: false },
      customers: { view: true, create: true, edit: true, delete: false },
      deals: { view: true, create: true, edit: true, delete: false },
      pipeline: { view: true, create: false, edit: false, delete: false },
      tasks: { view: true, create: true, edit: true, delete: true },
      contacts: { view: true, create: true, edit: true, delete: false },
      whatsapp: { view: true, create: true, edit: false, delete: false },
      inbox: { view: true, create: true, edit: false, delete: false },
      campaigns: { view: true, create: false, edit: false, delete: false },
      ai: { view: true, create: true, edit: false, delete: false },
      automation: { view: true, create: false, edit: false, delete: false },
      reports: { view: true, create: false, edit: false, delete: false },
      quotations: { view: true, create: true, edit: true, delete: false },
      invoices: { view: true, create: false, edit: false, delete: false },
      payments: { view: true, create: false, edit: false, delete: false },
      products: { view: true, create: false, edit: false, delete: false },
      documents: { view: true, create: true, edit: true, delete: false },
      team: { view: true, create: false, edit: false, delete: false },
    }),
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Daily CRM work — own leads, tasks & messages',
    memberCount: 18,
    color: 'bg-indigo-50 border-indigo-100 text-indigo-500',
    dotColor: 'bg-indigo-300',
    isSystem: false,
    permissions: makePerms({
      leads: { view: true, create: true, edit: true, delete: false },
      tasks: { view: true, create: true, edit: true, delete: true },
      contacts: { view: true, create: true, edit: false, delete: false },
      whatsapp: { view: true, create: true, edit: false, delete: false },
      inbox: { view: true, create: true, edit: false, delete: false },
      ai: { view: true, create: true, edit: false, delete: false },
      quotations: { view: true, create: true, edit: true, delete: false },
      documents: { view: true, create: true, edit: false, delete: false },
    }),
  },
  {
    id: 'readonly',
    name: 'Read Only',
    description: 'View-only access, no modifications allowed',
    memberCount: 3,
    color: 'bg-gray-50 border-gray-200 text-gray-500',
    dotColor: 'bg-gray-400',
    isSystem: false,
    permissions: makePerms(Object.fromEntries(ALL_MODULES.map(m => [m.key, { view: true }]))),
  },
];

export function PermissionsPage() {
  const [roles, setRoles] = useState<Role[]>(INITIAL_ROLES);
  const [selectedRoleId, setSelectedRoleId] = useState<string>(INITIAL_ROLES[0].id);
  const [savedState, setSavedState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [search, setSearch] = useState('');

  const selectedRole = roles.find(r => r.id === selectedRoleId)!;

  const toggle = (mod: string, action: Action) => {
    if (selectedRole.isSystem) return;
    setRoles(prev => prev.map(r => r.id !== selectedRoleId ? r : {
      ...r,
      permissions: {
        ...r.permissions,
        [mod]: { ...r.permissions[mod], [action]: !r.permissions[mod][action] },
      },
    }));
    setSavedState('idle');
  };

  const toggleAll = (mod: string, enable: boolean) => {
    if (selectedRole.isSystem) return;
    setRoles(prev => prev.map(r => r.id !== selectedRoleId ? r : {
      ...r,
      permissions: {
        ...r.permissions,
        [mod]: { view: enable, create: enable, edit: enable, delete: enable },
      },
    }));
    setSavedState('idle');
  };

  const handleSave = () => {
    setSavedState('saving');
    setTimeout(() => setSavedState('saved'), 800);
    setTimeout(() => setSavedState('idle'), 3000);
  };

  const filteredGroups = MODULE_GROUPS.map(g => ({
    ...g,
    modules: g.modules.filter(m => m.label.toLowerCase().includes(search.toLowerCase())),
  })).filter(g => g.modules.length > 0);

  const totalPermissions = ALL_MODULES.reduce((acc, m) => {
    return acc + ACTIONS.filter(a => selectedRole.permissions[m.key]?.[a.key]).length;
  }, 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control exactly what each role can access across all modules.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-sm">
            <Plus className="w-4 h-4" /> New Role
          </Button>
          <Button
            onClick={handleSave}
            disabled={savedState === 'saving'}
            className={`gap-2 text-sm min-w-[140px] transition-all duration-300 ${
              savedState === 'saved'
                ? 'bg-emerald-600 hover:bg-emerald-600'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {savedState === 'saving' && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {savedState === 'saved' && <Check className="w-4 h-4" />}
            {savedState === 'idle' && <Shield className="w-4 h-4" />}
            {savedState === 'saving' ? 'Saving...' : savedState === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        {/* Role Sidebar */}
        <div className="w-60 flex-shrink-0 space-y-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1 mb-3">Roles</p>
          {roles.map(role => {
            const active = selectedRoleId === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRoleId(role.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all duration-150 group ${
                  active
                    ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-100'
                    : 'bg-white border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-white' : role.dotColor}`} />
                    <span className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-800'}`}>
                      {role.name}
                    </span>
                  </div>
                  {role.isSystem
                    ? <Lock className={`w-3.5 h-3.5 ${active ? 'text-white/60' : 'text-gray-300'}`} />
                    : <ChevronRight className={`w-4 h-4 transition-transform ${active ? 'text-white' : 'text-gray-300 group-hover:translate-x-0.5'}`} />
                  }
                </div>
                <p className={`text-xs leading-relaxed ${active ? 'text-white/70' : 'text-gray-500'}`}>
                  {role.description}
                </p>
                <div className={`flex items-center gap-1 mt-2.5 text-xs font-medium ${active ? 'text-white/80' : 'text-gray-400'}`}>
                  <Users className="w-3 h-3" />
                  {role.memberCount} members
                </div>
              </button>
            );
          })}
        </div>

        {/* Permission Matrix */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Matrix Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedRole.color} border`}>
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900 text-sm">{selectedRole.name}</h2>
                  {selectedRole.isSystem && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <Lock className="w-3 h-3" /> System Role
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {totalPermissions} permissions granted across {ALL_MODULES.length} modules
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Filter modules..."
                  className="pl-8 h-8 text-xs w-44 bg-white"
                />
              </div>
              {!selectedRole.isSystem && (
                <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Column Headers — sticky */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
            <div className="grid px-6 py-2.5" style={{ gridTemplateColumns: '1fr repeat(4, 80px) 70px' }}>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Module</span>
              {ACTIONS.map(a => (
                <span key={a.key} className={`text-xs font-semibold uppercase tracking-wider text-center ${a.color}`}>
                  {a.label}
                </span>
              ))}
              <span className="text-xs font-semibold uppercase tracking-wider text-center text-gray-400">All</span>
            </div>
          </div>

          {/* Module Rows */}
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {filteredGroups.map(group => (
              <div key={group.label}>
                {/* Group Label */}
                <div className="px-6 py-2 bg-gray-50/70 border-y border-gray-100">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>

                {group.modules.map((mod, idx) => {
                  const perms = selectedRole.permissions[mod.key] ?? { view: false, create: false, edit: false, delete: false };
                  const allEnabled = ACTIONS.every(a => perms[a.key]);
                  const anyEnabled = ACTIONS.some(a => perms[a.key]);

                  return (
                    <div
                      key={mod.key}
                      className={`grid px-6 py-3 items-center transition-colors hover:bg-gray-50/60 ${
                        idx < group.modules.length - 1 ? 'border-b border-gray-50' : ''
                      }`}
                      style={{ gridTemplateColumns: '1fr repeat(4, 80px) 70px' }}
                    >
                      <span className={`text-sm font-medium ${anyEnabled ? 'text-gray-900' : 'text-gray-400'}`}>
                        {mod.label}
                      </span>

                      {ACTIONS.map(action => {
                        const enabled = perms[action.key];
                        return (
                          <div key={action.key} className="flex justify-center">
                            <button
                              onClick={() => toggle(mod.key, action.key)}
                              disabled={selectedRole.isSystem}
                              title={`${enabled ? 'Revoke' : 'Grant'} ${action.label} on ${mod.label}`}
                              className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150 ${
                                enabled
                                  ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700'
                                  : 'bg-gray-100 text-gray-300 hover:bg-gray-200 hover:text-gray-400'
                              } ${selectedRole.isSystem ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                            >
                              {enabled
                                ? <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                : <X className="w-3 h-3" strokeWidth={2.5} />
                              }
                            </button>
                          </div>
                        );
                      })}

                      {/* All Toggle */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleAll(mod.key, !allEnabled)}
                          disabled={selectedRole.isSystem}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all duration-150 ${
                            allEnabled
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                              : anyEnabled
                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          } ${selectedRole.isSystem ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {allEnabled ? 'All' : anyEnabled ? 'Some' : 'None'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {selectedRole.isSystem
                ? 'System roles cannot be modified. Clone this role to customize it.'
                : 'Click any cell to toggle. Changes are saved per-role.'
              }
            </p>
            {!selectedRole.isSystem && (
              <button className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                Clone Role
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
