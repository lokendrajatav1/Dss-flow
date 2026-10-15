import { useState } from 'react';

const FEATURES = [
  { id: 'ai_assistant', name: 'AI Assistant', description: 'Gemini-powered sales assistant and lead scoring', category: 'Intelligence', globalEnabled: true },
  { id: 'whatsapp', name: 'WhatsApp Messaging', description: 'Send and receive WhatsApp messages via WABA API', category: 'Communication', globalEnabled: true },
  { id: 'automation', name: 'Workflow Automation', description: 'Multi-step automated sequences and triggers', category: 'Intelligence', globalEnabled: true },
  { id: 'campaigns', name: 'Email Campaigns', description: 'Bulk email campaign management', category: 'Communication', globalEnabled: false },
  { id: 'payments', name: 'Payments', description: 'Razorpay/Stripe payment collection and tracking', category: 'Finance', globalEnabled: true },
  { id: 'products', name: 'Product Catalog', description: 'Manage product/service catalog for quotes', category: 'Finance', globalEnabled: true },
  { id: 'documents', name: 'Document Management', description: 'File storage and document sharing', category: 'CRM', globalEnabled: false },
];

export function FeatureFlagsPage() {
  const [features, setFeatures] = useState(FEATURES);

  const toggle = (id: string) => {
    setFeatures(prev => prev.map(f => f.id === id ? { ...f, globalEnabled: !f.globalEnabled } : f));
  };

  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Feature Flags</h1>
        <p className="text-xs text-gray-500 mt-0.5">Toggle features globally across all tenants. Per-tenant overrides available in Tenant Management.</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 font-medium">
        ⚠️ Changes here affect ALL tenants globally. Use per-tenant settings for individual overrides.
      </div>

      {categories.map(cat => (
        <div key={cat} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{cat}</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {features.filter(f => f.category === cat).map(feature => (
              <div key={feature.id} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{feature.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                </div>
                <button
                  onClick={() => toggle(feature.id)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    feature.globalEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    feature.globalEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
