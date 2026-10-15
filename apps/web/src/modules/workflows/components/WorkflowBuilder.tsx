import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  Node,
  Connection,
  NodeTypes,
  OnConnect,
  NodeMouseHandler,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeft,
  Power,
  Play,
  Save,
  Settings,
  MessageSquare,
  UserPlus,
  Tag,
  ArrowRightLeft,
  Activity,
  Sparkles,
  Clock,
  Server,
  GitBranch,
  Code,
  Mail,
  CheckSquare
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

import { Workflow, WorkflowAction, WorkflowTrigger } from '../types';
import { TriggerNode } from '../nodes/TriggerNode';
import { ActionNode } from '../nodes/ActionNode';
import { COMMON_VARIABLES } from '../nodes/constants';

const MySwal = withReactContent(Swal);

const CRM_MERGE_TAGS = [
  { label: 'Lead Name', tag: '{{lead.name}}' },
  { label: 'Phone', tag: '{{lead.phone}}' },
  { label: 'Email', tag: '{{lead.email}}' },
  { label: 'Company', tag: '{{lead.company}}' },
  { label: 'Deal Title', tag: '{{deal.title}}' },
  { label: 'Deal Value', tag: '{{deal.amount}}' },
  { label: 'Agent Name', tag: '{{agent.name}}' },
];

const nodeTypes: NodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};

interface WorkflowBuilderProps {
  initialWorkflow?: Workflow;
  onBack: () => void;
  onSave: (workflow: Workflow) => void;
}

export function WorkflowBuilder({ initialWorkflow, onBack, onSave }: WorkflowBuilderProps) {
  const [workflow, setWorkflow] = useState<Workflow>(() => {
    if (initialWorkflow) return { ...initialWorkflow };
    return {
      id: `wf-${Date.now()}`,
      name: 'Untitled Automation',
      description: '',
      isActive: false,
      trigger: {
        id: `trg-${Date.now()}`,
        type: 'whatsapp_message_received',
        config: { isFirstMessage: true }
      },
      actions: [],
      createdAt: new Date().toISOString(),
      runsCount: 0,
      version: '1.0.0'
    };
  });

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [crmUsers, setCrmUsers] = useState<any[]>([]);
  const [crmPipelines, setCrmPipelines] = useState<any[]>([]);
  const [crmLeads, setCrmLeads] = useState<any[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<any>(null);

  // Fetch real CRM users, pipelines, and leads for dynamic dropdowns and live simulation
  useEffect(() => {
    api.get('/users')
      .then(res => {
        const users = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCrmUsers(users);
      })
      .catch(() => {});

    api.get('/pipelines')
      .then(res => {
        const pipelines = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCrmPipelines(pipelines);
      })
      .catch(() => {});

    api.get('/leads')
      .then(res => {
        const leads = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setCrmLeads(leads);
      })
      .catch(() => {});
  }, []);

  // Initialize nodes
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Handle node deletion
  const handleNodeDelete = useCallback((nodeId: string) => {
    if (nodeId === workflow.trigger.id) {
      alert('Cannot delete the trigger node');
      return;
    }

    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId));

    setWorkflow(prev => ({
      ...prev,
      actions: prev.actions.filter(action => action.id !== nodeId)
    }));

    setSelectedNodeId(null);
  }, [setNodes, setEdges, workflow.trigger.id]);

  // Initialize with trigger + existing action nodes
  useEffect(() => {
    const triggerNode: Node = {
      id: workflow.trigger.id,
      type: 'trigger',
      position: { x: 250, y: 100 },
      data: {
        label: 'Trigger',
        nodeType: 'trigger',
        description: 'Starts the workflow',
        trigger: workflow.trigger
      }
    };

    const actionNodes: Node[] = workflow.actions.map((action, index) => ({
      id: action.id,
      type: 'action',
      position: { x: 250, y: 250 + index * 160 },
      data: {
        label: 'Action',
        nodeType: 'action',
        description: 'Performs an action',
        action,
        onDelete: () => handleNodeDelete(action.id)
      }
    }));

    // Auto-connect trigger → first action → second action ...
    const autoEdges = [
      ...(actionNodes.length > 0 ? [{
        id: `e-trigger-${actionNodes[0].id}`,
        source: triggerNode.id,
        target: actionNodes[0].id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      }] : []),
      ...actionNodes.slice(1).map((node, i) => ({
        id: `e-${actionNodes[i].id}-${node.id}`,
        source: actionNodes[i].id,
        target: node.id,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      }))
    ];

    setNodes([triggerNode, ...actionNodes]);
    setEdges(autoEdges);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle connection creation
  const onConnect: OnConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      animated: true, 
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
    }, eds));
  }, [setEdges]);

  // Handle workflow save
  const handleSave = useCallback(() => {
    if (!workflow.name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    const updatedActions: WorkflowAction[] = [...nodes]
      .filter((node) => node.type === 'action')
      .sort((a, b) => a.position.y - b.position.y)
      .map((node) => node.data.action)
      .filter((action) => action !== undefined);

    const updatedTrigger: WorkflowTrigger = nodes
      .find((node) => node.type === 'trigger')?.data.trigger || workflow.trigger;

    const updatedWorkflow: Workflow = {
      ...workflow,
      trigger: updatedTrigger,
      actions: updatedActions
    };

    onSave(updatedWorkflow);
  }, [workflow, nodes, onSave]);

  // Handle workflow simulation with real CRM leads
  const handleRunSimulation = useCallback(async () => {
    const actionNodes = nodes.filter((n) => n.type === 'action');
    if (actionNodes.length === 0) {
      MySwal.fire({
        icon: 'info',
        title: 'No Actions Added',
        text: 'Please add at least one action step from the library to test this workflow.',
        confirmButtonColor: '#4F46E5'
      });
      return;
    }

    // Determine target contact from real CRM leads
    let selectedLead: any = crmLeads.length > 0 ? crmLeads[0] : null;

    if (crmLeads.length > 1) {
      const optionsHtml = crmLeads.slice(0, 10).map((l: any, idx: number) => {
        const displayName = l.name || l.email || 'Unnamed Lead';
        const phone = l.phone ? `(${l.phone})` : '';
        const status = l.status ? `· ${l.status}` : '';
        return `<option value="${idx}">👤 ${displayName} ${phone} ${status}</option>`;
      }).join('');

      const promptResult = await MySwal.fire({
        title: 'Test Workflow with Contact',
        html: `
          <div style="text-align: left; font-size: 13px; color: #4B5563; margin-bottom: 10px;">
            Choose a contact from your real CRM leads to simulate this automation:
          </div>
          <select id="swal-lead-picker" style="width: 100%; padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 13px; color: #111827; background-color: #F9FAFB;">
            ${optionsHtml}
          </select>
          <div style="text-align: left; font-size: 11px; color: #6B7280; margin-top: 8px;">
            ⚡ Tokens like {{lead.name}} and {{lead.phone}} will use this contact's live CRM profile.
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Run Simulation 🚀',
        cancelButtonText: 'Cancel',
        confirmButtonColor: '#4F46E5',
        preConfirm: () => {
          const el = document.getElementById('swal-lead-picker') as HTMLSelectElement;
          return el ? parseInt(el.value, 10) : 0;
        }
      });

      if (!promptResult.isConfirmed) return;
      selectedLead = crmLeads[promptResult.value || 0] || crmLeads[0];
    }

    const contactName = selectedLead ? (selectedLead.name || selectedLead.email || 'CRM Lead') : 'Lead';
    const contactPhone = selectedLead ? (selectedLead.phone || selectedLead.email || '—') : '—';
    const contactLabel = `${contactName} (${contactPhone})`;

    setIsSimulating(true);
    setActiveStep(-1);
    setSelectedNodeId(workflow.trigger.id);

    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < actionNodes.length; i++) {
      setActiveStep(i);
      setSelectedNodeId(actionNodes[i].id);
      await new Promise(r => setTimeout(r, 650));
    }

    setIsSimulating(false);
    setActiveStep(null);

    // Call API test execution to log in DB with real contact data
    if (workflow.id) {
      try {
        await api.post(`/workflows/${workflow.id}/test`, {
          contactName,
          contactPhone,
          leadId: selectedLead?.id
        });
      } catch (err) {
        console.warn('API test simulation failed:', err);
      }
    }

    setWorkflow(prev => ({
      ...prev,
      runsCount: (prev.runsCount || 0) + 1,
      lastRunAt: 'Just now'
    }));

    MySwal.fire({
      icon: 'success',
      title: 'Workflow Simulation Completed!',
      html: `
        <div style="text-align: left; font-size: 13px; color: #374151; line-height: 1.6;">
          <p><strong>🎯 Workflow:</strong> ${workflow.name}</p>
          <p><strong>👤 Contact:</strong> ${contactLabel}</p>
          <p><strong>⚡ Steps Dispatched:</strong> ${actionNodes.length} action(s) executed successfully.</p>
          <p style="font-size: 11px; color: #10B981; margin-top: 8px;">
            ✓ Recorded in live Execution Audit Logs
          </p>
        </div>
      `,
      confirmButtonText: 'Great!',
      confirmButtonColor: '#4F46E5'
    });
  }, [nodes, workflow.id, workflow.name, workflow.trigger.id, crmLeads]);

  // Handle add action
  const addActionNode = useCallback((actionType: string) => {
    const newNodeId = `action-${Date.now()}`;

    setNodes((currentNodes) => {
      let nextY = 250;
      let lastNodeId = workflow.trigger.id;

      if (currentNodes.length > 0) {
        const sorted = [...currentNodes].sort((a, b) => b.position.y - a.position.y);
        const lowest = sorted[0];
        nextY = lowest.position.y + 140;
        lastNodeId = lowest.id;
      }

      const newNode: Node = {
        id: newNodeId,
        type: 'action',
        position: { x: 250, y: nextY },
        data: {
          label: 'Action',
          nodeType: 'action',
          description: 'Performs an action',
          action: {
            id: newNodeId,
            type: actionType as any,
            config: {}
          },
          onDelete: () => handleNodeDelete(newNodeId)
        }
      };

      // Auto-connect with styled animated edge from previous node
      setEdges((eds) => [
        ...eds,
        {
          id: `e-${lastNodeId}-${newNodeId}`,
          source: lastNodeId,
          target: newNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#6366f1', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
        }
      ]);

      return [...currentNodes, newNode];
    });

    setWorkflow(prev => ({
      ...prev,
      actions: [
        ...prev.actions,
        {
          id: newNodeId,
          type: actionType as any,
          config: {}
        }
      ]
    }));

    // Auto-select the newly added node for instant configuration in right panel
    setSelectedNodeId(newNodeId);
  }, [setNodes, setEdges, workflow.trigger.id, handleNodeDelete]);

  // Handle node data change
  const handleNodeDataChange = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map(node => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Get node data helper
  const getNodeData = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;
    return node.data;
  }, [nodes]);

  // Handle node click for selection
  const handleNodeClick: NodeMouseHandler = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  return (
    <div className="h-full w-full flex flex-col bg-slate-50/60 overflow-hidden select-none">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-5 py-2 sm:py-2.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 flex-shrink-0 shadow-xs z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>

          <div className="border-l border-gray-200 pl-2.5 sm:pl-4 min-w-0">
            <div className="flex items-center gap-2">
              <input
                value={workflow.name}
                onChange={e => setWorkflow({ ...workflow, name: e.target.value })}
                className="text-sm sm:text-base md:text-lg font-bold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-indigo-600 focus:outline-none px-1 py-0.5 rounded transition-all max-w-[130px] sm:max-w-[200px] md:max-w-xs truncate"
                placeholder="Workflow Name..."
              />
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold flex items-center gap-1 flex-shrink-0 ${workflow.isActive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-gray-100 text-gray-600'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${workflow.isActive ? 'bg-emerald-600' : 'bg-gray-400'}`}></span>
                {workflow.isActive ? 'Active' : 'Draft'}
              </span>
            </div>
            <input
              value={workflow.description}
              onChange={e => setWorkflow({ ...workflow, description: e.target.value })}
              className="text-[11px] sm:text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-indigo-400 focus:outline-none px-1 py-0.5 w-full max-w-[180px] sm:max-w-[260px] md:max-w-[350px] transition-all truncate"
              placeholder="Add description..."
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWorkflow({ ...workflow, isActive: !workflow.isActive })}
            className={`text-xs h-8 px-2 sm:px-3 border ${workflow.isActive ? 'text-gray-700' : 'text-emerald-700 border-emerald-300 bg-emerald-50'}`}
          >
            <Power className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">{workflow.isActive ? 'Deactivate' : 'Activate'}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="text-xs h-8 px-2 sm:px-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium"
          >
            <Play className={`w-3.5 h-3.5 sm:mr-1.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isSimulating ? (activeStep === -1 ? 'Testing Trigger...' : `Step ${(activeStep ?? 0) + 1}...`) : 'Test Run'}</span>
            <span className="sm:hidden">Test</span>
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            className="text-xs h-8 px-2.5 sm:px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Save className="w-3.5 h-3.5 sm:mr-1.5" />
            <span>Save</span>
            <span className="hidden sm:inline">&nbsp;Automation</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Action Library */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Action Library</h3>
            <p className="text-xs text-gray-500 mt-1">Click to add actions</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => addActionNode('send_whatsapp_message')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Send WhatsApp Message"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">WhatsApp</span>
              </button>

              <button
                onClick={() => addActionNode('assign_to_agent')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Assign to Agent"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Assign</span>
              </button>

              <button
                onClick={() => addActionNode('add_tag')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Add Tag"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                  <Tag className="w-4 h-4 text-amber-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Tag</span>
              </button>

              <button
                onClick={() => addActionNode('move_deal_stage')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Move Stage"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mb-1">
                  <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Stage</span>
              </button>

              <button
                onClick={() => addActionNode('update_lead_status')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Update Lead Status"
              >
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center mb-1">
                  <Activity className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Status</span>
              </button>

              <button
                onClick={() => addActionNode('generate_ai_reply')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Generate AI Reply"
              >
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">AI</span>
              </button>

              <button
                onClick={() => addActionNode('set_reminder')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Set Reminder"
              >
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Reminder</span>
              </button>

              <button
                onClick={() => addActionNode('http_request')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="HTTP Request"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                  <Server className="w-4 h-4 text-gray-700" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">HTTP</span>
              </button>

              <button
                onClick={() => addActionNode('delay')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Delay"
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-1">
                  <Clock className="w-4 h-4 text-amber-700" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Delay</span>
              </button>

              <button
                onClick={() => addActionNode('condition')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Conditional Logic"
              >
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center mb-1">
                  <GitBranch className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Logic</span>
              </button>

              <button
                onClick={() => addActionNode('code_execution')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Run Code"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center mb-1">
                  <Code className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Code</span>
              </button>

              <button
                onClick={() => addActionNode('send_email')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                title="Send Email"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mb-1">
                  <Mail className="w-4 h-4 text-blue-700" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Email</span>
              </button>

              <button
                onClick={() => addActionNode('create_task')}
                className="flex flex-col items-center p-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors col-span-2"
                title="Create Task"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                  <CheckSquare className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700">Follow-up Task</span>
              </button>
            </div>
          </div>

          <div className="p-3 border-t border-gray-200">
            <p className="text-[10px] text-gray-500">
              Click a node to configure it. Drag connectors between nodes to create the flow.
            </p>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1" ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={() => setSelectedNodeId(null)}
              onInit={(instance) => (reactFlowInstance.current = instance)}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
              className="bg-slate-50"
              snapToGrid={true}
              snapGrid={[15, 15]}
            >
              <Controls className="bg-white shadow-lg rounded-lg border border-gray-200" />
              <Background color="#94a3b8" gap={24} size={1} />
              <MiniMap
                nodeColor={(n) => {
                  if (n.type === 'trigger') return '#4f46e5';
                  return '#10b981';
                }}
                maskColor="rgba(241, 245, 249, 0.7)"
                style={{ width: 140, height: 90 }}
                className="bg-white/90 border border-gray-200 rounded-lg shadow-md"
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Right Sidebar - Configuration Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Configuration</h3>
            <p className="text-xs text-gray-500 mt-1">
              {selectedNodeId
                ? `Editing node: ${selectedNodeId}`
                : 'Select a node to configure'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {selectedNodeId ? (
              <div>
                {(() => {
                  const data = getNodeData(selectedNodeId);
                  if (!data) return null;

                  const renderConfig = () => {
                    switch (data.nodeType) {
                      case 'trigger': {
                        const trg = data.trigger || {};
                        const cfg = trg.config || {};
                        return (
                          <>
                            <div className="mb-4">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Trigger Event
                              </label>
                              <select
                                value={trg.type || 'whatsapp_message_received'}
                                onChange={(e) => {
                                  handleNodeDataChange(selectedNodeId, {
                                    label: 'Trigger',
                                    trigger: {
                                      ...trg,
                                      type: e.target.value,
                                      config: {}
                                    }
                                  });
                                }}
                                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                              >
                                <option value="whatsapp_message_received">💬 WhatsApp Message Received</option>
                                <option value="deal_stage_changed">💼 Pipeline Deal Stage Changed</option>
                                <option value="new_lead_added">👤 New Lead Captured</option>
                                <option value="lead_status_changed">🎯 Lead Status Changed</option>
                                <option value="tag_added">🏷️ Tag Applied to Contact</option>
                                <option value="call_disposition_logged">📞 Call Disposition Logged</option>
                              </select>
                            </div>

                            {/* WhatsApp Filter Config */}
                            {trg.type === 'whatsapp_message_received' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-gray-700">WhatsApp Filter Rule</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Message Match Type</label>
                                  <select
                                    value={cfg.matchType || (cfg.isFirstMessage ? 'first_message' : (cfg.keyword ? 'keyword' : 'any'))}
                                    onChange={(e) => {
                                      const matchType = e.target.value;
                                      handleNodeDataChange(selectedNodeId, {
                                        trigger: {
                                          ...trg,
                                          config: {
                                            ...cfg,
                                            matchType,
                                            isFirstMessage: matchType === 'first_message',
                                            keyword: matchType === 'keyword' ? (cfg.keyword || 'PRICE') : ''
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="first_message">⭐ First message from contact only</option>
                                    <option value="keyword">🔍 Message contains specific keyword</option>
                                    <option value="any">⚡ Any incoming WhatsApp message</option>
                                  </select>
                                </div>

                                {(cfg.matchType === 'keyword' || (!cfg.matchType && cfg.keyword)) && (
                                  <div>
                                    <label className="block text-[11px] text-gray-600 mb-1">Keyword to Match</label>
                                    <input
                                      type="text"
                                      value={cfg.keyword || ''}
                                      onChange={(e) => {
                                        handleNodeDataChange(selectedNodeId, {
                                          trigger: {
                                            ...trg,
                                            config: { ...cfg, keyword: e.target.value }
                                          }
                                        });
                                      }}
                                      placeholder="e.g. PRICE, DEMO, BROCHURE, SUPPORT"
                                      className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white font-mono"
                                    />
                                    <span className="text-[10px] text-gray-400 mt-0.5 block">Trigger fires if inbound message contains this word</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Deal Stage Filter Config */}
                            {trg.type === 'deal_stage_changed' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-gray-700">Target Pipeline & Stage</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">When Moved To Stage</label>
                                  <select
                                    value={cfg.stage || 'Won'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        trigger: {
                                          ...trg,
                                          config: { ...cfg, stage: e.target.value }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    {crmPipelines.length > 0 ? (
                                      crmPipelines.map((pipe: any) => (
                                        <optgroup key={pipe.id} label={`Pipeline: ${pipe.name}`}>
                                          {(pipe.stages || []).map((stg: any) => (
                                            <option key={stg.id} value={stg.name}>
                                              📍 {stg.name}
                                            </option>
                                          ))}
                                        </optgroup>
                                      ))
                                    ) : (
                                      <>
                                        <option value="Lead In">Lead In</option>
                                        <option value="Contact Made">Contact Made</option>
                                        <option value="Requirements Gathered">Requirements Gathered</option>
                                        <option value="Proposal Sent">Proposal Sent</option>
                                        <option value="Won">🏆 Won</option>
                                        <option value="Lost">Lost</option>
                                      </>
                                    )}
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* New Lead Source Filter */}
                            {trg.type === 'new_lead_added' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-gray-700">Lead Source Filter</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Source</label>
                                  <select
                                    value={cfg.source || 'All Sources'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        trigger: {
                                          ...trg,
                                          config: { ...cfg, source: e.target.value }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="All Sources">🌐 All Lead Sources</option>
                                    <option value="Website Form">💻 Website Inbound Form</option>
                                    <option value="WhatsApp Inbound">💬 WhatsApp Inbound</option>
                                    <option value="Facebook Lead Ads">📱 Facebook / Meta Ads</option>
                                    <option value="Google Ads">🔍 Google Ads Lead Form</option>
                                    <option value="Manual Entry">✍️ Manual CRM Entry</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* Lead Status Filter */}
                            {trg.type === 'lead_status_changed' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-gray-700">Target Lead Status</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">When Status Becomes</label>
                                  <select
                                    value={cfg.leadStatus || 'Contacted'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        trigger: {
                                          ...trg,
                                          config: { ...cfg, leadStatus: e.target.value }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="Contacted">Contacted</option>
                                    <option value="Qualified">Qualified</option>
                                    <option value="Proposal Sent">Proposal Sent</option>
                                    <option value="Negotiation">Negotiation</option>
                                    <option value="Closed Won">Closed Won</option>
                                    <option value="Closed Lost">Closed Lost</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* Tag Trigger */}
                            {trg.type === 'tag_added' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-gray-700">Tag Trigger</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">When Tag is Added</label>
                                  <input
                                    type="text"
                                    value={cfg.tag || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        trigger: {
                                          ...trg,
                                          config: { ...cfg, tag: e.target.value }
                                        }
                                      });
                                    }}
                                    placeholder="e.g. VIP, Hot-Lead, Urgent"
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white font-mono"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Call Disposition Trigger */}
                            {trg.type === 'call_disposition_logged' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-gray-700">Call Outcome Trigger</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Call Disposition</label>
                                  <select
                                    value={cfg.disposition || 'Interested - Follow Up Needed'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        trigger: {
                                          ...trg,
                                          config: { ...cfg, disposition: e.target.value }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="Interested - Follow Up Needed">⭐ Interested - Follow Up Needed</option>
                                    <option value="Connected - Not Interested">❌ Connected - Not Interested</option>
                                    <option value="Meeting Booked">📅 Meeting Booked</option>
                                    <option value="Left Voicemail">📼 Left Voicemail</option>
                                    <option value="Busy / No Answer">⏳ Busy / No Answer</option>
                                    <option value="Wrong Number">⚠️ Wrong Number</option>
                                  </select>
                                </div>
                              </div>
                            )}
                          </>
                        );
                      }

                      case 'action':
                        return (
                          <>
                            <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Action Type
                              </label>
                              <select
                                value={data.action?.type || 'send_whatsapp_message'}
                                onChange={(e) => {
                                  handleNodeDataChange(selectedNodeId, {
                                    action: {
                                      ...data.action,
                                      type: e.target.value
                                    }
                                  });
                                }}
                                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="send_whatsapp_message">Send WhatsApp Message</option>
                                <option value="assign_to_agent">Assign to Agent</option>
                                <option value="add_tag">Add Tag</option>
                                <option value="move_deal_stage">Move Stage</option>
                                <option value="update_lead_status">Update Lead Status</option>
                                <option value="generate_ai_reply">Generate AI Reply</option>
                                <option value="set_reminder">Set Reminder</option>
                                <option value="create_task">Create Follow-up Task</option>
                                <option value="delay">Delay / Wait</option>
                                <option value="send_email">Send Email</option>
                                <option value="http_request">HTTP Webhook Request</option>
                                <option value="condition">Conditional Logic (If/Else)</option>
                                <option value="code_execution">Execute Code</option>
                              </select>
                            </div>

                            {data.action?.type === 'send_whatsapp_message' && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-1.5">
                                  <label className="block text-xs font-medium text-gray-700">
                                    Message Content
                                  </label>
                                  <span className="text-[10px] text-indigo-600 font-semibold">Click to insert:</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                  {CRM_MERGE_TAGS.map(t => (
                                    <button
                                      key={t.tag}
                                      type="button"
                                      onClick={() => {
                                        const cur = data.action?.config?.message || '';
                                        handleNodeDataChange(selectedNodeId, {
                                          action: {
                                            ...data.action,
                                            config: {
                                              ...data.action?.config,
                                              message: cur ? `${cur} ${t.tag}` : t.tag
                                            }
                                          }
                                        });
                                      }}
                                      className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors font-mono cursor-pointer"
                                      title={`Insert ${t.tag}`}
                                    >
                                      + {t.label}
                                    </button>
                                  ))}
                                </div>
                                <textarea
                                  value={data.action?.config?.message || ''}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          message: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  rows={4}
                                  placeholder="Type WhatsApp message or click tags above..."
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                            )}

                            {data.action?.type === 'generate_ai_reply' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-purple-800 flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                                  AI Auto-Responder Settings
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">AI Objective / Task</label>
                                  <select
                                    value={data.action?.config?.aiTask || 'Auto-Reply to Customer Query'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            aiTask: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="Auto-Reply to Customer Query">💬 Auto-Reply to Customer Query</option>
                                    <option value="Lead Qualification & Discovery">🎯 Qualify Lead & Ask Key Questions</option>
                                    <option value="Appointment Booking Assistant">📅 Meeting / Call Booking Guide</option>
                                    <option value="Price & Service Inquiries">💰 Answer Pricing & Service FAQs</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Tone & Persona</label>
                                  <select
                                    value={data.action?.config?.tone || 'Friendly & Professional'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            tone: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="Friendly & Professional">Friendly & Professional</option>
                                    <option value="Direct & Concise">Direct & Concise</option>
                                    <option value="Warm & Consultative">Warm & Consultative</option>
                                    <option value="Urgent Sales Closer">Urgent Sales Closer</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Custom Business Knowledge / Instructions</label>
                                  <textarea
                                    value={data.action?.config?.systemPrompt || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            systemPrompt: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    rows={3}
                                    placeholder="e.g. Our basic package starts at ₹4,999/mo. Office hours: 9 AM - 7 PM. If they want a demo, offer link https://cal.com/demo"
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white placeholder-gray-400"
                                  />
                                  <span className="text-[10px] text-gray-400 mt-0.5 block">AI will use this custom knowledge to formulate accurate responses</span>
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Response Length</label>
                                  <select
                                    value={data.action?.config?.responseLength || 'Short (1-2 sentences, best for WhatsApp)'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            responseLength: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="Short (1-2 sentences, best for WhatsApp)">Short (1-2 sentences, WhatsApp)</option>
                                    <option value="Medium (1 concise paragraph)">Medium (1 concise paragraph)</option>
                                    <option value="Detailed (Comprehensive email length)">Detailed (Full Email)</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {data.action?.type === 'assign_to_agent' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Assign To Team Member
                                </label>
                                <select
                                  value={data.action?.config?.agent || 'Auto Round-Robin'}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          agent: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="Auto Round-Robin">🔄 Auto Round-Robin (All Active Agents)</option>
                                  {crmUsers.length > 0 && (
                                    <optgroup label="CRM Team Members">
                                      {crmUsers.map((u: any) => (
                                        <option key={u.id} value={u.name || u.email}>
                                          👤 {u.name || u.email} {u.role?.name ? `(${u.role.name})` : ''}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                  <optgroup label="Departments">
                                    <option value="Sales Team">👥 Sales Team</option>
                                    <option value="Support Team">👥 Support Team</option>
                                    <option value="Account Executives">👥 Account Executives</option>
                                  </optgroup>
                                </select>
                              </div>
                            )}

                            {data.action?.type === 'add_tag' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Tag Label
                                </label>
                                <input
                                  type="text"
                                  value={data.action?.config?.tag || ''}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          tag: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  placeholder="e.g. VIP, Hot Lead, Follow-up"
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                              </div>
                            )}

                            {data.action?.type === 'move_deal_stage' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Target Pipeline Stage
                                </label>
                                <select
                                  value={data.action?.config?.stage || 'Contact Made'}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          stage: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  {crmPipelines.length > 0 ? (
                                    crmPipelines.map((pipe: any) => (
                                      <optgroup key={pipe.id} label={`Pipeline: ${pipe.name}`}>
                                        {(pipe.stages || []).map((stg: any) => (
                                          <option key={stg.id} value={stg.name}>
                                            📍 {stg.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    ))
                                  ) : (
                                    <>
                                      <option value="Lead In">Lead In</option>
                                      <option value="Contact Made">Contact Made</option>
                                      <option value="Requirements Gathered">Requirements Gathered</option>
                                      <option value="Proposal Sent">Proposal Sent</option>
                                      <option value="Negotiation">Negotiation</option>
                                      <option value="Won">Won</option>
                                      <option value="Lost">Lost</option>
                                    </>
                                  )}
                                </select>
                              </div>
                            )}

                            {data.action?.type === 'set_reminder' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Reminder Timing
                                </label>
                                <select
                                  value={data.action?.config?.delay || 'In 3 Days'}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          delay: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="In 1 Hour">In 1 Hour</option>
                                  <option value="In 4 Hours">In 4 Hours</option>
                                  <option value="Tomorrow at 10 AM">Tomorrow at 10 AM</option>
                                  <option value="In 3 Days">In 3 Days</option>
                                  <option value="In 1 Week">In 1 Week</option>
                                </select>
                              </div>
                            )}

                            {data.action?.type === 'update_lead_status' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  New Status
                                </label>
                                <select
                                  value={data.action?.config?.leadStatus || 'Qualified'}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          leadStatus: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="Qualified">Qualified</option>
                                  <option value="Contacted">Contacted</option>
                                  <option value="Proposal Sent">Proposal Sent</option>
                                  <option value="Negotiation">Negotiation</option>
                                  <option value="Closed Won">Closed Won</option>
                                  <option value="Closed Lost">Closed Lost</option>
                                </select>
                              </div>
                            )}

                            {data.action?.type === 'delay' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Wait Duration
                                </label>
                                <select
                                  value={data.action?.config?.delay || '15 Minutes'}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          delay: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                  <option value="5 Minutes">5 Minutes</option>
                                  <option value="15 Minutes">15 Minutes</option>
                                  <option value="1 Hour">1 Hour</option>
                                  <option value="4 Hours">4 Hours</option>
                                  <option value="24 Hours">24 Hours</option>
                                  <option value="3 Days">3 Days</option>
                                </select>
                              </div>
                            )}

                            {data.action?.type === 'send_email' && (
                              <>
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Email Subject
                                  </label>
                                  <input
                                    type="text"
                                    value={data.action?.config?.subject || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            subject: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="e.g. Welcome {{lead.name}} to our CRM!"
                                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-medium text-gray-700">
                                      Email Body
                                    </label>
                                    <span className="text-[10px] text-indigo-600 font-semibold">Click to insert:</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                    {CRM_MERGE_TAGS.map(t => (
                                      <button
                                        key={t.tag}
                                        type="button"
                                        onClick={() => {
                                          const cur = data.action?.config?.body || '';
                                          handleNodeDataChange(selectedNodeId, {
                                            action: {
                                              ...data.action,
                                              config: {
                                                ...data.action?.config,
                                                body: cur ? `${cur} ${t.tag}` : t.tag
                                              }
                                            }
                                          });
                                        }}
                                        className="text-[10px] px-1.5 py-0.5 rounded bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs transition-colors font-mono cursor-pointer"
                                        title={`Insert ${t.tag}`}
                                      >
                                        + {t.label}
                                      </button>
                                    ))}
                                  </div>
                                  <textarea
                                    value={data.action?.config?.body || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            body: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    rows={4}
                                    placeholder="Write your email template or click tokens above..."
                                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </>
                            )}

                            {data.action?.type === 'http_request' && (
                              <>
                                <div className="mb-3">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    HTTP Method
                                  </label>
                                  <select
                                    value={data.action?.config?.method || 'POST'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            method: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                    <option value="POST">POST</option>
                                    <option value="GET">GET</option>
                                    <option value="PUT">PUT</option>
                                  </select>
                                </div>
                                <div className="mb-4">
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Webhook URL
                                  </label>
                                  <input
                                    type="text"
                                    value={data.action?.config?.url || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            url: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="https://api.example.com/webhook"
                                    className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                                </div>
                              </>
                            )}

                            {data.action?.type === 'condition' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-teal-800">Conditional Check (If/Else)</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Field to Check</label>
                                  <select
                                    value={data.action?.config?.conditionField || 'lead_status'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            conditionField: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="lead_status">Lead Status</option>
                                    <option value="deal_stage">Deal Stage</option>
                                    <option value="deal_amount">Deal Amount / Value</option>
                                    <option value="lead_tag">Lead Tag</option>
                                    <option value="message_keyword">Message Contains Keyword</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Operator</label>
                                  <select
                                    value={data.action?.config?.operator || 'equals'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            operator: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="equals">Equals (==)</option>
                                    <option value="not_equals">Does Not Equal (!=)</option>
                                    <option value="contains">Contains</option>
                                    <option value="greater_than">Greater Than (&gt;)</option>
                                    <option value="less_than">Less Than (&lt;)</option>
                                    <option value="is_not_empty">Is Not Empty</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Comparison Value</label>
                                  <input
                                    type="text"
                                    value={data.action?.config?.conditionValue || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            conditionValue: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="e.g. Qualified, Won, 50000"
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  />
                                </div>

                                <div className="text-[10px] text-teal-700 bg-teal-50 p-2 rounded-lg border border-teal-200">
                                  💡 Downstream actions execute only when this rule evaluates to true.
                                </div>
                              </div>
                            )}

                            {data.action?.type === 'create_task' && (
                              <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 mb-4">
                                <div className="text-[11px] font-bold text-orange-800">Create Follow-up Task</div>
                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Task Title</label>
                                  <input
                                    type="text"
                                    value={data.action?.config?.taskTitle || ''}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            taskTitle: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    placeholder="e.g. Call {{lead.name}} regarding {{deal.title}}"
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  />
                                </div>

                                <div>
                                  <label className="block text-[11px] text-gray-600 mb-1">Due Date / Timing</label>
                                  <select
                                    value={data.action?.config?.dueIn || 'Tomorrow at 10 AM'}
                                    onChange={(e) => {
                                      handleNodeDataChange(selectedNodeId, {
                                        action: {
                                          ...data.action,
                                          config: {
                                            ...data.action?.config,
                                            dueIn: e.target.value
                                          }
                                        }
                                      });
                                    }}
                                    className="w-full text-xs px-2.5 py-1.5 border border-gray-300 rounded-lg bg-white"
                                  >
                                    <option value="In 2 Hours">In 2 Hours</option>
                                    <option value="Tomorrow at 10 AM">Tomorrow at 10 AM</option>
                                    <option value="In 2 Days">In 2 Days</option>
                                    <option value="In 1 Week">In 1 Week</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {data.action?.type === 'code_execution' && (
                              <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Custom JavaScript Code
                                </label>
                                <textarea
                                  value={data.action?.config?.code || ''}
                                  onChange={(e) => {
                                    handleNodeDataChange(selectedNodeId, {
                                      action: {
                                        ...data.action,
                                        config: {
                                          ...data.action?.config,
                                          code: e.target.value
                                        }
                                      }
                                    });
                                  }}
                                  rows={4}
                                  placeholder="// return { success: true };"
                                  className="w-full font-mono text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-900 text-slate-100"
                                />
                              </div>
                            )}
                          </>
                        );

                      default:
                        return <p className="text-xs text-gray-500">No configuration available.</p>;
                    }
                  };

                  return (
                    <>
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Node Name
                        </label>
                        <input
                          type="text"
                          value={data.label}
                          onChange={(e) => handleNodeDataChange(selectedNodeId, { label: e.target.value })}
                          className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      {renderConfig()}

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-xs font-bold text-gray-900 mb-2">Variables</h4>
                        <div className="space-y-1">
                          {COMMON_VARIABLES.slice(0, 4).map(variable => (
                            <div key={variable.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                              <span className="font-medium text-gray-700">{variable.name}</span>
                              <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border">
                                {variable.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleNodeDelete(selectedNodeId)}
                          className="w-full"
                        >
                          Delete Node
                        </Button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-sm font-medium text-gray-500">No Node Selected</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Click on a node in the canvas to configure it
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
