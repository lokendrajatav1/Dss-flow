import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import {
  RevenueData,
  DealData,
  LeadData,
  OverviewData,
  DateRangeState
} from '../types';
import { ReportsHeader } from '../components/ReportsHeader';
import { ReportsOverviewCards } from '../components/ReportsOverviewCards';
import { RevenueTrajectoryChart } from '../components/RevenueTrajectoryChart';
import { DealsPipelineFunnel } from '../components/DealsPipelineFunnel';
import { LeadSourcesAttribution } from '../components/LeadSourcesAttribution';
import { CallDispositionsMatrix } from '../components/CallDispositionsMatrix';
import { OperationalLedgerTable } from '../components/OperationalLedgerTable';

const STAGE_COLORS = [
  '#2563eb', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#6366f1', // indigo
  '#64748b'  // slate
];

export function ReportsPage() {
  // Date Range state matching DashboardPage
  const [accountDateRange, setAccountDateRange] = useState<DateRangeState>(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    const sStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}/${start.getFullYear()}`;
    const eStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}/${end.getFullYear()}`;
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      display: `${sStr} - ${eStr}`,
      rangeKey: '30d'
    };
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'pipeline' | 'sources' | 'calls'>('overview');
  const [trendMetric, setTrendMetric] = useState<'revenue' | 'leads'>('revenue');
  const [selectedTable, setSelectedTable] = useState<'sources' | 'stages' | 'calls' | 'activities'>('sources');
  const [tableSearch, setTableSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [leadData, setLeadData] = useState<LeadData | null>(null);
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    try {
      const rangeParam = accountDateRange.rangeKey || '30d';
      const [revRes, dealsRes, leadsRes, overviewRes] = await Promise.all([
        api.get(`/reports/revenue?range=${rangeParam}`),
        api.get(`/reports/deals?range=${rangeParam}`),
        api.get(`/reports/leads?range=${rangeParam}`),
        api.get('/reports/overview')
      ]);

      setRevenueData(revRes.data);
      setDealData(dealsRes.data);
      setLeadData(leadsRes.data);
      setOverviewData(overviewRes.data);
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Error fetching report data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Report Sync Failed',
        text: 'Unable to retrieve latest reports data from the server.',
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    } finally {
      setIsLoading(false);
    }
  }, [accountDateRange.rangeKey]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Aggregated metrics
  const totalRevenueAmount = revenueData?.totalRevenue ?? overviewData?.stats?.totalRevenue ?? 0;
  const pendingRevenueAmount = revenueData?.pendingRevenue ?? 0;
  const totalDealsCount = dealData?.totalDeals ?? overviewData?.stats?.totalDeals ?? 0;
  const totalDealValueAmount = dealData?.totalDealValue ?? overviewData?.stats?.totalDealValue ?? 0;
  const avgDealValue = totalDealsCount > 0 ? Math.round(totalDealValueAmount / totalDealsCount) : 0;
  const totalLeadsCount = leadData?.totalLeads ?? overviewData?.stats?.totalLeads ?? 0;
  const qualifiedLeadsCount = leadData?.qualifiedCount ?? 0;
  const conversionRateValue = leadData?.conversionRate ?? (totalLeadsCount > 0 ? Math.round((qualifiedLeadsCount / totalLeadsCount) * 100) : 0);

  // Revenue chart data from overview or revenueData
  const revenueChartData = useMemo(() => {
    if (overviewData?.revenue?.chartData && overviewData.revenue.chartData.length > 0) {
      return overviewData.revenue.chartData;
    }
    if (revenueData?.chartData && revenueData.chartData.length > 0) {
      return revenueData.chartData.map(d => ({
        date: d.date,
        invoiceSales: d.revenue,
        leadSales: 0
      }));
    }
    return [];
  }, [overviewData, revenueData]);

  // Lead trend chart data
  const leadChartData = useMemo(() => {
    return (leadData?.trendData || []).map(d => ({
      date: d.date,
      leads: d.leads
    }));
  }, [leadData]);

  // Call status items
  const callStatusList = useMemo(() => {
    if (overviewData?.leadsCollected && overviewData.leadsCollected.length > 0) {
      return overviewData.leadsCollected;
    }
    const list = leadData?.statusBreakdown || [];
    return list.map((item, idx) => ({
      label: item.status || 'Untouched',
      count: item.count,
      percentage: item.percentage || (totalLeadsCount > 0 ? Math.round((item.count / totalLeadsCount) * 100) : 0),
      color: STAGE_COLORS[idx % STAGE_COLORS.length]
    }));
  }, [overviewData, leadData, totalLeadsCount]);

  // Recent CRM Activities
  const recentActivitiesList = useMemo(() => {
    if (overviewData?.activities && overviewData.activities.length > 0) {
      return overviewData.activities;
    }
    return (overviewData?.recentLeads || []).map((l: any) => ({
      id: l.id,
      type: 'LEAD',
      title: 'Lead Inbound',
      description: `${l.name} (${l.companyName || l.source || 'Direct'})`,
      createdAt: l.createdAt,
      performedBy: { name: 'System / Webhook' }
    }));
  }, [overviewData]);

  // Chart SVG Download
  const handleDownloadSVG = () => {
    const container = document.getElementById('reports-chart-container');
    if (!container) return;
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reports-chart-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Chart PNG Download
  const handleDownloadPNG = () => {
    const container = document.getElementById('reports-chart-container');
    if (!container) return;
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = (svgEl.clientWidth || 800) * 2;
      canvas.height = (svgEl.clientHeight || 300) * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `reports-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Full Executive CSV Report Download
  const handleDownloadFullCSV = () => {
    try {
      const rows: string[][] = [];
      const timestamp = new Date().toISOString().split('T')[0];

      rows.push(['CRM ANALYTICS & EXECUTIVE PERFORMANCE REPORT']);
      rows.push(['Report Period', accountDateRange.display]);
      rows.push(['Generated On', new Date().toLocaleString()]);
      rows.push([]);

      // 1. Account Summary
      rows.push(['1. EXECUTIVE ACCOUNT SUMMARY']);
      rows.push(['Metric', 'Value']);
      rows.push(['Total Sales (Revenue)', `INR ${totalRevenueAmount}`]);
      rows.push(['Pending Invoices Revenue', `INR ${pendingRevenueAmount}`]);
      rows.push(['Total Pipeline Value', `INR ${totalDealValueAmount}`]);
      rows.push(['Active Deals Count', `${totalDealsCount}`]);
      rows.push(['Average Deal Value', `INR ${avgDealValue}`]);
      rows.push(['Total Leads Captured', `${totalLeadsCount}`]);
      rows.push(['Qualified / Won Leads', `${qualifiedLeadsCount}`]);
      rows.push(['Conversion Rate', `${conversionRateValue}%`]);
      rows.push([]);

      // 2. Lead Sources
      rows.push(['2. LEAD SOURCES ATTRIBUTION']);
      rows.push(['Source Name', 'Leads Count', 'Percentage Share']);
      (leadData?.sourceBreakdown || []).forEach(s => {
        rows.push([s.source || 'Direct', `${s.count}`, `${s.percentage || 0}%`]);
      });
      rows.push([]);

      // 3. Pipeline Stages
      rows.push(['3. DEALS PIPELINE STAGES']);
      rows.push(['Stage', 'Deals Count', 'Total Stage Value (INR)', 'Share (%)']);
      (dealData?.stageBreakdown || []).forEach(st => {
        rows.push([st.stage, `${st.count}`, `${st.value}`, `${st.percentage || 0}%`]);
      });
      rows.push([]);

      // 4. Call Dispositions
      rows.push(['4. TELECALLING DISPOSITIONS']);
      rows.push(['Call Status', 'Count', 'Share (%)']);
      callStatusList.forEach(c => {
        rows.push([c.label, `${c.count}`, `${c.percentage}%`]);
      });

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `CRM_Executive_Report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      Swal.fire({
        icon: 'success',
        title: 'Report Downloaded',
        text: `CRM_Executive_Report_${timestamp}.csv generated successfully.`,
        toast: true,
        position: 'top-end',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-4 pb-12 text-gray-800">
      {/* 1. Header with Breadcrumbs, Date Picker, Action Buttons & Category Tabs */}
      <ReportsHeader
        dateRange={accountDateRange}
        onDateRangeChange={setAccountDateRange}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
        onRefresh={fetchReportData}
        onExportCSV={handleDownloadFullCSV}
      />

      {/* 2. Account Overview Metrics Cards (Matching DashboardPage Account Overview) */}
      {(activeTab === 'overview' || activeTab === 'revenue') && (
        <ReportsOverviewCards
          totalRevenue={totalRevenueAmount}
          pendingRevenue={pendingRevenueAmount}
          avgDealValue={avgDealValue}
          totalDeals={totalDealsCount}
          totalDealValue={totalDealValueAmount}
          totalLeads={totalLeadsCount}
          qualifiedLeads={qualifiedLeadsCount}
          conversionRate={conversionRateValue}
          lastRefreshed={lastRefreshed}
        />
      )}

      {/* 3. Revenue & Leads Trajectory Chart with Hamburger Menu (SVG, PNG, CSV) */}
      {(activeTab === 'overview' || activeTab === 'revenue') && (
        <RevenueTrajectoryChart
          revenueChartData={revenueChartData}
          leadChartData={leadChartData}
          trendMetric={trendMetric}
          onTrendMetricChange={setTrendMetric}
          totalRevenue={totalRevenueAmount}
          totalLeads={totalLeadsCount}
          onDownloadSVG={handleDownloadSVG}
          onDownloadPNG={handleDownloadPNG}
          onDownloadCSV={handleDownloadFullCSV}
        />
      )}

      {/* 4. Deals Pipeline Stages & Lead Sources Attribution */}
      {(activeTab === 'overview' || activeTab === 'pipeline' || activeTab === 'sources') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(activeTab === 'overview' || activeTab === 'pipeline') && (
            <DealsPipelineFunnel
              stageBreakdown={dealData?.stageBreakdown || []}
              totalDeals={totalDealsCount}
              totalDealValue={totalDealValueAmount}
              avgDealValue={avgDealValue}
            />
          )}

          {(activeTab === 'overview' || activeTab === 'sources') && (
            <LeadSourcesAttribution
              sourceBreakdown={leadData?.sourceBreakdown || []}
              totalLeads={totalLeadsCount}
            />
          )}
        </div>
      )}

      {/* 5. Call Dispositions & Telephony Outcomes Matrix */}
      {(activeTab === 'overview' || activeTab === 'calls') && (
        <CallDispositionsMatrix callStatusList={callStatusList} />
      )}

      {/* 6. Detailed Operational Ledger Table with Search & Section CSV Export */}
      <OperationalLedgerTable
        selectedTable={selectedTable}
        onSelectTable={setSelectedTable}
        tableSearch={tableSearch}
        onSearchChange={setTableSearch}
        sourceBreakdown={leadData?.sourceBreakdown || []}
        stageBreakdown={dealData?.stageBreakdown || []}
        callStatusList={callStatusList}
        recentActivities={recentActivitiesList}
        totalLeads={totalLeadsCount}
        totalDeals={totalDealsCount}
        lastRefreshed={lastRefreshed}
      />
    </div>
  );
}
