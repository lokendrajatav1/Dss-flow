import { Response } from 'express';
import { AuthRequest } from '../../middlewares/authMiddleware';
import { prisma } from '../../lib/db';

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

export const CRM_PERMISSION_MODULES: PermissionModule[] = [
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

export const PRESET_ROLE_PERMISSIONS: Record<string, string[]> = {
  Admin: ['*'],
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

/**
 * Seed default standard roles if company has none or missing
 */
export async function ensureDefaultRolesForCompany(companyId: string) {
  const existingRoles = await prisma.role.findMany({ where: { companyId } });
  const existingNames = new Set(existingRoles.map(r => r.name.toLowerCase()));

  const defaultsToCreate = [
    { name: 'Admin', permissions: PRESET_ROLE_PERMISSIONS.Admin },
    { name: 'Sales Manager', permissions: PRESET_ROLE_PERMISSIONS['Sales Manager'] },
    { name: 'Sales Rep', permissions: PRESET_ROLE_PERMISSIONS['Sales Rep'] },
    { name: 'Telecaller / Agent', permissions: PRESET_ROLE_PERMISSIONS['Telecaller / Agent'] }
  ];

  for (const def of defaultsToCreate) {
    if (!existingNames.has(def.name.toLowerCase())) {
      await prisma.role.create({
        data: {
          companyId,
          name: def.name,
          permissions: def.permissions
        }
      });
    }
  }
}

/**
 * Get all roles for company with user counts
 */
export const getCompanyRoles = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    await ensureDefaultRolesForCompany(companyId);

    const roles = await prisma.role.findMany({
      where: { companyId },
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      roles: roles.map(r => ({
        id: r.id,
        name: r.name,
        permissions: r.permissions || [],
        userCount: r._count.users,
        isAdmin: r.name.toLowerCase() === 'admin' || (r.permissions || []).includes('*')
      }))
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get permissions catalog and preset definitions
 */
export const getPermissionsCatalog = async (_req: AuthRequest, res: Response) => {
  res.json({
    success: true,
    modules: CRM_PERMISSION_MODULES,
    presets: PRESET_ROLE_PERMISSIONS
  });
};

/**
 * Create custom role
 */
export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { name, permissions } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const trimmedName = name.trim();

    const existing = await prisma.role.findFirst({
      where: { companyId, name: trimmedName }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'A role with this name already exists' });
    }

    const newRole = await prisma.role.create({
      data: {
        companyId,
        name: trimmedName,
        permissions: Array.isArray(permissions) ? permissions : []
      },
      include: {
        _count: { select: { users: true } }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      role: {
        id: newRole.id,
        name: newRole.name,
        permissions: newRole.permissions,
        userCount: newRole._count.users
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update role and its permissions
 */
export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;
    const { name, permissions } = req.body;

    const existing = await prisma.role.findUnique({ where: { id } });
    if (!existing || existing.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const updateData: any = {};
    if (name && name.trim()) {
      // Don't rename Admin role to avoid lockout
      if (existing.name.toLowerCase() === 'admin' && name.trim().toLowerCase() !== 'admin') {
        return res.status(400).json({ success: false, message: 'Default Admin role cannot be renamed' });
      }
      updateData.name = name.trim();
    }

    if (Array.isArray(permissions)) {
      updateData.permissions = permissions;
    }

    const updated = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { users: true } }
      }
    });

    res.json({
      success: true,
      message: 'Role permissions updated successfully',
      role: {
        id: updated.id,
        name: updated.name,
        permissions: updated.permissions,
        userCount: updated._count.users
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Delete custom role
 */
export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.companyId;
    const { id } = req.params;

    const existing = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    });

    if (!existing || existing.companyId !== companyId) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    if (existing.name.toLowerCase() === 'admin') {
      return res.status(400).json({ success: false, message: 'Default Admin role cannot be deleted' });
    }

    if (existing._count.users > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. There are ${existing._count.users} user(s) currently assigned to this role. Reassign them first.`
      });
    }

    await prisma.role.delete({ where: { id } });

    res.json({ success: true, message: 'Role deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
