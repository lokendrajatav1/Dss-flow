import React, { useState, useRef, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Pause,
  Play,
  Grid,
  Minus,
  X,
  Delete,
  Maximize2,
  Copy,
  Clock,
  GripVertical,
  Settings,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useDialer, CALL_OUTCOMES_LIST } from '@/context/TelephonyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';
import Swal from 'sweetalert2';

const KEYPAD_BUTTONS = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
];

export function WebDialerWidget() {
  const {
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
    tataConfig,
    refreshTataConfig,
    tataCallInfo,
    closeDialer,
    minimizeDialer,
    expandDialer,
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
    saveCallLog,
    dismissCall,
    formatDuration,
    openDialer
  } = useDialer();

  const [idleTab, setIdleTab] = useState<'keypad' | 'recents'>('keypad');
  const [showKeypadInCall, setShowKeypadInCall] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  // Drag-and-drop state & refs
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Keep widget inside viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const widgetEl = widgetRef.current;
        const width = widgetEl ? widgetEl.offsetWidth : 320;
        const height = widgetEl ? widgetEl.offsetHeight : 450;
        const maxX = Math.max(10, window.innerWidth - width - 10);
        const maxY = Math.max(10, window.innerHeight - height - 10);
        return {
          x: Math.max(10, Math.min(maxX, prev.x)),
          y: Math.max(10, Math.min(maxY, prev.y)),
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const target = e.target as HTMLElement;
    if (target.closest('button, input, select, textarea, a')) {
      return;
    }

    const widgetEl = widgetRef.current;
    if (!widgetEl) return;

    const rect = widgetEl.getBoundingClientRect();
    const startX = position ? position.x : rect.left;
    const startY = position ? position.y : rect.top;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX,
      startY,
    };
    setIsDragging(true);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;

    const deltaX = e.clientX - dragStartRef.current.mouseX;
    const deltaY = e.clientY - dragStartRef.current.mouseY;

    const widgetEl = widgetRef.current;
    const width = widgetEl ? widgetEl.offsetWidth : 320;
    const height = widgetEl ? widgetEl.offsetHeight : 450;

    const rawX = dragStartRef.current.startX + deltaX;
    const rawY = dragStartRef.current.startY + deltaY;

    const maxX = Math.max(10, window.innerWidth - width - 10);
    const maxY = Math.max(10, window.innerHeight - height - 10);

    const clampedX = Math.max(10, Math.min(maxX, rawX));
    const clampedY = Math.max(10, Math.min(maxY, rawY));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartRef.current) {
      dragStartRef.current = null;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Real Recent calls fetched dynamically from API
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && idleTab === 'recents') {
      api.get('/calls?limit=8')
        .then(res => {
          const list = res.data?.calls || [];
          setRecentCalls(list.map((c: any) => ({
            name: c.name || 'Unknown Contact',
            phone: c.phone || '',
            company: c.companyName || '',
            time: c.createdAt ? new Date(c.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''
          })));
        })
        .catch(() => setRecentCalls([]));
    }
  }, [isOpen, idleTab]);

  const handleCopyNumber = (num: string) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 1500);
  };

  const containerStyle: React.CSSProperties = position
    ? {
        left: `${position.x}px`,
        top: `${position.y}px`,
        bottom: 'auto',
        right: 'auto',
      }
    : {};

  // 1. Floating Launcher Button (Zero Shadow, Flat Corporate Indigo)
  if (!isOpen) {
    return (
      <div className="fixed bottom-5 right-5 z-[9999] pointer-events-auto">
        <button
          type="button"
          onClick={() => openDialer()}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white border-2 border-white transition-all cursor-pointer"
          title="Open CRM Phone Dialer"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // 2. Minimized Floating Bar (Draggable, Zero Shadow, Corporate Indigo)
  if (isMinimized) {
    const isCallActive = callStatus === 'dialing' || callStatus === 'connected';
    return (
      <div
        ref={widgetRef}
        style={containerStyle}
        className={`fixed z-[9999] pointer-events-auto select-none ${!position ? 'bottom-5 right-5' : ''}`}
      >
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="bg-indigo-700 text-white rounded-lg px-3 py-2 flex items-center gap-2.5 border border-indigo-800 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reposition dialer"
        >
          <GripVertical className="w-3.5 h-3.5 text-indigo-200 shrink-0 cursor-grab" />
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              callStatus === 'connected'
                ? 'bg-emerald-400'
                : callStatus === 'dialing'
                ? 'bg-amber-300 animate-pulse'
                : 'bg-indigo-300'
            }`}
          />

          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={expandDialer}
            title="Click to expand"
          >
            <span className="text-xs font-semibold text-white max-w-[130px] truncate">
              {activeCall?.name || 'CRM Phone'}
            </span>
            {isCallActive && (
              <span className="font-mono text-xs font-bold text-emerald-200 bg-indigo-900/60 px-2 py-0.5 rounded border border-indigo-600/40">
                {formatDuration(duration)}
              </span>
            )}
          </div>

          {isCallActive && (
            <div className="flex items-center gap-1.5 border-l border-indigo-600 pl-2">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={toggleMute}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  isMuted ? 'bg-red-500 text-white' : 'text-indigo-100 hover:text-white hover:bg-indigo-800'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={endCall}
                className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="End Call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={expandDialer}
            className="p-1 text-indigo-200 hover:text-white rounded transition-colors cursor-pointer"
            title="Expand"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // 3. Expanded Standard CRM Softphone Window (Draggable, Corporate Indigo + Clean White)
  return (
    <div
      ref={widgetRef}
      style={containerStyle}
      className={`fixed z-[9999] pointer-events-auto select-none font-sans ${!position ? 'bottom-5 right-5' : ''}`}
    >
      <div className="w-[320px] bg-white rounded-lg border border-gray-300 overflow-hidden flex flex-col">
        
        {/* Crisp Enterprise Draggable Titlebar (Corporate Indigo) */}
        <div
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
          className="bg-indigo-600 text-white px-3 py-2.5 flex items-center justify-between border-b border-indigo-700 shrink-0 cursor-grab active:cursor-grabbing touch-none"
          title="Drag and drop to reposition softphone"
        >
          <div className="flex items-center gap-1.5">
            <GripVertical className="w-3.5 h-3.5 text-indigo-200 cursor-grab" />
            <PhoneCall className="w-4 h-4 text-white" />
            <span className="text-xs font-bold text-white tracking-wide">
              Phone Dialer
            </span>
            {callStatus === 'connected' ? (
              <span className="text-[10px] font-semibold text-emerald-100 bg-emerald-600/80 px-2 py-0.5 rounded border border-emerald-400/40">
                Connected
              </span>
            ) : callStatus === 'dialing' ? (
              <span className="text-[10px] font-semibold text-amber-900 bg-amber-300 px-2 py-0.5 rounded border border-amber-400 animate-pulse">
                Dialing...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-white bg-indigo-700/80 px-2 py-0.5 rounded border border-indigo-500/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Ready
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={minimizeDialer}
              className="w-6 h-6 rounded text-indigo-100 hover:text-white hover:bg-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={closeDialer}
              className="w-6 h-6 rounded text-indigo-100 hover:text-white hover:bg-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TATA TELE SMARTFLO STATUS BAR (ZERO SHADOWS, ENTERPRISE CLEAN) */}
        {/* ============================================================== */}
        {callStatus === 'idle' && (
          <div className="bg-slate-900 px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-[11px]">
            {tataConfig?.configured ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                <span className="text-white">Tata Tele: <strong>Active</strong></span>
                {tataConfig.defaultAgentNumber && (
                  <span className="text-[10px] text-slate-400 font-mono">({tataConfig.defaultAgentNumber})</span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                <span>Tata Tele: <strong>Setup Required</strong></span>
              </div>
            )}

            <button
              type="button"
              onClick={() => { window.location.href = '/integrations/telephony'; }}
              className="text-indigo-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
              title="Configure Telephony"
            >
              <Settings className="w-3 h-3" />
              <span>Settings</span>
            </button>
          </div>
        )}

        {/* Live Call Routing Banner */}
        {(callStatus === 'dialing' || callStatus === 'connected') && (
          <div className="bg-slate-900 px-3 py-1 flex items-center justify-between border-b border-slate-800 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
              <span className="truncate">{tataCallInfo.statusText || 'Routed via Tata Telephony'}</span>
            </div>
            {tataCallInfo.agentNumber && (
              <span className="text-slate-400 font-mono shrink-0 ml-1">Ext: {tataCallInfo.agentNumber}</span>
            )}
          </div>
        )}
            {/* ============================================================== */}
            {/* VIEW 1: ACTIVE CALL / CALL IN PROGRESS                         */}
            {/* ============================================================== */}
            {(callStatus === 'dialing' || callStatus === 'connected') && (
              <div className="flex flex-col">
            
            {/* Contact Details Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-center flex flex-col items-center">
              
              {/* Contact Avatar Circle */}
              <div className="w-11 h-11 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center mb-1.5">
                {activeCall?.name
                  ? activeCall.name
                      .split(' ')
                      .map(n => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'C'}
              </div>

              {/* Contact Name */}
              <h4 className="text-sm font-bold text-gray-900 leading-tight">
                {activeCall?.name || 'Contact'}
              </h4>

              {/* Phone & Copy */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs text-gray-600 font-medium">
                  {activeCall?.phone || dialpadNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyNumber(activeCall?.phone || dialpadNumber)}
                  className="text-gray-400 hover:text-gray-700 p-0.5 rounded cursor-pointer transition-colors"
                  title="Copy Number"
                >
                  {copiedPhone ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              {/* Company Name */}
              {activeCall?.companyName && (
                <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-[240px]">
                  {activeCall.companyName}
                </p>
              )}

              {/* Call Status & Timer Badge */}
              <div className="mt-2">
                {callStatus === 'dialing' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                    Ringing...
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                )}
              </div>

              {isOnHold && (
                <span className="mt-1 inline-block text-[10px] font-semibold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                  Call On Hold
                </span>
              )}
            </div>

            {/* Standard Softphone Controls (Flat Circular Buttons) */}
            <div className="px-4 py-3 bg-white border-b border-gray-200">
              <div className="flex items-center justify-around gap-2 max-w-[260px] mx-auto">
                
                {/* Mute */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={`w-11 h-11 rounded-full aspect-square shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-red-50 border-red-400 text-red-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <span className="text-[10px] text-gray-600 font-medium">
                    {isMuted ? 'Muted' : 'Mute'}
                  </span>
                </div>

                {/* Keypad */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowKeypadInCall(!showKeypadInCall)}
                    className={`w-11 h-11 rounded-full aspect-square shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
                      showKeypadInCall
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Keypad (DTMF)"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-gray-600 font-medium">Keypad</span>
                </div>

                {/* Hold */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleHold}
                    className={`w-11 h-11 rounded-full aspect-square shrink-0 flex items-center justify-center border transition-colors cursor-pointer ${
                      isOnHold
                        ? 'bg-amber-50 border-amber-400 text-amber-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    title={isOnHold ? 'Resume' : 'Hold'}
                  >
                    {isOnHold ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>
                  <span className="text-[10px] text-gray-600 font-medium">
                    {isOnHold ? 'Resume' : 'Hold'}
                  </span>
                </div>

                {/* End Call Button */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={endCall}
                    className="w-11 h-11 rounded-full aspect-square shrink-0 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white flex items-center justify-center border border-red-700 transition-colors cursor-pointer"
                    title="End Call"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] text-red-600 font-bold">End</span>
                </div>

              </div>

              {/* In-Call Keypad (when open) */}
              {showKeypadInCall && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
                    {KEYPAD_BUTTONS.map(btn => (
                      <button
                        key={btn.digit}
                        type="button"
                        onClick={() => pressKeypad(btn.digit)}
                        className="w-11 h-11 rounded-full aspect-square shrink-0 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-sm font-bold text-slate-900 transition-colors cursor-pointer mx-auto flex items-center justify-center"
                      >
                        {btn.digit}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* In-Call Notes & Outcome */}
            <div className="p-3 space-y-2.5 max-h-[220px] overflow-y-auto bg-gray-50">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Call Outcome
                </label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className="w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded focus:border-indigo-600 outline-none cursor-pointer"
                >
                  {CALL_OUTCOMES_LIST.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Call Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter remarks while talking..."
                  className="w-full p-2 text-xs bg-white border border-gray-300 rounded focus:border-indigo-600 outline-none placeholder:text-gray-400"
                />
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: POST-CALL DISPOSITION / SAVE VIEW                      */}
        {/* ============================================================== */}
        {callStatus === 'ended' && (
          <div className="p-3.5 space-y-3 max-h-[380px] overflow-y-auto">
            {/* Call Ended Header */}
            <div className="bg-gray-50 border border-gray-200 rounded p-2.5 text-center">
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wide block">
                Call Ended
              </span>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                {activeCall?.name || 'Contact'} ({activeCall?.phone || dialpadNumber})
              </p>
              <p className="text-xs text-gray-600 mt-1 font-mono">
                Duration: <strong className="text-gray-900">{formatDuration(duration)}</strong>
              </p>
            </div>

            {/* Outcome Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Call Outcome *
              </label>
              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full h-8 px-2 text-xs bg-white border border-gray-300 rounded focus:border-indigo-600 outline-none cursor-pointer"
              >
                {CALL_OUTCOMES_LIST.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {/* Discussion Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Discussion Notes
              </label>
              <textarea
                rows={2.5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter discussion summary or next steps..."
                className="w-full p-2 text-xs bg-white border border-gray-300 rounded focus:border-indigo-600 outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Next Follow Up */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                <span>Next Follow-Up Date &amp; Time</span>
                <span className="text-[10px] text-gray-400 font-normal">Optional</span>
              </label>
              <Input
                type="datetime-local"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                className="h-8 text-xs w-full bg-white border-gray-300 rounded focus:border-indigo-600"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={dismissCall}
                className="flex-1 text-xs h-8 text-gray-700 border-gray-300 rounded hover:bg-gray-100"
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isSavingLog}
                onClick={() => saveCallLog(false)}
                className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded"
              >
                {isSavingLog ? 'Saving...' : 'Save Call Log'}
              </Button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: IDLE DIALPAD & RECENTS (CORPORATE INDIGO THEMED)       */}
        {/* ============================================================== */}
        {callStatus === 'idle' && (
          <div className="flex flex-col">
            
            {/* Standard Enterprise Tab Bar */}
            <div className="flex items-center border-b border-gray-200 bg-gray-50 text-xs">
              <button
                type="button"
                onClick={() => setIdleTab('keypad')}
                className={`flex-1 py-2 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  idleTab === 'keypad'
                    ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                Dialpad
              </button>
              <button
                type="button"
                onClick={() => setIdleTab('recents')}
                className={`flex-1 py-2 font-medium flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                  idleTab === 'recents'
                    ? 'border-indigo-600 text-indigo-600 bg-white font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Recent Calls
              </button>
            </div>

            {/* TAB 1: Keypad View */}
            {idleTab === 'keypad' && (
              <div className="p-3.5 space-y-3">
                
                {/* Number Display Screen (Clean Softphone Display) */}
                <div className="relative flex items-center justify-center min-h-[46px] px-3 bg-slate-50/60 border border-slate-200 rounded-lg">
                  <input
                    type="text"
                    value={dialpadNumber}
                    onChange={(e) => setDialpadNumber(e.target.value.replace(/[^0-9+*#]/g, ''))}
                    placeholder="Enter phone number..."
                    className="w-full text-center font-mono text-xl font-bold text-slate-900 bg-transparent outline-none tracking-wider placeholder:text-slate-400 placeholder:text-sm placeholder:font-normal placeholder:font-sans"
                  />
                  {dialpadNumber && (
                    <button
                      type="button"
                      onClick={backspaceKeypad}
                      className="absolute right-2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Backspace"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* 3x4 Standard Circular Keypad Grid (Clean Crisp Surface, Bold Digits, Readable Letters) */}
                <div className="grid grid-cols-3 gap-y-2.5 gap-x-3 max-w-[230px] mx-auto pt-0.5">
                  {KEYPAD_BUTTONS.map(btn => (
                    <button
                      key={btn.digit}
                      type="button"
                      onClick={() => pressKeypad(btn.digit)}
                      className="w-[54px] h-[54px] rounded-full aspect-square shrink-0 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 active:scale-95 border border-slate-200 hover:border-slate-300 flex flex-col items-center justify-center transition-all cursor-pointer mx-auto group"
                    >
                      <span className="text-xl font-bold text-slate-900 leading-none">
                        {btn.digit}
                      </span>
                      {btn.letters ? (
                        <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase leading-none mt-1">
                          {btn.letters}
                        </span>
                      ) : btn.digit === '0' ? (
                        <span className="text-xs font-bold text-slate-500 leading-none mt-0.5">+</span>
                      ) : (
                        <span className="h-1"></span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Bottom Action Row: Call Button centered, Clear on left, Backspace on right */}
                <div className="pt-2 flex items-center justify-center gap-6">
                  {/* Left Clear Button */}
                  <div className="w-10 flex justify-center">
                    {dialpadNumber ? (
                      <button
                        type="button"
                        onClick={clearKeypad}
                        className="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Clear Number"
                      >
                        Clear
                      </button>
                    ) : (
                      <span className="w-10"></span>
                    )}
                  </div>

                  {/* Center Solid Vibrant Green Call Button */}
                  <button
                    type="button"
                    onClick={() => manualDial()}
                    className="w-14 h-14 rounded-full aspect-square shrink-0 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Call Number"
                  >
                    <Phone className="w-6 h-6 fill-current" />
                  </button>

                  {/* Right Backspace Button */}
                  <div className="w-10 flex justify-center">
                    {dialpadNumber ? (
                      <button
                        type="button"
                        onClick={backspaceKeypad}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                        title="Backspace"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="w-10"></span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-center">
                  <p className="text-[11px] text-slate-400 font-medium">
                    Click any phone icon in Leads or Calls to 1-click dial
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: Recent Calls / Redial List */}
            {idleTab === 'recents' && (
              <div className="p-2.5 max-h-[300px] overflow-y-auto">
                {recentCalls.length === 0 ? (
                  <div className="py-8 text-center text-gray-400">
                    <Clock className="w-7 h-7 mx-auto mb-2 text-gray-300" />
                    <p className="text-xs font-semibold text-gray-700">No recent calls yet</p>
                    <p className="text-[11px] text-gray-400 mt-1">Calls made by your team will appear here.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentCalls.map((rec, i) => (
                      <div
                        key={i}
                        onClick={() => manualDial(rec.phone)}
                        className="py-2 px-2 hover:bg-gray-50 rounded flex items-center justify-between cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(rec.name || 'C').split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">
                              {rec.name}
                            </p>
                            <p className="text-[11px] font-mono text-gray-500">
                              {rec.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400">{rec.time}</span>
                          <button
                            type="button"
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-emerald-600 text-gray-600 hover:text-white border border-gray-200 hover:border-emerald-700 flex items-center justify-center transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

