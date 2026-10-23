import { useState } from 'react';
import { Search, Settings, Plus, FileSpreadsheet, Download, Upload, Link as LinkIcon, MessageCircle, PhoneCall } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const INTEGRATIONS_LIST = [
  { id: 'telephony', name: 'In-App Web Phone & Telephony', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: <PhoneCall className="w-6 h-6" />, color: 'bg-indigo-600' },
  { id: 'fb_ig', name: 'Facebook & Instagram', status: 'Configure', isBusinessPlan: false, icons: ['https://upload.wikimedia.org/wikipedia/commons/1/1b/Facebook_icon.svg', 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg'] },
  // { id: 'google_ads', name: 'Google Ads', status: 'Configure', isBusinessPlan: false, icon: 'https://thesvg.org/icons/google/default.svg' },
  { id: 'indiamart', name: 'IndiaMART', status: 'Configure', isBusinessPlan: false, icon: '/indiamart.png' },
  // { id: 'wordpress', name: 'WordPress', status: 'Configure', isBusinessPlan: false, icon: 'https://thesvg.org/icons/wordpress/default.svg' },
  // { id: 'woocommerce', name: 'WooCommerce', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'Woo', color: 'bg-purple-600' },
  // { id: 'pabbly', name: 'Pabbly', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'P', color: 'bg-green-500' },
  // { id: 'google_forms', name: 'Google Forms', status: 'Configure', isBusinessPlan: false, icon: 'https://thesvg.org/icons/google/default.svg' },
  { id: 'google_sheets', name: 'Google Sheet', status: 'Configure', isBusinessPlan: false, icon: 'https://thesvg.org/icons/google/default.svg' },
  // { id: 'linkedin', name: 'LinkedIn', status: 'Configure', isBusinessPlan: false, icon: 'https://thesvg.org/icons/linkedin/default.svg' },
  // { id: 'wix', name: 'Wix', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'W', color: 'bg-yellow-400' },
  // { id: 'clickfunnels', name: 'ClickFunnels', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'CF', color: 'bg-blue-600' },
  { id: 'webhooks', name: 'Webhooks', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: <LinkIcon className="w-6 h-6" />, color: 'bg-gray-800' },
  // { id: '99acres', name: '99acres', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: '99', color: 'bg-blue-600' },
  // { id: 'magicbricks', name: 'MagicBricks', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'mb', color: 'bg-red-500' },
  // { id: 'housing', name: 'Housing', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'H', color: 'bg-yellow-500' },
  // { id: 'quikr', name: 'Quikr Homes', status: 'Ask to Activate', isBusinessPlan: true, icon: null, textIcon: 'Q', color: 'bg-green-500' },
  // { id: 'commonfloor', name: 'Commonfloor', status: 'Ask to Activate', isBusinessPlan: true, icon: null, textIcon: 'C', color: 'bg-orange-500' },
  // { id: 'homeonline', name: 'Homeonline', status: 'Ask to Activate', isBusinessPlan: true, icon: null, textIcon: 'ho', color: 'bg-orange-600' },
  // { id: 'exportersindia', name: 'Exportersindia', status: 'Ask to Activate', isBusinessPlan: true, icon: null, textIcon: 'e', color: 'bg-blue-800' },
  { id: 'import_csv', name: 'Import from CSV', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: <Upload className="w-6 h-6" />, color: 'bg-green-600' },
  // { id: 'export_csv', name: 'Export to CSV', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: <Download className="w-6 h-6" />, color: 'bg-green-600' },
  // { id: 'justlead', name: 'JustLead', status: 'Ask to Activate', isBusinessPlan: true, icon: null, textIcon: 'JL', color: 'bg-blue-500' },
  { id: 'sulekha', name: 'Sulekha', status: 'Configure', isBusinessPlan: false, icon: '/sulekha.png' },
  { id: 'tradeindia', name: 'TradeIndia', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'TI', color: 'bg-orange-500' },
  // { id: 'website', name: 'Website', status: 'Configure', isBusinessPlan: false, icon: null, textIcon: 'WWW', color: 'bg-blue-500' },
  { id: 'justdial', name: 'JustDial', status: 'Configure', isBusinessPlan: false, icon: '/justdial.png' },
  // { id: 'lead_form', name: 'Lead Form', status: 'Manage', isBusinessPlan: false, icon: null, textIcon: <FileSpreadsheet className="w-6 h-6" />, color: 'bg-emerald-500' },
  // { id: 'whatsapp', name: 'WhatsApp', status: 'Configure', isBusinessPlan: false, icon: 'https://thesvg.org/icons/whatsapp/default.svg' },
];

export function IntegrationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredIntegrations = INTEGRATIONS_LIST.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">Integration</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 w-[240px] bg-white border-gray-200 text-sm focus-visible:ring-blue-500 rounded-lg"
            />
          </div>
          <Button size="icon" className="h-10 w-10 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-lg shrink-0">
            <Settings className="w-5 h-5" />
          </Button>
          <Button onClick={() => navigate('/inbox/channels')} className="h-10 bg-[#007bff] hover:bg-[#0069d9] text-white font-medium px-4 rounded-lg gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" /> Connect Channel
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
        {filteredIntegrations.map((app) => (
          <div key={app.id} className="relative bg-white rounded-[14px] p-4 flex items-center gap-3.5 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow">
            
            {/* Business Plan Badge */}
            {app.isBusinessPlan && (
              <div className="absolute -top-2.5 right-4 bg-[#374151] text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 shadow-sm border border-gray-600">
                Business Plan
              </div>
            )}

            {/* Icon */}
            <div className={`w-[44px] h-[44px] shrink-0 ${app.icons ? 'relative' : `rounded-xl flex items-center justify-center shadow-sm overflow-hidden text-white font-bold text-lg border border-gray-50 ${app.color || 'bg-blue-50'}`}`}>
              {app.icons ? (
                <>
                  <img src={app.icons[1]} alt="Instagram" className="absolute bottom-0 right-0 w-[28px] h-[28px] object-contain rounded-[6px] shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <img src={app.icons[0]} alt="Facebook" className="absolute top-0 left-0 w-[28px] h-[28px] z-10 object-contain rounded-[6px] shadow-sm" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </>
              ) : app.icon ? (
                <img src={app.icon} alt={app.name} className="w-7 h-7 object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                app.textIcon
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-[14px] font-bold text-gray-900 mb-1 truncate">{app.name}</h3>
              <div className="flex items-center">
                <button 
                  onClick={() => {
                    if (app.id === 'telephony') navigate('/configure-telephony');
                    if (app.id === 'fb_ig') navigate('/configure-facebook');
                    if (app.id === 'justdial') navigate('/configure-justdial');
                    if (app.id === 'indiamart') navigate('/configure-indiamart');
                    if (app.id === 'sulekha') navigate('/configure-sulekha');
                    if (app.id === 'tradeindia') navigate('/configure-tradeindia');
                    if (app.id === 'webhooks') navigate('/configure-webhooks');
                    if (app.id === 'google_sheets') navigate('/configure-google-sheets');
                    if (app.id === 'import_csv') navigate('/import-csv');
                  }}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition-colors whitespace-nowrap ${
                  app.status === 'Ask to Activate' 
                    ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                }`}>
                  {app.status}
                </button>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
