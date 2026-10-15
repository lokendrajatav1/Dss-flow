import { useState, useEffect, useRef } from 'react';
import { X, Plus, Wand2, Link as LinkIcon, Image as ImageIcon, ArrowUp, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { LinkModal } from './LinkModal';

export interface Template {
    id: string;
    name: string;
    content: string;
}

interface TemplateManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTemplate?: (content: string) => void;
}

export function TemplateManagerModal({ isOpen, onClose, onSelectTemplate }: TemplateManagerModalProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const editorRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [linkModalData, setLinkModalData] = useState<{ isOpen: boolean, text: string, range: Range | null }>({ isOpen: false, text: '', range: null });

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('email_templates');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setTemplates(parsed);
                } catch (e) {}
            }
            // Reset state for new template
            setActiveTemplateId(null);
            setTitle('');
            setContent('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            return Swal.fire('Error', 'Title and content cannot be empty.', 'error');
        }

        let newTemplates = [...templates];
        if (activeTemplateId) {
            newTemplates = newTemplates.map(t => t.id === activeTemplateId ? { ...t, name: title, content } : t);
        } else {
            const newTemp = { id: Date.now().toString(), name: title, content };
            newTemplates.push(newTemp);
            setActiveTemplateId(newTemp.id);
        }
        
        setTemplates(newTemplates);
        localStorage.setItem('email_templates', JSON.stringify(newTemplates));
        Swal.fire({ title: 'Saved!', text: 'Template saved successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
    };

    const handleSelectTemplate = (t: Template) => {
        setActiveTemplateId(t.id);
        setTitle(t.name);
        setContent(t.content);
        if (editorRef.current) {
            editorRef.current.innerHTML = t.content;
        }
    };

    const handleNewTemplate = () => {
        setActiveTemplateId(null);
        setTitle('');
        setContent('');
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
        }
    };

    const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Delete Template?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                const updated = templates.filter(t => t.id !== id);
                setTemplates(updated);
                localStorage.setItem('email_templates', JSON.stringify(updated));
                if (activeTemplateId === id) {
                    handleNewTemplate();
                }
                Swal.fire('Deleted!', 'Your template has been deleted.', 'success');
            }
        });
    };

    const handleBold = () => {
        document.execCommand('bold');
        if (editorRef.current) editorRef.current.focus();
    };

    const handleLink = () => {
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
            // Ensure images have a max width so they don't break the container
            setTimeout(() => {
                if (editorRef.current) {
                    const imgs = editorRef.current.getElementsByTagName('img');
                    for (let i = 0; i < imgs.length; i++) {
                        imgs[i].style.maxWidth = '100%';
                        imgs[i].style.borderRadius = '8px';
                    }
                    setContent(editorRef.current.innerHTML);
                }
            }, 100);
        };
        reader.readAsDataURL(file);

        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
                    <h2 className="text-xl font-bold text-gray-900">Templates</h2>
                    <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-64 border-r border-gray-100 flex flex-col p-4 gap-4 bg-white">
                        <button 
                            onClick={handleNewTemplate}
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> New template
                        </button>
                        
                        <div className="flex-1 overflow-y-auto flex flex-col gap-1">
                            {templates.map(t => (
                                <div key={t.id} className={`group flex items-center justify-between px-2 py-1.5 rounded-xl transition-colors ${activeTemplateId === t.id ? 'bg-gray-50 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    <button
                                        onClick={() => handleSelectTemplate(t)}
                                        className="flex-1 text-left px-2 py-1.5 text-sm font-medium truncate"
                                    >
                                        {t.name}
                                    </button>
                                    <button 
                                        onClick={(e) => handleDeleteTemplate(e, t.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Delete template"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Editor Area */}
                    <div className="flex-1 bg-white p-6 flex flex-col overflow-hidden">
                        <input
                            type="text"
                            placeholder="Add template title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-[22px] font-semibold text-slate-700 placeholder-slate-500 focus:outline-none mb-6 px-2"
                        />

                        <div className="flex-1 bg-white rounded-2xl flex flex-col overflow-hidden shadow-sm relative border border-gray-200">
                            <div
                                ref={editorRef}
                                contentEditable
                                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                className="flex-1 w-full p-6 text-slate-800 text-[15px] focus:outline-none overflow-y-auto empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400"
                                data-placeholder="Write your template content here..."
                                style={{ minHeight: '200px' }}
                            />

                            {/* AI Prompt Input */}
                            <div className="px-6 mb-2">
                                <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-indigo-100/60 bg-white focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all shadow-sm">
                                    <Wand2 className="w-4 h-4 text-indigo-500" />
                                    <input 
                                        type="text"
                                        placeholder="Ask AI to draft a message"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="flex-1 bg-transparent text-[15px] focus:outline-none text-slate-700 placeholder-slate-400"
                                    />
                                    <button className="p-1.5 bg-white border border-gray-100 shadow-sm rounded-full text-indigo-500 hover:bg-indigo-50 transition-colors">
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-100">
                                <div className="flex items-center gap-1 text-slate-500">
                                    <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Wand2 className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleBold} className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-colors font-serif font-bold text-sm">A</button>
                                    <button onClick={handleLink} className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-colors">
                                        <LinkIcon className="w-4 h-4" />
                                    </button>
                                    <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
                                    <button onClick={() => imageInputRef.current?.click()} className="p-2 hover:bg-slate-50 hover:text-slate-700 rounded-lg transition-colors">
                                        <ImageIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    {onSelectTemplate && activeTemplateId && (
                                        <button 
                                            onClick={() => { onSelectTemplate(content); onClose(); }}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
                                        >
                                            Use Template
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleSave}
                                        className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        Save template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Link Modal Popup */}
            <LinkModal
                isOpen={linkModalData.isOpen}
                initialText={linkModalData.text}
                onClose={() => setLinkModalData({ ...linkModalData, isOpen: false })}
                onSave={handleConfirmLink}
            />
        </div>
    );
}
