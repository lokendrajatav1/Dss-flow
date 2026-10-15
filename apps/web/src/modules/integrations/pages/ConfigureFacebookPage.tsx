import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Swal from 'sweetalert2';

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: any;
  }
}

export function ConfigureFacebookPage() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedAccountName, setConnectedAccountName] = useState<string | null>(null);

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
        appId: import.meta.env.VITE_FACEBOOK_APP_ID || '1234567890', // Replace with your actual Meta App ID
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

  const handleFacebookLogin = () => {
    setIsConnecting(true);
    
    if (!window.FB) {
      Swal.fire('Error', 'Facebook SDK not loaded. Check internet or adblocker.', 'error');
      setIsConnecting(false);
      return;
    }

    // Attempt login with required permissions
    window.FB.login(function (response: any) {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        const userID = response.authResponse.userID;
        
        // Fetch User's Name and Pages
        window.FB.api('/me', function(meResponse: any) {
          const userName = meResponse.name || 'Facebook User';
          
          // Fetch pages user has access to
          window.FB.api('/me/accounts', function(accountsResponse: any) {
            const pageIds = accountsResponse.data ? accountsResponse.data.map((page: any) => page.id) : [];
            
            // Subscribing our App to each Page to receive Webhooks!
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

            // Save token to backend
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
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Facebook Integration</h1>
        {!isConnected && (
          <Button 
            onClick={handleFacebookLogin}
            disabled={isConnecting}
            className="bg-[#007bff] hover:bg-[#0069d9] text-white gap-2 h-9 px-4 rounded-md"
          >
            <Plus className="w-4 h-4" /> {isConnecting ? 'Connecting...' : 'Add New'}
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto mt-16 p-6 text-center flex flex-col items-center space-y-8">

        <p className="text-[15px] text-gray-800">
          Receive new leads from your Facebook & Instagram Lead Ads into your DSSFlow account.
        </p>

        <p className="text-[15px] text-gray-800">
          Click 'Login with Facebook' and select the Facebook Pages you want to receive leads from.
        </p>

        <p className="text-[15px] text-gray-800">
          You need to log in using the page creator/owner account for the page; it will not sync if you use an editor or manager account.
        </p>

        <div className="pt-4 flex flex-col items-center gap-4 w-full">
          {!isConnected ? (
            <button 
              onClick={handleFacebookLogin}
              disabled={isConnecting}
              className={`flex items-center bg-[#4267B2] hover:bg-[#365899] text-white text-[15px] font-medium rounded shadow-sm transition-colors overflow-hidden h-11 ${isConnecting ? 'opacity-80 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-center w-11 h-full bg-[#3b5998]">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-5 h-5 fill-white">
                  <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                </svg>
              </div>
              <span className="px-6">{isConnecting ? 'Connecting...' : 'Login with Facebook'}</span>
            </button>
          ) : (
            <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#e8f0fe] rounded-full flex items-center justify-center text-[#1877f2]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-7 h-7 fill-current">
                      <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-gray-900">{connectedAccountName || 'Facebook Account'}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <span className="text-[13px] text-gray-500 font-medium">Active</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full border-t border-gray-100 pt-4 mt-2">
                <button 
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 text-[14px] font-medium rounded-lg h-10 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                  {isConnecting ? 'Disconnecting...' : 'Disconnect Account'}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
