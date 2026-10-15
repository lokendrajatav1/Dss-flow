import { useState, useEffect } from 'react';
import { X, XCircle } from 'lucide-react';

export interface LinkModalProps {
    isOpen: boolean;
    initialText: string;
    onClose: () => void;
    onSave: (text: string, url: string) => void;
}

export function LinkModal({ isOpen, initialText, onClose, onSave }: LinkModalProps) {
    const [text, setText] = useState(initialText);
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (isOpen) {
            setText(initialText);
            setUrl('');
        }
    }, [isOpen, initialText]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!url) return;
        onSave(text, url);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="w-[500px] bg-white rounded-2xl p-6 shadow-xl flex flex-col gap-6 relative border border-gray-100">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add link</h2>
                
                <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-semibold text-gray-700">Text to display</label>
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder="Text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-white text-gray-900 px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm shadow-sm"
                        />
                        {text && (
                            <button onClick={() => setText('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Link</label>
                    <div className="relative">
                        <input 
                            type="url"
                            placeholder="https://"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSave();
                            }}
                            className="w-full bg-white text-gray-900 px-4 py-3 pr-10 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-sm shadow-sm"
                        />
                        {url && (
                            <button onClick={() => setUrl('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <XCircle className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end mt-4">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="text-sm text-gray-600 font-semibold hover:text-gray-900 transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} disabled={!url} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
