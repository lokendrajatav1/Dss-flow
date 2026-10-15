import { CreditCard, Download, Zap, Shield, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BillingPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Billing & Usage</h1>
        <Button className="bg-indigo-600 hover:bg-indigo-700">Update Payment Method</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Pro Tier Subscription</h2>
                <p className="text-sm text-gray-500">Active until Oct 24, 2026</p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">You are on the Pro Tier. This gives you access to advanced automation, AI features, and up to 10,000 WhatsApp messages per month.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline">Downgrade Plan</Button>
            <Button className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 shadow-none border-none">Upgrade to Enterprise</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center">
          <h3 className="text-white/80 text-sm font-medium mb-1">Current Monthly Bill</h3>
          <p className="text-4xl font-bold mb-4">$99<span className="text-lg font-normal text-white/60">/mo</span></p>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 text-white/80" />
              <span>Next charge on Oct 24</span>
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 text-white/80" />
              <span>Payment via Card ending in 4242</span>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Metering */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Month Usage</h2>
        
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">WhatsApp Messages</span>
              <span className="text-gray-900">8,450 / 10,000</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: '84.5%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">AI Tokens</span>
              <span className="text-gray-900">45,000 / 100,000</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-gray-700">Active Contacts</span>
              <span className="text-gray-900">1,250 / 5,000</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 font-medium">Invoice Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Plan</th>
              <th className="px-6 py-4 font-medium text-right">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { id: 'INV-001', date: 'Sep 24, 2026', amount: '$99.00', status: 'Paid', plan: 'Pro Tier' },
              { id: 'INV-002', date: 'Aug 24, 2026', amount: '$99.00', status: 'Paid', plan: 'Pro Tier' },
              { id: 'INV-003', date: 'Jul 24, 2026', amount: '$99.00', status: 'Paid', plan: 'Pro Tier' },
            ].map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-gray-900 font-medium">{invoice.date}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-900 font-medium">{invoice.amount}</td>
                <td className="px-6 py-4 text-gray-500">{invoice.plan}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center justify-end w-full gap-1">
                    <Download className="w-4 h-4" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
