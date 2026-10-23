export interface Meeting {
  id: string;
  title: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone?: string;
  date: string;
  time: string;
  dateTime?: string;
  duration: string;
  type: string;
  meetingLink?: string;
  host: string;
  status: string;
  priority?: string;
  agenda?: string;
  leadId?: string;
  createdAt: string;
}

export { MEETING_STATUSES, MEETING_PLATFORMS, MEETING_DURATIONS } from '@/lib/constants';
