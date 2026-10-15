import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function SystemSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">System Settings</h1>
          <p className="text-xs text-gray-500 mt-0.5">Global configuration for the KeroCRM platform.</p>
        </div>
        <Button onClick={handleSave} className={`gap-2 text-sm transition-all ${saved ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
          <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* API Integrations */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">API Integrations</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Razorpay Key ID (Global)</label>
              <Input type="password" value="rzp_live_xxxxxxxxxxx" readOnly className="text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Razorpay Key Secret</label>
              <Input type="password" value="xxxxxxxxxxxxxxxx" readOnly className="text-sm font-mono" />
            </div>
            <hr className="border-gray-100" />
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">WhatsApp Cloud API Token</label>
              <Input type="password" value="EAABxxxxxxxxxxxxxxxxxxxxxxx" readOnly className="text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SendGrid API Key (System Emails)</label>
              <Input type="password" value="SG.xxxxxxxxxxxxxxxxxxxxxxx" readOnly className="text-sm font-mono" />
            </div>
          </div>
        </div>

        {/* Global Limits */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Global Rate Limits</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max API Requests / Min (Per Tenant)</label>
              <Input type="number" defaultValue={600} className="text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Max Emails / Day (Pro Plan)</label>
              <Input type="number" defaultValue={5000} className="text-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
