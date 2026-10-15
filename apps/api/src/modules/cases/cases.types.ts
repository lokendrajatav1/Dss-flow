export type CasePriority = 'Urgent' | 'High' | 'Medium' | 'Low';
export type CaseStatus = 'New' | 'Open' | 'In Progress' | 'Pending Customer' | 'Escalated' | 'Closed';
export type CaseCategory = 'Technical Support' | 'Billing & Invoicing' | 'Integration & API' | 'Feature Request' | 'Bug Report' | 'Account & Access';

export interface CaseComment {
  id: string;
  author: string;
  role: 'Customer' | 'Agent' | 'System';
  content: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface SupportCase {
  id: string;
  companyId: string;
  caseNumber: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  category: CaseCategory;
  priority: CasePriority;
  status: CaseStatus;
  assignedTo: string;
  description: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
  comments: CaseComment[];
}
