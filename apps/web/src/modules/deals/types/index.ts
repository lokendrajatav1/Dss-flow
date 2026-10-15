export type DealStage = 'Lead In' | 'Contact Made' | 'Requirements Gathered' | 'Proposal Sent' | 'Negotiation';
export type DealPriority = 'Low' | 'Medium' | 'High';

export interface Deal {
  id: string;
  title: string;
  leadId?: string;
  clientName?: string;
  companyName: string;
  value: number; // in INR
  stageId: string;
  priority: string;
  assignedTo: string;
  assignedToId?: string;
  expectedCloseDate?: string;
  notes?: string;
  tags: string[];
}
