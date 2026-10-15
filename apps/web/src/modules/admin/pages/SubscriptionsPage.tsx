import { ArrowUpRight, ArrowDownRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLAN_STATS = [
  { plan: 'Enterprise', tenants: 18, mrr: '$7,200', arr: '$86,400', color: 'bg-indigo-600' },
  { plan: 'Pro', tenants: 64, mrr: '$3,840', arr: '$46,080', color: 'bg-indigo-400' },
  { plan: 'Basic', tenants: 60, mrr: '$1,410', arr: '$16,920', color: 'bg-indigo-200' },
];

const INVOICES = [
  { id: 'INV-2609', tenant: 'Stark Industries', plan: 'Enterprise', amount: '$800', date: 'Sep 20, 2026', status: 'Paid' },
  { id: 'INV-2608', tenant: 'Acme Corp', plan: 'Enterprise', amount: '$400', date: 'Sep 18, 2026', status: 'Paid' },
  { id: 'INV-2607', tenant: 'Initech', plan: 'Basic', amount: '$24', date: 'Sep 15, 2026', status: 'Failed' },
  { id: 'INV-2606', tenant: 'Wayne Enterprises', plan: 'Pro', amount: '$60', date: 'Sep 12, 2026', status: 'Paid' },
  { id: 'INV-2605', tenant: 'Globex Inc', plan: 'Pro', amount: '$60', date: 'Sep 10, 2026', status: 'Paid' },
];

export function SubscriptionsPage() {
  const totalMRR = 12450;
  const lastMRR = 10920;
  const growth = (((totalMRR - lastMRR) / lastMRR) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Subscriptions & Revenue</h1>
          <p className="text-xs text-gray-500 mt-0.5">Financial overview across all active plans.</p>
        </div>
        <Button variant="outline" className="gap-2 text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* MRR / ARR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'MRR', value: `₹${totalMRR.toLocaleString('en-IN')}`, change: `+${growth}%`, trend: 'up' },
          { label: 'ARR', value: `₹${(totalMRR * 12).toLocaleString('en-IN')}`, change: `+${growth}%`, trend: 'up' },
          { label: 'Active Tenants', value: '128', change: '+5', trend: 'up' },
          { label: 'Churn This Month', value: '2', change: '-1', trend: 'up' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <div className="flex items-center gap-1 mt-1.5">
              {s.trend === 'up' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
              <span className="text-xs font-medium text-emerald-600">{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue by Plan</h2>
        <div className="grid grid-cols-3 gap-4">
          {PLAN_STATS.map(p => (
            <div key={p.plan} className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${p.color}`} />
                <span className="text-sm font-semibold text-gray-800">{p.plan}</span>
              </div>
              <p className="text-xs text-gray-500">Tenants: <span className="font-semibold text-gray-800">{p.tenants}</span></p>
              <p className="text-xs text-gray-500 mt-1">MRR: <span className="font-semibold text-gray-800">{p.mrr}</span></p>
              <p className="text-xs text-gray-500 mt-1">ARR: <span className="font-semibold text-gray-800">{p.arr}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Invoices</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {INVOICES.map(inv => (
              <tr key={inv.id} className="hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-3 text-xs font-mono text-gray-600">{inv.id}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900">{inv.tenant}</td>
                <td className="px-5 py-3 text-xs text-gray-500">{inv.plan}</td>
                <td className="px-5 py-3 text-sm font-semibold text-gray-900">{inv.amount}</td>
                <td className="px-5 py-3 text-xs text-gray-400">{inv.date}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                    inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>{inv.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
