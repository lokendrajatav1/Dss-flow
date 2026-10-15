import React, { useState } from 'react';
import { LifeBuoy, MessageSquare, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Swal from 'sweetalert2';

export function TicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    client: '',
    priority: 'Medium',
    status: 'Open',
    description: ''
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      Swal.fire('Validation Error', 'Subject is required', 'warning');
      return;
    }

    const newTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: formData.subject,
      client: formData.client || '—',
      priority: formData.priority,
      status: formData.status,
      date: 'Just now'
    };

    setTickets(prev => [newTicket, ...prev]);
    setIsModalOpen(false);
    setFormData({
      subject: '',
      client: '',
      priority: 'Medium',
      status: 'Open',
      description: ''
    });
    Swal.fire({
      icon: 'success',
      title: 'Ticket Created',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleDelete = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 text-xs mt-1">Manage client issues, service queries, and support requests.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold h-9"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Create Ticket
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] font-bold text-gray-600 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3.5">Ticket ID</th>
              <th className="px-6 py-3.5">Subject</th>
              <th className="px-6 py-3.5">Client</th>
              <th className="px-6 py-3.5">Priority</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                  <LifeBuoy className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">No support tickets found</p>
                  <p className="text-xs text-gray-500 mt-0.5">Click "Create Ticket" to log a new client issue.</p>
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-blue-600">{ticket.id}</td>
                  <td className="px-6 py-3.5 font-semibold text-gray-900">{ticket.subject}</td>
                  <td className="px-6 py-3.5 text-gray-600">{ticket.client}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      ticket.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' : 
                      ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      ticket.status === 'Open' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                      ticket.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => handleDelete(ticket.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete ticket"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900">Create Support Ticket</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Issue with payment gateway"
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Client / Customer</label>
                <Input
                  value={formData.client}
                  onChange={e => setFormData({ ...formData, client: e.target.value })}
                  placeholder="e.g. Apex Traders Ltd"
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 px-3 text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-9 rounded-md border border-gray-200 px-3 text-xs bg-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="h-9 px-4 text-xs font-medium"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
