import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle2, Send, ExternalLink, ShieldCheck, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Swal from 'sweetalert2';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export function ConfigureFacebookPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'webhook' | 'oauth'>('webhook');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Direct Test Lead Form State
  const [testName, setTestName] = useState('Rahul Sharma (Meta Ads Test)');
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [testEmail, setTestEmail] = useState('rahul.meta@testlead.com');
  const [testCity, setTestCity] = useState('Mumbai');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // OAuth States
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccountName, setConnectedAccountName] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') 
    : 'http://localhost:4000';
  const companyId = user?.companyId || 'ab1f3a06-27df-4294-93f6-3d572ac96042';
  const webhookUrl = `${API_BASE}/webhooks/facebook/${companyId}`;
  const verifyToken = 'my_secure_verify_token';

  useEffect(() => {
    // Fetch existing integrations to check if Facebook is already connected
    api.get('/integrations').then((res) => {
      const integrations = res.data.integrations || [];
      const fbIntegration = integrations.find((i: any) => i.providerName === 'facebook' && i.status === 'active');
      if (fbIntegration) {
        setIsConnected(true);
        if (fbIntegration.configJson) {
          try {
            const config = JSON.parse(fbIntegration.configJson);
            if (config.userName) setConnectedAccountName(config.userName);
          } catch (e) {}
        }
      }
    }).catch(err => console.error('Failed to fetch integrations', err));

    // Check if script already exists
    if (document.getElementById('facebook-jssdk')) return;

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || '2520039771825254',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
    };

    // Load the SDK asynchronously
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s) as HTMLScriptElement;
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode?.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }, []);

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const copyVerifyToken = () => {
    navigator.clipboard.writeText(verifyToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSendTestLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName || !testPhone) {
      Swal.fire('Required Fields', 'Please enter at least Name and Phone number.', 'warning');
      return;
    }

    setIsSendingTest(true);
    try {
      const res = await api.post(`/webhooks/facebook/${companyId}`, {
        name: testName,
        phone: testPhone,
        email: testEmail,
        city: testCity,
        test: true
      });

      if (res.data?.success) {
        Swal.fire({
          title: 'Meta Test Lead Created!',
          text: `Lead for ${testName} (${testPhone}) has been captured successfully in your CRM.`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#007bff',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Go to Lead Manager',
          cancelButtonText: 'Stay Here'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/lead-manager');
          }
        });
      } else {
        Swal.fire('Error', res.data?.message || 'Failed to create test lead', 'error');
      }
    } catch (err: any) {
      console.error('Failed to send test lead:', err);
      Swal.fire('Error', err.response?.data?.message || err.message || 'Failed to connect to webhook API', 'error');
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleFacebookLogin = () => {
    setIsConnecting(true);
    
    if (!window.FB) {
      Swal.fire('Error', 'Facebook SDK not loaded. Check internet or adblocker.', 'error');
      setIsConnecting(false);
      return;
    }

    window.FB.login(function (response: any) {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const userID = response.authResponse.userID;
        
        window.FB.api('/me', function(meResponse: any) {
          const userName = meResponse.name || 'Facebook User';
          
          window.FB.api('/me/accounts', function(accountsResponse: any) {
            const pageIds = accountsResponse.data ? accountsResponse.data.map((page: any) => page.id) : [];
            
            if (accountsResponse.data) {
              accountsResponse.data.forEach((page: any) => {
                window.FB.api(`/${page.id}/subscribed_apps`, 'post', {
                  subscribed_fields: ['leadgen'],
                  access_token: page.access_token
                }, function(subResponse: any) {
                  console.log(`Subscribed App to Page ${page.id}:`, subResponse);
                });
              });
            }

            api.post('/integrations/save', { 
              providerName: 'facebook', 
              accessToken,
              configJson: JSON.stringify({ userID, userName, pageIds })
            })
              .then(() => {
                Swal.fire({
                  title: 'Success!',
                  text: `Successfully connected to Facebook as ${userName}!`,
                  icon: 'success',
                  timer: 3000,
                  showConfirmButton: false
                });
                setIsConnected(true);
                setConnectedAccountName(userName);
              })
              .catch((err) => {
                console.error('API Error:', err);
                Swal.fire('Error', 'Could not save connection to server.', 'error');
              })
              .finally(() => {
                setIsConnecting(false);
              });
          });
        });
      } else {
        Swal.fire('Cancelled', 'User cancelled login or did not authorize.', 'warning');
        setIsConnecting(false);
      }
    }, { 
      scope: 'public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata,leads_retrieval' 
    });
  };

  const handleDisconnect = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will stop receiving new leads from Facebook.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, disconnect it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setIsConnecting(true);
        api.delete('/integrations/facebook')
          .then(() => {
            setIsConnected(false);
            setConnectedAccountName(null);
            Swal.fire('Disconnected!', 'Facebook has been disconnected.', 'success');
          })
          .catch(err => {
            console.error('API Error:', err);
            Swal.fire('Error', 'Failed to disconnect.', 'error');
          })
          .finally(() => setIsConnecting(false));
      }
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => navigate('/integrations')}>
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facebook & Instagram Lead Ads Integration</h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Automatically ingest and assign leads from Meta Lead Ads into DSSFlow CRM
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 pb-20">
        
        {/* Method Switcher Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('webhook')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'webhook'
                ? 'border-[#007bff] text-[#007bff]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Direct Webhook Setup & Testing (Recommended)
          </button>
          <button
            onClick={() => setActiveTab('oauth')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'oauth'
                ? 'border-[#007bff] text-[#007bff]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-3.5 h-3.5 fill-current">
              <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
            </svg>
            Facebook Account Login (OAuth)
          </button>
        </div>

        {/* TAB 1: WEBHOOK & TESTING */}
        {activeTab === 'webhook' && (
          <div className="space-y-6">
            {/* Webhook Configuration Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1877F2] flex items-center justify-center font-bold text-lg">
                  f
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Meta Webhooks Configuration</h2>
                  <p className="text-sm text-gray-500">Configure these settings inside Meta Developer Portal or your Lead Gen Webhook bridge</p>
                </div>
              </div>

              <div className="space-y-5 mt-6">
                {/* Callback URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Callback URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-800 break-all select-all">
                      {webhookUrl}
                    </div>
                    <Button 
                      type="button" 
                      onClick={copyWebhookUrl}
                      className="bg-[#28a745] hover:bg-[#218838] text-white h-[42px] px-5 shrink-0 shadow-sm gap-2"
                    >
                      {copiedUrl ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedUrl ? 'Copied' : 'Copy URL'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Paste this into <strong>Meta App Dashboard &gt; Webhooks &gt; Page &gt; Callback URL</strong>.
                  </p>
                </div>

                {/* Verify Token */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Verify Token
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-gray-800 break-all select-all">
                      {verifyToken}
                    </div>
                    <Button 
                      type="button" 
                      onClick={copyVerifyToken}
                      className="bg-gray-800 hover:bg-gray-900 text-white h-[42px] px-5 shrink-0 shadow-sm gap-2"
                    >
                      {copiedToken ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      {copiedToken ? 'Copied' : 'Copy Token'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter this verify token to instantly validate Meta's handshake challenge.
                  </p>
                </div>

                {/* Subscription Field */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Subscribed Fields:</span> Check/subscribe to <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-blue-700">leadgen</code> on your Facebook Page. Whenever a customer submits your Instant Lead Form on Facebook or Instagram, Meta sends the lead data to this URL immediately.
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">How to connect with Meta Developer Portal:</h3>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                  <li>Visit <a href="https://developers.facebook.com/apps" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">developers.facebook.com/apps <ExternalLink className="w-3 h-3" /></a> and open your App.</li>
                  <li>In the left sidebar, click <strong>Webhooks</strong> &gt; Select <strong>Page</strong> in the dropdown &gt; Click <strong>Subscribe to this object</strong>.</li>
                  <li>Paste the <strong>Callback URL</strong> and <strong>Verify Token</strong> from above, then click <strong>Verify and Save</strong>.</li>
                  <li>Scroll down to the <strong>leadgen</strong> row and click <strong>Subscribe</strong>.</li>
                  <li>You can test leads anytime using the <a href="https://developers.facebook.com/tools/lead-ads-testing" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-semibold">Meta Lead Ads Testing Tool <ExternalLink className="w-3 h-3" /></a> or use the instant test generator below!</li>
                </ol>
              </div>
            </div>

            {/* Test Lead Generator Card */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Send Test Meta Lead (100% Flow Verification)</h3>
                    <p className="text-xs text-gray-500">Test the lead ingestion flow right now without needing active Facebook ads</p>
                  </div>
                </div>
                <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                  Ready to Test
                </span>
              </div>

              <form onSubmit={handleSendTestLead} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Lead Full Name</label>
                    <input
                      type="text"
                      value={testName}
                      onChange={(e) => setTestName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile / Phone Number</label>
                    <input
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="e.g. rahul@example.com"
                      className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City / Location</label>
                    <input
                      type="text"
                      value={testCity}
                      onChange={(e) => setTestCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full bg-white border border-gray-300 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-gray-500">
                    Lead will be tagged with source: <span className="font-semibold text-gray-700">Meta Ads (Facebook/Instagram)</span>
                  </p>
                  <Button
                    type="submit"
                    disabled={isSendingTest}
                    className="bg-[#007bff] hover:bg-[#0069d9] text-white h-10 px-6 rounded-md font-medium shadow-sm gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {isSendingTest ? 'Sending Test Lead...' : 'Send Test Meta Lead'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: OAUTH LOGIN */}
        {activeTab === 'oauth' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center flex flex-col items-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-8 h-8 fill-current">
                <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
              </svg>
            </div>

            <div className="max-w-lg space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Connect via Facebook OAuth</h2>
              <p className="text-sm text-gray-600">
                Sign in with the Facebook account that owns your Business Pages to automatically subscribe your lead forms to DSSFlow.
              </p>
            </div>

            <div className="bg-amber-50 text-amber-900 text-xs p-4 rounded-lg border border-amber-200 text-left max-w-lg leading-relaxed">
              <strong>Requirement Note:</strong> You must log in using the Facebook Page Administrator/Owner account. Editor or advertiser permissions without admin role cannot grant webhook subscriptions.
            </div>

            <div className="pt-2 w-full max-w-md">
              {!isConnected ? (
                <button 
                  onClick={handleFacebookLogin}
                  disabled={isConnecting}
                  className={`w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors h-11 ${isConnecting ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-4 h-4 fill-white">
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                  <span>{isConnecting ? 'Connecting...' : 'Login with Facebook'}</span>
                </button>
              ) : (
                <div className="w-full bg-white border border-gray-200 rounded-lg p-5 text-left shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{connectedAccountName || 'Facebook Account'}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        <span className="text-xs text-green-700 font-semibold">Active & Synced</span>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleDisconnect}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-md h-9 transition-colors"
                  >
                    {isConnecting ? 'Disconnecting...' : 'Disconnect Facebook Account'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
