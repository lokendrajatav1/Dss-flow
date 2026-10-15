import { useState } from 'react';
import { ArrowLeft, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export function ConfigureJustdialPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Dynamically get the API Base URL from environment variables
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.yourdomain.com/api/v1';
  const webhookUrl = `${API_BASE}/webhooks/justdial/${user?.companyId || 'YOUR_COMPANY_ID'}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/integrations')}>
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Justdial Integration</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto mt-16 p-6 text-center flex flex-col items-center space-y-8">

        <p className="text-[15px] text-gray-800">
          Receive new leads from your Justdial Vendor Account into your DSSFlow account.
        </p>

        <p className="text-[15px] text-gray-800">
          Copy the Webhook URL below and provide it to your Justdial Account Manager or configure it in your JdOmni portal.
        </p>

        <p className="text-[15px] text-gray-800">
          Once configured, any new enquiries from Justdial will automatically sync to your Leads pipeline.
        </p>

        <div className="pt-4 w-full max-w-xl">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-mono text-gray-800 break-all text-left">
              {webhookUrl}
            </div>
            <Button 
              onClick={copyToClipboard}
              className="bg-[#007bff] hover:bg-[#0069d9] text-white shrink-0 h-[46px] px-6"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied' : 'Copy URL'}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
