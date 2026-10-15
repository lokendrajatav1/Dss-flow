import { Mail, Trash2, Plus, Settings } from 'lucide-react';
import { EmailAccount } from '../types';

interface ManageAccountsModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: EmailAccount[];
    onConnectNew: () => void;
    onDeleteAccount: (id: string) => void;
}

export function ManageAccountsModal({ isOpen, onClose, accounts, onConnectNew, onDeleteAccount }: ManageAccountsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Email Accounts</h2>
                        <p className="text-sm text-gray-500 mt-1">Connect and manage your email accounts for syncing.</p>
                    </div>
                    <button
                        onClick={onConnectNew}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Connect Account
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    {accounts.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No email accounts connected yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Connect your Gmail or Outlook to start syncing.</p>
                        </div>
                    ) : (
                        <div className="space-y-4 mt-2">
                            {accounts.map(account => (
                                <div key={account.id} className="flex items-center justify-between p-5 border border-gray-100 rounded-2xl hover:border-indigo-100 hover:shadow-sm transition-all bg-white">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3.5 rounded-xl flex items-center justify-center ${account.provider === 'gmail' ? 'bg-red-50 text-red-500' : account.provider === 'outlook' ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-600'}`}>
                                            {account.provider === 'gmail' ? (
                                                <img src="https://www.vectorlogo.zone/logos/google_gmail/google_gmail-icon.svg" alt="Gmail" className="w-6 h-6" />
                                            ) : account.provider === 'outlook' ? (
                                                <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook" className="w-6 h-6" />
                                            ) : (
                                                <Mail className="w-6 h-6" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{account.email}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-2 h-2 rounded-full ${account.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                <span className="text-xs text-gray-500 capitalize">{account.status} • {account.provider}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDeleteAccount(account.id)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Disconnect
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-5 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
