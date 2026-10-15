import { Mail, MailOpen, Star, Trash2, Send, Archive, AlertCircle, AlignLeft, ChevronDown, Reply, Forward, MoreVertical, Printer, Paperclip, Download, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import { EmailMessage } from '../types';

interface EmailReaderProps {
    className?: string;
    message: EmailMessage | null;
    onToggleStar: (id: string, currentStarred: boolean) => void;
    onToggleRead: (id: string, currentRead: boolean) => void;
    onDelete: (id: string) => void;
    onReply: (msg: EmailMessage) => void;
    onMoveFolder: (id: string, folder: string) => void;
    onBack?: () => void;
}

export function EmailReader({
    className = '',
    message,
    onToggleStar,
    onToggleRead,
    onDelete,
    onReply,
    onMoveFolder,
    onBack,
}: EmailReaderProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showTrimmed, setShowTrimmed] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const detailsRef = useRef<HTMLDivElement>(null);
    const moreMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setShowTrimmed(false);
    }, [message?.id]);

    const parseEmailBody = (html: string) => {
        if (!html) return { main: '', trimmed: '' };
        
        const splitMarkers = [
            '<div class="gmail_quote">',
            '<blockquote class="gmail_quote"',
            '<blockquote type="cite">',
            '<div class="yahoo_quoted">',
            '<hr tabindex="-1"'
        ];

        let splitIndex = -1;
        for (const marker of splitMarkers) {
            const index = html.indexOf(marker);
            if (index !== -1) {
                if (splitIndex === -1 || index < splitIndex) {
                    splitIndex = index;
                }
            }
        }

        // Special case for plain text replies converted to HTML
        if (splitIndex === -1) {
            const dateRegexMatch = html.match(/On\s+[A-Z][a-z]{2},\s+[A-Z][a-z]{2}\s+\d{1,2},\s+\d{4}\s+at\s+\d{1,2}:\d{2}\s+[AM|PM].*?wrote:/);
            if (dateRegexMatch && dateRegexMatch.index !== undefined) {
                splitIndex = dateRegexMatch.index;
            }
        }

        if (splitIndex !== -1) {
            return {
                main: html.substring(0, splitIndex),
                trimmed: html.substring(splitIndex)
            };
        }

        return { main: html, trimmed: '' };
    };

    const { main, trimmed } = parseEmailBody(message?.body || '');

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            if (detailsRef.current && !detailsRef.current.contains(target)) {
                setShowDetails(false);
            }
            if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
                setShowMoreMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handlePrint = () => {
        if (!message) return;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;
        
        const dateStr = message.receivedAt ? new Date(message.receivedAt).toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : '';
        const fromStr = message.fromName ? `${message.fromName} &lt;${message.from}&gt;` : message.from;
        const toStr = message.to && message.to.length > 0 ? message.to.join(', ') : 'me';

        const printHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${message.subject}</title>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; line-height: 1.6; max-width: 800px; margin: 0 auto; }
                    .header { margin-bottom: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 20px; }
                    .subject { font-size: 24px; font-weight: 600; margin-bottom: 20px; color: #111827; }
                    .meta-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 14px; }
                    .from { font-weight: 600; }
                    .to { color: #4b5563; }
                    .date { color: #4b5563; text-align: right; }
                    .body { font-size: 14px; margin-top: 30px; }
                    img { max-width: 100%; height: auto; }
                    @media print {
                        body { padding: 0; max-width: 100%; }
                        @page { margin: 2cm; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="subject">${message.subject}</div>
                    <div class="meta-row">
                        <div class="from">${fromStr}</div>
                        <div class="date">${dateStr}</div>
                    </div>
                    <div class="meta-row">
                        <div class="to">To: ${toStr}</div>
                    </div>
                </div>
                <div class="body">
                    ${message.body || ''}
                </div>
                <script>
                    window.onload = () => {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `;
        
        printWindow.document.write(printHtml);
        printWindow.document.close();
    };

    const handleDelete = () => {
        if (!message) return;
        
        const isTrash = message.folder === 'trash';
        
        Swal.fire({
            title: isTrash ? 'Permanently Delete?' : 'Move to Trash?',
            text: isTrash 
                ? "This email will be permanently deleted and cannot be recovered."
                : "Are you sure you want to move this email to trash?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: isTrash ? 'Yes, delete permanently!' : 'Yes, move to trash!'
        }).then((result) => {
            if (result.isConfirmed) {
                onDelete(message.id);
            }
        });
    };

    return (
        <div className={`flex-1 flex flex-col bg-white overflow-hidden relative ${className}`}>
            {message ? (
                <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
                    {/* Top Action Bar */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                            {onBack && (
                                <button onClick={onBack} className="md:hidden p-2 -ml-2 mr-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </button>
                            )}
                            <div className="flex items-center gap-0.5 sm:gap-1 text-gray-700">
                            <button onClick={() => onToggleRead(message.id, message.read)} className="hover:bg-gray-100 p-2 rounded-full transition-colors group relative">
                                {message.read ? (
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-gray-600" strokeWidth={2} />
                                        <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gray-700 rounded-full border-[1.5px] border-white"></div>
                                    </div>
                                ) : (
                                    <MailOpen className="w-4 h-4 text-gray-600" strokeWidth={2} />
                                )}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    {message.read ? "Mark as unread" : "Mark as read"}
                                </div>
                            </button>
                            <button onClick={() => onMoveFolder(message.id, 'spam')} className="hover:bg-gray-100 p-2 rounded-full transition-colors group relative">
                                <AlertCircle className="w-4 h-4 text-gray-600" strokeWidth={2} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Report spam
                                </div>
                            </button>
                            <button onClick={handleDelete} className="hover:bg-gray-100 p-2 rounded-full transition-colors group relative mr-2">
                                <Trash2 className="w-4 h-4 text-gray-600" strokeWidth={2} />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                    Delete
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subject Line */}
                    <h1 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">{message.subject}</h1>

                    {/* Email Card */}
                    <div className="bg-white border border-gray-200 rounded-xl flex flex-col">
                        <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="flex items-baseline gap-1.5 flex-wrap">
                                        <span className="font-semibold text-gray-900 text-sm">{message.fromName || message.from.split('@')[0]}</span>
                                        <span className="text-xs text-gray-500">&lt;{message.from}&gt;</span>
                                    </div>
                                    <div className="relative" ref={detailsRef}>
                                        <div 
                                            className="text-xs text-gray-600 mt-1 flex items-center gap-1 cursor-pointer hover:text-gray-900"
                                            onClick={() => setShowDetails(!showDetails)}
                                        >
                                            to me <ChevronDown className="w-3.5 h-3.5" />
                                        </div>
                                        
                                        {showDetails && (
                                            <div className="absolute top-full left-0 mt-1.5 w-[330px] max-w-[90vw] bg-white border border-gray-200 rounded-md shadow-lg shadow-gray-200/50 p-3 z-10 text-[13px] text-gray-700 leading-tight">
                                                <div className="grid grid-cols-[60px_1fr] gap-x-2 gap-y-1 items-start">
                                                    <div className="text-gray-500 text-right">From:</div>
                                                    <div className="break-all">{message.from}</div>
                                                    
                                                    <div className="text-gray-500 text-right">To:</div>
                                                    <div className="break-all">{message.to && message.to.length > 0 ? message.to.join(', ') : 'me'}</div>
                                                    
                                                    <div className="text-gray-500 text-right">Reply to:</div>
                                                    <div className="break-all">{message.from}</div>
                                                    
                                                    <div className="text-gray-500 text-right">Date:</div>
                                                    <div>{message.receivedAt ? new Date(message.receivedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' }) : ''}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 flex-shrink-0">
                                <span className="text-xs mr-2">
                                    {message.receivedAt ? new Date(message.receivedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }) : ''}
                                </span>
                                <div className="flex items-center gap-0.5">
                                    <button onClick={() => onToggleStar(message.id, message.starred)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative">
                                        <Star className={`w-4 h-4 ${message.starred ? 'text-yellow-400' : 'text-gray-500'}`} fill={message.starred ? 'currentColor' : 'none'} strokeWidth={message.starred ? 1.5 : 2} />
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            {message.starred ? 'Unstar' : 'Star'}
                                        </div>
                                    </button>
                                    <button onClick={() => onReply(message)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative">
                                        <Reply className="w-4 h-4 text-gray-600" strokeWidth={2} />
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            Reply
                                        </div>
                                    </button>
                                    <div className="relative" ref={moreMenuRef}>
                                        <button onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative">
                                            <MoreVertical className="w-4 h-4 text-gray-600" strokeWidth={2} />
                                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-xs rounded-md shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                More
                                            </div>
                                        </button>

                                        {showMoreMenu && (
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-100 py-2 z-20">
                                                <button onClick={() => { setShowMoreMenu(false); onReply(message); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700 transition-colors">
                                                    <Reply className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                                    Reply
                                                </button>
                                                <button onClick={() => { setShowMoreMenu(false); Swal.fire('Coming Soon', 'Forward functionality is coming soon!', 'info'); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700 transition-colors">
                                                    <Forward className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                                    Forward
                                                </button>
                                                <div className="h-px bg-gray-100 my-1.5"></div>
                                                <button onClick={() => { setShowMoreMenu(false); handlePrint(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-3 text-sm text-gray-700 transition-colors">
                                                    <Printer className="w-4 h-4 text-gray-500" strokeWidth={2} />
                                                    Print
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Email Body */}
                        <div className="px-5 pb-5 flex flex-col flex-1">
                            <div className="border-t border-gray-100 pt-5 flex-1 flex flex-col">
                                <iframe 
                                    srcDoc={main} 
                                    title="Email Content" 
                                    className="w-full flex-1 min-h-[500px] border-none bg-white"
                                    sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                />
                            </div>
                            
                            {/* Three dots button */}
                            {trimmed && !showTrimmed && (
                                <div className="mt-4">
                                    <button 
                                        onClick={() => setShowTrimmed(true)}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded text-lg leading-none transition-colors font-serif tracking-widest"
                                        title="Show trimmed content"
                                    >
                                        ...
                                    </button>
                                </div>
                            )}

                            {/* Trimmed content */}
                            {showTrimmed && (
                                <div className="mt-4 pt-4 border-t border-gray-200 opacity-70">
                                    <iframe 
                                        srcDoc={trimmed} 
                                        title="Trimmed Email Content" 
                                        className="w-full min-h-[300px] border-none bg-white"
                                        sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                    />
                                </div>
                            )}

                            {/* Attachments Section */}
                            {message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                                        <Paperclip className="w-4 h-4" />
                                        <span>{message.attachments.length} Attachment{message.attachments.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {message.attachments.map((attachment: any, idx: number) => {
                                            // Skip inline images (cid) from showing in the generic attachment list
                                            if (attachment.cid) return null;
                                            
                                            const isImage = attachment.filename?.match(/\.(jpeg|jpg|png|gif|webp)$/i);
                                            const dataUrl = `data:${isImage ? 'image/'+attachment.filename.split('.').pop() : 'application/octet-stream'};base64,${attachment.content}`;
                                            
                                            return (
                                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl min-w-[200px] max-w-[300px] group hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer" onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = dataUrl;
                                                    a.download = attachment.filename;
                                                    a.click();
                                                }}>
                                                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600">
                                                        {isImage ? <ImageIcon className="w-5 h-5" /> : <Paperclip className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{attachment.filename}</p>
                                                        <p className="text-xs text-gray-500 mt-0.5">{(attachment.content?.length / 1.37 / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50">
                                                        <Download className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Bottom Action Buttons */}
                    <div className="mt-6 flex items-center gap-3">
                        <button onClick={() => onReply(message)} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-sm font-semibold text-gray-700 transition-colors">
                            <Reply className="w-4 h-4" />
                            Reply
                        </button>
                        <button onClick={() => Swal.fire('Coming Soon', 'Forward functionality is coming soon!', 'info')} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 rounded-full text-sm font-semibold text-gray-700 transition-colors">
                            <Forward className="w-4 h-4" />
                            Forward
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                    <Mail className="w-16 h-16 mb-4 text-gray-300" strokeWidth={1} />
                    <p className="text-xl font-medium text-gray-500">Select an item to read</p>
                    <p className="text-sm mt-2">Click on an email in the list to view its contents here</p>
                </div>
            )}
        </div>
    );
}
