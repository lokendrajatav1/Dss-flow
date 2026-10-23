import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  PhoneCall,
  CheckCircle2,
  Copy,
  ShieldCheck,
  Building2,
  Cloud,
  Server,
  Radio,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useDialer } from '@/context/TelephonyContext';

export function ConfigureTelephonyPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshTataConfig, tataConfig } = useDialer();

  // Mode Selection: 'sip_trunk' (Local PBX Box / MicroSIP) | 'smartflo' (Cloud API)
  const [trunkType, setTrunkType] = useState<'sip_trunk' | 'smartflo'>('sip_trunk');
  const [dialMethod, setDialMethod] = useState<'microsip' | 'pbx_gateway'>('microsip');

  // SIP Trunk / Local PBX Box fields
  const [pbxHost, setPbxHost] = useState('192.168.1.100');
  const [pbxPort, setPbxPort] = useState('8089');
  const [pbxBrand, setPbxBrand] = useState('Grandstream');
  const [agentExtension, setAgentExtension] = useState('101');
  const [pbxUsername, setPbxUsername] = useState('');
  const [pbxSecret, setPbxSecret] = useState('');

  // Smartflo fields
  const [tataApiToken, setTataApiToken] = useState('');
  const [callerId, setCallerId] = useState('');
  const [agentNumber, setAgentNumber] = useState('');

  // Test Call state
  const [testNumber, setTestNumber] = useState('');
  const [isDialingTest, setIsDialingTest] = useState(false);

  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
  const telephonyWebhookUrl = `${API_BASE}/webhooks/telephony/${user?.companyId || 'YOUR_COMPANY_ID'}`;

  // Load saved configuration from backend
  useEffect(() => {
    api.get('/integrations/telephony/tata-config')
      .then(res => {
        if (res.data) {
          if (res.data.trunkType) setTrunkType(res.data.trunkType);
          if (res.data.dialMethod) setDialMethod(res.data.dialMethod);
          if (res.data.apiToken) setTataApiToken(res.data.apiToken);
          if (res.data.callerId) setCallerId(res.data.callerId);
          if (res.data.defaultAgentNumber) setAgentNumber(res.data.defaultAgentNumber);
          if (res.data.pbxHost) setPbxHost(res.data.pbxHost);
          if (res.data.pbxPort) setPbxPort(res.data.pbxPort);
          if (res.data.pbxBrand) setPbxBrand(res.data.pbxBrand);
          if (res.data.agentExtension) setAgentExtension(res.data.agentExtension);
          if (res.data.pbxUsername) setPbxUsername(res.data.pbxUsername);
        }
      })
      .catch(() => {});
  }, []);

  // Test Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const res = await api.post('/integrations/telephony/test-tata', {
        trunkType,
        dialMethod,
        apiToken: tataApiToken.trim(),
        callerId: callerId.trim(),
        defaultAgentNumber: agentNumber.trim(),
        pbxHost: pbxHost.trim(),
        pbxPort: pbxPort.trim(),
        agentExtension: agentExtension.trim()
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: trunkType === 'sip_trunk' ? 'Tata SIP Trunk Ready!' : 'Tata Smartflo Connected!',
          text: res.data.message || 'Settings validated successfully.',
          confirmButtonColor: '#4f46e5'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: res.data?.message || 'Could not verify configuration.',
          confirmButtonColor: '#ef4444'
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Connection Test Failed',
        text: err?.response?.data?.message || 'Failed to verify telephony connection.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Trigger Live Test Call
  const handleRunTestCall = async () => {
    const cleanNum = testNumber.replace(/\D/g, '');
    if (!cleanNum || cleanNum.length < 10) {
      Swal.fire({
        icon: 'warning',
        title: 'Valid Phone Required',
        text: 'Please enter a 10-digit mobile number to test.',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    setIsDialingTest(true);
    try {
      const res = await api.post('/integrations/telephony/call', {
        destinationNumber: cleanNum,
        contactName: 'Test Contact (Tata Trunk Verification)'
      });

      if (res.data?.success) {
        if (res.data.dialMethod === 'microsip') {
          // Trigger browser URI for MicroSIP
          const dialUri = res.data.telUri || res.data.sipUri;
          const link = document.createElement('a');
          link.href = dialUri;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          Swal.fire({
            icon: 'success',
            title: 'MicroSIP Dialing Triggered!',
            html: `
              <div style="text-align: left; font-size: 13px; line-height: 1.5;">
                <p>📞 <strong>Destination:</strong> ${cleanNum}</p>
                <p>⚡ <strong>URI:</strong> <code>${dialUri}</code></p>
                <p style="margin-top: 6px; color: #475569;">Your local MicroSIP / Softphone application should now be dialing out using your Tata Trunk line!</p>
              </div>
            `,
            confirmButtonColor: '#4f46e5'
          });
        } else if (res.data.dialMethod === 'pbx_gateway') {
          Swal.fire({
            icon: 'success',
            title: 'PBX Box Signal Dispatched!',
            html: `
              <div style="text-align: left; font-size: 13px; line-height: 1.5;">
                <p>🏢 <strong>PBX Host:</strong> ${res.data.pbxHost}:${res.data.pbxPort || '8089'}</p>
                <p>📞 <strong>Extension Ringing:</strong> ${res.data.agentNumber || agentExtension}</p>
                <p>🔗 <strong>Bridging To:</strong> ${cleanNum}</p>
              </div>
            `,
            confirmButtonColor: '#4f46e5'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Tata Smartflo Call Initiated!',
            text: res.data.message,
            confirmButtonColor: '#4f46e5'
          });
        }
      } else {
        Swal.fire('Notice', res.data?.message || 'Could not complete test call.', 'warning');
      }
    } catch (err: any) {
      Swal.fire('Error', err?.response?.data?.message || 'Failed to trigger test call.', 'error');
    } finally {
      setIsDialingTest(false);
    }
  };

  // Save settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/integrations/telephony/save-tata', {
        trunkType,
        dialMethod,
        apiToken: tataApiToken.trim(),
        callerId: callerId.trim(),
        defaultAgentNumber: agentNumber.trim(),
        pbxHost: pbxHost.trim(),
        pbxPort: pbxPort.trim(),
        pbxBrand,
        agentExtension: agentExtension.trim(),
        pbxUsername: pbxUsername.trim(),
        pbxSecret: pbxSecret.trim()
      });

      await refreshTataConfig();

      Swal.fire({
        icon: 'success',
        title: 'Settings Saved!',
        text: `${trunkType === 'sip_trunk' ? 'Tata SIP Trunk' : 'Tata Smartflo'} configuration saved successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save Tata settings.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(telephonyWebhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
    Swal.fire({
      icon: 'success',
      title: 'Webhook URL Copied!',
      text: 'Paste this URL into your PBX / Tata Smartflo CDR Webhook settings.',
      timer: 1500,
      showConfirmButton: false,
      toast: true,
      position: 'top-end'
    });
  };

  return (
    <div className="max-w-[850px] mx-auto pb-12">
      {/* Top Navigation */}
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={() => navigate('/integrations')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Integrations
        </button>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-7 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Tata Telephony &amp; Trunk Integration
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Configure Tata SIP Trunk (Hardware PBX Box) or Tata Smartflo Cloud
              </p>
            </div>
          </div>

          <div>
            {tataConfig?.configured ? (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active Connected
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Setup Required
              </span>
            )}
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setTrunkType('sip_trunk')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
              trunkType === 'sip_trunk'
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`p-2 rounded-md ${trunkType === 'sip_trunk' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                Tata SIP Trunk (PBX Box)
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-medium">Your Setup</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                For offices with a physical hardware PBX box or MicroSIP softphones.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTrunkType('smartflo')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-3 ${
              trunkType === 'smartflo'
                ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className={`p-2 rounded-md ${trunkType === 'smartflo' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900">
                Tata Smartflo (Cloud API)
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">
                For Tata Cloud Telephony using API Token &amp; Click-to-Call REST API.
              </p>
            </div>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">

          {/* ==================== TATA SIP TRUNK (HARDWARE BOX) CONFIG ==================== */}
          {trunkType === 'sip_trunk' && (
            <div className="space-y-5 bg-slate-50/70 p-4 sm:p-5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Tata SIP Trunk &amp; PBX Box Settings
                </h3>
              </div>

              {/* Dialing Method Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Call Trigger Method:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setDialMethod('microsip')}
                    className={`p-3 rounded-md border flex items-start gap-2.5 cursor-pointer text-left ${
                      dialMethod === 'microsip'
                        ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dialMethod"
                      checked={dialMethod === 'microsip'}
                      onChange={() => setDialMethod('microsip')}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        MicroSIP / Softphone (Direct 1-Click)
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Browser opens MicroSIP instantly to dial out via your Tata Trunk. No server routing needed.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setDialMethod('pbx_gateway')}
                    className={`p-3 rounded-md border flex items-start gap-2.5 cursor-pointer text-left ${
                      dialMethod === 'pbx_gateway'
                        ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600'
                        : 'border-gray-300 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dialMethod"
                      checked={dialMethod === 'pbx_gateway'}
                      onChange={() => setDialMethod('pbx_gateway')}
                      className="mt-0.5 text-indigo-600"
                    />
                    <div>
                      <div className="text-xs font-bold text-gray-900">
                        Local PBX Gateway (HTTP API / AMI)
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        CRM sends dial command directly to your office box IP (Grandstream / Asterisk / Matrix).
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* PBX Box Details (if pbx_gateway) */}
              {dialMethod === 'pbx_gateway' && (
                <div className="space-y-4 pt-2 border-t border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PBX Brand / Model
                      </label>
                      <select
                        value={pbxBrand}
                        onChange={(e) => setPbxBrand(e.target.value)}
                        className="w-full bg-white h-9 text-xs border border-gray-300 rounded px-2.5"
                      >
                        <option value="Grandstream">Grandstream UCM</option>
                        <option value="Matrix">Matrix ETERNITY</option>
                        <option value="Asterisk">Asterisk / FreePBX</option>
                        <option value="Zycoo">Zycoo CooVox</option>
                        <option value="Generic">Other / Generic PBX</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PBX Box IP / Domain *
                      </label>
                      <Input
                        placeholder="e.g. 192.168.1.100"
                        value={pbxHost}
                        onChange={(e) => setPbxHost(e.target.value)}
                        className="bg-white h-9 text-xs font-mono border-gray-300 rounded"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        PBX API Port
                      </label>
                      <Input
                        placeholder="e.g. 8089 or 5038"
                        value={pbxPort}
                        onChange={(e) => setPbxPort(e.target.value)}
                        className="bg-white h-9 text-xs font-mono border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Agent Extension and Caller ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Agent SIP Extension *
                  </label>
                  <Input
                    placeholder="e.g. 101, 102, 1001"
                    value={agentExtension}
                    onChange={(e) => setAgentExtension(e.target.value)}
                    className="bg-white h-9 text-xs font-mono border-gray-300 rounded"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Internal extension number mapped to the agent's desk phone or MicroSIP.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Tata Trunk Pilot Number (Caller ID)
                  </label>
                  <Input
                    placeholder="e.g. 011-4500-1234 or official number"
                    value={callerId}
                    onChange={(e) => setCallerId(e.target.value)}
                    className="bg-white h-9 text-xs font-mono border-gray-300 rounded"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Main company landline number assigned by Tata Tele Services.
                  </p>
                </div>
              </div>

              {/* Quick Setup Instructions Box */}
              <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-xs text-indigo-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-indigo-900">
                  <Info className="w-4 h-4 text-indigo-600" />
                  How to test Tata SIP Trunk right now:
                </p>
                <p className="text-[11px] leading-relaxed">
                  <strong>Step 1:</strong> Keep your <strong>MicroSIP</strong> softphone app open on this computer with your Tata Trunk extension logged in.<br/>
                  <strong>Step 2:</strong> Use the <strong>"Live Test Call"</strong> box below to dial your personal mobile number.<br/>
                  <strong>Step 3:</strong> MicroSIP will automatically ring and dial your mobile through the Tata Trunk!
                </p>
              </div>
            </div>
          )}

          {/* ==================== TATA SMARTFLO (CLOUD API) CONFIG ==================== */}
          {trunkType === 'smartflo' && (
            <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Tata Smartflo API Credentials
                </h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  API Auth Token (Bearer Token) *
                </label>
                <div className="flex gap-2">
                  <Input
                    type="password"
                    placeholder="Paste your Tata Smartflo API Token"
                    value={tataApiToken}
                    onChange={(e) => setTataApiToken(e.target.value)}
                    className="bg-white h-9 text-xs font-mono border-gray-300 flex-1 rounded"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shrink-0 cursor-pointer"
                  >
                    {isTesting ? 'Testing...' : 'Test Token'}
                  </Button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Obtained from Tata Smartflo Portal &gt; Settings / Integration &gt; API Tokens.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Agent Phone / Extension Number *
                  </label>
                  <Input
                    placeholder="e.g. 9876543210 or extension 101"
                    value={agentNumber}
                    onChange={(e) => setAgentNumber(e.target.value)}
                    className="bg-white h-9 text-xs font-mono border-gray-300 rounded"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Your phone/extension that rings first when initiating a call.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Caller ID (Tata Virtual / Pilot Number)
                  </label>
                  <Input
                    placeholder="e.g. 011-4500-1234 or +91 98765 00000"
                    value={callerId}
                    onChange={(e) => setCallerId(e.target.value)}
                    className="bg-white h-9 text-xs font-mono border-gray-300 rounded"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    Number shown to customer upon receiving call.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================== LIVE TEST CALL VERIFICATION BOX ==================== */}
          <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600 animate-pulse" />
                <h3 className="text-sm font-bold text-gray-900">
                  Live Test Dial (Check Your Trunk Right Now)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Instant Verification
              </span>
            </div>

            <p className="text-xs text-gray-600">
              Enter any 10-digit mobile number below to test that the CRM triggers your Tata Trunk or MicroSIP:
            </p>

            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                placeholder="Enter 10-digit mobile (e.g. 9876543210)"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="bg-white h-10 text-xs font-mono border-gray-300 flex-1 rounded"
              />
              <Button
                type="button"
                onClick={handleRunTestCall}
                disabled={isDialingTest}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 text-xs px-5 rounded cursor-pointer shrink-0 gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {isDialingTest ? 'Connecting Call...' : 'Test Dial Now'}
              </Button>
            </div>
          </div>

          {/* Section: Call Recording Webhook */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-gray-900">
              Automatic Call Recording Webhook
            </h3>

            <p className="text-xs text-gray-600">
              Paste this URL in your Tata Smartflo Portal or PBX Box under <strong>CDR &amp; Call Recording Webhooks</strong> so recordings appear automatically on lead timelines:
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono text-gray-800 break-all select-all">
                {telephonyWebhookUrl}
              </div>

              <Button
                type="button"
                onClick={copyWebhookUrl}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-4 gap-1.5 cursor-pointer shrink-0"
              >
                {copiedWebhook ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy Webhook URL'}</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="text-xs h-10 border-gray-300 text-gray-700 font-semibold cursor-pointer"
            >
              {isTesting ? 'Verifying...' : 'Validate Configuration'}
            </Button>

            <Button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-10 text-xs rounded cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default ConfigureTelephonyPage;
