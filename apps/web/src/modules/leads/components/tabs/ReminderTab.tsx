import React, { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ReminderTabProps {
  lead: any;
  refreshTrigger?: number;
}

export function ReminderTab({ lead, refreshTrigger = 0 }: ReminderTabProps) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/leads/${lead.id}/tasks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(res.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (lead?.id) fetchTasks();
  }, [lead?.id, refreshTrigger]);

  const updateStatus = async (taskId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.put(`/tasks/${taskId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status } : t));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading reminders...</div>;
  }

  const reminderTasks = tasks.filter(t => !t.description?.startsWith('Call with ') && t.title !== '-None-');

  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">TITLE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">DATE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">STATUS</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide text-right">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {reminderTasks.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-12 text-center text-[14px] text-gray-500 font-medium">
                No reminders found.
              </td>
            </tr>
          ) : (
            reminderTasks.map(task => (
              <tr key={task.id} className="border-b border-gray-100">
                <td className="py-3 px-4 text-[14px] text-gray-900">
                  <div className="font-semibold">{task.title}</div>
                  {task.description && <div className="text-[12px] text-gray-500">{task.description}</div>}
                </td>
                <td className="py-3 px-4 text-[14px] text-gray-600">
                  {new Date(task.dueDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${
                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {task.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => updateStatus(task.id, 'COMPLETED')}
                      className="text-[12px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      Mark Done
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
