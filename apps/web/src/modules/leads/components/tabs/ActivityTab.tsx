import React, { useState, useEffect } from 'react';
import { Calendar, Check, X, Clock } from 'lucide-react';
import api from '@/lib/api';
import Swal from 'sweetalert2';

interface ActivityTabProps {
  lead: any;
  refreshTrigger?: number;
}

const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

export function ActivityTab({ lead, refreshTrigger = 0 }: ActivityTabProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/leads/${lead.id}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActivities(res.data);
      } catch (err) {
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (lead?.id) fetchActivities();
  }, [lead?.id, refreshTrigger]);

  const handleDeleteActivity = async (activityId: string) => {
    // Cannot delete system creation event if it doesn't have an ID in DB
    if (activityId === 'creation-event') return;
    
    try {
      const result = await Swal.fire({
        title: 'Delete Activity?',
        text: 'Are you sure you want to delete this activity?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await api.delete(`/leads/${lead.id}/activities/${activityId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setActivities(prev => prev.filter(a => a.id !== activityId));
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Activity has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      Swal.fire('Error', 'Failed to delete activity', 'error');
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading activities...</div>;
  }

  // Fallback to a default event if no activities exist
  const allEvents = activities.length > 0 ? activities : [{
    id: 'creation-event',
    type: 'creation',
    title: 'Lead Created',
    description: lead.notes,
    createdAt: lead.createdAt || new Date().toISOString(),
    performedBy: lead.assignedTo || { name: 'System' }
  }];

  const groupedActivities = allEvents.reduce((acc: Record<string, any[]>, act: any) => {
    const dateStr = new Date(act.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(act);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl relative">
      {/* Vertical Timeline Line */}
      <div className="absolute left-[15px] top-2 bottom-0 w-px bg-gray-200"></div>

      {Object.entries(groupedActivities).map(([dateStr, acts]: [string, any[]]) => (
        <div key={dateStr} className="mb-8 relative pl-12">
          {/* Date Block Header */}
          <div className="flex items-center gap-4 mb-6 -ml-12 pl-12 relative z-10">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50 pr-4">
              {dateStr}
            </div>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          <div className="space-y-6">
            {acts.map((act) => {
              const userName = act.performedBy?.name || 'System';
              const bant = act.metadata?.bant;
              const activityDate = act.metadata?.activityDate;
              
              return (
              <div key={act.id} className="relative">
                <div className="absolute -left-[48.5px] top-0 w-8 h-8 rounded-full bg-[#10b981] text-white flex items-center justify-center text-[13px] font-bold shadow-sm z-10">
                  {getInitials(userName)}
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 text-[15px]">
                      <span className="font-bold text-gray-900">{userName}</span>
                      <span className="text-gray-500">added</span>
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                        act.type === 'CALL'
                          ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]'
                          : 'bg-[#fff8e6] text-[#d97706] border-[#fde68a]'
                      }`}>
                        ● {act.title?.replace('Call logged: ', '') || act.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
                        <Clock className="w-4 h-4 text-gray-400" /> 
                        {new Date(act.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(act.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={() => handleDeleteActivity(act.id)}
                        title="Delete Activity"
                        className="w-[22px] h-[22px] rounded-full bg-gray-300 hover:bg-red-500 text-white flex items-center justify-center transition-colors ml-1"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Message */}
                  {act.description && (
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">MESSAGE / NOTES</div>
                      <div className="text-[14px] text-gray-900 font-medium">{act.description}</div>
                    </div>
                  )}

                  {/* BANT INFO */}
                  {bant && (
                    <div className="mb-4">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">BANT INFO</div>
                      <div className="flex flex-col gap-1.5">
                        {['budget', 'authority', 'need', 'timeline'].map((key) => {
                          const value = bant[key];
                          if (value === null || value === undefined) return null;
                          
                          const label = key.charAt(0).toUpperCase() + key.slice(1);
                          return (
                            <div key={key} className="flex items-center gap-2 text-[13px] font-medium text-gray-900">
                              {value ? (
                                <div className="w-5 h-5 rounded-[4px] bg-[#16a34a] flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" strokeWidth={3} /></div>
                              ) : (
                                <div className="w-5 h-5 rounded-[4px] bg-[#dc2626] flex items-center justify-center"><X className="w-3.5 h-3.5 text-white" strokeWidth={3} /></div>
                              )}
                              {label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Activity Date */}
                  {activityDate && !act.metadata?.followUpDate && (
                    <div className="bg-[#eef2ff] border border-[#e0e7ff] rounded-lg p-3.5 flex items-center gap-3 mt-4">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#e0e7ff] text-[#6366f1] flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">ACTIVITY DATE</div>
                        <div className="text-[13px] font-bold text-gray-900">
                          {new Date(activityDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(activityDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Follow Up Date */}
                  {act.metadata?.followUpDate && (
                    <div className="bg-[#fffbf0] border border-[#fde68a] rounded-lg p-3.5 flex items-center gap-3 mt-4">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#fde68a] text-[#d97706] flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">FOLLOW-UP</div>
                        <div className="text-[13px] font-bold text-gray-900">
                          {new Date(act.metadata.followUpDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {new Date(act.metadata.followUpDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      ))}
    </div>
  );
}
