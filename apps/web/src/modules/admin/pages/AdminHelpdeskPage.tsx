import { useState, useEffect } from 'react';
import { Search, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface AdminTicket {
  id: string;
  tenantName: string;
  plan: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdAgo: string;
  messages: {
    sender: 'Tenant' | 'Admin';
    name: string;
    content: string;
    time: string;
  }[];
}

export function AdminHelpdeskPage() {
  const [activeTicket, setActiveTicket] = useState<AdminTicket | null>(null);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/tickets');
        setTickets(response.data || []);
        if (response.data && response.data.length > 0) {
          setActiveTicket(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6 max-w-7xl mx-auto">
      {/* Left Sidebar: Ticket List */}
      <div className="w-80 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-bold text-gray-900 mb-3">Support Tickets</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input placeholder="Search tickets..." className="pl-8 h-8 text-xs bg-white" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No tickets found</div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${activeTicket?.id === ticket.id ? 'bg-indigo-50/50 border-l-2 border-indigo-600' : 'border-l-2 border-transparent'}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-900">{ticket.tenantName}</span>
                  <span className="text-xs text-gray-400">{ticket.createdAgo}</span>
                </div>
                <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-2">{ticket.subject}</p>
                <div className="flex gap-2">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Content: Ticket Detail & Chat */}
      <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-5 text-center text-gray-500">Loading ticket details...</div>
        ) : !activeTicket ? (
          <div className="p-5 text-center text-gray-500">Select a ticket to view details</div>
        ) : (
          <>
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/30">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{activeTicket.id}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getStatusColor(activeTicket.status)}`}>{activeTicket.status}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${getPriorityColor(activeTicket.priority)}`}>{activeTicket.priority}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">{activeTicket.subject}</h2>
                <p className="text-xs text-gray-500 mt-1">Tenant: <span className="font-semibold text-gray-700">{activeTicket.tenantName}</span> ({activeTicket.plan} Plan)</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="text-xs h-8">Mark Resolved</Button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/30">
              {activeTicket.messages.map((msg, i) => {
                const isAdmin = msg.sender === 'Admin';
                return (
                  <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${isAdmin ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'}`}>
                      <div className={`flex items-center gap-2 mb-1 text-[10px] ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                        <span className="font-bold">{msg.name}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Box */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply to the tenant..."
                    rows={3}
                    className="w-full text-sm border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 mb-1 h-10 px-6">
                  <Send className="w-4 h-4 mr-2" /> Reply
                </Button>
              </div>
              <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Replies are instantly emailed to the tenant's admin team.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
