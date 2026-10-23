import React from 'react';
import { Star, Eye, Edit, Bell, Phone, Mail, MoreVertical, Trash2, User, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { CallItem } from '../types';
import { timeAgo } from '../pages/CallsPage';

interface CallRowProps {
    call: CallItem;
    selectedCallIds: string[];
    openMoreId: string | null;
    onSelectCall: (id: string, checked: boolean) => void;
    onTogglePriority: (call: CallItem) => void;
    onViewCall: (call: CallItem) => void;
    onEditCall: (call: CallItem) => void;
    onOpenReminder: (call: CallItem) => void;
    onDeleteCall: (id: string) => void;
    onBulkDelete: () => void;
    onExportCSV: () => void;
    onUpdateCallStatus: (id: string, newStatus: string) => void;
    onUpdateCallOutcome: (id: string, newOutcome: string) => void;
    onOpenMore: (id: string, e: React.MouseEvent) => void;
    onClickOutside: () => void;
    formatDate: (dateString: string) => string;
}

export const CallRow: React.FC<CallRowProps> = ({
    call,
    selectedCallIds,
    openMoreId,
    onSelectCall,
    onTogglePriority,
    onViewCall,
    onEditCall,
    onOpenReminder,
    onDeleteCall,
    onBulkDelete,
    onExportCSV,
    onUpdateCallStatus,
    onUpdateCallOutcome,
    onOpenMore,
    onClickOutside,
    formatDate,
}) => {
    const WhatsAppIcon = ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.128.552 4.148 1.603 5.928L.18 23.361l5.545-1.455c1.721.956 3.659 1.464 5.679 1.464h.01C18.615 23.37 24 17.985 24 11.34 24 8.113 22.743 5.08 20.463 2.797 18.18 5.513 15.249 0 12.031 0zm.01 19.397c-1.802 0-3.567-.484-5.114-1.401l-.367-.217-3.799.997.994-3.702-.239-.38a9.497 9.497 0 0 1-1.45-5.07c0-5.246 4.269-9.516 9.516-9.516 2.54 0 4.928.99 6.723 2.784a9.518 9.518 0 0 1 2.783 6.721c0 5.247-4.269 9.516-9.516 9.516zm5.222-7.142c-.287-.143-1.696-.837-1.96-.933-.263-.093-.456-.143-.65.093-.19.237-.743.934-.91 1.127-.167.19-.335.215-.623.071-.287-.143-1.21-.446-2.306-1.422-.852-.76-1.428-1.7-1.595-1.986-.167-.287-.018-.442.126-.584.13-.129.287-.335.43-.502.143-.167.19-.287.287-.478.096-.19.048-.36-.024-.502-.072-.143-.65-1.569-.89-2.147-.234-.564-.473-.487-.65-.497-.167-.008-.36-.008-.55-.008-.19 0-.5.071-.763.36-.263.287-1.004.981-1.004 2.392s1.028 2.774 1.171 2.964c.143.19 2.022 3.085 4.898 4.327.685.296 1.219.473 1.636.606.688.218 1.314.187 1.808.113.553-.083 1.696-.693 1.936-1.363.239-.67.239-1.244.167-1.363-.071-.12-.263-.19-.55-.333z" />
        </svg>
    );

    return (
        <tr key={call.id} className="hover:bg-gray-50/50 group relative">
            {/* Name Column with Checkbox, Star, Details */}
            <td className="px-4 py-3 border-r border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedCallIds.includes(call.id)}
                            onChange={(e) => onSelectCall(call.id, e.target.checked)}
                        />
                        <span
                            title={call.priority === 'High' ? 'High Priority' : 'Mark as High Priority'}
                            onClick={(e) => { e.stopPropagation(); onTogglePriority(call); }}
                            className="inline-flex cursor-pointer"
                        >
                            <Star
                                className={`w-4 h-4 transition-colors ${call.priority === 'High' ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
                            />
                        </span>

                        <div className="relative group/name">
                            <span
                                onClick={() => onViewCall(call)}
                                className="text-gray-700 font-medium hover:text-blue-600 cursor-pointer"
                            >
                                {call.name}
                            </span>
                            <span className="text-xs text-gray-400 ml-2 font-normal">
                                ({call.companyName})
                            </span>

                            {/* Hover Popover */}
                            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg opacity-0 invisible group-hover/name:opacity-100 group-hover/name:visible transition-all duration-200 z-[60] p-4 flex flex-col gap-2.5">
                                <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-gray-200 transform rotate-45"></div>

                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                                    <User className="w-4 h-4 text-indigo-600" />
                                    <span>{call.name}</span>
                                </div>

                                <p className="text-xs text-gray-600 font-medium">{call.companyName}</p>

                                <div className="text-xs text-gray-500 space-y-1 pt-1 border-t border-gray-100">
                                    <p>Phone: <span className="font-mono text-gray-800 font-medium">{call.phone}</span></p>
                                    {call.email && <p>Email: <span className="font-mono text-gray-700">{call.email}</span></p>}
                                    <p>Direction: <strong>{call.direction}</strong> • Duration: <strong>{call.duration}</strong></p>
                                    <p>Outcome: <strong>{call.outcome}</strong></p>
                                    <p>Agent: <strong>{call.assignedTo}</strong></p>
                                    {call.notes && <p className="text-gray-600 italic mt-1">"{call.notes}"</p>}
                                </div>

                                <div className="mt-1">
                                    <span className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                        {timeAgo(call.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Name Cell Action Cluster: Eye, Edit, Bell, MoreVertical */}
                    <div className="flex items-center gap-1.5">
                        {/* Eye Button -> View Details */}
                        <button
                            onClick={() => onViewCall(call)}
                            className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:text-blue-600 bg-white"
                            title="View Details"
                        >
                            <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Button -> Edit Call */}
                        <button
                            onClick={() => onEditCall(call)}
                            className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                            title="Edit Call"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Bell Button (Purple) -> Open Existing SetReminderModal */}
                        <button
                            onClick={() => onOpenReminder(call)}
                            className="p-1 border border-purple-600 bg-purple-600 text-white rounded hover:bg-purple-700"
                            title="Set Reminder"
                        >
                            <Bell className="w-3.5 h-3.5" />
                        </button>

                        {/* More Menu */}
                        <div className="relative">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenMore(call.id, e);
                                }}
                                className="p-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 bg-white"
                                title="More Actions"
                            >
                                <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {openMoreId === call.id && (
                                <div
                                    className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-white border border-gray-200 rounded-md p-1.5 flex items-center gap-1.5 z-50 animate-in fade-in zoom-in duration-150"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        onClick={() => {
                                            onClickOutside();
                                            onViewCall(call);
                                        }}
                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            onClickOutside();
                                            onEditCall(call);
                                        }}
                                        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                                        title="Edit"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => {
                                            onClickOutside();
                                            onOpenReminder(call);
                                        }}
                                        className="p-1.5 text-purple-600 hover:bg-purple-50 rounded"
                                        title="Set Reminder"
                                    >
                                        <Bell className="w-4 h-4" />
                                    </button>

                                    {call.phone && (
                                        <a
                                            href={`https://wa.me/${call.phone.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                            title="WhatsApp"
                                        >
                                            <WhatsAppIcon className="w-4 h-4" />
                                        </a>
                                    )}

                                    <button
                                        onClick={() => {
                                            onClickOutside();
                                            onDeleteCall(call.id);
                                        }}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </td>

            {/* Direction Badge */}
            <td className="px-3 py-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${call.direction === 'Inbound'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                    {call.direction === 'Inbound' ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    {call.direction || 'Outbound'}
                </span>
            </td>

            {/* Call Status Dropdown Select */}
            <td className="px-3 py-3 text-center">
                <select
                    value={call.callStatus || 'Untouched'}
                    onChange={(e) => onUpdateCallStatus(call.id, e.target.value)}
                    className={`h-8 px-2 border rounded text-xs font-medium outline-none cursor-pointer bg-white transition-colors
            ${call.callStatus === 'Connected' ? 'border-green-500 text-green-700 bg-green-50/50' :
                            call.callStatus === 'Callback Scheduled' ? 'border-purple-500 text-purple-700 bg-purple-50/50' :
                                call.callStatus === 'Busy' ? 'border-amber-500 text-amber-700 bg-amber-50/50' :
                                    call.callStatus === 'No Answer' || call.callStatus === 'Not Answered' ? 'border-red-500 text-red-700 bg-red-50/50' :
                                        'border-gray-300 text-gray-700'}
          `}
                >
                    <option value="Untouched">Untouched</option>
                    <option value="Connected">Connected</option>
                    <option value="Busy">Busy</option>
                    <option value="No Answer">No Answer</option>
                    <option value="Left Voicemail">Left Voicemail</option>
                    <option value="Interested">Interested</option>
                    <option value="Follow Up Needed">Follow Up Needed</option>
                    <option value="Callback Scheduled">Callback Scheduled</option>
                </select>
            </td>

            {/* Outcome Dropdown Select */}
            <td className="px-3 py-3 text-center">
                <select
                    value={call.outcome || 'Follow-up Required'}
                    onChange={(e) => onUpdateCallOutcome(call.id, e.target.value)}
                    className={`h-8 px-2 border rounded text-xs font-medium outline-none cursor-pointer bg-white transition-colors
            ${call.outcome === 'Interested' || call.outcome === 'Closed Won' ? 'border-emerald-500 text-emerald-700 bg-emerald-50/50' :
                            call.outcome === 'Follow-up Required' ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50' :
                                call.outcome === 'Not Interested' ? 'border-rose-500 text-rose-700 bg-rose-50/50' :
                                    'border-gray-300 text-gray-700'}
          `}
                >
                    <option value="Follow-up Required">Follow-up Required</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Closed Won">Closed Won</option>
                </select>
            </td>

            {/* Duration Column */}
            <td className="px-3 py-3 text-center">
                <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                    {call.duration || '00:00'}
                </span>
            </td>

            {/* Date Column */}
            <td className="px-4 py-3 text-gray-500 text-center text-xs">
                {formatDate(call.dateTime || call.createdAt)}
            </td>

            {/* Quick Action Column - Exact Segmented Box from LeadsPage */}
            <td className="px-4 py-3">
                <div className="flex items-center justify-center">
                    <div className="flex items-center border border-gray-200 rounded divide-x divide-gray-200 bg-white">
                        {call.phone ? (
                            <a
                                href={`tel:${call.phone}`}
                                className="p-1.5 hover:bg-gray-50 text-blue-600 rounded-none border-0 block"
                                title={`Call ${call.phone}`}
                            >
                                <Phone className="w-4 h-4" />
                            </a>
                        ) : (
                            <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                                <Phone className="w-4 h-4" />
                            </button>
                        )}

                        {call.phone ? (
                            <a
                                href={`https://wa.me/${call.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 hover:bg-gray-50 text-green-600 rounded-none border-0 block"
                                title="WhatsApp"
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                            </a>
                        ) : (
                            <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Phone">
                                <WhatsAppIcon className="w-4 h-4" />
                            </button>
                        )}

                        {call.email ? (
                            <a
                                href={`mailto:${call.email}`}
                                className="p-1.5 hover:bg-gray-50 text-teal-600 rounded-none border-0 block"
                                title="Send Email"
                            >
                                <Mail className="w-4 h-4" />
                            </a>
                        ) : (
                            <button className="p-1.5 text-gray-300 cursor-not-allowed" disabled title="No Email">
                                <Mail className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={() => onDeleteCall(call.id)}
                            className="p-1.5 hover:bg-gray-50 text-red-500 rounded-none border-0 block"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </td>
        </tr>
    );
};