import { useState, useEffect, useCallback } from 'react';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Zap, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Search, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

interface ActionLogItem {
  id?: string;
  actionType: string;
  status: string;
  output?: string;
  duration?: number;
  timestamp?: string;
}

interface ExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial' | 'running';
  targetContact?: string;
  duration?: number;
  error?: string;
  actionLogs?: ActionLogItem[];
}

interface ExecutionLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId?: string | null;
  workflowName?: string | null;
  onRunTest?: (id: string) => void;
}

export function ExecutionLogsModal({
  isOpen,
  onClose,
  workflowId,
  workflowName,
  onRunTest
}: ExecutionLogsModalProps) {
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const url = workflowId ? `/workflows/${workflowId}/logs` : '/workflows/logs';
      const { data } = await api.get(url);
      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      }
    } catch (err) {
      console.warn('Failed to load execution logs:', err);
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, fetchLogs]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.workflowName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.targetContact && log.targetContact.toLowerCase().includes(searchQuery.toLowerCase())) ||
      log.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'success') return log.status === 'success';
    if (statusFilter === 'failed') return log.status === 'failed';
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => prev === id ? null : id);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' · ' + date.toLocaleDateString();
    } catch {
      return isoString;
    }
  };

  const formatActionName = (actionType: string) => {
    return actionType
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Automation Execution Logs
                </h2>
                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                  Live Audit
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {workflowName ? `History for "${workflowName}"` : 'All workflow runs and trigger execution outcomes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
              className="text-xs h-8 px-2.5 text-gray-600 hover:text-indigo-600 border-gray-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-5 py-3 border-b border-gray-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by contact, phone, or workflow..."
              className="w-full text-xs pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'all' 
                  ? 'bg-gray-900 text-white shadow-xs' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('success')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'success' 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Success ({logs.filter(l => l.status === 'success').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('failed')}
              className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                statusFilter === 'failed' 
                  ? 'bg-rose-600 text-white shadow-xs' 
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Failed ({logs.filter(l => l.status === 'failed').length})
            </button>
          </div>
        </div>

        {/* Logs List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 custom-scrollbar bg-slate-50/50">
          {loading && logs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-gray-500">Loading audit history...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 text-center py-12 px-4 shadow-xs">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-gray-700">No Execution Logs Recorded</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {searchQuery ? 'No runs match your search query.' : 'Executions will appear here when workflows trigger or when you run a simulation.'}
              </p>
              {workflowId && onRunTest && (
                <Button 
                  size="sm" 
                  onClick={() => {
                    onRunTest(workflowId);
                    setTimeout(fetchLogs, 400);
                  }}
                  className="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  <Play className="w-3.5 h-3.5 mr-1" /> Run Test Now
                </Button>
              )}
            </div>
          ) : (
            filteredLogs.map(log => {
              const isExpanded = expandedLogId === log.id;
              const isSuccess = log.status === 'success';

              return (
                <div 
                  key={log.id}
                  className="bg-white rounded-xl border border-gray-200 shadow-2xs hover:border-indigo-200 transition-all overflow-hidden"
                >
                  {/* Top Summary Bar */}
                  <div 
                    onClick={() => toggleExpand(log.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-50/60"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="text-gray-400">
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-indigo-600" /> : <ChevronRight className="w-4 h-4" />}
                      </div>

                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSuccess ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}>
                        {isSuccess ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-900 truncate">
                            {log.workflowName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            isSuccess 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 mt-0.5">
                          {log.targetContact && (
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <UserCheck className="w-3 h-3 text-indigo-600" />
                              {log.targetContact}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-gray-400">
                            <Clock className="w-3 h-3" />
                            {formatTime(log.timestamp)}
                          </span>
                          {log.duration && (
                            <span className="text-gray-400">
                              ⚡ {log.duration}ms
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-indigo-600 font-medium hidden sm:inline">
                        {log.actionLogs?.length || 0} steps
                      </span>
                    </div>
                  </div>

                  {/* Expanded Step-by-Step Breakdown */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 px-4 py-3.5 border-t border-gray-100 space-y-2">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Dispatched Actions & Outcomes
                      </div>

                      {log.actionLogs && log.actionLogs.length > 0 ? (
                        <div className="space-y-2">
                          {log.actionLogs.map((step, idx) => {
                            const isAi = step.actionType === 'generate_ai_reply';
                            const isWhatsApp = step.actionType === 'send_whatsapp_message';

                            return (
                              <div 
                                key={step.id || idx} 
                                className={`p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all ${
                                  isAi 
                                    ? 'bg-slate-50 border-indigo-200' 
                                    : isWhatsApp
                                    ? 'bg-emerald-50/40 border-emerald-200'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                    isAi 
                                      ? 'bg-indigo-600 text-white' 
                                      : isWhatsApp
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-bold text-gray-900">
                                      <span>{formatActionName(step.actionType)}</span>
                                      {isAi && (
                                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-200">
                                          AI Generator
                                        </span>
                                      )}
                                    </div>
                                    {step.output && (
                                      <div className={`text-[11px] mt-1 leading-relaxed ${
                                        isAi ? 'text-gray-800 font-medium bg-white p-2 rounded border border-gray-200' : 'text-gray-600'
                                      }`}>
                                        {step.output}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                  {step.duration && (
                                    <span className="text-[10px] text-gray-400 font-mono">
                                      {step.duration}ms
                                    </span>
                                  )}
                                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                    Dispatched
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No individual step diagnostics recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Showing {filteredLogs.length} execution events</span>
          <Button size="sm" variant="outline" onClick={onClose} className="text-xs h-8">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
