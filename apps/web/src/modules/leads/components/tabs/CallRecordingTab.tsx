import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Play,
  Pause,
  PhoneCall
} from 'lucide-react';
import api from '@/lib/api';

interface CallRecordingTabProps {
  lead?: any;
  refreshTrigger?: number;
}

function InlineAudioPlayer({ src, defaultDuration }: { src: string; defaultDuration?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return defaultDuration || '00:00';
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 w-60 max-w-full">
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        className="hidden"
      />
      <button
        type="button"
        onClick={togglePlay}
        className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
      </button>

      <input
        type="range"
        min={0}
        max={duration || 100}
        value={currentTime}
        onChange={handleSeek}
        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />

      <span className="font-mono text-[11px] text-gray-600 flex-shrink-0">
        {formatTime(currentTime)}
      </span>
    </div>
  );
}

export function CallRecordingTab({ lead, refreshTrigger }: CallRecordingTabProps) {
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead?.id) {
      fetchCallRecordings();
    }
  }, [lead?.id, refreshTrigger]);

  const fetchCallRecordings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await api.get(`/leads/${lead.id}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        // Only real calls where call conversation took place
        const callActivities = res.data.filter((act: any) => act.type === 'CALL');
        setRecordings(callActivities);
      }
    } catch (err) {
      console.error('Failed to fetch call recordings', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
        d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-200">
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">TYPE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">CALL TIME</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">AGENT</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">DURATION</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">OUTCOME</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">RECORDING</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide text-right">ACTION</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-[14px] text-gray-500 font-medium">
                Loading calls...
              </td>
            </tr>
          ) : recordings.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-[14px] text-gray-500 font-medium">
                No calls recorded yet for this client.
              </td>
            </tr>
          ) : (
            recordings.map((rec) => {
              const recUrl = rec.metadata?.recordingUrl;
              const duration = rec.metadata?.duration || '00:00';
              const outcome = rec.metadata?.outcome || rec.title?.replace('In-App Call: ', '').replace('Call logged: ', '') || 'Call Logged';
              const agentName = rec.performedBy?.name || rec.metadata?.agentNumber || 'Agent';
              const direction = rec.metadata?.direction || 'Outbound';
              const isInbound = direction.toLowerCase().includes('in');

              return (
                <tr key={rec.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                  {/* Direction */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      isInbound
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {isInbound ? (
                        <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-blue-600" />
                      )}
                      {direction}
                    </span>
                  </td>

                  {/* Call Time */}
                  <td className="py-3 px-4 text-[13px] text-gray-700 whitespace-nowrap">
                    {formatDate(rec.createdAt)}
                  </td>

                  {/* Agent */}
                  <td className="py-3 px-4 text-[13px] text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[10px] flex items-center justify-center">
                        {agentName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-xs text-gray-900">{agentName}</span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                      {duration}
                    </span>
                  </td>

                  {/* Outcome */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-[13px] font-medium text-gray-900">{outcome}</span>
                  </td>

                  {/* Recording Player */}
                  <td className="py-3 px-4">
                    {recUrl ? (
                      <InlineAudioPlayer src={recUrl} defaultDuration={duration} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-normal">
                        <PhoneCall className="w-3.5 h-3.5 text-gray-400" />
                        <span>Call Logged (No Audio File)</span>
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {recUrl ? (
                      <a
                        href={recUrl}
                        download={`call_${rec.id}.mp3`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-800"
                        title="Download Recording"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Logged</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
