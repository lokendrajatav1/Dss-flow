import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Search, SlidersHorizontal, Check, ChevronLeft, ChevronRight, Mail, MailOpen, AlertCircle, Trash2, Star, Inbox, ShieldCheck } from 'lucide-react';
import { EmailMessage } from '../types';

export interface AdvancedSearchFilters {
    dateRange: 'all' | '7days' | '30days';
    folder: 'current' | 'all';
    searchIn: {
        sender: boolean;
        recipient: boolean;
        subject: boolean;
        body: boolean;
    };
}

const formatEmailDate = (dateString: string | Date | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time (e.g., "10:43 AM")
    if (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
    ) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // If this year, show month and day (e.g., "Oct 8")
    if (date.getFullYear() === now.getFullYear()) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // If older, show short date (e.g., "10/8/25")
    return date.toLocaleDateString('en-US', { year: '2-digit', month: 'numeric', day: 'numeric' });
};

interface EmailListProps {
    className?: string;
    messages: EmailMessage[];
    messagesLoading: boolean;
    selectedFolder: string;
    selectedMessage: EmailMessage | null;
    currentPage: number;
    totalPages: number;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onSearch: (filters?: AdvancedSearchFilters) => void;
    onSelectMessage: (msg: EmailMessage) => void;
    onRefresh: () => void;
    onPageChange: (page: number) => void;
    onBulkAction?: (action: 'read' | 'unread' | 'spam' | 'inbox' | 'delete', messageIds: string[]) => void;
    onToggleStar?: (id: string, currentStarred: boolean) => void;
    onEmptyTrash?: () => void;
    onOpenSidebar?: () => void;
    onComposeClick?: () => void;
}

export function EmailList({
    className = '',
    messages,
    messagesLoading,
    selectedFolder,
    selectedMessage,
    currentPage,
    totalPages,
    searchQuery,
    onSearchChange,
    onSearch,
    onSelectMessage,
    onRefresh,
    onPageChange,
    onBulkAction,
    onToggleStar,
    onEmptyTrash,
    onOpenSidebar,
    onComposeClick,
}: EmailListProps) {
    const [showFilters, setShowFilters] = useState(false);
    const [listFilter, setListFilter] = useState<'all' | 'unread' | 'read' | 'starred'>('all');
    const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
    const filterRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState<AdvancedSearchFilters>({
        dateRange: 'all',
        folder: 'current',
        searchIn: { sender: true, recipient: true, subject: true, body: true }
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setShowFilters(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSearchIn = (field: keyof AdvancedSearchFilters['searchIn']) => {
        setFilters(prev => ({
            ...prev,
            searchIn: { ...prev.searchIn, [field]: !prev.searchIn[field] }
        }));
    };

    const handleSearch = () => {
        setShowFilters(false);
        onSearch(filters);
    };

    return (
        <div className={`w-full md:w-[380px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white ${className}`}>
            <div className="p-4 border-b border-gray-200 flex flex-col gap-3 bg-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onOpenSidebar} className="lg:hidden p-1.5 -ml-1.5 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                        </button>
                        <h2 className="font-semibold text-gray-900 capitalize text-lg">{selectedFolder}</h2>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {totalPages > 0 && (
                            <div className="flex items-center gap-1 text-gray-500">
                                <button
                                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs font-medium text-indigo-600 w-8 text-center">{currentPage}/{totalPages}</span>
                                <button
                                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="relative" ref={filterRef}>
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search emails..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-colors ${showFilters ? 'bg-indigo-100 text-indigo-600' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                    </button>

                    {/* Advanced Search Popover */}
                    {showFilters && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-50 p-4 border border-gray-200 text-gray-900">
                            
                            {/* Date Range & Folder */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                <button onClick={() => setFilters({...filters, dateRange: filters.dateRange === '7days' ? 'all' : '7days'})} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border ${filters.dateRange === '7days' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                    {filters.dateRange === '7days' && <Check className="w-3 h-3" />} Last 7 days
                                </button>
                                <button onClick={() => setFilters({...filters, dateRange: filters.dateRange === '30days' ? 'all' : '30days'})} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border ${filters.dateRange === '30days' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                    {filters.dateRange === '30days' && <Check className="w-3 h-3" />} Last 30 days
                                </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-5">
                                <button onClick={() => setFilters({...filters, folder: 'current'})} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border ${filters.folder === 'current' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                    {filters.folder === 'current' && <Check className="w-3 h-3" />} {selectedFolder}
                                </button>
                                <button onClick={() => setFilters({...filters, folder: 'all'})} className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors border ${filters.folder === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                                    {filters.folder === 'all' && <Check className="w-3 h-3" />} All folders
                                </button>
                            </div>

                            {/* Search In */}
                            <div className="mb-2">
                                <span className="text-sm font-semibold text-gray-900">Search in:</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                {Object.entries(filters.searchIn).map(([key, value]) => (
                                    <label key={key} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${value ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white group-hover:border-gray-400'}`}>
                                            {value && <Check className="w-3 h-3 text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={value} onChange={() => toggleSearchIn(key as keyof AdvancedSearchFilters['searchIn'])} />
                                        <span className="text-sm text-gray-700 capitalize">{key}</span>
                                    </label>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    onClick={handleSearch}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Search
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {selectedFolder === 'trash' && messages.length > 0 && (
                <div className="bg-gray-100 text-gray-700 text-[13px] px-4 py-3 flex justify-between items-center flex-shrink-0 border-b border-gray-200">
                    <span>Messages that have been in Trash more than 30 days will be automatically deleted.</span>
                    <button onClick={onEmptyTrash} className="text-indigo-600 font-medium hover:text-indigo-700 transition-colors whitespace-nowrap ml-4">
                        Empty trash now
                    </button>
                </div>
            )}

            {/* Filter Pills Toolbar */}
            <div className="px-4 py-2 border-b border-gray-200 bg-white flex items-center gap-2 flex-wrap min-h-[48px]">
                <div className="flex items-center gap-1 mr-2 text-gray-500">
                    <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                        checked={selectedMessageIds.length > 0 && selectedMessageIds.length === messages.filter(msg => {
                            if (listFilter === 'unread') return !msg.read;
                            if (listFilter === 'read') return msg.read;
                            if (listFilter === 'starred') return msg.starred;
                            return true;
                        }).length}
                        onChange={(e) => {
                            if (e.target.checked) {
                                setSelectedMessageIds(messages.filter(msg => {
                                    if (listFilter === 'unread') return !msg.read;
                                    if (listFilter === 'read') return msg.read;
                                    if (listFilter === 'starred') return msg.starred;
                                    return true;
                                }).map(m => m.id));
                            } else {
                                setSelectedMessageIds([]);
                            }
                        }}
                    />
                </div>
                
                {selectedMessageIds.length > 0 ? (
                    <div className="flex items-center gap-2 ml-2 text-gray-700">
                        <button onClick={() => { onBulkAction?.('unread', selectedMessageIds); setSelectedMessageIds([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative">
                            <div className="relative">
                                <Mail className="w-4 h-4" />
                                <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gray-700 rounded-full border border-white"></div>
                            </div>
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Mark as unread
                            </div>
                        </button>
                        {selectedFolder === 'trash' ? (
                            <button onClick={() => { onBulkAction?.('inbox', selectedMessageIds); setSelectedMessageIds([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative">
                                <Inbox className="w-4 h-4" />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Move to inbox
                                </div>
                            </button>
                        ) : selectedFolder === 'spam' ? (
                            <button onClick={() => { onBulkAction?.('inbox', selectedMessageIds); setSelectedMessageIds([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative">
                                <ShieldCheck className="w-4 h-4" />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Not spam
                                </div>
                            </button>
                        ) : (
                            <button onClick={() => { onBulkAction?.('spam', selectedMessageIds); setSelectedMessageIds([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative">
                                <AlertCircle className="w-4 h-4" />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Report spam
                                </div>
                            </button>
                        )}
                        <button onClick={() => { onBulkAction?.('delete', selectedMessageIds); setSelectedMessageIds([]); }} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors group relative">
                            <Trash2 className="w-4 h-4" />
                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                Delete
                            </div>
                        </button>
                        <span className="text-xs text-gray-500 ml-2">{selectedMessageIds.length} selected</span>
                    </div>
                ) : (
                    <>
                        <button 
                            onClick={() => setListFilter('all')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${listFilter === 'all' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            All mail
                        </button>
                        <button 
                            onClick={() => setListFilter('unread')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${listFilter === 'unread' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Unread
                        </button>
                        <button 
                            onClick={() => setListFilter('read')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${listFilter === 'read' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Read
                        </button>
                        <button 
                            onClick={() => setListFilter('starred')}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${listFilter === 'starred' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            Starred
                        </button>
                    </>
                )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {messagesLoading ? (
                    <div className="p-8 text-center text-sm text-gray-500">Loading messages...</div>
                ) : messages.filter(msg => {
                    if (listFilter === 'unread') return !msg.read;
                    if (listFilter === 'read') return msg.read;
                    if (listFilter === 'starred') return msg.starred;
                    return true;
                }).length === 0 ? (
                    selectedFolder === 'drafts' ? (
                        <div className="flex flex-col items-center justify-center p-12 h-full min-h-[300px]">
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                                <Mail className="w-8 h-8 text-gray-500" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-1.5">No Messages Here</h4>
                            <p className="text-sm text-gray-500 mb-8">You don't have any saved drafts</p>
                            <button 
                                onClick={onComposeClick} 
                                className="px-6 py-2.5 border border-gray-200 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                            >
                                Create first email
                            </button>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-gray-500">No messages found</div>
                    )
                ) : (
                    messages.filter(msg => {
                        if (listFilter === 'unread') return !msg.read;
                        if (listFilter === 'read') return msg.read;
                        if (listFilter === 'starred') return msg.starred;
                        return true;
                    }).map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => onSelectMessage(msg)}
                            className={`px-4 py-2 cursor-pointer transition-colors relative flex gap-3 group ${selectedMessage?.id === msg.id ? 'bg-indigo-50' : 'hover:bg-gray-50'} ${!msg.read && selectedMessage?.id !== msg.id ? 'bg-blue-50/20' : ''}`}
                        >
                            <div className="flex flex-col items-center justify-start pt-1" onClick={(e) => e.stopPropagation()}>
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                    checked={selectedMessageIds.includes(msg.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) setSelectedMessageIds(prev => [...prev, msg.id]);
                                        else setSelectedMessageIds(prev => prev.filter(id => id !== msg.id));
                                    }}
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                {selectedMessage?.id === msg.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />
                                )}
                                <div className="flex justify-between items-center mb-0.5 relative">
                                    <span className={`text-sm truncate pr-2 ${!msg.read ? 'font-bold text-gray-900' : 'font-medium text-gray-800'}`}>
                                        {selectedFolder === 'sent' || msg.direction === 'outbound' 
                                            ? (Array.isArray(msg.to) ? msg.to.join(', ') : msg.to)
                                            : (msg.fromName || msg.from)}
                                    </span>
                                    
                                    {/* Default Date (Fades out on Hover) */}
                                    <div className="flex items-center gap-2 group-hover:opacity-0 transition-opacity flex-shrink-0">
                                        {!msg.read && <div className="w-2 h-2 bg-indigo-600 rounded-full" title="Unread"></div>}
                                        <span className="text-xs text-gray-500 font-medium">
                                            {formatEmailDate(msg.receivedAt)}
                                        </span>
                                        {msg.starred && <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />}
                                    </div>
                                    
                                    {/* Action Icons (Fades in on Hover, Positioned Absolute to avoid layout shift) */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        <button onClick={() => onBulkAction?.(msg.read ? 'unread' : 'read', [msg.id])} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors bg-white/80 group/actionBtn relative">
                                            {msg.read ? (
                                                <div className="relative">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-gray-700 rounded-full border border-white"></div>
                                                </div>
                                            ) : (
                                                <MailOpen className="w-3.5 h-3.5" />
                                            )}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover/actionBtn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {msg.read ? "Mark as unread" : "Mark as read"}
                                            </div>
                                        </button>
                                        {selectedFolder === 'trash' ? (
                                            <button onClick={() => onBulkAction?.('inbox', [msg.id])} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors bg-white/80 group/actionBtn relative">
                                                <Inbox className="w-3.5 h-3.5" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover/actionBtn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    Move to inbox
                                                </div>
                                            </button>
                                        ) : selectedFolder === 'spam' ? (
                                            <button onClick={() => onBulkAction?.('inbox', [msg.id])} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors bg-white/80 group/actionBtn relative">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover/actionBtn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    Not spam
                                                </div>
                                            </button>
                                        ) : (
                                            <button onClick={() => onBulkAction?.('spam', [msg.id])} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors bg-white/80 group/actionBtn relative">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover/actionBtn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                    Report spam
                                                </div>
                                            </button>
                                        )}
                                        <button onClick={() => onBulkAction?.('delete', [msg.id])} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors bg-white/80 group/actionBtn relative">
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover/actionBtn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                Delete
                                            </div>
                                        </button>
                                        <button onClick={() => onToggleStar?.(msg.id, msg.starred)} className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700 transition-colors bg-white/80 group/actionBtn relative">
                                            <Star className={`w-3.5 h-3.5 ${msg.starred ? 'text-yellow-500 fill-yellow-500' : ''}`} />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover/actionBtn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {msg.starred ? "Unstar" : "Star"}
                                            </div>
                                        </button>
                                    </div>
                                </div>
                                <div className={`text-[13px] truncate mb-0.5 pr-4 ${!msg.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {msg.subject}
                                </div>
                                <div className="text-[12px] text-gray-500 truncate">
                                    {msg.snippet?.replace(/<[^>]*>?/gm, '')?.replace(/&nbsp;/g, ' ')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
