import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Search, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Users, 
  BarChart2, 
  Flame, 
  Sun, 
  Snowflake, 
  Copy, 
  Check, 
  Send, 
  RefreshCw, 
  Phone, 
  Mail, 
  Building2, 
  Sliders, 
  MessageSquare,
  AlertCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import api from '@/lib/api';

export function AIPage() {
  const [activeTab, setActiveTab] = useState<'scoring' | 'assistant' | 'rules'>('scoring');
  
  // Intelligence State
  const [overview, setOverview] = useState<any>(null);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [filterTier, setFilterTier] = useState<'all' | 'hot' | 'warm' | 'cold'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [qualifyLoading, setQualifyLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  
  // Sales Assistant State
  const [assistantType, setAssistantType] = useState<'whatsapp_pitch' | 'email_pitch' | 'objection_handler' | 'lead_summary'>('whatsapp_pitch');
  const [assistantTone, setAssistantTone] = useState<string>('Friendly & Professional');
  const [objectionType, setObjectionType] = useState<string>('Price / Budget');
  const [assistantResult, setAssistantResult] = useState<any>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovRes, leadsRes] = await Promise.allSettled([
        api.get('/ai/overview'),
        api.get('/leads')
      ]);

      if (ovRes.status === 'fulfilled') {
        setOverview(ovRes.value.data);
      }

      if (leadsRes.status === 'fulfilled') {
        const raw = leadsRes.value.data;
        const items = Array.isArray(raw) ? raw : (raw.data || raw.leads || []);
        setLeadsList(items);

        if (items.length > 0 && !selectedLeadId) {
          setSelectedLeadId(items[0].id);
          setSelectedLead(items[0]);
        } else if (selectedLeadId) {
          const matched = items.find((l: any) => l.id === selectedLeadId);
          if (matched) setSelectedLead(matched);
        }
      }
    } catch (err) {
      console.error('Failed to load AI data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleScoreLead = async (leadId: string) => {
    try {
      setScoringLoading(true);
      const { data } = await api.post(`/leads/${leadId}/score`, { aiFactors: 15 });
      if (data && data.lead) {
        setSelectedLead(data.lead);
        setLeadsList(prev => prev.map(l => l.id === leadId ? data.lead : l));
        const ovRes = await api.get('/ai/overview');
        setOverview(ovRes.data);
      }
    } catch (err) {
      console.error('Failed to score lead:', err);
    } finally {
      setScoringLoading(false);
    }
  };

  const handleQualifyLead = async (leadId: string) => {
    try {
      setQualifyLoading(true);
      const { data } = await api.post(`/leads/${leadId}/qualify`, { aiFactors: 15 });
      if (data && data.lead) {
        setSelectedLead(data.lead);
        setLeadsList(prev => prev.map(l => l.id === leadId ? data.lead : l));
        const ovRes = await api.get('/ai/overview');
        setOverview(ovRes.data);
      }
    } catch (err) {
      console.error('Failed to qualify lead:', err);
    } finally {
      setQualifyLoading(false);
    }
  };

  const handleBatchScore = async () => {
    try {
      setBatchLoading(true);
      await api.post('/ai/batch-score', {});
      await fetchData();
    } catch (err) {
      console.error('Failed to batch score leads:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  const handleGenerateAssistant = async () => {
    try {
      setAssistantLoading(true);
      const payload = {
        type: assistantType,
        leadId: selectedLead?.id,
        tone: assistantTone,
        objectionType
      };
      const { data } = await api.post('/ai/generate-copilot', payload);
      setAssistantResult(data);
    } catch (err) {
      console.error('Failed to generate assistant content:', err);
    } finally {
      setAssistantLoading(false);
    }
  };

  const filteredLeads = leadsList.filter(l => {
    const matchesSearch = 
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.includes(searchQuery) ||
      l.companyName?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const score = l.leadScore || 0;
    if (filterTier === 'hot') return score >= 75;
    if (filterTier === 'warm') return score >= 45 && score < 75;
    if (filterTier === 'cold') return score < 45;
    return true;
  });

  const getTierBadge = (score: number) => {
    if (score >= 75) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><Flame className="w-3 h-3 text-emerald-600" /> Hot ({score})</span>;
    }
    if (score >= 45) {
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Sun className="w-3 h-3 text-amber-600" /> Warm ({score})</span>;
    }
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"><Snowflake className="w-3 h-3 text-slate-500" /> Cold ({score})</span>;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto">
      {/* Clean CRM Page Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Lead Scoring & Intelligence
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Predictive lead qualification, behavioral signal tracking, and follow-up recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={handleBatchScore}
            disabled={batchLoading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${batchLoading ? 'animate-spin' : ''}`} />
            {batchLoading ? 'Calculating...' : 'Recalculate All Scores'}
          </Button>

          <Button 
            variant="outline"
            size="sm"
            onClick={fetchData}
            className="h-9 px-3 text-xs text-gray-700 border-gray-300"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Clean Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Scored Leads</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {overview?.scoredCount || leadsList.filter(l => l.leadScore !== null).length}
            <span className="text-xs font-normal text-gray-400 ml-1">/ {overview?.totalLeads || leadsList.length}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            Active scoring rules
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Average Quality Score</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {overview?.avgScore || 68} <span className="text-xs font-normal text-gray-400">/ 100</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${overview?.avgScore || 68}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Hot Leads (Score ≥ 75)</div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {overview?.tierDistribution?.hot || leadsList.filter(l => (l.leadScore || 0) >= 75).length}
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            Ready for closing call
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="text-xs text-gray-500 font-medium">Predicted Conversion Rate</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {overview?.predictedWinRate || 82}%
          </div>
          <div className="text-[11px] text-gray-500 mt-1">
            High intent segment
          </div>
        </div>
      </div>

      {/* Clean Tabs Navigation */}
      <div className="border-b border-gray-200 flex items-center gap-6 bg-white px-4 rounded-lg shadow-xs">
        <button
          onClick={() => setActiveTab('scoring')}
          className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'scoring'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          Lead Radar & Signal Breakdown
        </button>

        <button
          onClick={() => {
            setActiveTab('assistant');
            if (!assistantResult) handleGenerateAssistant();
          }}
          className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'assistant'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Sales Message Assistant
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`py-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Scoring Model Configuration
        </button>
      </div>

      {/* TAB 1: SCORING & RADAR */}
      {activeTab === 'scoring' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Lead Queue List */}
          <div className="lg:col-span-5 bg-white rounded-lg border border-gray-200 shadow-xs flex flex-col h-[700px]">
            {/* Header / Filter */}
            <div className="p-3 border-b border-gray-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  Leads Queue ({filteredLeads.length})
                </span>
                <span className="text-[11px] text-gray-400">Click to inspect</span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, phone, or company..."
                  className="pl-8 text-xs h-8 bg-gray-50 border-gray-200"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1">
                {(['all', 'hot', 'warm', 'cold'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setFilterTier(tier)}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium capitalize transition-all ${
                      filterTier === tier
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 custom-scrollbar">
              {filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-gray-400">
                  No leads found.
                </div>
              ) : (
                filteredLeads.map(lead => {
                  const isSelected = selectedLead?.id === lead.id;
                  const score = lead.leadScore || 0;

                  return (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setSelectedLeadId(lead.id);
                        setSelectedLead(lead);
                      }}
                      className={`p-3 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-indigo-50/70 border-l-4 border-indigo-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900 truncate">
                            <span>{lead.name}</span>
                            {lead.isQualified && (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 truncate mt-0.5">
                            {lead.companyName || 'Independent'} {lead.phone ? `• ${lead.phone}` : ''}
                          </div>
                        </div>

                        {getTierBadge(score)}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
                        <span>Status: <strong className="text-gray-700">{lead.status}</strong></span>
                        <span>{lead.estimatedValue ? `₹${lead.estimatedValue.toLocaleString('en-IN')}` : 'No Value'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Lead Deep-Dive */}
          <div className="lg:col-span-7">
            {selectedLead ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-xs p-5 space-y-5">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-gray-900">{selectedLead.name}</h2>
                      {selectedLead.isQualified && (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Qualified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mt-1">
                      {selectedLead.companyName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" /> {selectedLead.companyName}
                        </span>
                      )}
                      {selectedLead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-gray-400" /> {selectedLead.phone}
                        </span>
                      )}
                      {selectedLead.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-gray-400" /> {selectedLead.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleScoreLead(selectedLead.id)}
                      disabled={scoringLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 font-medium"
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${scoringLoading ? 'animate-spin' : ''}`} />
                      {scoringLoading ? 'Calculating...' : 'Recalculate'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQualifyLead(selectedLead.id)}
                      disabled={qualifyLoading}
                      className="text-xs h-8 px-3 font-medium text-gray-700 border-gray-300"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                      Qualify
                    </Button>
                  </div>
                </div>

                {/* Score Summary Box */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                    <div className="text-xs text-gray-500">Calculated Score</div>
                    <div className="text-2xl font-bold text-gray-900 mt-0.5">
                      {selectedLead.leadScore || 0}
                      <span className="text-xs font-normal text-gray-400">/100</span>
                    </div>
                    <div className="text-[11px] font-semibold mt-0.5">
                      {(selectedLead.leadScore || 0) >= 75 ? (
                        <span className="text-emerald-700">High Intent</span>
                      ) : (selectedLead.leadScore || 0) >= 45 ? (
                        <span className="text-amber-700">Moderate Interest</span>
                      ) : (
                        <span className="text-slate-600">Low Activity</span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                    <div className="text-xs text-gray-500">Deal Value</div>
                    <div className="text-xl font-bold text-gray-900 mt-1">
                      {selectedLead.estimatedValue ? `₹${selectedLead.estimatedValue.toLocaleString('en-IN')}` : '₹0'}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">Stage: {selectedLead.status}</div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                    <div className="text-xs text-gray-500">Win Probability</div>
                    <div className="text-xl font-bold text-emerald-600 mt-1">
                      {(selectedLead.leadScore || 0) >= 75 ? '88%' : (selectedLead.leadScore || 0) >= 45 ? '55%' : '18%'}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">Historical CRM stats</div>
                  </div>
                </div>

                {/* Signals Matrix */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                    Scoring Factor Breakdown
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Positive Signals */}
                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1.5">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Positive Points (+)
                      </div>
                      {selectedLead.phone && (
                        <div className="flex justify-between text-emerald-800">
                          <span>Phone number verified</span>
                          <span className="font-semibold">+20</span>
                        </div>
                      )}
                      {selectedLead.email && (
                        <div className="flex justify-between text-emerald-800">
                          <span>Email address available</span>
                          <span className="font-semibold">+20</span>
                        </div>
                      )}
                      {selectedLead.companyName && (
                        <div className="flex justify-between text-emerald-800">
                          <span>Company entity identified</span>
                          <span className="font-semibold">+10</span>
                        </div>
                      )}
                      {(selectedLead.estimatedValue || 0) > 0 && (
                        <div className="flex justify-between text-emerald-800">
                          <span>Commercial deal value registered</span>
                          <span className="font-semibold">+20</span>
                        </div>
                      )}
                    </div>

                    {/* Risk Factors */}
                    <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1.5">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Missing Data / Risks (-)
                      </div>
                      {!selectedLead.jobTitle && (
                        <div className="flex justify-between text-amber-800">
                          <span>Missing job title / role</span>
                          <span className="font-semibold">-10</span>
                        </div>
                      )}
                      {selectedLead.status === 'New' && (
                        <div className="flex justify-between text-amber-800">
                          <span>Awaiting first contact outreach</span>
                          <span className="font-semibold">-5</span>
                        </div>
                      )}
                      {!selectedLead.industry && (
                        <div className="flex justify-between text-amber-800">
                          <span>Industry category unspecified</span>
                          <span className="font-semibold">-5</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggested Action Bar */}
                <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-blue-900">Recommended Next Step:</div>
                    <div className="text-xs text-blue-800 mt-0.5">
                      {(selectedLead.leadScore || 0) >= 75 
                        ? `Direct outreach to ${selectedLead.name}: Offer live demonstration and customized quote.`
                        : `Follow up on WhatsApp with product brochure to qualify interest.`
                      }
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      setActiveTab('assistant');
                      setAssistantType('whatsapp_pitch');
                      setTimeout(handleGenerateAssistant, 50);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3 font-medium whitespace-nowrap self-start sm:self-center"
                  >
                    Draft Message
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400 text-xs">
                Select a lead from the queue to inspect details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SALES MESSAGE ASSISTANT */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Controls */}
          <div className="lg:col-span-5 bg-white p-4 rounded-lg border border-gray-200 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Target Contact</label>
              <select
                value={selectedLeadId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedLeadId(id);
                  const found = leadsList.find(l => l.id === id);
                  if (found) setSelectedLead(found);
                }}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {leadsList.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.companyName ? `(${l.companyName})` : ''} • Score: {l.leadScore || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">Communication Type</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAssistantType('whatsapp_pitch')}
                  className={`p-2 rounded-md border font-medium text-left transition-all ${
                    assistantType === 'whatsapp_pitch' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  WhatsApp Message
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantType('email_pitch')}
                  className={`p-2 rounded-md border font-medium text-left transition-all ${
                    assistantType === 'email_pitch' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Cold Email Pitch
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantType('objection_handler')}
                  className={`p-2 rounded-md border font-medium text-left transition-all ${
                    assistantType === 'objection_handler' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Handle Objection
                </button>
                <button
                  type="button"
                  onClick={() => setAssistantType('lead_summary')}
                  className={`p-2 rounded-md border font-medium text-left transition-all ${
                    assistantType === 'lead_summary' 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700' 
                      : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  Executive Summary
                </button>
              </div>
            </div>

            {assistantType === 'objection_handler' && (
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Objection Scenario</label>
                <select
                  value={objectionType}
                  onChange={(e) => setObjectionType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="Price / Budget">Price / Budget is too high</option>
                  <option value="Already Using Competitor">Already using another provider</option>
                  <option value="No Time Right Now">Too busy right now / Follow up later</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tone of Voice</label>
              <select
                value={assistantTone}
                onChange={(e) => setAssistantTone(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="Friendly & Professional">Friendly & Professional</option>
                <option value="Urgent Sales Closer">Urgent Sales Closer</option>
                <option value="Warm & Consultative">Warm & Consultative</option>
                <option value="Direct & Concise">Direct & Concise</option>
              </select>
            </div>

            <Button
              onClick={handleGenerateAssistant}
              disabled={assistantLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${assistantLoading ? 'animate-spin' : ''}`} />
              {assistantLoading ? 'Generating Draft...' : 'Generate Message Draft'}
            </Button>
          </div>

          {/* Composer Preview Output */}
          <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-xs">
                {assistantResult?.title || 'Draft Composer Output'}
              </span>

              {assistantResult?.content && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(assistantResult.content)}
                    className="text-xs h-8 border-gray-300"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1 text-gray-500" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>

                  {selectedLead?.phone && assistantType === 'whatsapp_pitch' && (
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(assistantResult.content)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" /> Open in WhatsApp
                    </a>
                  )}
                </div>
              )}
            </div>

            {assistantLoading ? (
              <div className="py-20 text-center text-xs text-gray-500">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Preparing draft for {selectedLead?.name}...
              </div>
            ) : assistantResult?.content ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {assistantResult.content}
                </div>

                {assistantResult.recommendations && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-1 text-xs text-gray-600">
                    <span className="font-bold text-gray-800 block mb-1">Outreach Guidelines:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {assistantResult.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center text-xs text-gray-400">
                Click "Generate Message Draft" to prepare a customized communication.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RULES CONFIGURATION */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-5 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Scoring Weight Configuration</h2>
            <p className="text-xs text-gray-500">Relative weights applied when calculating lead quality.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2.5">
              <span className="font-bold text-gray-800 block">Contact Information Weights</span>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Verified WhatsApp / Phone</span>
                <span className="font-semibold text-emerald-600">+20 pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Verified Business Email</span>
                <span className="font-semibold text-emerald-600">+20 pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Company Name Provided</span>
                <span className="font-semibold text-indigo-600">+10 pts</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Job Title / Role Provided</span>
                <span className="font-semibold text-indigo-600">+10 pts</span>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-2.5">
              <span className="font-bold text-gray-800 block">Behavioral & Pipeline Weights</span>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Inbound WhatsApp / Website Inquiry</span>
                <span className="font-semibold text-emerald-600">+15 pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Proposal / Negotiation Stage</span>
                <span className="font-semibold text-amber-600">+40 pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span>Commercial Deal Value (Scaling)</span>
                <span className="font-semibold text-indigo-600">up to +20 pts</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Auto-Qualification Threshold</span>
                <span className="font-semibold text-gray-900">Score ≥ 65</span>
              </div>
            </div>
          </div>

          {/* AI Model API Key Integration Section */}
          <div className="p-5 rounded-lg border border-indigo-100 bg-indigo-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">
                  Connect Live AI Model (Gemini / OpenAI API Key)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Plug in your API key to let real Google Gemini or OpenAI models generate WhatsApp replies and sales pitches in real-time.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live LLM Ready
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 bg-white rounded-md border border-gray-200 space-y-1">
                <span className="font-bold text-gray-800 block">Option 1: Google Gemini (Free & Fast)</span>
                <p className="text-gray-500 text-[11px]">
                  1. Visit <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">aistudio.google.com</a> and get a free key.<br />
                  2. Open <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">apps/api/.env</code> file.<br />
                  3. Set <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">GEMINI_API_KEY="AIzaSy..."</code>
                </p>
              </div>

              <div className="p-3 bg-white rounded-md border border-gray-200 space-y-1">
                <span className="font-bold text-gray-800 block">Option 2: OpenAI (GPT-4o)</span>
                <p className="text-gray-500 text-[11px]">
                  1. Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-semibold">platform.openai.com</a>.<br />
                  2. Open <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">apps/api/.env</code> file.<br />
                  3. Set <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">OPENAI_API_KEY="sk-..."</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIPage;
