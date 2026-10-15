import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SENT = [
  { id: 1, title: 'Scheduled Maintenance Oct 1', message: 'The platform will be down for 30 minutes on Oct 1 at 2 AM IST.', type: 'Warning', sentTo: 'All Tenants', date: 'Sep 20, 2026' },
  { id: 2, title: 'New AI Features Available', message: 'We have added AI-powered lead scoring. Check it out!', type: 'Info', sentTo: 'Pro & Enterprise', date: 'Sep 10, 2026' },
];

export function AnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'Info' | 'Warning' | 'Critical'>('Info');
  const [audience, setAudience] = useState('All Tenants');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Announcements</h1>
        <p className="text-xs text-gray-500 mt-0.5">Send in-app notifications to all or selected tenants.</p>
      </div>

      {/* Compose */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">New Announcement</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Title</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Scheduled Maintenance on Oct 1" className="text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your announcement message..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Info</option>
                <option>Warning</option>
                <option>Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Send To</label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>All Tenants</option>
                <option>Enterprise Only</option>
                <option>Pro & Enterprise</option>
                <option>Basic Only</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 text-sm">
              <Send className="w-4 h-4" /> Send Announcement
            </Button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Sent Announcements</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {SENT.map(ann => (
            <div key={ann.id} className="px-5 py-4 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    ann.type === 'Warning' ? 'bg-amber-100 text-amber-700' :
                    ann.type === 'Critical' ? 'bg-red-100 text-red-700' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>{ann.type}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">{ann.message}</p>
                <p className="text-xs text-gray-400">Sent to: {ann.sentTo} · {ann.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
