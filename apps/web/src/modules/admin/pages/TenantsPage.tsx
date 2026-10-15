import { useState, useEffect } from 'react';
import { Search, MoreVertical, AlertCircle, UserCheck, Ban, RefreshCw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export function TenantsPage() {
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const res = await api.get('/companies');
      const list = res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setTenants(list);
    } catch (err) {
      console.error('Failed to fetch tenants', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = tenants.filter(t =>
    (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.domain || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tenant Management</h1>
          <p className="text-xs text-gray-500 mt-0.5">{tenants.length} companies registered in database</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={fetchTenants}
            variant="outline"
            className="h-8 px-2.5 bg-white"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or domain..."
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Registered On</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                    Loading tenants from database...
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-800">No tenants found</p>
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {(t.name || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">{t.name || 'Unnamed Company'}</p>
                        <p className="text-[11px] text-gray-400 font-mono">{t.domain || 'no domain'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">
                      {t.plan || 'Free'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                      t.active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {t.active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">
                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View details">
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
