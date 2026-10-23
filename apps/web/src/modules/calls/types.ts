export interface CallItem {
  id: string;
  leadId?: string;
  name: string; // Contact Name
  companyName: string;
  phone: string;
  email?: string;
  direction: string;
  callStatus: string;
  outcome: string;
  duration: string;
  assignedTo: string;
  notes: string;
  priority: string;
  createdAt: string;
  dateTime?: string;
  nextFollowUp?: string;
  recordingUrl?: string;
  dialedVia?: string;
}

export { CALL_OUTCOMES, CALL_RESULTS, CALL_DIRECTIONS, CALL_TYPES, CALL_PRIORITIES } from '@/lib/constants';

