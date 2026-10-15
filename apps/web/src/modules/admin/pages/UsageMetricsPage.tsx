import { useState, useEffect } from 'react';
import { Search, Database, HardDrive, Zap, Bot, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

interface TenantUsage {
  tenantId: string;
  tenantName: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  autoBillOverages: boolean;
  metrics: {
    storageGb: { used: number; limit: number };
    dbRows: { used: number; limit: number };
    apiCalls: { used: number; limit: number };
    aiTokens: { used: number; limit: number };
  };
}

export function UsageMetricsPage() {
  const [search, setSearch] = useState('');
  const [showOverLimit, setShowOverLimit] = useState(false);

  const [loading, setLoading] = useState(true);
  const [usageData, setUsageData] = useState<TenantUsage[]>([]);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const response = await api.get('/admin/usage-metrics');
        setUsageData(response.data || []);
      } catch (error) {
        console.error('Failed to fetch usage metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, []);

  const filtered = usageData.filter(t =>
    t.tenantName.toLowerCase().includes(search.toLowerCase())
  );

  const getProgressColor = (used: number, limit: number) => {
    const pct = (used / limit) * 100;
    if (pct >= 95) return 'bg-red-500';
    if (pct >= 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStatusBg = (used: number, limit: number) => {
    const pct = (used / limit) * 100;
    if (pct >= 95) return 'bg-red-50';
    if (pct >= 80) return 'bg-amber-50';
    return '';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Storage & Usage Metrics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track resource consumption and billing overages across all tenants.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><HardDrive className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Storage Used</p>
            <p className="text-xl font-bold text-gray-900">
              {loading ? '...' : usageData.reduce((sum, t) => sum + t.metrics.storageGb.used, 0)} GB
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Database className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total DB Rows</p>
            <p className="text-xl font-bold text-gray-900">
              {loading ? '...' : usageData.reduce((sum, t) => sum + t.metrics.dbRows.used, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Zap className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">API Calls (This Month)</p>
            <p className="text-xl font-bold text-gray-900">
              {loading ? '...' : usageData.reduce((sum, t) => sum + t.metrics.apiCalls.used, 0).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Bot className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">AI Tokens (This Month)</p>
            <p className="text-xl font-bold text-gray-900">
              {loading ? '...' : usageData.reduce((sum, t) => sum + t.metrics.aiTokens.used, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenants..." className="pl-8 h-8 text-xs bg-white" />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showOverLimit} onChange={() => setShowOverLimit(!showOverLimit)} className="rounded text-indigo-600 focus:ring-indigo-500" />
            <span className="text-xs font-medium text-gray-700">Show only near/over limit</span>
          </label>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-white">
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">Tenant</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage (GB)</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DB Rows</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">API Calls</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Tokens</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Overage Billing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(t => {
              const metrics = t.metrics;
              const hasAlert = Object.values(metrics).some(m => (m.used / m.limit) >= 0.8);

              if (showOverLimit && !hasAlert) return null;

              return (
                <tr key={t.tenantId} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-sm flex items-center gap-2">
                          {t.tenantName}
                          {hasAlert && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{t.plan} Plan</p>
                      </div>
                    </div>
                  </td>

                  {/* Storage */}
                  <td className={`px-5 py-4 ${getStatusBg(metrics.storageGb.used, metrics.storageGb.limit)}`}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-900">{metrics.storageGb.used} GB</span>
                      <span className="text-gray-400">{metrics.storageGb.limit} GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${getProgressColor(metrics.storageGb.used, metrics.storageGb.limit)}`} style={{ width: `${Math.min((metrics.storageGb.used / metrics.storageGb.limit) * 100, 100)}%` }} />
                    </div>
                  </td>

                  {/* DB Rows */}
                  <td className={`px-5 py-4 ${getStatusBg(metrics.dbRows.used, metrics.dbRows.limit)}`}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-900">{formatNumber(metrics.dbRows.used)}</span>
                      <span className="text-gray-400">{formatNumber(metrics.dbRows.limit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${getProgressColor(metrics.dbRows.used, metrics.dbRows.limit)}`} style={{ width: `${Math.min((metrics.dbRows.used / metrics.dbRows.limit) * 100, 100)}%` }} />
                    </div>
                  </td>

                  {/* API Calls */}
                  <td className={`px-5 py-4 ${getStatusBg(metrics.apiCalls.used, metrics.apiCalls.limit)}`}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-900">{formatNumber(metrics.apiCalls.used)}</span>
                      <span className="text-gray-400">{formatNumber(metrics.apiCalls.limit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${getProgressColor(metrics.apiCalls.used, metrics.apiCalls.limit)}`} style={{ width: `${Math.min((metrics.apiCalls.used / metrics.apiCalls.limit) * 100, 100)}%` }} />
                    </div>
                  </td>

                  {/* AI Tokens */}
                  <td className={`px-5 py-4 ${getStatusBg(metrics.aiTokens.used, metrics.aiTokens.limit)}`}>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-900">{formatNumber(metrics.aiTokens.used)}</span>
                      <span className="text-gray-400">{formatNumber(metrics.aiTokens.limit)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${getProgressColor(metrics.aiTokens.used, metrics.aiTokens.limit)}`} style={{ width: `${Math.min((metrics.aiTokens.used / metrics.aiTokens.limit) * 100, 100)}%` }} />
                    </div>
                  </td>

                  {/* Auto-billing toggle */}
                  <td className="px-5 py-4 text-center">
                    <button
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${t.autoBillOverages ? 'bg-indigo-600' : 'bg-gray-300'
                        }`}
                    >
                      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${t.autoBillOverages ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                    </button>
                    <p className={`text-[10px] mt-1 ${t.autoBillOverages ? 'text-indigo-600 font-medium' : 'text-gray-400'}`}>
                      {t.autoBillOverages ? 'Enabled' : 'Disabled'}
                    </p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
