export type DealStage = 'Lead In' | 'Contact Made' | 'Requirements Gathered' | 'Proposal Sent' | 'Negotiation';
export type DealPriority = 'Low' | 'Medium' | 'High';

export interface Deal {
  id: string;
  title: string;
  leadId?: string;
  lead?: any;
  customerId?: string;
  customer?: any;
  clientName?: string;
  companyName?: string;
  value: number; // in INR
  stageId: string;
  stage?: { id: string; name: string };
  priority: string;
  assignedTo?: any;
  assignedToId?: string;
  expectedCloseDate?: string;
  startDate?: string;
  notes?: string;
  tags?: string[];
  createdAt?: string;
}
