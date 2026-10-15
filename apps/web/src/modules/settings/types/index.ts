export type IntegrationStatus = 'connected' | 'disconnected' | 'coming_soon';

export interface Integration {
  id: string;
  name: string;
  description: string;
  status: IntegrationStatus;
  icon: string;
  category: 'Communication' | 'Payment' | 'Productivity';
}

export interface WhatsAppConfig {
  phoneNumberId: string;
  accessToken: string;
  businessAccountId: string;
}

export interface WorkspaceSettings {
  companyName: string;
  domain: string;
  timezone: string;
  currency: string;
  gstNumber: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Manager' | 'Agent';
  status: 'Active' | 'Invited';
  lastActive: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Failed';
  planName: string;
}
