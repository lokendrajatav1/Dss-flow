import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Package,
  Shield,
  UserPlus,
  ClipboardCheck,
  Building2,
  Settings,
  GitBranch,
  BarChart3,
  Workflow,
  Blocks,
  Search,
  Layers
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ManagementCard {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  category: 'team' | 'crm' | 'products' | 'system';
  primaryLink: string;
  actions: {
    label: string;
    href: string;
  }[];
}

export function ManagementPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'team' | 'crm' | 'products' | 'system'>('all');

  const cards: ManagementCard[] = [
    {
      id: 'team-management',
      icon: Users,
      title: 'Team Management',
      description: 'Create teams, assign team leaders and add members.',
      category: 'team',
      primaryLink: '/groups',
      actions: [
        { label: 'Team Groups', href: '/groups' },
        { label: 'View Teams', href: '/team' },
      ],
    },
    {
      id: 'account-management',
      icon: UserCheck,
      title: 'Account Management',
      description: 'Create employee accounts, edit profiles and activate/deactivate users.',
      category: 'team',
      primaryLink: '/team',
      actions: [
        { label: 'Add Employee', href: '/team/new' },
        { label: 'Manage Users', href: '/team' },
      ],
    },
    {
      id: 'product-management',
      icon: Package,
      title: 'Product Management',
      description: 'Add products, edit details, manage prices and product status.',
      category: 'products',
      primaryLink: '/products',
      actions: [
        { label: 'Add Product', href: '/products/create' },
        { label: 'Product List', href: '/products' },
      ],
    },
    {
      id: 'category-management',
      icon: Layers,
      title: 'Category Management',
      description: 'Create and manage dynamic product categories, groups and classifications.',
      category: 'products',
      primaryLink: '/categories',
      actions: [
        { label: 'Add Category', href: '/categories' },
        { label: 'View Categories', href: '/categories' },
      ],
    },
    {
      id: 'roles-permissions',
      icon: Shield,
      title: 'Roles & Permissions',
      description: 'Control access for Admin, Team Leader and Employee.',
      category: 'team',
      primaryLink: '/team/roles',
      actions: [
        { label: 'Manage Roles', href: '/team/roles' },
        { label: 'New Role & Access', href: '/team/roles/new' },
      ],
    },
    {
      id: 'lead-assignment',
      icon: UserPlus,
      title: 'Lead Assignment',
      description: 'Assign leads to teams or individual employees.',
      category: 'crm',
      primaryLink: '/lead-manager',
      actions: [
        { label: 'Assign Leads', href: '/lead-manager' },
        { label: 'Lead Funnels', href: '/funnels' },
      ],
    },
    {
      id: 'task-management',
      icon: ClipboardCheck,
      title: 'Task Management',
      description: 'Create tasks, set deadlines and monitor employee work.',
      category: 'crm',
      primaryLink: '/tasks',
      actions: [
        { label: 'Tasks Board', href: '/tasks' },
        { label: 'Reminders & Calendar', href: '/calendar' },
      ],
    },
    {
      id: 'organization-settings',
      icon: Building2,
      title: 'Organisation Settings',
      description: 'Company profile, branding, tax registration, and business details.',
      category: 'system',
      primaryLink: '/company-profile',
      actions: [
        { label: 'Company Profile', href: '/company-profile' },
        { label: 'Branding & Taxes', href: '/company-profile' },
      ],
    },
    {
      id: 'crm-settings',
      icon: Settings,
      title: 'CRM Settings',
      description: 'Configure general defaults, custom fields, currencies and notifications.',
      category: 'system',
      primaryLink: '/settings',
      actions: [
        { label: 'General Settings', href: '/settings' },
        { label: 'Channels Config', href: '/inbox/channels' },
      ],
    },
    {
      id: 'pipeline-management',
      icon: GitBranch,
      title: 'Pipelines & Funnels',
      description: 'Configure deal stages, lead funnel flow, and SLA automation rules.',
      category: 'crm',
      primaryLink: '/leads-pipelines',
      actions: [
        { label: 'Lead Pipelines', href: '/leads-pipelines' },
        { label: 'Deal Pipelines', href: '/deals-pipelines' },
      ],
    },
    {
      id: 'reports-analytics',
      icon: BarChart3,
      title: 'Reports & Analytics',
      description: 'Team performance reports, conversion velocity, and audit summaries.',
      category: 'crm',
      primaryLink: '/reports',
      actions: [
        { label: 'Sales Reports', href: '/reports' },
        { label: 'Executive Dashboard', href: '/dashboard' },
      ],
    },
    {
      id: 'workflows-automation',
      icon: Workflow,
      title: 'Workflows & Automation',
      description: 'Trigger-based WhatsApp alerts, round-robin distribution, and auto-actions.',
      category: 'system',
      primaryLink: '/workflows',
      actions: [
        { label: 'Workflow Builder', href: '/workflows' },
        { label: 'AI Sales Assistant', href: '/ai' },
      ],
    },
    {
      id: 'integrations-channels',
      icon: Blocks,
      title: 'Integrations & Channels',
      description: 'Connect WhatsApp Cloud API, Facebook Ads, Google Sheets & Webhooks.',
      category: 'system',
      primaryLink: '/integrations',
      actions: [
        { label: 'Integrations Hub', href: '/integrations' },
        { label: 'WhatsApp API', href: '/whatsapp' },
      ],
    },
  ];

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.actions.some((a) => a.label.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'all' || card.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const tabOptions = [
    { id: 'all', label: 'All Modules' },
    { id: 'team', label: 'Teams & Accounts' },
    { id: 'crm', label: 'CRM & Assignments' },
    { id: 'products', label: 'Product Catalog' },
    { id: 'system', label: 'Settings & Automation' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/70 p-4 sm:p-6 lg:p-8 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Simple Standard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Management Hub
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your company teams, user accounts, product catalogue, roles, lead routing, and CRM configuration.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search management cards..."
              className="pl-10 h-10 rounded-lg text-sm bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-indigo-500 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Proper Standard Tabs (Clean Underline Style) */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar -mb-px">
            {tabOptions.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Clean Standard Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.primaryLink)}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-indigo-300 hover:shadow-2xs transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Clean Icon */}
                  <div className="text-indigo-600 mb-3">
                    <Icon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* Card Title */}
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {card.title}
                  </h3>

                  {/* Card Description */}
                  <p className="text-sm text-gray-500 mt-1 mb-4 leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>

                {/* Sub-links */}
                <div
                  className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-indigo-600"
                  onClick={(e) => e.stopPropagation()}
                >
                  {card.actions.map((act, index) => (
                    <React.Fragment key={act.label}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(act.href);
                        }}
                        className="hover:underline transition-colors cursor-pointer"
                      >
                        {act.label}
                      </button>
                      {index < card.actions.length - 1 && (
                        <span className="text-gray-300 select-none px-0.5">·</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCards.length === 0 && (
          <div className="text-center py-14 rounded-xl border bg-white border-gray-200">
            <Search className="w-8 h-8 text-gray-400 mx-auto mb-2.5" />
            <h3 className="text-sm font-semibold text-gray-800">
              No matching cards found
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              We couldn't find any card matching "{searchQuery}".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
