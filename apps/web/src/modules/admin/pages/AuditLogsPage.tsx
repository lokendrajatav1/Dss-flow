import { useState } from 'react';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const LOGS = [
  { id: 1, action: 'Suspended Tenant', target: 'Initech', user: 'Admin (System)', date: 'Sep 20, 2026 14:30', severity: 'high' },
  { id: 2, action: 'Updated API Key', target: 'Razorpay Live', user: 'Admin (System)', date: 'Sep 19, 2026 10:15', severity: 'high' },
  { id: 3, action: 'Enabled Feature', target: 'AI Assistant', user: 'Admin (System)', date: 'Sep 18, 2026 09:00', severity: 'medium' },
  { id: 4, action: 'Created Announcement', target: 'All Tenants', user: 'Admin (System)', date: 'Sep 15, 2026 16:45', severity: 'low' },
  { id: 5, action: 'Logged In', target: 'Super Admin Portal', user: 'Admin (System)', date: 'Sep 15, 2026 08:30', severity: 'low' },
];

export function AuditLogsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track all administrative actions performed on the platform.</p>
        </div>
        <Button variant="outline" className="gap-2 text-sm">
          <Filter className="w-4 h-4" /> Filter Logs
        </Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs by action or target..." className="pl-8 h-8 text-xs" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Target</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {LOGS.map(log => (
              <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {log.severity === 'high' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                    <span className="font-medium text-gray-900 text-sm">{log.action}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm font-medium text-gray-700">{log.target}</td>
                <td className="px-5 py-3 text-xs text-gray-500">{log.user}</td>
                <td className="px-5 py-3 text-xs text-gray-400 font-mono">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
