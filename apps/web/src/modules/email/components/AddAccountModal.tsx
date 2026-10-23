import { useState } from 'react';
import { Mail, Settings2, ChevronDown } from 'lucide-react';

interface AddAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (accountData: any) => void;
}

export function AddAccountModal({ isOpen, onClose, onConnect }: AddAccountModalProps) {
    const [provider, setProvider] = useState<'gmail' | 'outlook' | 'other'>('gmail');
    const [showAdvanced, setShowAdvanced] = useState(false);

    if (!isOpen) return null;

    const handleConnect = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const email = (formData.get('email') as string)?.trim() || '';
        const accessToken = (formData.get('accessToken') as string)?.trim() || '';

        onConnect({
            provider: provider,
            email: email,
            accessToken: accessToken,
            refreshToken: (formData.get('refreshToken') as string)?.trim() || '',
            imapHost: (formData.get('imapHost') as string)?.trim() || '',
            smtpHost: (formData.get('smtpHost') as string)?.trim() || '',
            syncEnabled: formData.get('syncEnabled') === 'on' || true,
            syncInterval: parseInt(formData.get('syncInterval') as string) || 300,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 transition-all duration-300">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="text-center mb-5">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Connect your email</h2>
                    <p className="text-xs text-gray-500 mt-1">Select your email provider to securely connect your inbox.</p>
                </div>

                <form onSubmit={handleConnect} className="space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setProvider('gmail')}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'gmail' ? 'border-blue-500 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className={`text-sm font-medium ${provider === 'gmail' ? 'text-blue-700' : 'text-gray-700'}`}>Gmail</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setProvider('outlook')}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'outlook' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <Mail className="w-4 h-4 text-blue-700" />
                            </div>
                            <span className={`text-sm font-medium ${provider === 'outlook' ? 'text-blue-700' : 'text-gray-700'}`}>Outlook</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setProvider('other')}
                            className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${provider === 'other' ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                        >
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Settings2 className="w-5 h-5 text-gray-600" />
                            </div>
                            <span className={`text-xs font-medium text-center leading-tight ${provider === 'other' ? 'text-indigo-700' : 'text-gray-700'}`}>Other<br/>(IMAP)</span>
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder={provider === 'gmail' ? 'you@gmail.com' : provider === 'outlook' ? 'you@outlook.com' : 'you@company.com'}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            {provider === 'gmail' ? 'Google App Password (16-digits)' : 'Email Password'}
                        </label>
                        <input
                            name="accessToken"
                            type="password"
                            required
                            placeholder={provider === 'gmail' ? 'abcd efgh ijkl mnop' : 'Your password'}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {provider === 'gmail' && (
                            <p className="text-[10px] text-gray-500 mt-1">
                                Note: Normal Gmail passwords are not supported. Please generate an "App Password" from your Google Account Security settings.
                            </p>
                        )}
                    </div>

                    {provider === 'other' && (
                        <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">IMAP Host</label>
                                <input
                                    name="imapHost"
                                    type="text"
                                    required
                                    placeholder="imap.example.com"
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">SMTP Host</label>
                                <input
                                    name="smtpHost"
                                    type="text"
                                    required
                                    placeholder="smtp.example.com"
                                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm text-sm"
                        >
                            Connect
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
