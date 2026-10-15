export interface Tenant {
  id: number;
  name: string;
  domain: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  seats: number;
  used: number;
  status: 'Active' | 'Past Due' | 'Suspended';
  mrr: string;
  since: string;
}
