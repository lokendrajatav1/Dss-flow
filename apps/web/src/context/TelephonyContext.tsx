import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { telephonyAudio } from '@/lib/dtmfAudio';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { CALL_OUTCOMES } from '@/lib/constants';

export type CallStatus = 'idle' | 'dialing' | 'connected' | 'ended';

export interface CallTarget {
  id?: string;
  name: string;
  phone: string;
  companyName?: string;
  email?: string;
  sourceType?: 'lead' | 'contact' | 'call';
  leadId?: string;
}

export const CALL_OUTCOMES_LIST = CALL_OUTCOMES;

export interface TataTeleConfig {
  configured: boolean;
  apiToken: string;
  callerId: string;
  defaultAgentNumber: string;
  status: string;
}

interface TelephonyContextType {
  isOpen: boolean;
  isMinimized: boolean;
  callStatus: CallStatus;
  activeCall: CallTarget | null;
  duration: number;
  isMuted: boolean;
  isOnHold: boolean;
  dialpadNumber: string;
  outcome: string;
  notes: string;
  nextFollowUp: string;
  recordingUrl: string;
  isSavingLog: boolean;
  activeTab: 'keypad' | 'notes';
  // Tata Tele Smartflo Integration State
  tataConfig: TataTeleConfig | null;
  refreshTataConfig: () => Promise<void>;
  tataCallInfo: { inProgress: boolean; agentNumber: string; statusText: string };
  // Actions
  openDialer: (target?: CallTarget) => void;
  closeDialer: () => void;
  minimizeDialer: () => void;
  expandDialer: () => void;
  startCall: (target: CallTarget) => void;
  manualDial: (phone?: string) => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleHold: () => void;
  pressKeypad: (digit: string) => void;
  backspaceKeypad: () => void;
  clearKeypad: () => void;
  setDialpadNumber: (num: string) => void;
  setOutcome: (val: string) => void;
  setNotes: (val: string) => void;
  setNextFollowUp: (val: string) => void;
  setRecordingUrl: (url: string) => void;
  setActiveTab: (tab: 'keypad' | 'notes') => void;
  saveCallLog: (andNext?: boolean) => Promise<boolean>;
  dismissCall: () => void;
  formatDuration: (totalSecs: number) => string;
}

const TelephonyContext = createContext<TelephonyContextType | undefined>(undefined);

export function TelephonyProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [activeCall, setActiveCall] = useState<CallTarget | null>(null);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [dialpadNumber, setDialpadNumber] = useState('');
  const [outcome, setOutcome] = useState('-None-');
  const [notes, setNotes] = useState('');
  const [nextFollowUp, setNextFollowUp] = useState('');
  const [recordingUrl, setRecordingUrl] = useState('');
  const [isSavingLog, setIsSavingLog] = useState(false);
  const [activeTab, setActiveTab] = useState<'keypad' | 'notes'>('keypad');

  // Tata Tele Smartflo State
  const [tataConfig, setTataConfig] = useState<TataTeleConfig | null>(null);
  const [tataCallInfo, setTataCallInfo] = useState<{ inProgress: boolean; agentNumber: string; statusText: string }>({
    inProgress: false,
    agentNumber: '',
    statusText: ''
  });

  const refreshTataConfig = useCallback(async () => {
    try {
      const res = await api.get('/integrations/telephony/tata-config');
      if (res.data) {
        setTataConfig({
          configured: Boolean(res.data.configured),
          apiToken: res.data.apiToken || '',
          callerId: res.data.callerId || '',
          defaultAgentNumber: res.data.defaultAgentNumber || '',
          status: res.data.status || 'disconnected'
        });
      }
    } catch (e) {
      console.warn('Failed to fetch Tata Tele config', e);
    }
  }, []);

  useEffect(() => {
    refreshTataConfig();
  }, [refreshTataConfig]);

  const timerRef = useRef<any>(null);
  const dialingTimeoutRef = useRef<any>(null);

  // Format MM:SS helper
  const formatDuration = useCallback((totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, []);

  // Timer runner for connected state
  useEffect(() => {
    if (callStatus === 'connected' && !isOnHold) {
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus, isOnHold]);

  // Clean up audio & timeouts when unmounting
  useEffect(() => {
    return () => {
      telephonyAudio.stopRinging();
      if (dialingTimeoutRef.current) clearTimeout(dialingTimeoutRef.current);
    };
  }, []);

  // Open dialer widget
  const openDialer = useCallback((target?: CallTarget) => {
    setIsOpen(true);
    setIsMinimized(false);
    if (target) {
      startCall(target);
    }
  }, []);

  const closeDialer = useCallback(() => {
    if (callStatus === 'connected' || callStatus === 'dialing') {
      // In active call, minimize instead of closing to prevent accidental hangup
      setIsMinimized(true);
      return;
    }
    setIsOpen(false);
  }, [callStatus]);

  const minimizeDialer = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const expandDialer = useCallback(() => {
    setIsMinimized(false);
  }, []);

  // Start outgoing call to target
  const startCall = useCallback((target: CallTarget) => {
    // Reset state for new call
    setDuration(0);
    setIsMuted(false);
    setIsOnHold(false);
    setNotes('');
    setNextFollowUp('');
    setRecordingUrl('');
    setOutcome('-None-');
    setActiveTab('keypad');
    setActiveCall(target);
    setDialpadNumber(target.phone || '');
    setCallStatus('dialing');
    setIsOpen(true);
    setIsMinimized(false);

    // Start audible ringing sound
    telephonyAudio.startRinging();

    // Trigger Tata Tele Smartflo Click-to-Call API if configured
    setTataCallInfo({ inProgress: true, agentNumber: '', statusText: 'Connecting to Tata Tele Smartflo...' });

    api.post('/integrations/telephony/call', {
      destinationNumber: target.phone,
      contactName: target.name,
      leadId: target.leadId || (target.sourceType === 'lead' ? target.id : undefined)
    }).then(res => {
      if (res.data?.success) {
        const agentNum = res.data.agentNumber || 'Your Extension / Phone';
        const method = res.data.dialMethod || 'smartflo';

        if (method === 'microsip') {
          setTataCallInfo({
            inProgress: true,
            agentNumber: agentNum,
            statusText: `MicroSIP Active: Dialing ${target.phone} via Tata SIP Trunk...`
          });

          // Trigger OS protocol handler to open MicroSIP / softphone
          if (res.data.telUri || res.data.sipUri) {
            const dialUri = res.data.telUri || res.data.sipUri;
            const link = document.createElement('a');
            link.href = dialUri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }

          Swal.fire({
            icon: 'success',
            title: 'Tata SIP Trunk (MicroSIP)',
            html: `
              <div style="text-align: left; font-size: 13px; line-height: 1.5;">
                <p>📞 <strong>MicroSIP Softphone triggered:</strong> Dialing <strong>${target.phone}</strong>.</p>
                <p style="color: #64748b; margin-top: 6px; font-size: 12px;">Make sure your MicroSIP app is open and connected to your Tata Trunk / PBX Box.</p>
              </div>
            `,
            confirmButtonText: 'OK',
            confirmButtonColor: '#4f46e5',
            timer: 4000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end'
          });
        } else if (method === 'pbx_gateway') {
          setTataCallInfo({
            inProgress: true,
            agentNumber: agentNum,
            statusText: `PBX Box (${res.data.pbxHost}): Ringing extension ${agentNum}...`
          });

          Swal.fire({
            icon: 'success',
            title: 'PBX Box Triggered',
            html: `
              <div style="text-align: left; font-size: 13px; line-height: 1.5;">
                <p>🏢 <strong>PBX Host:</strong> ${res.data.pbxHost}</p>
                <p>📞 <strong>Ringing Extension:</strong> ${agentNum}</p>
                <p>🔗 <strong>Destination:</strong> ${target.phone}</p>
              </div>
            `,
            confirmButtonText: 'Got It',
            confirmButtonColor: '#4f46e5',
            timer: 5000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end'
          });
        } else {
          setTataCallInfo({
            inProgress: true,
            agentNumber: agentNum,
            statusText: `Ringing Agent (${agentNum}). Answer to connect!`
          });

          Swal.fire({
            icon: 'success',
            title: 'Tata Tele Smartflo Initiated',
            html: `
              <div style="text-align: left; font-size: 13px; line-height: 1.5;">
                <p>📞 <strong>Step 1:</strong> Tata Tele is calling your phone / extension (<strong>${agentNum}</strong>).</p>
                <p style="margin-top: 6px;">🔗 <strong>Step 2:</strong> When you pick up, Tata Tele will immediately dial <strong>${target.phone}</strong> and bridge your call.</p>
                <p style="color: #64748b; margin-top: 8px; font-size: 11px;">Audio recording and duration will be automatically synced to the CRM activity timeline when the call finishes.</p>
              </div>
            `,
            confirmButtonText: 'Got It',
            confirmButtonColor: '#4f46e5',
            timer: 5000,
            timerProgressBar: true,
            toast: true,
            position: 'top-end'
          });
        }
      } else if (res.data?.notConfigured) {
        setTataCallInfo({ inProgress: false, agentNumber: '', statusText: 'Telephony Not Configured' });
        Swal.fire({
          icon: 'warning',
          title: 'Telephony Setup Needed',
          html: `
            <div style="text-align: left; font-size: 13px;">
              <p>Tata SIP Trunk or Smartflo is not configured yet.</p>
              <p style="color: #64748b; margin-top: 6px; font-size: 12px;">Would you like to configure your Tata SIP Trunk / PBX Box or Smartflo now?</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Configure Telephony',
          cancelButtonText: 'Continue in Simulation Mode',
          confirmButtonColor: '#4f46e5',
          cancelButtonColor: '#94a3b8'
        }).then(result => {
          if (result.isConfirmed) {
            window.location.href = '/integrations/telephony';
          }
        });
      } else if (res.data?.message) {
        setTataCallInfo({ inProgress: false, agentNumber: '', statusText: 'Tata Tele Error' });
        Swal.fire({
          icon: 'error',
          title: 'Tata Tele Smartflo Error',
          text: res.data.message,
          confirmButtonColor: '#ef4444'
        });
      }
    }).catch(err => {
      setTataCallInfo({ inProgress: false, agentNumber: '', statusText: 'Tata Tele Offline' });
      console.warn('Tata Tele Smartflo trigger note:', err?.response?.data?.message || err.message);
    });

    // Auto-connect after brief realistic ringing (2.2 seconds)
    if (dialingTimeoutRef.current) clearTimeout(dialingTimeoutRef.current);
    dialingTimeoutRef.current = setTimeout(() => {
      telephonyAudio.stopRinging();
      telephonyAudio.playConnectedChime();
      setCallStatus('connected');
    }, 2200);
  }, []);

  // Manual dial from dialpad
  const manualDial = useCallback((phoneToDial?: string) => {
    const targetNumber = (phoneToDial || dialpadNumber).trim();
    if (!targetNumber) {
      Swal.fire({
        title: 'Enter Phone Number',
        text: 'Please dial or enter a valid number to place a call.',
        icon: 'warning',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });
      return;
    }

    startCall({
      name: `Contact (${targetNumber})`,
      phone: targetNumber,
      sourceType: 'call'
    });
  }, [dialpadNumber, startCall]);

  // End call
  const endCall = useCallback(() => {
    telephonyAudio.stopRinging();
    if (dialingTimeoutRef.current) clearTimeout(dialingTimeoutRef.current);
    telephonyAudio.playHangupTone();

    setCallStatus('ended');
    setIsMinimized(false); // Automatically expand post-call disposition form
    setActiveTab('notes');  // Automatically open notes/outcome form for quick save
  }, []);

  // Dismiss without saving
  const dismissCall = useCallback(() => {
    setCallStatus('idle');
    setActiveCall(null);
    setDuration(0);
    setNotes('');
    setNextFollowUp('');
    setRecordingUrl('');
    setDialpadNumber('');
  }, []);

  // Mute / Unmute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // Hold / Resume
  const toggleHold = useCallback(() => {
    setIsOnHold(prev => !prev);
  }, []);

  // Keypad actions
  const pressKeypad = useCallback((digit: string) => {
    telephonyAudio.playDtmf(digit);
    setDialpadNumber(prev => prev + digit);
  }, []);

  const backspaceKeypad = useCallback(() => {
    setDialpadNumber(prev => prev.slice(0, -1));
  }, []);

  const clearKeypad = useCallback(() => {
    setDialpadNumber('');
  }, []);

  // Save call log into CRM Activity
  const saveCallLog = useCallback(async (_andNext: boolean = false): Promise<boolean> => {
    if (!activeCall) {
      dismissCall();
      return true;
    }

    setIsSavingLog(true);
    try {
      const formattedDuration = formatDuration(duration);
      const activityPayload = {
        type: 'CALL',
        title: outcome,
        description: notes || `Call with ${activeCall.name}. Outcome: ${outcome}.`,
        metadata: {
          phone: activeCall.phone || dialpadNumber,
          dialedVia: 'WebDialer',
          duration: formattedDuration,
          durationSeconds: duration,
          status: outcome,
          outcome: outcome,
          nextFollowUp: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
          recordingUrl: recordingUrl.trim() || null,
          name: activeCall.name,
          companyName: activeCall.companyName || 'Contact Entity',
          activityDate: new Date().toISOString()
        }
      };

      const leadId = (activeCall.sourceType === 'lead' ? activeCall.id : undefined) || activeCall.leadId;

      await api.post(
        leadId ? `/leads/${leadId}/activities` : '/activities',
        activityPayload
      );

      Swal.fire({
        icon: 'success',
        title: 'Call Logged Successfully',
        text: `Call with ${activeCall.name} (${formattedDuration}) saved.`,
        timer: 1600,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

      dismissCall();
      return true;
    } catch (err: any) {
      console.error('Failed to log call activity', err);
      Swal.fire('Error', err?.response?.data?.message || 'Failed to save call log.', 'error');
      return false;
    } finally {
      setIsSavingLog(false);
    }
  }, [activeCall, dialpadNumber, duration, formatDuration, nextFollowUp, notes, outcome, recordingUrl, dismissCall]);

  return (
    <TelephonyContext.Provider
      value={{
        isOpen,
        isMinimized,
        callStatus,
        activeCall,
        duration,
        isMuted,
        isOnHold,
        dialpadNumber,
        outcome,
        notes,
        nextFollowUp,
        recordingUrl,
        isSavingLog,
        activeTab,
        tataConfig,
        refreshTataConfig,
        tataCallInfo,
        openDialer,
        closeDialer,
        minimizeDialer,
        expandDialer,
        startCall,
        manualDial,
        endCall,
        toggleMute,
        toggleHold,
        pressKeypad,
        backspaceKeypad,
        clearKeypad,
        setDialpadNumber,
        setOutcome,
        setNotes,
        setNextFollowUp,
        setRecordingUrl,
        setActiveTab,
        saveCallLog,
        dismissCall,
        formatDuration
      }}
    >
      {children}
    </TelephonyContext.Provider>
  );
}

export function useDialer() {
  const context = useContext(TelephonyContext);
  if (!context) {
    throw new Error('useDialer must be used within a TelephonyProvider');
  }
  return context;
}
