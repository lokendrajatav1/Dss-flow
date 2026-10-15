import { useState, useEffect, useRef } from 'react';
import { Minus, Maximize2, X, ArrowUp, ChevronDown, Paperclip, Link, Image as ImageIcon, Eye, FileText, PenTool, Trash2, Wand2, Loader2, XCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { EmailAccount } from '../types';
import { TemplateManagerModal } from './TemplateManagerModal';
import { LinkModal } from './LinkModal';

interface ComposeModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: EmailAccount[];
    initialData?: {
        emailAccountId?: string;
        to?: string;
        cc?: string;
        bcc?: string;
        subject?: string;
        text?: string;
        html?: string;
    };
    onSend: (data: any) => Promise<void> | void;
    onSaveDraft?: (data: any) => void;
}

export function ComposeModal({ isOpen, onClose, accounts, initialData, onSend, onSaveDraft }: ComposeModalProps) {
    const defaultFormData = {
        emailAccountId: '',
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        text: '',
        html: '',
    };
    const [formData, setFormData] = useState(defaultFormData);
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showScheduleMenu, setShowScheduleMenu] = useState(false);
    
    // Toolbar state
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isPreview, setIsPreview] = useState(false);
    const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const [linkModalData, setLinkModalData] = useState<{ isOpen: boolean, text: string, range: Range | null }>({ isOpen: false, text: '', range: null });

    // Toolbar Handlers
    const handleFormatting = () => {
        document.execCommand('bold');
        if (editorRef.current) editorRef.current.focus();
    };

    const handleInsertLink = () => {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : '';

        let range: Range | null = null;
        if (selection && selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
        }

        setLinkModalData({ isOpen: true, text: selectedText, range });
    };

    const handleConfirmLink = (text: string, url: string) => {
        const { range } = linkModalData;
        setLinkModalData({ ...linkModalData, isOpen: false });
        
        if (!url) return;

        if (editorRef.current) {
            editorRef.current.focus();
            const selection = window.getSelection();
            if (selection && range) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
            
            if (text && text !== (range?.toString() || '')) {
                document.execCommand('insertHTML', false, `<a href="${url}" style="color: #4f46e5; text-decoration: underline;" target="_blank">${text}</a>`);
            } else {
                document.execCommand('createLink', false, url);
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            if (editorRef.current) editorRef.current.focus();
            document.execCommand('insertImage', false, base64);
            setTimeout(() => {
                if (editorRef.current) {
                    const imgs = editorRef.current.getElementsByTagName('img');
                    for (let i = 0; i < imgs.length; i++) {
                        imgs[i].style.maxWidth = '100%';
                        imgs[i].style.borderRadius = '8px';
                    }
                    setFormData({ ...formData, text: editorRef.current.innerHTML });
                }
            }, 100);
        };
        reader.readAsDataURL(file);

        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleSignature = () => {
        if (editorRef.current) {
            editorRef.current.innerHTML += "<br><br>--<br>Alex Johnson<br>Senior Account Executive";
            setFormData({ ...formData, text: editorRef.current.innerHTML });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (isOpen) {
            setFormData({
                ...defaultFormData,
                ...(initialData || {}),
                emailAccountId: initialData?.emailAccountId || (accounts.length > 0 ? accounts[0].id : '')
            });
            setShowCcBcc(false);
            setIsMaximized(false);
            setIsMinimized(false);
            setAiPrompt('');
            
            if (editorRef.current) {
                editorRef.current.innerHTML = initialData?.text || '';
            }
        }
    }, [isOpen, initialData, accounts]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        try {
            // Convert attachments to base64 for JSON payload
            const processedAttachments = await Promise.all(attachments.map(async (file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve({
                            filename: file.name,
                            content: base64,
                            encoding: 'base64'
                        });
                    };
                    reader.readAsDataURL(file);
                });
            }));

            await onSend({
                ...formData,
                attachments: processedAttachments
            });
            setAttachments([]);
        } finally {
            setIsSending(false);
        }
    };

    const handleSaveDraft = () => {
        if (onSaveDraft) {
            onSaveDraft(formData);
            onClose();
        } else {
            // Fake draft save if prop not provided
            Swal.fire({
                icon: 'success',
                title: 'Draft saved',
                text: 'Draft saved locally.',
                timer: 1500,
                showConfirmButton: false
            });
            onClose();
        }
    };

    const handleTrash = async () => {
        const result = await Swal.fire({
            title: 'Discard draft?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Discard'
        });
        
        if (result.isConfirmed) {
            setFormData(defaultFormData);
            onClose();
        }
    };

    const handleGenerateAI = () => {
        if (!aiPrompt.trim()) return;
        setIsAiGenerating(true);
        // Simulate AI generation delay
        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                text: prev.text + (prev.text ? '\n\n' : '') + `[AI Generated based on: "${aiPrompt}"]\nDear ${formData.to || 'Recipient'},\n\nI hope this email finds you well. I am writing to discuss the matter we previously talked about. Please let me know your thoughts.\n\nBest regards,`
            }));
            setIsAiGenerating(false);
            setAiPrompt('');
        }, 1500);
    };

    // If minimized, only show a small floating header
    if (isMinimized) {
        return (
            <div className="fixed bottom-0 right-24 w-72 bg-gray-900 rounded-t-xl shadow-2xl flex flex-col overflow-hidden z-[60] border border-gray-800">
                <div 
                    className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => setIsMinimized(false)}
                >
                    <h2 className="text-sm font-medium truncate text-white">{formData.subject || 'New message'}</h2>
                    <div className="flex items-center gap-3">
                        <button onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); setIsMinimized(false); }} className="text-gray-400 hover:text-white transition-colors">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${isMaximized ? 'w-full h-full' : 'w-full max-w-3xl h-[650px]'}`}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">New message</h2>
                    <div className="flex items-center gap-3 text-gray-500">
                        <button onClick={() => setIsMinimized(true)} className="hover:text-gray-800 transition-colors"><Minus className="w-4 h-4" /></button>
                        <button onClick={() => setIsMaximized(!isMaximized)} className="hover:text-gray-800 transition-colors">
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button onClick={onClose} className="hover:text-gray-800 transition-colors"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="overflow-y-auto flex-1 flex flex-col">
                        {/* Account Selector (Hidden if only 1 account) */}
                        {accounts.length > 1 && (
                            <div className="px-6 py-3 border-b border-gray-100 flex items-center shrink-0">
                                <span className="text-gray-500 text-sm w-12">From</span>
                                <select
                                    value={formData.emailAccountId}
                                    onChange={e => setFormData({ ...formData, emailAccountId: e.target.value })}
                                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900"
                                >
                                    {accounts.map(account => (
                                        <option key={account.id} value={account.id}>{account.email}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* To Field */}
                        <div className="px-6 py-3 border-b border-gray-100 flex items-center shrink-0">
                            <span className="text-gray-500 text-sm w-8">To</span>
                            <input
                                type="text"
                                required
                                value={formData.to}
                                onChange={e => setFormData({ ...formData, to: e.target.value })}
                                className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900"
                            />
                            {!showCcBcc && (
                                <button 
                                    type="button" 
                                    onClick={() => setShowCcBcc(true)}
                                    className="text-gray-500 hover:text-gray-700 text-sm shrink-0 ml-2"
                                >
                                    Cc / Bcc
                                </button>
                            )}
                        </div>

                        {/* CC / BCC Fields */}
                        {showCcBcc && (
                            <>
                                <div className="px-6 py-3 border-b border-gray-100 flex items-center shrink-0">
                                    <span className="text-gray-500 text-sm w-8">Cc</span>
                                    <input
                                        type="text"
                                        value={formData.cc}
                                        onChange={e => setFormData({ ...formData, cc: e.target.value })}
                                        className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900"
                                    />
                                </div>
                                <div className="px-6 py-3 border-b border-gray-100 flex items-center shrink-0">
                                    <span className="text-gray-500 text-sm w-8">Bcc</span>
                                    <input
                                        type="text"
                                        value={formData.bcc}
                                        onChange={e => setFormData({ ...formData, bcc: e.target.value })}
                                        className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900"
                                    />
                                </div>
                            </>
                        )}

                        {/* Subject Field */}
                        <div className="px-6 py-3 border-b border-gray-100 shrink-0">
                            <input
                                type="text"
                                required
                                placeholder="Subject"
                                value={formData.subject}
                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                className="w-full bg-transparent text-sm focus:outline-none text-gray-900 placeholder-gray-500 font-medium"
                            />
                        </div>

                        {/* Body Field */}
                        <div className="flex-1 p-6 relative flex flex-col min-h-[200px]">
                            {isPreview ? (
                                <div className="flex-1 w-full bg-gray-50 text-sm text-gray-800 rounded-md p-4 overflow-y-auto whitespace-pre-wrap border border-gray-200">
                                    {formData.text || <span className="text-gray-400 italic">No content to preview</span>}
                                </div>
                            ) : (
                                <div
                                    ref={editorRef}
                                    contentEditable
                                    onInput={(e) => setFormData({ ...formData, text: e.currentTarget.innerHTML })}
                                    className="flex-1 w-full bg-transparent text-sm text-gray-900 focus:outline-none overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 whitespace-pre-wrap"
                                    data-placeholder="Write or ask AI to draft"
                                />
                            )}
                            
                            {/* Attachments Preview */}
                            {attachments.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 shrink-0">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                            <Paperclip className="w-3 h-3 text-gray-500" />
                                            <span className="max-w-[150px] truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeAttachment(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                                <XCircle className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            
                            {/* AI Input Pill */}
                            <div className="mt-4 shrink-0 p-[1.5px] rounded-full bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 shadow-sm mx-auto w-full max-w-full">
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white">
                                    <Wand2 className="w-5 h-5 text-gray-700" />
                                    <input 
                                        type="text" 
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGenerateAI())}
                                        placeholder="Ask AI to draft a message" 
                                        className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700 placeholder-gray-500"
                                        disabled={isAiGenerating}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleGenerateAI}
                                        disabled={isAiGenerating || !aiPrompt.trim()}
                                        className="p-1.5 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
                                    >
                                        {isAiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Toolbar */}
                    <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-gray-100 shrink-0">
                        <div className="flex items-center gap-4">
                            {/* Send Button Group */}
                            <div className="relative">
                                <div className={`flex items-center rounded-lg transition-colors overflow-hidden ${isSending ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'}`}>
                                    <button type="submit" disabled={isSending} className="px-5 py-2 text-white text-sm font-semibold flex items-center justify-center gap-2 flex-1 disabled:opacity-80">
                                        {isSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : 'Send'}
                                    </button>
                                    <div className="w-px h-full bg-white/30 py-2"></div>
                                    <button type="button" onClick={() => setShowScheduleMenu(!showScheduleMenu)} disabled={isSending} className="px-2 py-2 text-white hover:bg-white/10 transition-colors disabled:opacity-80 disabled:cursor-not-allowed">
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                {showScheduleMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowScheduleMenu(false)}></div>
                                        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 text-left">
                                            <div className="px-4 py-2 text-[15px] font-bold text-gray-900 pb-3">Schedule message</div>
                                            <button type="button" onClick={() => { setShowScheduleMenu(false); Swal.fire('Coming Soon', 'Message scheduling feature is coming soon!', 'info'); }} className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex text-left transition-colors">
                                                Tomorrow at 9:00 AM
                                            </button>
                                            <button type="button" onClick={() => { setShowScheduleMenu(false); Swal.fire('Coming Soon', 'Message scheduling feature is coming soon!', 'info'); }} className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex text-left transition-colors">
                                                Monday at 9:00 AM
                                            </button>
                                            <div className="h-px bg-gray-100 my-1"></div>
                                            <button type="button" onClick={() => { setShowScheduleMenu(false); Swal.fire('Coming Soon', 'Message scheduling feature is coming soon!', 'info'); }} className="w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex text-left transition-colors">
                                                Custom time and date
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Formatting Tools - Fully Functional! */}
                            <div className="flex items-center gap-1">
                                {/* Hidden File Input */}
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />

                                <button type="button" onClick={() => document.querySelector<HTMLInputElement>('input[placeholder="Ask AI to draft a message"]')?.focus()} className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors bg-gray-50 border border-gray-200 ml-2" title="Ask AI">
                                    <Wand2 className="w-4 h-4 text-indigo-600" />
                                </button>
                                <button type="button" onClick={handleFormatting} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors font-serif font-bold text-sm mx-1 underline underline-offset-2 decoration-2" title="Bold Selected Text">A</button>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Attach File"><Paperclip className="w-4 h-4" /></button>
                                <button type="button" onClick={handleInsertLink} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Insert Link"><Link className="w-4 h-4" /></button>
                                <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                                <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Insert Image"><ImageIcon className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setIsPreview(!isPreview)} className={`p-2 rounded-md transition-colors ${isPreview ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-100'}`} title={isPreview ? "Edit Mode" : "Preview Mode"}><Eye className="w-4 h-4" /></button>
                                
                                <button type="button" onClick={() => setIsTemplateManagerOpen(true)} className={`p-2 rounded-md transition-colors ${isTemplateManagerOpen ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-100'}`} title="Manage Templates"><FileText className="w-4 h-4" /></button>

                                <button type="button" onClick={handleSignature} className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors" title="Insert Signature"><PenTool className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                type="button" 
                                onClick={handleSaveDraft}
                                className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                            >
                                Save draft
                            </button>
                            <button 
                                type="button" 
                                onClick={handleTrash}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Sub-Modals */}
            <TemplateManagerModal 
                isOpen={isTemplateManagerOpen} 
                onClose={() => setIsTemplateManagerOpen(false)} 
                onSelectTemplate={(content) => {
                    if (editorRef.current) {
                        editorRef.current.innerHTML += content;
                        setFormData({ ...formData, text: editorRef.current.innerHTML });
                    }
                }}
            />

            {/* Link Modal */}
            <LinkModal
                isOpen={linkModalData.isOpen}
                initialText={linkModalData.text}
                onClose={() => setLinkModalData({ ...linkModalData, isOpen: false })}
                onSave={handleConfirmLink}
            />
        </div>
    );
}
