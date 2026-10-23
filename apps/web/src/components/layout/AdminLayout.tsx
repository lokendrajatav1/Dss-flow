import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, CreditCard, Flag,
  Megaphone, Settings, FileText, LogOut, Shield, ChevronRight,
  Database, LifeBuoy, BarChart3, Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const adminNav = [
  {
    section: 'Platform',
    items: [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
      { name: 'Tenants', href: '/admin/tenants', icon: Building2 },
      { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
      { name: 'Usage & Limits', href: '/admin/usage', icon: Database },
    ],
  },
  {
    section: 'Analytics & Support',
    items: [
      { name: 'Advanced BI', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Support Helpdesk', href: '/admin/support', icon: LifeBuoy },
    ],
  },
  {
    section: 'Control',
    items: [
      { name: 'Platform Team', href: '/admin/team', icon: Users },
      { name: 'Feature Flags', href: '/admin/features', icon: Flag },
      { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
      { name: 'Audit Logs', href: '/admin/logs', icon: FileText },
    ],
  },
  {
    section: 'Configuration',
    items: [
      { name: 'System Settings', href: '/admin/system', icon: Settings },
    ],
  },
];

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? location.pathname === href : location.pathname.startsWith(href);

  return (
    <div className="h-screen flex bg-gray-950 overflow-hidden">
      {/* Dark Sidebar */}
      <div className="w-60 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-gray-800">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-none">DSS Flow</p>
            <p className="text-indigo-400 text-[10px] font-medium mt-0.5 uppercase tracking-wider">Super Admin</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">
          {adminNav.map(group => (
            <div key={group.section}>
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-widest px-2 mb-1.5">
                {group.section}
              </p>
              <div className="space-y-0.5">
                {group.items.map(item => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={`flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${
                        active
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Back to CRM + User */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" />
            Back to CRM
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-500 hover:text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
          <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-gray-300 text-xs font-medium truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-gray-600 text-[10px] truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-indigo-600 font-medium">Super Admin</span>
            <ChevronRight className="w-3 h-3" />
            <span className="capitalize text-gray-700 font-medium">
              {location.pathname.split('/admin/')[1]?.replace(/-/g, ' ') || 'Overview'}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
