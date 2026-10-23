export interface TaskItem {
  id: string;
  title: string;
  clientName: string;
  companyName: string;
  dueDate: string;
  dueTime: string;
  dueDateTime?: string;
  status: string;
  priority: string;
  assignedTo: string;
  description: string;
  phone?: string;
  leadId?: string;
  createdAt: string;
  nextFollowUp?: string;
}

export { TASK_STATUSES, TASK_PRIORITIES } from '@/lib/constants';
