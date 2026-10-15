export type TriggerType =
  | 'whatsapp_message_received'
  | 'deal_stage_changed'
  | 'new_lead_added'
  | 'lead_status_changed'
  | 'tag_added'
  | 'call_disposition_logged'
  | 'webhook_received'
  | 'schedule_triggered'
  | 'email_received'
  | 'form_submitted';

export type ActionType =
  | 'send_whatsapp_message'
  | 'assign_to_agent'
  | 'add_tag'
  | 'move_deal_stage'
  | 'update_lead_status'
  | 'generate_ai_reply'
  | 'set_reminder'
  | 'http_request'
  | 'delay'
  | 'condition'
  | 'code_execution'
  | 'update_custom_field'
  | 'send_email'
  | 'create_task'
  | 'add_to_list';

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'starts_with'
  | 'ends_with'
  | 'is_empty'
  | 'is_not_empty';

export type VariableType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'object'
  | 'array';

export interface WorkflowVariable {
  id: string;
  name: string;
  type: VariableType;
  value: any;
  description?: string;
  source?: 'trigger' | 'action' | 'manual';
}

export interface WorkflowTrigger {
  id: string;
  type: TriggerType;
  config?: Record<string, any>;
  conditions?: WorkflowCondition[];
}

export interface WorkflowAction {
  id: string;
  type: ActionType;
  config?: Record<string, any>;
  conditions?: WorkflowCondition[];
  onError?: 'stop' | 'continue' | 'retry';
  retryCount?: number;
  retryDelay?: number;
}

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: ConditionOperator;
  value: any;
  type: 'trigger' | 'action';
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  createdAt: string;
  lastRunAt?: string;
  runsCount: number;
  variables?: WorkflowVariable[];
  version: string;
  tags?: string[];
  category?: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  timestamp: string;
  status: 'success' | 'failed' | 'partial' | 'running';
  triggerData: Record<string, any>;
  actionLogs: WorkflowActionLog[];
  error?: string;
  duration: number;
}

export interface WorkflowActionLog {
  id: string;
  actionId: string;
  actionType: ActionType;
  status: 'pending' | 'running' | 'success' | 'failed';
  timestamp: string;
  duration: number;
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  error?: string;
  retryCount?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  trigger: WorkflowTrigger;
  actions: WorkflowAction[];
  tags: string[];
  icon: string;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
}

export interface WorkflowStatistics {
  totalWorkflows: number;
  activeWorkflows: number;
  totalExecutions: number;
  successRate: number;
  avgExecutionTime: number;
  topTriggers: Record<string, number>;
  topActions: Record<string, number>;
  monthlyTrend: { month: string; executions: number }[];
}
