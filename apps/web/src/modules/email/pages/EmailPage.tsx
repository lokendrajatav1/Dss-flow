import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Inbox as InboxIcon, Archive as Drafts, Send, Trash2, AlertOctagon } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '@/lib/api';
import { EmailAccount, EmailMessage } from '../types';
import { EmailSidebar } from '../components/EmailSidebar';
import { EmailList, AdvancedSearchFilters } from '../components/EmailList';
import { EmailReader } from '../components/EmailReader';
import { AddAccountModal } from '../components/AddAccountModal';
import { ComposeModal } from '../components/ComposeModal';
import { ManageAccountsModal } from '../components/ManageAccountsModal';

export function EmailPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [accounts, setAccounts] = useState<EmailAccount[]>([]);
    const [messages, setMessages] = useState<EmailMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState('inbox');
    const [selectedAccount, setSelectedAccount] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalMessages, setTotalMessages] = useState(0);
    const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedSearchFilters | null>(null);
    const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
    const [draftsCount, setDraftsCount] = useState(0);

    // Modals state
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [composeInitialData, setComposeInitialData] = useState<any>({});

    const folders = [
        { name: 'inbox', label: 'Inbox', icon: InboxIcon, color: 'text-blue-500' },
        { name: 'sent', label: 'Sent', icon: Send, color: 'text-green-500' },
        { name: 'drafts', label: 'Drafts', icon: Drafts, color: 'text-orange-500' },
        { name: 'spam', label: 'Spam', icon: AlertOctagon, color: 'text-yellow-600' },
        { name: 'trash', label: 'Trash', icon: Trash2, color: 'text-red-500' },
    ];

    useEffect(() => {
        fetchAccounts();
    }, []);

    useEffect(() => {
        const composeTo = searchParams.get('composeTo');
        if (composeTo) {
            setComposeInitialData({ to: [composeTo] });
            setIsComposeOpen(true);
            // Optionally remove the query param so it doesn't re-open on refresh
            searchParams.delete('composeTo');
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    // Replaced by unreadCount from API response

    useEffect(() => {
        fetchMessages();
    }, [selectedFolder, selectedAccount, currentPage]); // Added currentPage here

    const fetchAccounts = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get('/email/accounts', { headers: { Authorization: `Bearer ${token}` } });
            setAccounts(res.data);
        } catch (err) {
            console.error('Failed to fetch email accounts', err);
        }
    };

    const fetchMessages = async (filtersOverride?: AdvancedSearchFilters | null, isBackground = false) => {
        try {
            if (!isBackground) setMessagesLoading(true);
            const token = localStorage.getItem('token');
            
            const activeFilters = filtersOverride !== undefined ? filtersOverride : advancedFilters;
            const actualFolder = activeFilters?.folder === 'all' && searchQuery ? 'all' : selectedFolder;

            const params: any = { folder: actualFolder, page: currentPage, pageSize: 20 };
            if (selectedAccount !== 'all') params.accountId = selectedAccount;
            if (searchQuery) {
                params.search = searchQuery;
                if (activeFilters) {
                    params.dateRange = activeFilters.dateRange;
                    params.searchIn = JSON.stringify(activeFilters.searchIn);
                }
            }

            const res = await api.get('/email/messages', { headers: { Authorization: `Bearer ${token}` }, params });
            setMessages(res.data.messages);
            setTotalPages(res.data.totalPages);
            setTotalMessages(res.data.total);
            if (actualFolder === 'drafts') {
                setDraftsCount(res.data.total);
            }
            if (actualFolder === 'inbox') {
                setInboxUnreadCount(res.data.unreadCount);
            }
        } catch (err) {
            console.error('Failed to fetch messages', err);
        } finally {
            if (!isBackground) setMessagesLoading(false);
        }
    };

    const handleRefresh = async (isBackground = false) => {
        try {
            if (!isBackground) setMessagesLoading(true);
            const token = localStorage.getItem('token');
            const accountsToSync = selectedAccount === 'all' ? accounts : accounts.filter(a => a.id === selectedAccount);
            
            // Trigger IMAP sync for supported accounts
            for (const acc of accountsToSync) {
                if (acc.provider === 'gmail' || acc.provider === 'other') {
                    try {
                        await api.post(`/email/accounts/${acc.id}/sync`, {}, { headers: { Authorization: `Bearer ${token}` } });
                    } catch (syncErr) {
                        console.error(`Sync failed for account ${acc.id}`, syncErr);
                    }
                }
            }
        } finally {
            // After sync attempts (successful or not), fetch the messages from DB
            await fetchMessages(undefined, isBackground);
        }
    };

    // Auto-refresh emails in the background every 1 minute
    useEffect(() => {
        const timer = setInterval(() => {
            if (accounts.length > 0) {
                handleRefresh(true);
            }
        }, 60000); // 60 seconds
        return () => clearInterval(timer);
    }, [accounts, selectedAccount, currentPage, selectedFolder, searchQuery]);

    const handleMarkRead = async (id: string, readStatus: boolean = true) => {
        try {
            const token = localStorage.getItem('token');
            const msg = messages.find(m => m.id === id);
            await api.patch(`/email/messages/${id}/read`, { read: readStatus }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, read: readStatus } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, read: readStatus });
            }
            if (msg && msg.folder === 'inbox' && msg.read !== readStatus) {
                setInboxUnreadCount(prev => readStatus ? Math.max(0, prev - 1) : prev + 1);
            }
        } catch (err) {
            console.error('Failed to mark read', err);
        }
    };

    const handleToggleStar = async (id: string, currentStarred: boolean) => {
        try {
            const token = localStorage.getItem('token');
            await api.patch(`/email/messages/${id}/star`, { starred: !currentStarred }, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, starred: !currentStarred } : m));
            if (selectedMessage?.id === id) {
                setSelectedMessage({ ...selectedMessage, starred: !currentStarred });
            }
        } catch (err) {
            console.error('Failed to toggle star', err);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const msg = messages.find(m => m.id === id);
            await api.delete(`/email/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessage?.id === id) {
                setSelectedMessage(null);
            }
            if (msg && msg.folder === 'inbox' && !msg.read) {
                setInboxUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Failed to delete message', err);
        }
    };

    const handleMoveFolder = async (id: string, folder: string) => {
        try {
            const token = localStorage.getItem('token');
            const msg = messages.find(m => m.id === id);
            await api.patch(`/email/messages/${id}/folder`, { folder }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (selectedFolder !== folder) {
                setMessages(prev => prev.filter(m => m.id !== id));
                if (selectedMessage?.id === id) {
                    setSelectedMessage(null);
                }
            } else {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, folder } : m));
            }
            
            if (msg && !msg.read) {
                if (msg.folder === 'inbox' && folder !== 'inbox') {
                    setInboxUnreadCount(prev => Math.max(0, prev - 1));
                } else if (msg.folder !== 'inbox' && folder === 'inbox') {
                    setInboxUnreadCount(prev => prev + 1);
                }
            }
            
            Swal.fire({
                title: 'Moved!',
                text: `Email moved to ${folder}.`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error(`Failed to move message to ${folder}`, err);
            Swal.fire('Error', `Failed to move email to ${folder}.`, 'error');
        }
    };

    const handleBulkAction = async (action: 'read' | 'unread' | 'spam' | 'inbox' | 'delete', messageIds: string[]) => {
        if (messageIds.length === 0) return;

        // If deleting from trash, ask for confirmation
        if (action === 'delete' && selectedFolder === 'trash') {
            const result = await Swal.fire({
                title: 'Permanently Delete?',
                text: `This will permanently delete ${messageIds.length} email(s). This cannot be undone.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes, delete permanently!'
            });
            if (!result.isConfirmed) return;
        }

        try {
            const token = localStorage.getItem('token');
            const promises = messageIds.map(id => {
                if (action === 'read') return api.patch(`/email/messages/${id}/read`, { read: true }, { headers: { Authorization: `Bearer ${token}` } });
                if (action === 'unread') return api.patch(`/email/messages/${id}/read`, { read: false }, { headers: { Authorization: `Bearer ${token}` } });
                if (action === 'spam') return api.patch(`/email/messages/${id}/folder`, { folder: 'spam' }, { headers: { Authorization: `Bearer ${token}` } });
                if (action === 'inbox') return api.patch(`/email/messages/${id}/folder`, { folder: 'inbox' }, { headers: { Authorization: `Bearer ${token}` } });
                if (action === 'delete') {
                    if (selectedFolder === 'trash') {
                        return api.delete(`/email/messages/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                    } else {
                        return api.patch(`/email/messages/${id}/folder`, { folder: 'trash' }, { headers: { Authorization: `Bearer ${token}` } });
                    }
                }
            });
            await Promise.all(promises);

            if (action === 'delete' || (action === 'spam' && selectedFolder !== 'spam') || (action === 'inbox' && selectedFolder !== 'inbox')) {
                let unreadRemoved = 0;
                let unreadAdded = 0;
                messages.forEach(m => {
                    if (messageIds.includes(m.id)) {
                        if (!m.read && m.folder === 'inbox') unreadRemoved++;
                        if (!m.read && action === 'inbox') unreadAdded++;
                    }
                });

                setMessages(prev => prev.filter(m => !messageIds.includes(m.id)));
                
                if (unreadRemoved > 0) setInboxUnreadCount(prev => Math.max(0, prev - unreadRemoved));
                if (unreadAdded > 0) setInboxUnreadCount(prev => prev + unreadAdded);

                if (selectedMessage && messageIds.includes(selectedMessage.id)) {
                    setSelectedMessage(null);
                }
            } else if (action === 'read' || action === 'unread') {
                const readStatus = action === 'read';
                let changedCount = 0;
                messages.forEach(m => {
                    if (messageIds.includes(m.id) && m.folder === 'inbox' && m.read !== readStatus) {
                        changedCount++;
                    }
                });
                
                setMessages(prev => prev.map(m => {
                    if (messageIds.includes(m.id)) {
                        return { ...m, read: readStatus };
                    }
                    return m;
                }));
                
                if (changedCount > 0) {
                    setInboxUnreadCount(prev => readStatus ? Math.max(0, prev - changedCount) : prev + changedCount);
                }
                if (selectedMessage && messageIds.includes(selectedMessage.id)) {
                    setSelectedMessage({ ...selectedMessage, read: readStatus });
                }
            }
            
            Swal.fire({
                title: 'Success!',
                text: action === 'delete' && selectedFolder !== 'trash' 
                    ? `Moved ${messageIds.length} email(s) to trash.` 
                    : `Applied action to ${messageIds.length} email(s).`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Failed bulk action', err);
            Swal.fire('Error', 'Bulk action failed.', 'error');
        }
    };

    const handleEmptyTrash = async () => {
        const result = await Swal.fire({
            title: 'Empty Trash?',
            text: 'All messages in the trash will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, empty it!'
        });
        
        if (!result.isConfirmed) return;
        
        try {
            const token = localStorage.getItem('token');
            const accountParam = selectedAccount !== 'all' ? `?accountId=${selectedAccount}` : '';
            await api.delete(`/email/messages/trash/empty${accountParam}`, { headers: { Authorization: `Bearer ${token}` } });
            
            setMessages([]);
            setSelectedMessage(null);
            setTotalPages(1);
            setTotalMessages(0);
            
            Swal.fire({
                title: 'Success!',
                text: 'Trash has been emptied.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Failed to empty trash', err);
            Swal.fire('Error', 'Failed to empty trash.', 'error');
        }
    };

    const handleAddAccount = async (accountData: any) => {
        const token = localStorage.getItem('token');
        try {
            await api.post('/email/accounts', accountData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            await fetchAccounts();
            setIsAddModalOpen(false);
            setIsManageModalOpen(true); // Re-open manage modal after success
            Swal.fire('Success', 'Account added successfully!', 'success');
        } catch (err: any) {
            console.error('Failed to add account', err);
            Swal.fire('Error', err.response?.data?.message || 'Failed to add account. Check your credentials.', 'error');
        }
    };

    const handleDeleteAccount = async (id: string) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'All synced emails will be deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, remove it!'
        });
        
        if (!result.isConfirmed) return;
        
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/email/accounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (selectedAccount === id) {
                setSelectedAccount('all');
            }
            await fetchAccounts();
            Swal.fire('Deleted!', 'Account has been removed.', 'success');
        } catch (err: any) {
            console.error('Failed to delete account', err);
            Swal.fire('Error', 'Failed to delete account.', 'error');
        }
    };

    const handleSendEmail = async (composeData: any) => {
        const token = localStorage.getItem('token');
        try {
            await api.post('/email/send', composeData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsComposeOpen(false);
            setComposeInitialData({});
            Swal.fire({
                icon: 'success',
                title: 'Sent!',
                text: 'Email sent successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            fetchMessages(); // Refresh messages to show the sent one
        } catch (err) {
            console.error('Failed to send email', err);
            Swal.fire('Error', 'Failed to send email. Check your account credentials.', 'error');
        }
    };

    const handleSaveDraft = async (composeData: any) => {
        const token = localStorage.getItem('token');
        try {
            const selectedAcc = accounts.find(a => a.id === composeData.emailAccountId);
            // Using createMessage endpoint with folder 'drafts'
            const draftData = {
                ...composeData,
                from: selectedAcc?.email || '',
                fromName: '',
                to: composeData.to ? composeData.to.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                cc: composeData.cc ? composeData.cc.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                bcc: composeData.bcc ? composeData.bcc.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
                body: composeData.html || composeData.text || '',
                snippet: (composeData.text || composeData.html || '').replace(/<[^>]*>?/gm, '').substring(0, 100),
                folder: 'drafts',
                direction: 'outbound',
                read: true,
                starred: false
            };

            await api.post('/email/messages', draftData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire({
                icon: 'success',
                title: 'Saved',
                text: 'Draft saved successfully!',
                timer: 2000,
                showConfirmButton: false
            });
            fetchMessages();
        } catch (err) {
            console.error('Failed to save draft', err);
            Swal.fire('Error', 'Failed to save draft.', 'error');
        }
    };

    const openReply = (msg: EmailMessage) => {
        setComposeInitialData({
            to: msg.from,
            subject: msg.subject.startsWith('Re:') ? msg.subject : `Re: ${msg.subject}`,
            emailAccountId: msg.emailAccountId
        });
        setIsComposeOpen(true);
    };

    return (
        <>
            <div className="flex h-[calc(100vh-4rem)] -m-4 sm:-m-6 lg:-m-8 bg-white overflow-hidden shadow-sm border border-gray-200 relative">
                {/* Mobile Sidebar Overlay */}
                {isMobileSidebarOpen && (
                    <div 
                        className="absolute inset-0 bg-gray-900/50 z-40 lg:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}
                
                <EmailSidebar
                    className={`absolute lg:relative z-50 lg:z-auto h-full transform transition-transform duration-300 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                    folders={folders}
                    accounts={accounts}
                    selectedFolder={selectedFolder}
                    selectedAccount={selectedAccount}
                    onSelectFolder={(folder) => { setSelectedFolder(folder); setCurrentPage(1); setSelectedMessage(null); setIsMobileSidebarOpen(false); }}
                    onSelectAccount={(accountId) => { setSelectedAccount(accountId); setCurrentPage(1); setSelectedMessage(null); setIsMobileSidebarOpen(false); }}
                    onComposeClick={() => { setComposeInitialData({ emailAccountId: selectedAccount !== 'all' ? selectedAccount : undefined }); setIsComposeOpen(true); setIsMobileSidebarOpen(false); }}
                    onManageAccountsClick={() => { setIsManageModalOpen(true); setIsMobileSidebarOpen(false); }}
                    onRefresh={handleRefresh}
                    isRefreshing={messagesLoading}
                    counts={{ inbox: inboxUnreadCount, drafts: draftsCount }}
                />

                <EmailList
                    className={`${selectedMessage ? 'hidden md:flex' : 'flex'}`}
                    messages={messages}
                    messagesLoading={messagesLoading}
                    selectedFolder={selectedFolder}
                    selectedMessage={selectedMessage}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSearch={(filters) => { 
                        if (filters) setAdvancedFilters(filters);
                        setCurrentPage(1); 
                        fetchMessages(filters); 
                    }}
                    onSelectMessage={(msg) => {
                        if (msg.folder === 'drafts') {
                            setComposeInitialData({
                                emailAccountId: msg.emailAccountId,
                                to: Array.isArray(msg.to) ? msg.to.join(', ') : msg.to,
                                cc: Array.isArray(msg.cc) ? msg.cc.join(', ') : msg.cc,
                                bcc: Array.isArray(msg.bcc) ? msg.bcc.join(', ') : msg.bcc,
                                subject: msg.subject,
                                text: msg.snippet || '',
                                html: msg.body || ''
                            });
                            setIsComposeOpen(true);
                            setSelectedMessage(null);
                        } else {
                            setSelectedMessage(msg);
                            if (!msg.read) handleMarkRead(msg.id);
                        }
                    }}
                    onRefresh={handleRefresh}
                    onPageChange={(page) => setCurrentPage(page)}
                    onBulkAction={handleBulkAction}
                    onToggleStar={handleToggleStar}
                    onEmptyTrash={handleEmptyTrash}
                    onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                    onComposeClick={() => { setComposeInitialData({ emailAccountId: selectedAccount !== 'all' ? selectedAccount : undefined }); setIsComposeOpen(true); setIsMobileSidebarOpen(false); }}
                />

                <EmailReader
                    className={`${selectedMessage ? 'flex' : 'hidden md:flex'}`}
                    message={selectedMessage}
                    onToggleStar={handleToggleStar}
                    onToggleRead={(id, currentRead) => handleMarkRead(id, !currentRead)}
                    onDelete={handleDelete}
                    onReply={openReply}
                    onMoveFolder={handleMoveFolder}
                    onBack={() => setSelectedMessage(null)}
                />
            </div>

            <AddAccountModal
                isOpen={isAddModalOpen}
                onClose={() => { 
                    setIsAddModalOpen(false);
                    setIsManageModalOpen(true); // Return to manage modal on cancel
                }}
                onConnect={handleAddAccount}
            />

            <ManageAccountsModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                accounts={accounts}
                onConnectNew={() => {
                    setIsManageModalOpen(false);
                    setIsAddModalOpen(true);
                }}
                onDeleteAccount={handleDeleteAccount}
            />

            <ComposeModal
                isOpen={isComposeOpen}
                onClose={() => setIsComposeOpen(false)}
                accounts={accounts}
                initialData={composeInitialData}
                onSend={handleSendEmail}
                onSaveDraft={handleSaveDraft}
            />
        </>
    );
}
