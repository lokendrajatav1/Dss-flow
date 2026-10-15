export type SolutionCategory = 
  | 'General & Getting Started'
  | 'WhatsApp Automation'
  | 'Email & IMAP Sync'
  | 'Leads & Pipelines'
  | 'Invoicing & Payments'
  | 'Integrations & Webhooks'
  | 'Account & Permissions';

export type SolutionStatus = 'Published' | 'Draft' | 'Under Review';

export interface SolutionArticle {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  category: SolutionCategory;
  status: SolutionStatus;
  summary: string;
  problem: string;
  stepsToResolve: string[];
  tips?: string[];
  tags: string[];
  author: string;
  views: number;
  helpfulCount: number;
  unhelpfulCount: number;
  updatedAt: string;
}
