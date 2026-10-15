import { useState } from 'react';
import { 
  Plus, 
  Settings2, 
  Play, 
  Power, 
  PowerOff, 
  Trash2, 
  Copy, 
  Search, 
  Zap, 
  MessageSquare, 
  Briefcase, 
  Tag, 
  UserPlus, 
  PhoneCall, 
  CheckCircle2, 
  Clock, 
  Layers,
  Activity,
  FileEdit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Workflow, TriggerType } from '../types';

interface WorkflowListProps {
  workflows: Workflow[];
  onCreateNew: () => void;
  onEdit: (id: string) => void;
  onToggleActive: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRunTest: (id: string) => void;
  onViewLogs?: (workflowId?: string, workflowName?: string) => void;
}

export function WorkflowList({ 
  workflows, 
  onCreateNew, 
  onEdit, 
  onToggleActive, 
  onDelete, 
  onDuplicate, 
  onRunTest,
  onViewLogs
}: WorkflowListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'draft'>('all');

  // Stats calculation
  const totalWorkflows = workflows.length;
  const activeWorkflows = workflows.filter(w => w.isActive).length;
  const draftWorkflows = workflows.filter(w => !w.isActive).length;
  const totalRuns = workflows.reduce((acc, curr) => acc + (curr.runsCount || 0), 0);

  // Filter workflows
  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = 
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (filterTab === 'active') return w.isActive;
    if (filterTab === 'draft') return !w.isActive;
    return true;
  });

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Automations & Workflows
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
            Build rules to automate repetitive customer conversations, assignments, and deal progression.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => onViewLogs?.()}
            className="w-full sm:w-auto text-xs sm:text-sm py-2 px-3 sm:px-3.5 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-gray-700 font-medium"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
            Audit Logs
          </Button>

          <Button 
            onClick={onCreateNew} 
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-medium text-xs sm:text-sm py-2 px-3 sm:px-4"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Automation
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Workflows</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900 mt-0.5 sm:mt-1">{totalWorkflows}</div>
          <div className="text-[11px] sm:text-xs text-indigo-600 mt-1 flex items-center gap-1 truncate">
            <Layers className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" /> Built in system
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Automations</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">{activeWorkflows}</div>
          <div className="text-[11px] sm:text-xs text-emerald-600 mt-1 flex items-center gap-1 truncate">
            <CheckCircle2 className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" /> Live & monitoring
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Draft Automations</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-700 mt-0.5 sm:mt-1">{draftWorkflows}</div>
          <div className="text-[11px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
            <FileEdit className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" /> In progress
          </div>
        </div>

        <div 
          onClick={() => onViewLogs?.()}
          className="bg-white p-3.5 sm:p-5 rounded-xl border border-gray-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
          title="Click to view execution history"
        >
          <div className="flex items-center justify-between">
            <div className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Executions</div>
            <span className="text-[10px] text-indigo-600 font-semibold group-hover:underline">
              Logs &rarr;
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 mt-0.5 sm:mt-1">{totalRuns.toLocaleString()}</div>
          <div className="text-[11px] sm:text-xs text-gray-500 mt-1 flex items-center gap-1 truncate">
            <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0 text-amber-500" /> View audit history
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-gray-200 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72 lg:w-80">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search workflows by name..."
            className="w-full text-xs pl-8 sm:pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto flex-nowrap sm:flex-wrap">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filterTab === 'all' ? 'bg-white text-gray-900 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({workflows.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filterTab === 'active' ? 'bg-white text-emerald-700 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({workflows.filter(w => w.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('draft')}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              filterTab === 'draft' ? 'bg-white text-gray-700 shadow-xs font-semibold' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Draft ({workflows.filter(w => !w.isActive).length})
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredWorkflows.length === 0 ? (
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 text-center py-12 sm:py-16 px-4">
          <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm sm:text-base font-bold text-gray-700">No Automations Found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery 
              ? 'No workflows match your search query. Try clearing your search.' 
              : 'You have not created any automations yet.'}
          </p>
          <div className="mt-4 flex justify-center gap-2">
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            )}
            <Button size="sm" onClick={onCreateNew} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-1.5" /> Create New Workflow
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* Mobile Card View (Screens < 768px)                       */}
          {/* ======================================================== */}
          <div className="block md:hidden space-y-3">
            {filteredWorkflows.map(wf => (
              <div 
                key={wf.id} 
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs space-y-3 hover:border-indigo-200 transition-colors"
              >
                {/* Header Row: Title & Active Toggle */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 
                      onClick={() => onEdit(wf.id)}
                      className="font-bold text-sm text-gray-900 hover:text-indigo-600 cursor-pointer transition-colors leading-snug"
                    >
                      {wf.name}
                    </h3>
                    {wf.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {wf.description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleActive(wf.id)}
                    className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                      wf.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {wf.isActive ? <Power className="w-3 h-3 text-emerald-600" /> : <PowerOff className="w-3 h-3 text-gray-400" />}
                    {wf.isActive ? 'Active' : 'Draft'}
                  </button>
                </div>

                {/* Metadata Row: Trigger, Steps, Runs */}
                <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-gray-100">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
                    <TriggerIcon type={wf.trigger?.type} />
                    <span className="truncate max-w-[150px]">{formatTriggerName(wf.trigger?.type)}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                    <Layers className="w-3 h-3 text-gray-400" />
                    {wf.actions.length} {wf.actions.length === 1 ? 'Step' : 'Steps'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onViewLogs?.(wf.id, wf.name)}
                    className="inline-flex items-center gap-1 text-gray-700 hover:text-indigo-600 font-semibold ml-auto transition-colors"
                    title="Click to view execution history"
                  >
                    <Play className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                    <span>{(wf.runsCount || 0).toLocaleString()} runs</span>
                  </button>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onRunTest(wf.id)}
                    className="flex-1 text-xs h-8 border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Play className="w-3 h-3 mr-1 text-indigo-600" /> Test
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewLogs?.(wf.id, wf.name)}
                    className="flex-1 text-xs h-8 border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    <Activity className="w-3 h-3 mr-1 text-indigo-600" /> Logs
                  </Button>

                  <Button 
                    size="sm" 
                    onClick={() => onEdit(wf.id)}
                    className="flex-1 text-xs h-8 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
                  >
                    <Settings2 className="w-3 h-3 mr-1" /> Edit
                  </Button>

                  <button
                    type="button"
                    onClick={() => onDuplicate(wf.id)}
                    title="Duplicate Workflow"
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(wf.id)}
                    title="Delete Workflow"
                    className="p-1.5 rounded-md text-rose-500 hover:bg-rose-50 border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ======================================================== */}
          {/* Desktop & Tablet Table View (Screens >= 768px)           */}
          {/* ======================================================== */}
          <div className="hidden md:block bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full min-w-[720px] text-sm text-left">
                <thead className="bg-gray-50/70 border-b border-gray-200/70 text-gray-500 font-semibold text-xs">
                  <tr>
                    <th className="px-5 lg:px-6 py-3.5 whitespace-nowrap">AUTOMATION</th>
                    <th className="px-4 lg:px-6 py-3.5 whitespace-nowrap">STATUS</th>
                    <th className="px-4 lg:px-6 py-3.5 whitespace-nowrap">TRIGGER</th>
                    <th className="px-4 lg:px-6 py-3.5 whitespace-nowrap">STEPS</th>
                    <th className="px-4 lg:px-6 py-3.5 whitespace-nowrap">RUNS</th>
                    <th className="px-5 lg:px-6 py-3.5 text-right whitespace-nowrap">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWorkflows.map(wf => (
                    <tr key={wf.id} className="hover:bg-gray-50/60 transition-colors group">
                      
                      {/* Name and Description */}
                      <td className="px-5 lg:px-6 py-4">
                        <div 
                          onClick={() => onEdit(wf.id)}
                          className="font-bold text-gray-900 group-hover:text-indigo-600 cursor-pointer transition-colors max-w-xs truncate"
                        >
                          {wf.name}
                        </div>
                        {wf.description && (
                          <div className="text-xs text-gray-500 line-clamp-1 max-w-xs mt-0.5">
                            {wf.description}
                          </div>
                        )}
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onToggleActive(wf.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            wf.isActive 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                          }`}
                          title="Click to toggle status"
                        >
                          {wf.isActive ? <Power className="w-3 h-3 text-emerald-600" /> : <PowerOff className="w-3 h-3 text-gray-400" />}
                          {wf.isActive ? 'Active' : 'Draft'}
                        </button>
                      </td>

                      {/* Trigger Badge */}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
                          <TriggerIcon type={wf.trigger?.type} />
                          <span className="max-w-[160px] truncate">{formatTriggerName(wf.trigger?.type)}</span>
                        </span>
                      </td>

                      {/* Actions Count */}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                          <Layers className="w-3 h-3 text-gray-400" />
                          {wf.actions.length} {wf.actions.length === 1 ? 'Step' : 'Steps'}
                        </span>
                      </td>

                      {/* Runs Count */}
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onViewLogs?.(wf.id, wf.name)}
                          className="flex items-center gap-1.5 text-gray-700 hover:text-indigo-600 font-semibold text-xs transition-colors group/run"
                          title="Click to view execution logs"
                        >
                          <Play className="w-3 h-3 text-indigo-500 fill-indigo-500" />
                          <span className="group-hover/run:underline">{(wf.runsCount || 0).toLocaleString()} runs</span>
                        </button>
                        {wf.lastRunAt && (
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {wf.lastRunAt}
                          </div>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="px-5 lg:px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onRunTest(wf.id)}
                            title="Simulate / Run Test"
                            className="h-8 px-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Play className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Test
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewLogs?.(wf.id, wf.name)}
                            title="View Execution Audit Logs"
                            className="h-8 px-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Activity className="w-3.5 h-3.5 mr-1" /> Logs
                          </Button>

                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onEdit(wf.id)}
                            title="Edit Rules"
                            className="h-8 px-2.5 text-indigo-600 hover:bg-indigo-50"
                          >
                            <Settings2 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>

                          <button
                            type="button"
                            onClick={() => onDuplicate(wf.id)}
                            title="Duplicate Workflow"
                            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDelete(wf.id)}
                            title="Delete Workflow"
                            className="p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

function TriggerIcon({ type }: { type?: TriggerType }) {
  switch (type) {
    case 'whatsapp_message_received':
      return <MessageSquare className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />;
    case 'deal_stage_changed':
      return <Briefcase className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />;
    case 'lead_status_changed':
      return <Activity className="w-3.5 h-3.5 text-violet-600 flex-shrink-0" />;
    case 'new_lead_added':
      return <UserPlus className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />;
    case 'tag_added':
      return <Tag className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />;
    case 'call_disposition_logged':
      return <PhoneCall className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />;
    default:
      return <Zap className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />;
  }
}

function formatTriggerName(type?: TriggerType) {
  if (!type) return 'Trigger';
  return type
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
