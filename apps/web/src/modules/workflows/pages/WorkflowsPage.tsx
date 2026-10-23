import { useState, useEffect, useCallback } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { WorkflowList } from '../components/WorkflowList';
import { WorkflowBuilder } from '../components/WorkflowBuilder';
import { WorkflowTemplatesModal } from '../components/WorkflowTemplatesModal';
import { ExecutionLogsModal } from '../components/ExecutionLogsModal';
import { Workflow } from '../types';
import { WorkflowRecipe } from '../data/templates';
import api from '@/lib/api';

const MySwal = withReactContent(Swal);

export function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'builder'>('list');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | undefined>(undefined);

  // Modals state
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [logsWorkflowId, setLogsWorkflowId] = useState<string | null>(null);
  const [logsWorkflowName, setLogsWorkflowName] = useState<string | null>(null);

  // ─── Load workflows from API on mount ────────────────────────────────────────
  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/workflows');
      if (data.success && Array.isArray(data.data)) {
        setWorkflows(data.data);
      }
    } catch (err) {
      console.error('Failed to load workflows:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const activeWorkflow = activeWorkflowId
    ? (editingWorkflow?.id === activeWorkflowId ? editingWorkflow : workflows.find(w => w.id === activeWorkflowId))
    : editingWorkflow;

  const handleCreateNew = () => {
    setIsTemplatesModalOpen(true);
  };

  const handleSelectRecipe = (recipe: WorkflowRecipe | null) => {
    setIsTemplatesModalOpen(false);
    if (!recipe) {
      // Blank workflow
      setEditingWorkflow(undefined);
      setActiveWorkflowId(null);
    } else {
      const newWf: Workflow = {
        ...recipe.workflow,
        id: `wf-${Date.now()}`,
        createdAt: new Date().toISOString(),
        runsCount: 0
      };
      setEditingWorkflow(newWf);
      setActiveWorkflowId(newWf.id);
    }
    setView('builder');
  };

  const handleViewLogs = (id?: string, name?: string) => {
    setLogsWorkflowId(id || null);
    setLogsWorkflowName(name || null);
    setIsLogsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    const existing = workflows.find(w => w.id === id);
    setEditingWorkflow(existing);
    setActiveWorkflowId(id);
    setView('builder');
  };

  // ─── Save (create or update) workflow via API ─────────────────────────────────
  const handleSaveWorkflow = async (savedWorkflow: Workflow) => {
    try {
      const isNew = !workflows.some(w => w.id === savedWorkflow.id);
      if (isNew) {
        const { data } = await api.post('/workflows', savedWorkflow);
        setWorkflows(prev => [data.data, ...prev]);
      } else {
        const { data } = await api.put(`/workflows/${savedWorkflow.id}`, savedWorkflow);
        setWorkflows(prev => prev.map(w => w.id === savedWorkflow.id ? data.data : w));
      }
    } catch (err) {
      console.warn('API save failed, saving locally:', err);
      setWorkflows(prev => {
        const index = prev.findIndex(w => w.id === savedWorkflow.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = savedWorkflow;
          return updated;
        }
        return [savedWorkflow, ...prev];
      });
    }
    setView('list');
    setActiveWorkflowId(null);
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Workflow saved!',
      showConfirmButton: false,
      timer: 1800
    });
  };

  // ─── Toggle active/draft via API ──────────────────────────────────────────────
  const handleToggleActive = async (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (!wf) return;
    const newState = !wf.isActive;
    try {
      await api.put(`/workflows/${id}`, { isActive: newState });
    } catch (err) {
      console.warn('Toggle API failed, updating locally:', err);
    }
    setWorkflows(prev =>
      prev.map(w => w.id === id ? { ...w, isActive: newState } : w)
    );
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: newState ? 'success' : 'info',
      title: `Workflow "${wf.name}" is now ${newState ? 'Active' : 'Draft'}`,
      showConfirmButton: false,
      timer: 2000
    });
  };

  // ─── Delete workflow via API ──────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const wf = workflows.find(w => w.id === id);
    const result = await MySwal.fire({
      title: 'Delete Workflow?',
      text: `Are you sure you want to delete "${wf?.name || 'this workflow'}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel'
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/workflows/${id}`);
    } catch (err) {
      console.warn('Delete API failed, removing locally:', err);
    }
    setWorkflows(prev => prev.filter(w => w.id !== id));
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Workflow deleted',
      showConfirmButton: false,
      timer: 1800
    });
  };

  // ─── Duplicate (local only, then save) ───────────────────────────────────────
  const handleDuplicate = async (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (!wf) return;
    const cloned: Workflow = {
      ...wf,
      id: `wf-${Date.now()}`,
      name: `${wf.name} (Copy)`,
      isActive: false,
      runsCount: 0,
      createdAt: new Date().toISOString(),
      lastRunAt: undefined
    };
    try {
      const { data } = await api.post('/workflows', cloned);
      setWorkflows(prev => [data.data, ...prev]);
    } catch (err) {
      console.warn('Duplicate API failed, saving locally:', err);
      setWorkflows(prev => [cloned, ...prev]);
    }
    MySwal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `Duplicated as "${cloned.name}"`,
      showConfirmButton: false,
      timer: 2000
    });
  };

  // ─── Test Run via API ─────────────────────────────────────────────────────────
  const handleRunTest = async (id: string) => {
    const wf = workflows.find(w => w.id === id);
    if (!wf) return;
    try {
      const { data } = await api.post(`/workflows/${id}/test`);
      const targetContact = data?.data?.targetContact || 'CRM Lead';

      setWorkflows(prev =>
        prev.map(w => w.id === id
          ? { ...w, runsCount: (w.runsCount || 0) + 1, lastRunAt: 'Just now' }
          : w
        )
      );

      MySwal.fire({
        icon: 'success',
        title: 'Workflow Simulation Executed!',
        html: `
          <div style="text-align: left; font-size: 13px; color: #4B5563; line-height: 1.6;">
            <p><strong>🎯 Workflow:</strong> ${wf.name}</p>
            <p><strong>👤 Contact:</strong> ${targetContact}</p>
            <p><strong>⚡ Actions:</strong> ${wf.actions?.length || 0} step(s) processed by AI & dispatched.</p>
            <p style="font-size: 11px; color: #10B981; margin-top: 8px;">✓ Recorded in live Execution Audit Trail</p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'View Execution Logs',
        cancelButtonText: 'Done',
        confirmButtonColor: '#4F46E5',
        cancelButtonColor: '#9CA3AF'
      }).then((result) => {
        if (result.isConfirmed) {
          handleViewLogs(wf.id, wf.name);
        }
      });
    } catch (err) {
      console.warn('Test API failed:', err);
    }
  };


  // ─── Builder view ─────────────────────────────────────────────────────────────
  if (view === 'builder') {
    return (
      <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] overflow-hidden">
        <WorkflowBuilder
          initialWorkflow={activeWorkflow}
          onBack={() => {
            setView('list');
            setActiveWorkflowId(null);
          }}
          onSave={handleSaveWorkflow}
        />
      </div>
    );
  }

  // ─── List view ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
      <WorkflowList
        workflows={workflows}
        onCreateNew={handleCreateNew}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        onDuplicate={handleDuplicate}
        onRunTest={handleRunTest}
        onViewLogs={handleViewLogs}
      />

      {/* Templates & Recipe Library Modal */}
      <WorkflowTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectRecipe={handleSelectRecipe}
      />

      {/* Execution Audit History Modal */}
      <ExecutionLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => {
          setIsLogsModalOpen(false);
          setLogsWorkflowId(null);
          setLogsWorkflowName(null);
        }}
        workflowId={logsWorkflowId}
        workflowName={logsWorkflowName}
        onRunTest={handleRunTest}
      />
    </div>
  );
}
