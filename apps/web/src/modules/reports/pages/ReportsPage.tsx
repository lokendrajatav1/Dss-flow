import { TrendingUp, Users, IndianRupee, Activity, BarChart3, PieChart, Download, Plus, AlertCircle, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

const STATS = [
  { label: 'Total Revenue', value: '₹124,500', change: '+14%', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Active Deals', value: '42', change: '+5%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { label: 'New Contacts', value: '1,204', change: '+22%', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { label: 'Conversion Rate', value: '8.4%', change: '-2%', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-100' },
];

const PIPELINE_STAGES = [
  { name: 'New', value: 12, color: '#3B82F6', percentage: 28 },
  { name: 'Contacted', value: 8, color: '#10B981', percentage: 19 },
  { name: 'Qualified', value: 15, color: '#F59E0B', percentage: 35 },
  { name: 'Proposal', value: 5, color: '#8B5CF6', percentage: 12 },
  { name: 'Negotiation', value: 2, color: '#EC4899', percentage: 5 },
];

const RECENT_ACTIVITY = [
  { id: 1, type: 'lead', message: 'New lead qualified from WhatsApp', time: '2 minutes ago', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 2, type: 'deal', message: 'Deal moved to Negotiation stage', time: '15 minutes ago', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 3, type: 'alert', message: '3 leads past due date', time: '1 hour ago', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  { id: 4, type: 'task', message: 'Follow-up call scheduled', time: '2 hours ago', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
];

export function ReportsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [dealData, setDealData] = useState<any>(null);
  const [leadData, setLeadData] = useState<any>(null);

  useEffect(() => {
    fetchReportData();
  }, [timeRange]);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch revenue data
      const revenueRes = await api.get(`/reports/revenue?range=${timeRange}`);
      setRevenueData(revenueRes.data);
      
      // Fetch deal data
      const dealsRes = await api.get(`/reports/deals?range=${timeRange}`);
      setDealData(dealsRes.data);
      
      // Fetch lead data
      const leadsRes = await api.get(`/reports/leads?range=${timeRange}`);
      setLeadData(leadsRes.data);
      
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-emerald-600';
    if (change.startsWith('-')) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: string) => {
    if (change.startsWith('+')) return TrendingUp;
    if (change.startsWith('-')) return TrendingDown;
    return Activity;
  };

  const renderRevenueChart = () => {
    const revenueList = Array.isArray(revenueData)
      ? revenueData
      : [
          { period: 'Total Revenue', amount: revenueData?.totalRevenue ?? 0, change: '+14%' },
          { period: 'Pending Invoices', amount: revenueData?.pendingRevenue ?? 0, change: '-2%' },
          { period: 'Total Invoices', amount: revenueData?.totalInvoices ?? 0, change: '+5%' },
        ];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {revenueList.map((item: any, idx: number) => {
            const Icon = getChangeIcon(item.change || '');
            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">{item.period}</div>
                <div className="text-xl font-bold text-gray-900">₹{(item.amount || 0).toLocaleString()}</div>
                <div className={`text-sm mt-1 flex items-center ${getChangeColor(item.change || '')}`}>
                  <Icon className="w-3 h-3 mr-1" />
                  {item.change}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderPipelineChart = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Distribution</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: stage.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-500">{stage.value} deals</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        backgroundColor: stage.color,
                        width: `${stage.percentage}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <PieChart className="w-32 h-32 text-gray-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">42</div>
                  <div className="text-xs text-gray-500">Total Deals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLeadSources = () => {
    const sources = [
      { name: 'WhatsApp', value: 45, color: '#25D366' },
      { name: 'Website', value: 30, color: '#3B82F6' },
      { name: 'Phone', value: 15, color: '#10B981' },
      { name: 'Referral', value: 10, color: '#F59E0B' },
    ];
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Lead Sources</h3>
        
        <div className="space-y-3">
          {sources.map((source, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm font-medium text-gray-700">{source.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">{source.value}%</div>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      backgroundColor: source.color,
                      width: `${source.value}%`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchReportData()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button 
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Total Revenue',
            value: revenueData?.totalRevenue != null ? `₹${revenueData.totalRevenue.toLocaleString()}` : STATS[0].value,
            change: STATS[0].change,
            icon: STATS[0].icon,
            color: STATS[0].color,
            bg: STATS[0].bg,
          },
          {
            label: 'Active Deals',
            value: dealData?.totalDeals != null ? `${dealData.totalDeals}` : STATS[1].value,
            change: STATS[1].change,
            icon: STATS[1].icon,
            color: STATS[1].color,
            bg: STATS[1].bg,
          },
          {
            label: 'New Contacts',
            value: leadData?.totalLeads != null ? `${leadData.totalLeads}` : STATS[2].value,
            change: STATS[2].change,
            icon: STATS[2].icon,
            color: STATS[2].color,
            bg: STATS[2].bg,
          },
          {
            label: 'Conversion Rate',
            value: STATS[3].value,
            change: STATS[3].change,
            icon: STATS[3].icon,
            color: STATS[3].color,
            bg: STATS[3].bg,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          const ChangeIcon = getChangeIcon(stat.change);
          return (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <ChangeIcon className={`w-4 h-4 mr-1 ${getChangeColor(stat.change)}`} />
                <span className={`text-sm font-medium ${getChangeColor(stat.change)}`}>{stat.change}</span>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {isLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading report data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {renderRevenueChart()}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {renderPipelineChart()}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {renderLeadSources()}
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${activity.bg}`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
          <select 
            value={selectedMetric} 
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="revenue">Revenue</option>
            <option value="deals">Deals</option>
            <option value="leads">Leads</option>
          </select>
        </div>
        
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">Detailed {selectedMetric} analytics chart</h3>
            <p className="text-sm text-gray-400">Advanced visualization and filtering will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
}
