export interface RevenueData {
  totalRevenue: number;
  pendingRevenue: number;
  totalInvoices: number;
  chartData: Array<{ date: string; revenue: number }>;
}

export interface StageBreakdownItem {
  stage: string;
  count: number;
  value: number;
  color?: string;
  percentage?: number;
}

export interface DealData {
  totalDeals: number;
  totalDealValue: number;
  stageBreakdown: StageBreakdownItem[];
}

export interface BreakdownItem {
  status?: string;
  source?: string;
  count: number;
  percentage?: number;
}

export interface LeadData {
  totalLeads: number;
  qualifiedCount: number;
  conversionRate: number;
  statusBreakdown: BreakdownItem[];
  sourceBreakdown: BreakdownItem[];
  trendData: Array<{ date: string; leads: number }>;
}

export interface OverviewData {
  stats: {
    totalLeads: number;
    totalDeals: number;
    totalCustomers: number;
    totalInvoices: number;
    totalPayments: number;
    totalRevenue: number;
    totalDealValue: number;
    todayLeads?: number;
    sevenDayUntouched?: number;
    totalUntouched?: number;
    todayFollowups?: number;
    followupLeads?: number;
    meetingScheduled?: number;
  };
  accountOverview?: {
    totalSales: number;
    avgSaleValue: number;
    totalDeals: number;
  };
  revenue?: {
    amount: number;
    chartData: Array<{ date: string; invoiceSales: number; leadSales: number }>;
  };
  leadsCollected?: Array<{ label: string; count: number; percentage: number; color: string }>;
  recentLeads?: any[];
  recentDeals?: any[];
  activities?: any[];
}

export interface DateRangeState {
  startDate: string;
  endDate: string;
  display: string;
  rangeKey: '7d' | '30d' | '90d' | '1y' | 'all';
}
