import { useState } from 'react';
import { Building2, Calendar, User, MoreHorizontal, GripVertical, Trash2, Edit2 } from 'lucide-react';
import { Deal } from '../types';

interface DealCardProps {
  deal: Deal;
  onDelete?: (id: string) => void;
  onEdit?: (deal: Deal) => void;
}

export function DealCard({ deal, onDelete, onEdit }: DealCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-amber-100 text-amber-700';
      case 'Low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-3.5 shadow-sm hover:shadow-md transition-shadow cursor-grab group relative"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('dealId', deal.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      
      {/* Drag handle visible on hover */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div className="flex justify-between items-start mb-2 pl-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2 pr-2">{deal.title}</h3>
        <div className="relative">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onEdit) onEdit(deal);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    if (onDelete) onDelete(deal.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="pl-2 space-y-2">
        <div className="flex flex-col gap-1.5">
          {deal.clientName && deal.clientName !== 'Unknown Client' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <User className="w-3.5 h-3.5" />
              <span className="font-medium text-gray-700 line-clamp-1">{deal.clientName}</span>
            </div>
          )}
          {deal.companyName && deal.companyName !== 'No Company' && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Building2 className="w-3.5 h-3.5" />
              <span className="font-medium text-gray-700 line-clamp-1">{deal.companyName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-gray-900">{formatINR(deal.value)}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(deal.priority)}`}>
            {deal.priority}
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {deal.tags?.map(tag => (
            <span key={tag} className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>

        <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{deal.assignedTo ? deal.assignedTo.split(' ')[0] : 'Unassigned'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'No date'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
