import { ArrowUpRight, ArrowDownRight, Activity, Users, DollarSign, Bot, MessageSquare } from 'lucide-react';

const BI_METRICS = [
  { label: 'Customer Acquisition Cost (CAC)', value: '$124.50', change: '-12%', trend: 'up', sub: 'vs last month' },
  { label: 'Customer Lifetime Value (LTV)', value: '$4,250', change: '+5%', trend: 'up', sub: 'vs last month' },
  { label: 'LTV:CAC Ratio', value: '34:1', change: '+18%', trend: 'up', sub: 'excellent health' },
  { label: 'Average Revenue Per User (ARPU)', value: '$97.20', change: '+2%', trend: 'up', sub: 'across all plans' },
];

const ADOPTION_STATS = [
  { feature: 'Core CRM (Contacts, Deals)', usage: '100%', users: '142 Tenants', color: 'bg-indigo-500' },
  { feature: 'AI Assistant', usage: '84%', users: '119 Tenants', color: 'bg-purple-500' },
  { feature: 'WhatsApp Integration', usage: '62%', users: '88 Tenants', color: 'bg-emerald-500' },
  { feature: 'Workflow Automation', usage: '45%', users: '64 Tenants', color: 'bg-blue-500' },
  { feature: 'Document Storage', usage: '30%', users: '42 Tenants', color: 'bg-amber-500' },
];

export function AdvancedBIPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Advanced BI & Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">Deep insights into SaaS unit economics and feature adoption.</p>
        </div>
      </div>

      {/* Unit Economics */}
      <h2 className="text-sm font-semibold text-gray-900 mt-8 mb-2">Unit Economics (SaaS Metrics)</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {BI_METRICS.map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {s.trend === 'up'
                ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />
              }
              <span className="text-xs font-medium text-emerald-600">{s.change}</span>
              <span className="text-xs text-gray-400">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Feature Adoption Leaderboard */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-6">Feature Adoption (Global)</h2>
          <div className="space-y-6">
            {ADOPTION_STATS.map(stat => (
              <div key={stat.feature}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-gray-800">{stat.feature}</span>
                  <span className="font-bold text-gray-900">{stat.usage} <span className="font-normal text-gray-500">({stat.users})</span></span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className={`h-2 rounded-full ${stat.color}`} style={{ width: stat.usage }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Churn & Retention (Placeholder for Chart) */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Churn & Retention Trends</h2>
          <div className="flex-1 min-h-[250px] bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center flex-col gap-2 mt-2">
            <Activity className="w-6 h-6 text-gray-400" />
            <p className="text-xs text-gray-500 font-medium">Monthly Churn Rate Graph Visualization</p>
          </div>
        </div>
      </div>
    </div>
  );
}
