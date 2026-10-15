import { useState, useEffect } from 'react';
import { Plus, ChevronDown, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export const WhatsAppTab = ({ data }: { data: any }) => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [status, setStatus] = useState<string>('DISCONNECTED');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/whatsapp/status');
      setStatus(res.data.status);
      setQrCodeUrl(res.data.qrCodeUrl);
      setInfo(res.data.info);
    } catch (err) {
      console.error('Error fetching whatsapp status', err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleInitialize = async () => {
    setLoading(true);
    try {
      await api.post('/whatsapp/initialize');
      await fetchStatus();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post('/whatsapp/logout');
      await fetchStatus();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:shadow-md">
        <div className="flex items-start sm:items-center gap-5">
          <div className={`w-[52px] h-[52px] shrink-0 rounded-[16px] flex items-center justify-center ${data.iconBg}`}>
            <data.icon />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-gray-900 mb-1">{data.title}</h2>
            <p className="text-[14px] text-gray-500 font-normal leading-relaxed">{data.description}</p>
          </div>
        </div>
        {status === 'CONNECTED' ? (
          <Button onClick={handleLogout} variant="destructive" disabled={loading} className="shrink-0 h-10 px-5 rounded-lg shadow-sm gap-2 text-[14px]">
            <LogOut className="w-4 h-4" /> Disconnect
          </Button>
        ) : (
          <Button onClick={handleInitialize} disabled={loading || status !== 'DISCONNECTED'} className="shrink-0 bg-[#5b52f6] hover:bg-[#4f46e5] text-white font-medium h-10 px-5 rounded-lg shadow-sm gap-2 text-[14px]">
            <Plus className="w-4 h-4" /> {status === 'DISCONNECTED' ? 'Add WhatsApp Number' : 'Initializing...'}
          </Button>
        )}
      </div>

      <div className="bg-[#f8fafc] rounded-2xl border border-gray-100 overflow-hidden transition-all hover:border-gray-200">
        <button onClick={() => setIsGuideOpen(!isGuideOpen)} className="w-full flex items-center justify-between p-5 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100/50 flex items-center justify-center text-green-600">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <span className="font-medium text-[15px] text-gray-800">How to Connect WhatsApp Number (Step-by-Step)</span>
          </div>
          <div className="flex items-center gap-2 text-[13px] font-medium text-[#5b52f6]">
            Step-by-Step Guide
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isGuideOpen ? 'rotate-180' : ''}`} />
          </div>
        </button>
        {isGuideOpen && (
          <div className="px-5 pb-5 pt-2 text-[14px] text-gray-600 font-medium border-t border-gray-100 leading-relaxed">
            <div className="space-y-4 pt-2">
              <p>Click the <strong>"+ Add WhatsApp Number"</strong> button below to generate a new connection QR code.</p>
              <p>Open <strong>WhatsApp</strong> on your mobile phone.</p>
              <p>Tap <strong>Menu (⋮)</strong> or <strong>Settings {'>'} Linked Devices {'>'} Link a Device</strong>.</p>
              <p>Point your phone camera at the QR code displayed on screen to scan it.</p>
              <p><strong>Done!</strong> Your account name, phone number, and profile picture will auto-sync and display below.</p>
            </div>
          </div>
        )}
      </div>

      {status === 'CONNECTED' && info && (
        <div className="border border-green-200 bg-green-50/30 rounded-[20px] p-6 transition-all">
           <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-green-100">
               <CheckCircle2 className="w-7 h-7 text-green-500" />
             </div>
             <div>
               <h3 className="text-[16px] font-semibold text-gray-900">Connected to {info.pushname}</h3>
               <p className="text-[14px] text-gray-500 mt-0.5">Number: {info.wid?.user}</p>
             </div>
           </div>
        </div>
      )}

      {(status === 'INITIALIZING' || status === 'QR_READY') && (
        <div className="border border-dashed border-[#5b52f6]/40 bg-white rounded-[20px] p-6 transition-all hover:border-[#5b52f6]/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#f1f5f9] rounded-md flex items-center justify-center border border-gray-200">
                <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
              </div>
              <h3 className="text-[16px] font-semibold text-gray-800">Scan QR Code to Connect WhatsApp</h3>
            </div>
          </div>
          <div className="border border-gray-100 bg-gray-50/50 rounded-xl p-10 flex flex-col items-center justify-center text-center mt-2">
            {qrCodeUrl ? (
              <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 border-4 border-white shadow-md rounded-xl mb-4" />
            ) : (
              <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#5b52f6] animate-spin mb-4"></div>
            )}
            <p className="text-[13px] text-gray-500 font-medium max-w-sm">
              {qrCodeUrl ? 'Scan this QR code with WhatsApp (Linked Devices).' : 'Generating QR Code... Please wait.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
