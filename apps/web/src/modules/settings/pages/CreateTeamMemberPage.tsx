import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, RefreshCw, Shield, User, Mail, Phone, Lock, 
  Building, Briefcase, PhoneCall, Check, SlidersHorizontal 
} from 'lucide-react';
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

// Built-in Complete Permissions Catalog
export const DEFAULT_PERMISSION_MODULES: PermissionModule[] = [
  {
    module: 'leads',
    label: 'Leads Management',
    description: 'Control access to view, create, edit, delete, export leads, and manage pipelines',
    permissions: [
      { id: 'leads.view_all', label: 'View All Leads', description: 'Can view all company leads across all sales reps' },
      { id: 'leads.view_own', label: 'View Own Leads Only', description: 'Can only view leads assigned to this user' },
      { id: 'leads.create', label: 'Create Leads', description: 'Can create new leads manually or via imports' },
      { id: 'leads.edit_all', label: 'Edit All Leads', description: 'Can update any lead stage, status, or details' },
      { id: 'leads.edit_own', label: 'Edit Assigned Leads', description: 'Can only edit details of leads assigned to them' },
      { id: 'leads.delete', label: 'Delete Leads', description: 'Can delete leads permanently from CRM' },
      { id: 'leads.export', label: 'Export Leads', description: 'Can export leads to Excel / CSV' },
      { id: 'leads.pipelines', label: 'Manage Lead Pipelines', description: 'Can create and configure lead pipelines, stages, and funnels' },
    ]
  },
  {
    module: 'deals',
    label: 'Deals & Sales Pipeline',
    description: 'Manage sales stages, closing deals, pipeline boards, and win/loss states',
    permissions: [
      { id: 'deals.view_all', label: 'View All Deals', description: 'Can view pipeline deals of the entire company' },
      { id: 'deals.view_own', label: 'View Own Deals', description: 'Can only view deals assigned to them' },
      { id: 'deals.create', label: 'Create Deals', description: 'Can create new deals in pipeline' },
      { id: 'deals.edit', label: 'Edit Deals', description: 'Can move stages, change value, mark won/lost' },
      { id: 'deals.delete', label: 'Delete Deals', description: 'Can delete deals from pipeline' },
      { id: 'deals.pipelines', label: 'Manage Deal Pipelines', description: 'Can configure deal stages, probabilities, and boards' },
    ]
  },
  {
    module: 'contacts',
    label: 'Customers & Contacts',
    description: 'Access to customer contact profiles, accounts, client history, and companies',
    permissions: [
      { id: 'contacts.view', label: 'View Contacts', description: 'Can view customer and client directory' },
      { id: 'contacts.create', label: 'Create Contacts', description: 'Can add new customer and client profiles' },
      { id: 'contacts.edit', label: 'Edit Contacts', description: 'Can edit customer details and custom data' },
      { id: 'contacts.delete', label: 'Delete Contacts', description: 'Can delete customer contacts' },
    ]
  },
  {
    module: 'calls',
    label: 'Telephony & Calling (Tata Trunk / PBX)',
    description: 'Permissions for placing outbound calls, reviewing logs, and listening to recordings',
    permissions: [
      { id: 'calls.make_call', label: 'Make Outbound Calls', description: 'Can use WebDialer to place click-to-call dials' },
      { id: 'calls.view_all_logs', label: 'View All Call Logs', description: 'Can view call history of all team members' },
      { id: 'calls.view_own_logs', label: 'View Own Call Logs Only', description: 'Can only see their own call history' },
      { id: 'calls.listen_recordings', label: 'Listen to Call Recordings', description: 'Can listen and download customer call audio recordings' },
    ]
  },
  {
    module: 'communication',
    label: 'Communication (WhatsApp, Email & Inbox)',
    description: 'Access to WhatsApp API, customer email conversations, and team inbox',
    permissions: [
      { id: 'whatsapp.view_all_chats', label: 'View All WhatsApp Chats', description: 'Can view WhatsApp conversations of all sales reps' },
      { id: 'whatsapp.send_message', label: 'Send WhatsApp Messages', description: 'Can chat with customers via WhatsApp templates and text' },
      { id: 'email.send', label: 'Send Customer Emails', description: 'Can compose and send emails directly from CRM' },
      { id: 'inbox.access', label: 'Shared Team Inbox', description: 'Can access unified communication inbox' },
    ]
  },
  {
    module: 'activities',
    label: 'Activities, Tasks & Meetings',
    description: 'Manage daily tasks, reminders, follow-ups, and calendar meetings',
    permissions: [
      { id: 'tasks.view', label: 'View Tasks', description: 'Can view tasks and pending follow-ups' },
      { id: 'tasks.create', label: 'Create Tasks', description: 'Can assign tasks and set reminder follow-ups' },
      { id: 'tasks.edit', label: 'Edit & Complete Tasks', description: 'Can update task status and complete follow-ups' },
      { id: 'tasks.delete', label: 'Delete Tasks', description: 'Can delete tasks from system' },
      { id: 'meetings.manage', label: 'Manage Meetings & Calendar', description: 'Can schedule and manage meetings on the calendar' },
    ]
  },
  {
    module: 'inventory',
    label: 'Inventory, Products & Price Books',
    description: 'Manage products catalog, SKU pricing, price books, and vendor suppliers',
    permissions: [
      { id: 'products.view', label: 'View Products', description: 'Can view product catalog and stock info' },
      { id: 'products.create', label: 'Create Products', description: 'Can add new products, pricing, and tax rates' },
      { id: 'products.edit', label: 'Edit Products', description: 'Can update product details and prices' },
      { id: 'products.delete', label: 'Delete Products', description: 'Can delete products from catalog' },
      { id: 'pricebooks.manage', label: 'Manage Price Books', description: 'Can configure tier pricing and price books' },
      { id: 'vendors.manage', label: 'Manage Vendors & Suppliers', description: 'Can manage vendor profiles and suppliers' },
    ]
  },
  {
    module: 'billing',
    label: 'Quotations, Invoices & Orders',
    description: 'Manage quotations, estimates, sales orders, purchase orders, and invoices',
    permissions: [
      { id: 'quotes.view', label: 'View Quotations', description: 'Can view estimates and proposals' },
      { id: 'quotes.create', label: 'Create Quotations', description: 'Can generate new quotes with items and taxes' },
      { id: 'quotes.edit', label: 'Edit & Send Quotes', description: 'Can modify pricing, discounts, and dispatch PDF' },
      { id: 'quotes.delete', label: 'Delete Quotations', description: 'Can delete quotation records' },
      { id: 'invoices.view', label: 'View Invoices', description: 'Can view company invoices and receipts' },
      { id: 'invoices.create', label: 'Generate Invoices', description: 'Can generate invoices from deals or scratch' },
      { id: 'invoices.edit', label: 'Edit & Record Payments', description: 'Can update invoice status and log payments' },
      { id: 'invoices.delete', label: 'Delete Invoices', description: 'Can delete invoice documents' },
      { id: 'orders.manage', label: 'Sales & Purchase Orders', description: 'Can create and process sales and purchase orders' },
    ]
  },
  {
    module: 'support',
    label: 'Support Cases & Knowledge Base',
    description: 'Helpdesk ticketing, support case resolution, and solutions library',
    permissions: [
      { id: 'cases.view', label: 'View Support Cases', description: 'Can view customer support tickets and cases' },
      { id: 'cases.create', label: 'Create Cases', description: 'Can log new customer complaints and issues' },
      { id: 'cases.edit', label: 'Resolve & Edit Cases', description: 'Can change priority, assign tech, and resolve' },
      { id: 'cases.delete', label: 'Delete Cases', description: 'Can delete support cases' },
      { id: 'solutions.manage', label: 'Knowledge Base Solutions', description: 'Can manage troubleshooting guides and articles' },
    ]
  },
  {
    module: 'automations',
    label: 'Workflows & AI Assistant',
    description: 'Automation triggers, webhook actions, auto-assignments, and AI assistance',
    permissions: [
      { id: 'workflows.view', label: 'View Workflows', description: 'Can view automation rules and triggers' },
      { id: 'workflows.manage', label: 'Configure Workflows', description: 'Can create and modify automated business workflows' },
      { id: 'ai.use', label: 'Access AI Assistant', description: 'Can use AI assistant for summary and copy generation' },
    ]
  },
  {
    module: 'reports',
    label: 'Reports & Dashboard Analytics',
    description: 'Access to executive dashboards, sales rep performance, and ROI reports',
    permissions: [
      { id: 'reports.view', label: 'View Reports & Dashboard', description: 'Can access analytical dashboards and charts' },
      { id: 'reports.export', label: 'Export Reports', description: 'Can download revenue and activity reports to Excel' },
    ]
  },
  {
    module: 'settings',
    label: 'Settings & Administration',
    description: 'Admin-level configuration of company settings, users, and phone trunks',
    permissions: [
      { id: 'team.manage', label: 'Manage Team & Permissions', description: 'Can invite users, edit roles, and assign permissions' },
      { id: 'settings.telephony', label: 'Manage Telephony Trunks', description: 'Can configure Tata SIP Trunk, PBX IP, and Smartflo' },
      { id: 'settings.company', label: 'Company Profile & Custom Fields', description: 'Can modify company profile, logo, and form layouts' },
    ]
  }
];

export const DEFAULT_PRESETS: Record<string, string[]> = {
  'Sales Rep': [
    'leads.view_own', 'leads.create', 'leads.edit_own',
    'deals.view_own', 'deals.create', 'deals.edit',
    'contacts.view', 'contacts.create', 'contacts.edit',
    'calls.make_call', 'calls.view_own_logs',
    'whatsapp.send_message', 'email.send', 'inbox.access',
    'tasks.view', 'tasks.create', 'tasks.edit', 'meetings.manage',
    'products.view', 'quotes.view', 'quotes.create',
    'invoices.view'
  ],
  'Telecaller / Agent': [
    'leads.view_own', 'leads.create', 'leads.edit_own',
    'deals.view_own', 'deals.create',
    'contacts.view',
    'calls.make_call', 'calls.view_own_logs',
    'whatsapp.send_message',
    'tasks.view', 'tasks.create', 'tasks.edit'
  ],
  'Sales Manager': [
    'leads.view_all', 'leads.create', 'leads.edit_all', 'leads.export', 'leads.pipelines',
    'deals.view_all', 'deals.create', 'deals.edit', 'deals.delete', 'deals.pipelines',
    'contacts.view', 'contacts.create', 'contacts.edit',
    'calls.make_call', 'calls.view_all_logs', 'calls.listen_recordings',
    'whatsapp.view_all_chats', 'whatsapp.send_message', 'email.send', 'inbox.access',
    'tasks.view', 'tasks.create', 'tasks.edit', 'meetings.manage',
    'products.view', 'quotes.view', 'quotes.create', 'quotes.edit',
    'invoices.view', 'invoices.create', 'invoices.edit',
    'reports.view', 'reports.export'
  ],
  'Support Executive': [
    'contacts.view', 'contacts.edit',
    'cases.view', 'cases.create', 'cases.edit', 'solutions.manage',
    'calls.make_call', 'calls.view_all_logs',
    'whatsapp.view_all_chats', 'whatsapp.send_message', 'email.send',
    'tasks.view', 'tasks.create', 'tasks.edit'
  ],
  'Read Only': [
    'leads.view_all', 'deals.view_all', 'contacts.view',
    'calls.view_all_logs', 'products.view', 'quotes.view', 'invoices.view',
    'cases.view', 'reports.view'
  ]
};

export function CreateTeamMemberPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roleName: 'Sales Rep',
    department: 'Sales',
    designation: 'Sales Executive',
    status: 'active'
  });

  // Permissions Matrix
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(DEFAULT_PRESETS['Sales Rep']);
  const [catalog, setCatalog] = useState<PermissionModule[]>(DEFAULT_PERMISSION_MODULES);
  const [presets, setPresets] = useState<Record<string, string[]>>(DEFAULT_PRESETS);
  const [existingUsers, setExistingUsers] = useState<any[]>([]);

  useEffect(() => {
    loadPageData();
  }, [id]);

  const loadPageData = async () => {
    try {
      if (isEditMode) setIsFetching(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [catalogRes, usersRes] = await Promise.all([
        api.get('/roles/catalog', { headers }).catch(() => null),
        api.get('/users', { headers }).catch(() => null)
      ]);

      if (catalogRes?.data?.modules) {
        setCatalog(catalogRes.data.modules);
      }
      if (catalogRes?.data?.presets) {
        setPresets(catalogRes.data.presets);
      }
      if (usersRes?.data && Array.isArray(usersRes.data)) {
        setExistingUsers(usersRes.data);
      }

      if (isEditMode && id && usersRes?.data) {
        const usersList = Array.isArray(usersRes.data) ? usersRes.data : [];
        const member = usersList.find((u: any) => u.id === id);

        if (member) {
          const rName = member.role?.name || 'Sales Rep';
          const rPerms = member.role?.permissions && member.role.permissions.length > 0 
            ? member.role.permissions 
            : (presets[rName] || DEFAULT_PRESETS[rName] || []);

          setFormData({
            name: member.name || '',
            email: member.email || '',
            phone: member.phone || '',
            password: '',
            roleName: rName,
            department: 'Sales',
            designation: rName,
            status: 'active'
          });
          setSelectedPermissions(rPerms);
        } else {
          Swal.fire('Error', 'Team member not found', 'error');
          navigate('/team');
        }
      }
    } catch (err) {
      console.error('Failed to load page data', err);
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
      setFormData(prev => ({ ...prev, roleName: 'Admin' }));
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
    const presetPerms = presets[presetName] || DEFAULT_PRESETS[presetName];
    if (presetPerms) {
      setSelectedPermissions([...presetPerms]);
      setFormData(prev => ({ ...prev, roleName: presetName }));
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

    if (!formData.name.trim()) {
      Swal.fire('Required', 'Please enter team member name.', 'warning');
      return;
    }

    if (!formData.email.trim()) {
      Swal.fire('Required', 'Please enter email address.', 'warning');
      return;
    }

    if (!isEditMode && !formData.password) {
      Swal.fire('Required', 'Please enter a password (min 6 characters).', 'warning');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      Swal.fire('Invalid Password', 'Password must be at least 6 characters.', 'warning');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password || undefined,
        roleName: formData.roleName.trim(),
        permissions: selectedPermissions
      };

      if (isEditMode) {
        await api.put(`/users/${id}`, payload, { headers });
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Team member details and permissions saved successfully.',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        await api.post('/users', payload, { headers });
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: `${formData.name} added with configured permissions.`,
          timer: 1500,
          showConfirmButton: false
        });
      }

      navigate('/team');
    } catch (err: any) {
      console.error('Failed to save team member', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save team member.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-7 h-7 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Loading form details...</p>
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
              onClick={() => navigate('/team')}
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
              title="Back to Team"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
              {isEditMode ? `Edit Team Member: ${formData.name}` : 'Create Team Member'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/team')}
              className="px-4 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
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
          
          {/* Section 1: Member Credentials & Contact Details */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">
              Member Credentials & Contact Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address (Login Username) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@yourcompany.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Password {isEditMode ? <span className="text-gray-400 font-normal lowercase">(leave blank to keep current)</span> : <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  required={!isEditMode}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isEditMode ? 'Enter new password if changing' : 'Min 6 characters'}
                  minLength={6}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Calling Extension (Tata Trunk / PBX)
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 101, 102 or Mobile 9876543210"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Tata SIP Trunk will ring this extension before bridging the customer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.roleName}
                  onChange={e => setFormData({ ...formData, roleName: e.target.value })}
                  placeholder="e.g. Sales Rep, Telecaller, Manager"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="Sales">Sales</option>
                  <option value="Support">Support</option>
                  <option value="Telecalling">Telecalling / Inside Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Module Permissions & Access Control (CRUD) - ON THE SAME PAGE */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Module Permissions & Access Control (CRUD)</span>
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Apply a standard preset or customize checkboxes below to configure what this member can access.
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-gray-400 font-medium mr-1">Presets:</span>
                {Object.keys(presets).map((pName) => (
                  <button
                    key={pName}
                    type="button"
                    onClick={() => applyPreset(pName)}
                    className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors cursor-pointer ${
                      formData.roleName === pName
                        ? 'bg-blue-600 text-white border-blue-700'
                        : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
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

            {/* Granular Module Checkboxes Matrix */}
            <div className="space-y-4">
              {catalog.map((mod) => {
                const modPermIds = mod.permissions.map(p => p.id);
                const allChecked = !isAllAdmin && modPermIds.every(pid => selectedPermissions.includes(pid));

                return (
                  <div key={mod.module} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                    {/* Module Title Bar */}
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
                            className={`flex items-start gap-3 p-2.5 rounded border transition-colors cursor-pointer select-none ${
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
              {isAllAdmin ? 'Full Admin Access Selected' : `${selectedPermissions.length} module permissions selected`}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/team')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors shadow-xs disabled:opacity-50 min-w-[100px] cursor-pointer"
              >
                {isLoading ? 'Saving...' : (isEditMode ? 'Update Member' : 'Save Member')}
              </button>
            </div>
          </div>

        </form>
      </div>

    </div>
  );
}
