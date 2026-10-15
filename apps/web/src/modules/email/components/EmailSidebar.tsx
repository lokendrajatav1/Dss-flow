import { Mail, SquarePen, Settings, RefreshCw } from 'lucide-react';
import { EmailAccount } from '../types';

interface EmailSidebarProps {
    className?: string;
    folders: { name: string; label: string; icon: any; color: string }[];
    accounts: EmailAccount[];
    selectedFolder: string;
    selectedAccount: string;
    onSelectFolder: (folder: string) => void;
    onSelectAccount: (accountId: string) => void;
    onComposeClick: () => void;
    onManageAccountsClick: () => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
    counts?: Record<string, number>;
}

export function EmailSidebar({
    className = '',
    folders,
    accounts,
    selectedFolder,
    selectedAccount,
    onSelectFolder,
    onSelectAccount,
    onComposeClick,
    onManageAccountsClick,
    onRefresh,
    isRefreshing = false,
    counts = {},
}: EmailSidebarProps) {
    return (
        <div className={`w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50/50 flex flex-col ${className}`}>
            <div className="p-4">
                <button
                    onClick={onComposeClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                >
                    <SquarePen className="w-4 h-4" />
                    New Message
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                <div className="px-3 mb-2">

                    <div className="space-y-1">
                        {folders.map(folder => (
                            <div
                                key={folder.name}
                                onClick={() => onSelectFolder(folder.name)}
                                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer group ${selectedFolder === folder.name
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <folder.icon className={`w-4 h-4 ${selectedFolder === folder.name ? 'text-indigo-700' : folder.color}`} />
                                <span className="flex-1 text-left">{folder.label}</span>
                                <div className="flex items-center gap-1.5">
                                    {counts[folder.name] !== undefined && counts[folder.name] > 0 && (
                                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-400/50 px-1.5 text-xs font-medium text-gray-700">
                                            {counts[folder.name]}
                                        </span>
                                    )}
                                    {folder.name === 'inbox' && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                                            className="p-1 hover:bg-indigo-200 rounded text-indigo-600 transition-colors disabled:opacity-50"
                                            title={`Refresh ${folder.label}`}
                                            disabled={isRefreshing && selectedFolder === 'inbox'}
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${(isRefreshing && selectedFolder === 'inbox') ? 'animate-spin' : ''}`} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-3 mt-6 mb-2">
                    <div className="flex items-center justify-between px-2 mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accounts</h3>
                        <button 
                            onClick={onManageAccountsClick} 
                            className="text-gray-400 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-gray-200"
                            title="Manage Accounts"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        <button
                            onClick={() => onSelectAccount('all')}
                            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors ${selectedAccount === 'all'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Mail className="w-4 h-4 text-gray-500" />
                            All Accounts
                        </button>
                        {accounts.map(account => (
                            <button
                                key={account.id}
                                onClick={() => onSelectAccount(account.id)}
                                className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-colors truncate ${selectedAccount === account.id
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Mail className={`w-4 h-4 flex-shrink-0 ${account.status === 'connected' ? 'text-green-500' : 'text-red-500'}`} />
                                <span className="truncate flex-1 text-left">{account.email}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
