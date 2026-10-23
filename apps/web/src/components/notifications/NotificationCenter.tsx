import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  RotateCw, 
  UserPlus, 
  CheckSquare, 
  Briefcase, 
  Clock, 
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { FaFacebook } from 'react-icons/fa';
import api from '@/lib/api';

export interface NotificationItem {
  id: string;
  type: 'lead' | 'task' | 'deal' | 'call';
  title: string;
  message: string;
  link: string;
  createdAt: string | Date;
  metadata?: Record<string, any>;
}

const formatTimeAgo = (dateStr: string | Date) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSec < 60) return 'Just now';
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)}m ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)}h ago`;
  if (diffInSec < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export function NotificationCenter() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'lead' | 'task' | 'deal'>('all');
  
  // Track read notification IDs in localStorage for persistence
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('dssflow_read_notifications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for new alerts
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle clicking outside to close popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !readIds.includes(n.id)).length;

  const markAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id];
      setReadIds(updated);
      try {
        localStorage.setItem('dssflow_read_notifications', JSON.stringify(updated.slice(-200)));
      } catch (e) {}
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...readIds, ...allIds]));
    setReadIds(updated);
    try {
      localStorage.setItem('dssflow_read_notifications', JSON.stringify(updated.slice(-200)));
    } catch (e) {}
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (item.link) {
      navigate(item.link);
    }
  };

  const filteredNotifications = notifications.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === activeFilter;
  });

  const renderIcon = (item: NotificationItem) => {
    const source = (item.metadata?.source || '').toLowerCase();

    if (source.includes('facebook') || source.includes('meta')) {
      return (
        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FaFacebook className="w-4 h-4" />
        </div>
      );
    }

    if (source.includes('sheet')) {
      return (
        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" 
            alt="Google Sheets" 
            className="w-4 h-4 object-contain" 
          />
        </div>
      );
    }

    switch (item.type) {
      case 'lead':
        return (
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      case 'task':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-4 h-4" />
          </div>
        );
      case 'deal':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-xs"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white shadow-xs animate-in zoom-in">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] sm:w-[420px] bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-50 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchNotifications()}
                className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-[#007bff] hover:text-[#0056b3] font-medium flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-gray-100 px-4 bg-gray-50/50 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`py-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('lead')}
              className={`py-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
                activeFilter === 'lead'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveFilter('task')}
              className={`py-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
                activeFilter === 'task'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveFilter('deal')}
              className={`py-2 px-3 font-medium border-b-2 transition-colors cursor-pointer ${
                activeFilter === 'deal'
                  ? 'border-[#007bff] text-[#007bff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Deals
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-6 h-6 stroke-[1.5]" />
                </div>
                <p className="text-sm font-semibold text-gray-800">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">
                  You are all caught up! New leads and alerts will appear here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isRead = readIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isRead ? 'bg-white hover:bg-gray-50' : 'bg-blue-50/30 hover:bg-blue-50/60'
                    }`}
                  >
                    {renderIcon(item)}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-semibold truncate ${isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                          {item.title}
                        </p>
                        <span className="text-[11px] text-gray-400 shrink-0 font-medium">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>

                    {!isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#007bff] shrink-0 mt-1.5" title="Unread" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Navigation Bar */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-600">
            <button
              onClick={() => { setIsOpen(false); navigate('/lead-manager'); }}
              className="text-[#007bff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Go to Lead Manager <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setIsOpen(false); navigate('/tasks'); }}
              className="text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              View Tasks
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
