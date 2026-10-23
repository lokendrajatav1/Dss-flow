import { useState } from 'react';
import Swal from 'sweetalert2';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  X,
  Target,
  Briefcase,
  BarChart,
  MessageCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  GitBranch,
  FileSignature,
  CreditCard,
  Bot,
  CalendarDays,
  Megaphone,
  Folder,
  Inbox,
  Blocks,
  Package,
  UserPlus,
  Ticket,
  Workflow,
  Receipt,
  Crown,
  ShieldCheck,
  Tag,
  ShoppingCart,
  Store,
  ClipboardCheck,
  Calendar,
  Phone,
  LifeBuoy,
  MessageSquareText,
  Mail,
  PhoneCall,
  LayoutGrid
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDialer } from '@/context/TelephonyContext';
import { WebDialerWidget } from '@/components/dialer/WebDialerWidget';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openDialer, callStatus } = useDialer();

  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your account.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log out!'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  type NavItem = {
    name: string;
    href?: string;
    icon: React.ElementType;
    roles: UserRole[];
    children?: { name: string; href: string; icon?: React.ElementType }[];
  };

  const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'companyadmin', 'employee'] },
    { name: 'Management Hub', href: '/management', icon: LayoutGrid, roles: ['superadmin', 'companyadmin'] },
    {
      name: 'Sales',
      icon: Target,
      roles: ['superadmin', 'companyadmin', 'employee'],
      children: [
        { name: 'Leads', href: '/lead-manager', icon: UserPlus },
        { name: 'Leads Pipelines', href: '/leads-pipelines', icon: GitBranch },
        { name: 'Contacts', href: '/contacts', icon: Users },
        { name: 'Deals', href: '/deals', icon: Briefcase },
        { name: 'Deals Pipelines', href: '/deals-pipelines', icon: Folder },
        { name: 'Groups', href: '/groups', icon: Users },
        { name: 'Funnels', href: '/funnels', icon: Target },
        { name: 'Reminder Calendar', href: '/calendar', icon: CalendarDays },
      ]
    },
    {
      name: 'Inventory',
      icon: Package,
      roles: ['superadmin', 'companyadmin', 'employee'],
      children: [
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Price Books', href: '/price-books', icon: Tag },
        { name: 'Quotes', href: '/quotations', icon: FileText },
        { name: 'Sales Orders', href: '/sales-orders', icon: FileSignature },
        { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart },
        { name: 'Invoices', href: '/invoices', icon: Receipt },
        { name: 'Vendors', href: '/vendors', icon: Store },
      ]
    },
    {
      name: 'Communication',
      icon: MessageCircle,
      roles: ['superadmin', 'companyadmin', 'employee'],
      children: [
        { name: 'Inbox', href: '/inbox', icon: Inbox },
        { name: 'WhatsApp', href: '/whatsapp', icon: MessageCircle },
        { name: 'Email', href: '/email', icon: Mail },
      ]
    },
    {
      name: 'Automations',
      icon: Workflow,
      roles: ['superadmin', 'companyadmin'],
      children: [
        { name: 'Workflows', href: '/workflows', icon: Workflow },
        { name: 'AI Assistant', href: '/ai', icon: Bot },
      ]
    },
    {
      name: 'Activities',
      icon: ClipboardCheck,
      roles: ['superadmin', 'companyadmin', 'employee'],
      children: [
        { name: 'Tasks', href: '/tasks', icon: ClipboardCheck },
        { name: 'Meetings', href: '/meetings', icon: Calendar },
        { name: 'Calls', href: '/calls', icon: Phone },
      ]
    },
    {
      name: 'Support',
      icon: LifeBuoy,
      roles: ['superadmin', 'companyadmin', 'employee'],
      children: [
        { name: 'Cases', href: '/cases', icon: Ticket },
        { name: 'Solutions', href: '/solutions', icon: MessageSquareText },
      ]
    },
    { name: 'Reports', href: '/reports', icon: BarChart, roles: ['superadmin', 'companyadmin'] },
    { name: 'Team & Permissions', href: '/team', icon: Users, roles: ['superadmin', 'companyadmin'] },
    { name: 'Integrations', href: '/integrations', icon: Blocks, roles: ['superadmin', 'companyadmin'] },
    {
      name: 'Settings',
      icon: Settings,
      roles: ['superadmin', 'companyadmin'],
      children: [
        { name: 'Company Profile', href: '/company-profile', icon: Building2 },
        { name: 'Team & Roles', href: '/team', icon: Users },
      ]
    },
  ];

  // Filter navigation by current user's role
  const visibleNav = navigation.filter(item => user && item.roles.includes(user.role));

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-[#1C2434] text-gray-300 border-r border-gray-800 transform transition-all duration-300 ease-in-out lg:static lg:inset-0 flex flex-col relative
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${desktopCollapsed ? 'lg:w-16 w-60' : 'w-60'}
      `}>
        <div className={`flex items-center h-16 border-b border-gray-800 transition-all duration-300 ${desktopCollapsed ? 'justify-center px-0' : 'justify-between px-4'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            {!desktopCollapsed && (
              <span className="text-lg font-bold text-white whitespace-nowrap overflow-hidden transition-all duration-300">
                DSSFlow
              </span>
            )}
          </div>
          {!desktopCollapsed && (
            <button
              className="lg:hidden p-1.5 text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={() => setDesktopCollapsed(!desktopCollapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-[#1C2434] border border-gray-700 rounded-full items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 shadow-sm z-50 transition-colors cursor-pointer"
        >
          {desktopCollapsed ? <ChevronRight className="w-4 h-4 ml-0.5" /> : <ChevronLeft className="w-4 h-4 mr-0.5" />}
        </button>

        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto overflow-x-hidden">
          {visibleNav.map((item) => {
            const Icon = item.icon;

            if (item.children) {
              const isOpen = openDropdowns[item.name];
              const currentFullUrl = location.pathname + location.search;
              const isActive = item.children.some(child => currentFullUrl === child.href || location.pathname === child.href || location.pathname.startsWith(`${child.href.split('?')[0]}/`));

              return (
                <div key={item.name} className="flex flex-col">
                  <button
                    onClick={() => {
                      if (desktopCollapsed) setDesktopCollapsed(false);
                      setOpenDropdowns(prev => ({ ...prev, [item.name]: !prev[item.name] }));
                    }}
                    title={desktopCollapsed ? item.name : undefined}
                    className={`
                      flex items-center justify-between py-2.5 rounded-lg transition-all duration-200 cursor-pointer
                      ${isActive 
                        ? 'text-white font-semibold bg-[#333A48]/50' 
                        : 'text-gray-300 hover:text-white hover:bg-[#333A48]/30 font-medium'
                      }
                      ${desktopCollapsed ? 'justify-center px-0' : 'px-3'}
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Folder className="w-5 h-5 flex-shrink-0 text-indigo-400 fill-indigo-500/80" />
                      {!desktopCollapsed && <span className="truncate whitespace-nowrap text-[15px]">{item.name}</span>}
                    </div>
                    {!desktopCollapsed && (
                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    )}
                  </button>
                  
                  {isOpen && !desktopCollapsed && (
                    <div className="ml-4 pl-3 mt-1 flex flex-col gap-1 border-l border-gray-700/70">
                      {item.children.map(child => {
                        const isChildActive = currentFullUrl === child.href || (location.pathname === child.href.split('?')[0] && !child.href.includes('?'));
                        return (
                          <Link
                            key={child.name}
                            to={child.href}
                            className={`
                              flex items-center gap-2.5 py-2 px-3 text-sm transition-all duration-200 rounded-lg relative
                              ${isChildActive 
                                ? 'bg-[#333A48] text-white font-semibold shadow-sm' 
                                : 'text-slate-300 hover:text-white hover:bg-[#333A48]/60 font-medium'
                              }
                            `}
                          >
                            {child.icon && <child.icon className="w-4 h-4 flex-shrink-0 text-slate-400" />}
                            <span className="truncate">{child.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = item.href && (location.pathname === item.href || location.pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                to={item.href!}
                title={desktopCollapsed ? item.name : undefined}
                className={`
                  flex items-center gap-2.5 py-2.5 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-[#333A48] text-white font-semibold'
                    : 'text-gray-300 hover:bg-[#333A48]/30 hover:text-white font-medium'
                  }
                  ${desktopCollapsed ? 'justify-center px-0' : 'px-3'}
                `}
              >
                <Folder className="w-5 h-5 flex-shrink-0 text-indigo-400 fill-indigo-500/80" />
                {!desktopCollapsed && <span className="truncate whitespace-nowrap text-[15px]">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="w-full p-3 border-t border-gray-800 flex-shrink-0">
          <Link
            to="/admin"
            title={desktopCollapsed ? "Super Admin" : undefined}
            className={`
              flex items-center gap-2.5 py-2.5 mb-1 text-amber-500 hover:bg-[#2a1a5e] hover:text-amber-400 rounded-lg transition-colors font-medium text-sm
              ${desktopCollapsed ? 'justify-center px-0' : 'px-3'}
            `}
          >
            <Crown className="w-4.5 h-4.5 flex-shrink-0 text-amber-500" />
            {!desktopCollapsed && <span className="truncate whitespace-nowrap text-sm">Super Admin</span>}
          </Link>

          <button
            onClick={handleLogout}
            title={desktopCollapsed ? "Logout" : undefined}
            className={`
              w-full flex items-center gap-2.5 py-2.5 text-red-500 hover:bg-[#2a1a5e] hover:text-red-400 rounded-lg transition-colors mt-0.5 text-sm cursor-pointer
              ${desktopCollapsed ? 'justify-center px-0' : 'px-3'}
            `}
          >
            <LogOut className="w-4.5 h-4.5 flex-shrink-0 text-red-500" />
            {!desktopCollapsed && <span className="truncate whitespace-nowrap text-sm">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 sticky top-0 z-30 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:flex max-w-md w-full relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 w-full rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* In-App Web Phone Header Trigger */}
            <button 
              type="button"
              onClick={() => openDialer()}
              className={`relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer shadow-xs ${
                callStatus === 'connected' || callStatus === 'dialing'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 animate-pulse ring-2 ring-emerald-100'
                  : 'border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300'
              }`}
              title="Open In-App Web Phone"
            >
              <PhoneCall className={`w-4 h-4 ${callStatus === 'connected' ? 'text-emerald-600' : 'text-gray-600'}`} />
              {callStatus === 'connected' && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* Real-time In-App Notification Center */}
            <NotificationCenter />

            {/* Subtle Divider */}
            <div className="h-5 w-px bg-gray-200 mx-1" />

            {/* User Profile Pill */}
            <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.name ?? 'User'}&background=007bff&color=fff&bold=true`}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200/80 shadow-xs"
              />
              <div className="hidden md:flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-700">
                  Hi, {user?.name ? user.name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </button>
          </div>
        </header>

        {/* Main scrollable area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Embedded In-App Floating Web Dialer Widget */}
      <WebDialerWidget />
    </div>
  );
}
