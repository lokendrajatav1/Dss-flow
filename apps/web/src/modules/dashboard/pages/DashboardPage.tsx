import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Settings,
  Menu,
  ArrowUp,
  FileText,
  Sun,
  Search,
  CalendarCheck
} from 'lucide-react';
import {
  FaChartColumn,
  FaCalendarDays,
  FaUsers,
  FaUserGroup,
  FaClipboardList,
  FaHandshake,
  FaUserClock,
  FaCalendarCheck,
  FaChartLine,
  FaTag,
  FaBriefcase,
  FaClock
} from 'react-icons/fa6';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

// All 23 Call Statuses from standard CRM Select2 options
const ALL_CALL_STATUSES = [
  'Untouched',
  'Busy',
  'Call Back Later',
  'Callback Scheduled',
  'Connected',
  'Customer Query Resolved',
  'Disconnected',
  'Do Not Call Request',
  'Follow-up Required',
  'Information Sent',
  'Interested',
  'Invalid Number',
  'Lead Converted',
  'Left Message',
  'Meeting Scheduled',
  'Not Answered',
  'Not Connected',
  'Not Interested',
  'Other',
  'Proposal Submitted',
  'Voicemail Left',
  'Wrong Contact Person',
  'Wrong Number'
];

// --- Standard Enterprise CRM Icons (FontAwesome 6 + Clean Vector Badges) ---

const TodayLeadsIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaChartColumn className="w-8 h-8 text-[#2563eb]" />
    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[8px] font-bold shadow-2xs">
      ↑
    </span>
  </div>
);

const SevenDayUntouchedIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaCalendarDays className="w-8 h-8 text-[#2563eb]" />
    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-2xs">
      <FaClock className="w-2.5 h-2.5" />
    </span>
  </div>
);

const TotalUntouchedIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaUserGroup className="w-8 h-8 text-[#2563eb]" />
    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white" />
  </div>
);

const TodaysFollowupsIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaClipboardList className="w-8 h-8 text-[#2563eb]" />
    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-2xs">
      <FaClock className="w-2.5 h-2.5" />
    </span>
  </div>
);

const TotalLeadIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaUsers className="w-8 h-8 text-[#2563eb]" />
  </div>
);

const DealsIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaHandshake className="w-8 h-8 text-[#2563eb]" />
  </div>
);

const ClientsIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaUsers className="w-8 h-8 text-orange-500" />
  </div>
);

const FollowupLeadsIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaUserClock className="w-8 h-8 text-[#2563eb]" />
  </div>
);

const MeetingScheduledIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaCalendarCheck className="w-8 h-8 text-[#2563eb]" />
    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px] shadow-2xs">
      <FaClock className="w-2.5 h-2.5" />
    </span>
  </div>
);

const SalesTrendIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaChartLine className="w-8 h-8 text-[#2563eb]" />
  </div>
);

const PriceTagIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaTag className="w-8 h-8 text-[#2563eb]" />
  </div>
);

const TotalDealsBoardIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaBriefcase className="w-8 h-8 text-[#2563eb]" />
  </div>
);


export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [accountDateRange, setAccountDateRange] = useState(() => {
    const end = new Date();
    const start = new Date(end.getFullYear(), end.getMonth(), 1);
    const sStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}/${start.getFullYear()}`;
    const eStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}/${end.getFullYear()}`;
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      display: `${sStr} - ${eStr}`
    };
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState(accountDateRange.startDate);
  const [customEnd, setCustomEnd] = useState(accountDateRange.endDate);

  const handleApplyDateRange = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    const sStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}/${start.getFullYear()}`;
    const eStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}/${end.getFullYear()}`;
    setAccountDateRange({
      startDate: customStart,
      endDate: customEnd,
      display: `${sStr} - ${eStr}`
    });
    setShowDatePicker(false);
  };

  const [showChartMenu, setShowChartMenu] = useState(false);

  // Filter Settings State for Leads Collected
  const [showFilterSettings, setShowFilterSettings] = useState(false);
  const [selectedCallStatuses, setSelectedCallStatuses] = useState<string[]>([
    'Untouched',
    'Follow-up Required',
    'Not Answered'
  ]);
  const [tempSelectedStatuses, setTempSelectedStatuses] = useState<string[]>([
    'Untouched',
    'Follow-up Required',
    'Not Answered'
  ]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [tempTimeframe, setTempTimeframe] = useState<'Weekly' | 'Monthly' | 'Yearly'>('Weekly');
  const [statusSearch, setStatusSearch] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const handleOpenFilterSettings = () => {
    setTempSelectedStatuses([...selectedCallStatuses]);
    setTempTimeframe(selectedTimeframe);
    setStatusSearch('');
    setShowStatusDropdown(false);
    setShowFilterSettings(true);
  };

  const handleApplyFilterSettings = () => {
    setSelectedCallStatuses([...tempSelectedStatuses]);
    setSelectedTimeframe(tempTimeframe);
    setShowFilterSettings(false);
  };

  const handleRemoveStatus = (status: string) => {
    setTempSelectedStatuses(prev => prev.filter(s => s !== status));
  };

  const handleAddStatus = (status: string) => {
    if (tempSelectedStatuses.length >= 6) return;
    if (!tempSelectedStatuses.includes(status)) {
      setTempSelectedStatuses(prev => [...prev, status]);
    }
    setStatusSearch('');
    setShowStatusDropdown(false);
  };

  const handleDownloadCSV = () => {
    const chartData = revenue.chartData || [];
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'Date,Invoice Sales (INR),Lead Sales (INR)\n';
    chartData.forEach((row: any) => {
      csvContent += `"${row.date}",${row.invoiceSales || 0},${row.leadSales || 0}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `revenue-sales-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowChartMenu(false);
  };

  const handleDownloadSVG = () => {
    const container = document.getElementById('revenue-chart-container');
    if (!container) return;
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `revenue-chart-${new Date().toISOString().split('T')[0]}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowChartMenu(false);
  };

  const handleDownloadPNG = () => {
    const container = document.getElementById('revenue-chart-container');
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
        link.download = `revenue-chart-${new Date().toISOString().split('T')[0]}.png`;
        link.href = pngUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setShowChartMenu(false);
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await api.get('/reports/overview');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const kpis = dashboardData?.kpis || {
    todayLeads: 0,
    sevenDayUntouched: 0,
    totalUntouched: 0,
    todayFollowups: 0,
    totalLead: 0,
    deals: 0,
    clients: 0,
    followupLeads: 0,
    meetingScheduled: 0
  };

  const accountOverview = dashboardData?.accountOverview || {
    totalSales: 0,
    avgSaleValue: 0,
    totalDeals: 0
  };

  const revenue = dashboardData?.revenue || {
    amount: 0,
    target: { current: 0, total: 0 },
    chartData: []
  };

  const groups = dashboardData?.groups || [];
  const reminders = dashboardData?.reminders || [];
  const leadsCollected = dashboardData?.leadsCollected || [];

  const filteredReminders = reminders.filter((rem: any) => {
    if (!rem.nextFollowUp) return false;
    const remDate = new Date(rem.nextFollowUp).toISOString().split('T')[0];
    return remDate === selectedDate;
  });

  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-[1440px] mx-auto space-y-4 pb-12 text-gray-800">
      {/* 1. TOP GREETING BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-500 shadow-2xs shrink-0">
              <Sun className="w-4.5 h-4.5 fill-amber-400 text-amber-500" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Lokendra'}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 font-medium pl-3 border-l border-gray-200">
            <span className="flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span><strong className="text-gray-900 font-bold">{kpis.todayLeads}</strong> new leads.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span><strong className="text-gray-900 font-bold">{reminders.length}</strong> reminders.</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span><strong className="text-gray-900 font-bold">{dashboardData?.activities?.length || 0}</strong> action taken.</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (8 of 12 columns / ~67% width) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 3x3 Operational Metric Counters Card (Spacious 9 Items Grid) */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs relative overflow-hidden">
            <div className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </div>

            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {/* Item 1: Today Leads */}
              <div
                onClick={() => navigate('/leads')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <TodayLeadsIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Today Leads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.todayLeads}</p>
                </div>
              </div>

              {/* Item 2: 7-Day Untouched */}
              <div
                onClick={() => navigate('/leads')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <SevenDayUntouchedIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">7-Day Untouched</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.sevenDayUntouched}</p>
                </div>
              </div>

              {/* Item 3: Total Untouched */}
              <div
                onClick={() => navigate('/leads')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <TotalUntouchedIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Total Untouched</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalUntouched}</p>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {/* Item 4: Today's Follow-ups */}
              <div
                onClick={() => navigate('/tasks')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <TodaysFollowupsIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Today's Follow-ups</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.todayFollowups}</p>
                </div>
              </div>

              {/* Item 5: Total Lead */}
              <div
                onClick={() => navigate('/leads')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <TotalLeadIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Total Lead</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.totalLead}</p>
                </div>
              </div>

              {/* Item 6: Deals */}
              <div
                onClick={() => navigate('/deals')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <DealsIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Deals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.deals}</p>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
              {/* Item 7: Clients */}
              <div
                onClick={() => navigate('/contacts')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <ClientsIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Clients</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.clients}</p>
                </div>
              </div>

              {/* Item 8: Follow-up Leads */}
              <div
                onClick={() => navigate('/leads')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <FollowupLeadsIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Follow-up Leads</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.followupLeads}</p>
                </div>
              </div>

              {/* Item 9: Meeting Scheduled */}
              <div
                onClick={() => navigate('/meetings')}
                className="p-5 flex items-center gap-4 hover:bg-gray-50/50 transition-colors cursor-pointer"
              >
                <MeetingScheduledIcon />
                <div>
                  <p className="text-[13px] text-gray-800 font-semibold leading-tight">Meeting Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{kpis.meetingScheduled}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Group Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 text-gray-800">
              <FaUsers className="w-5 h-5 text-[#2563eb]" />
              <h2 className="text-base font-bold text-gray-900">Group</h2>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {groups.length === 0 ? (
                <div className="flex items-center gap-3.5 p-3.5 px-5 bg-white rounded-xl border border-gray-200 shadow-2xs min-w-[160px]">
                  <div className="w-12 h-12 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-xs shrink-0">
                    <FaUsers className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 leading-tight">fdghf</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">{kpis.totalLead || 1}</p>
                  </div>
                </div>
              ) : (
                groups.map((grp: any) => (
                  <div
                    key={grp.id}
                    onClick={() => navigate('/leads')}
                    className="flex items-center gap-3.5 p-3.5 px-5 bg-white hover:bg-gray-50/80 rounded-xl border border-gray-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer min-w-[160px]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-xs shrink-0">
                      <FaUsers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">{grp.name}</p>
                      <p className="text-sm font-bold text-gray-800 mt-1">{grp.count}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Account Overview Section (Spacious Cards) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-900">Account Overview</h2>
              <div className="relative">
                <div
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="flex items-stretch bg-white border border-gray-300 rounded-md shadow-2xs text-xs text-gray-700 overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <div className="px-3 py-1.5 flex items-center font-normal text-gray-700 tracking-wide select-none">
                    {accountDateRange.display}
                  </div>
                  <div className="border-l border-gray-300 flex items-center justify-center px-2.5 text-gray-600 hover:bg-gray-50 transition-colors">
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-600" />
                  </div>
                </div>

                {showDatePicker && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDatePicker(false)}
                    />
                    <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-72 space-y-3 text-xs">
                      <p className="font-bold text-gray-900 border-b border-gray-100 pb-1.5">Select Date Range</p>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => {
                            const now = new Date();
                            const todayStr = now.toISOString().split('T')[0];
                            setCustomStart(todayStr);
                            setCustomEnd(todayStr);
                          }}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors"
                        >
                          Today
                        </button>
                        <button
                          onClick={() => {
                            const now = new Date();
                            const endStr = now.toISOString().split('T')[0];
                            const start = new Date(now.getTime() - 7 * 86400000);
                            setCustomStart(start.toISOString().split('T')[0]);
                            setCustomEnd(endStr);
                          }}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors"
                        >
                          Last 7 Days
                        </button>
                        <button
                          onClick={() => {
                            const now = new Date();
                            const endStr = now.toISOString().split('T')[0];
                            const start = new Date(now.getTime() - 30 * 86400000);
                            setCustomStart(start.toISOString().split('T')[0]);
                            setCustomEnd(endStr);
                          }}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors"
                        >
                          Last 30 Days
                        </button>
                        <button
                          onClick={() => {
                            const now = new Date();
                            const endStr = now.toISOString().split('T')[0];
                            const start = new Date(now.getFullYear(), now.getMonth(), 1);
                            setCustomStart(start.toISOString().split('T')[0]);
                            setCustomEnd(endStr);
                          }}
                          className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors"
                        >
                          This Month
                        </button>
                      </div>

                      <div className="space-y-2 pt-1 border-t border-gray-100">
                        <div>
                          <label className="text-[11px] font-medium text-gray-500 block mb-1">From Date</label>
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-gray-500 block mb-1">To Date</label>
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="w-full border border-gray-200 rounded px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={() => setShowDatePicker(false)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs font-medium transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleApplyDateRange}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Box 1: Total Sales */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <SalesTrendIcon />
                  <div className="text-right">
                    <p className="text-xs text-gray-700 font-bold">Total Sales</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">₹{Number(accountOverview.totalSales || 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>0%</span>
                  <span className="text-gray-600 font-medium ml-1">From last period</span>
                </div>
              </div>

              {/* Box 2: Avg. Sale Value */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <PriceTagIcon />
                  <div className="text-right">
                    <p className="text-xs text-gray-700 font-bold">Avg. Sale Value</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">₹{Number(accountOverview.avgSaleValue || 0).toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>0%</span>
                  <span className="text-gray-600 font-medium ml-1">From last period</span>
                </div>
              </div>

              {/* Box 3: Total Deals */}
              <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <TotalDealsBoardIcon />
                  <div className="text-right">
                    <p className="text-xs text-gray-700 font-bold">Total Deals</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">{accountOverview.totalDeals || 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold gap-1">
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>0%</span>
                  <span className="text-gray-600 font-medium ml-1">From last period</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900">
                <FaChartColumn className="w-5 h-5 text-[#2563eb]" />
                <h2 className="text-sm font-bold text-gray-900">Revenue</h2>
              </div>
              <div className="text-xs text-gray-700 font-semibold">
                Total Target <strong className="text-red-600 font-bold">0</strong> / <strong className="text-gray-900 font-bold">0</strong>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{Number(revenue.amount || 0).toFixed(2)}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-600 gap-0.5">
                  <ArrowUp className="w-3 h-3" /> 0%
                </span>
                <span className="text-xs text-gray-600 font-medium">from last period</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-800 font-semibold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                  This period
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                  Last period
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowChartMenu(!showChartMenu)}
                    className="p-1 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors cursor-pointer"
                    title="Chart Menu"
                  >
                    <Menu className="w-4 h-4" />
                  </button>

                  {showChartMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowChartMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1.5 w-32 bg-white border border-gray-200 rounded-sm shadow-md z-50 py-1 text-xs text-right text-gray-800">
                        <button
                          onClick={handleDownloadSVG}
                          className="w-full text-right px-3 py-1.5 hover:bg-gray-100 transition-colors block cursor-pointer"
                        >
                          Download SVG
                        </button>
                        <button
                          onClick={handleDownloadPNG}
                          className="w-full text-right px-3 py-1.5 hover:bg-gray-100 transition-colors block cursor-pointer"
                        >
                          Download PNG
                        </button>
                        <button
                          onClick={handleDownloadCSV}
                          className="w-full text-right px-3 py-1.5 hover:bg-gray-100 transition-colors block cursor-pointer"
                        >
                          Download CSV
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div id="revenue-chart-container" className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue.chartData || []} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="date"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    dy={6}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: number) => `₹${val.toFixed(2)}`}
                    domain={[0, 2]}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '6px', border: 'none', color: '#FFF', fontSize: '11px' }}
                    formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, 'Amount']}
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiceSales"
                    stroke="#10B981"
                    strokeWidth={2}
                    fill="#10B981"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="leadSales"
                    stroke="#0284C7"
                    strokeWidth={2}
                    fill="#0284C7"
                    fillOpacity={0.08}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Chart Legend */}
            <div className="flex items-center justify-center gap-8 pt-3 border-t border-gray-100 text-xs font-semibold text-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#10b981]" />
                <span>Invoice Sales (₹)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-xs bg-[#1e3a8a]" />
                <span>Lead Sales (₹)</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 of 12 columns / Sidebar) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reminders Card */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col min-h-[380px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shadow-2xs">
                  {reminders.length}
                </span>
                <h3 className="text-sm font-bold text-gray-900">Reminders</h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-8 border border-gray-200 rounded px-2 text-xs text-gray-700 outline-none bg-white font-medium cursor-pointer"
                />
                <button
                  onClick={() => navigate('/meetings')}
                  title="New Appointment"
                  className="w-8 h-8 bg-[#10b981] hover:bg-[#059669] text-white rounded flex items-center justify-center transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/calendar')}
                  title="Calendar View"
                  className="w-8 h-8 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded flex items-center justify-center transition-colors shadow-2xs"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-2.5 text-sm font-semibold text-gray-800 border-b border-gray-100 bg-gray-50/40">
              {formattedSelectedDate}
            </div>

            <div className="p-5 flex-1 flex flex-col items-center justify-center text-center">
              {filteredReminders.length === 0 ? (
                <div className="py-20 text-gray-600 font-medium text-sm">
                  No Appointments Found.
                </div>
              ) : (
                <div className="w-full space-y-2.5 text-left">
                  {filteredReminders.map((rem: any) => (
                    <div
                      key={rem.id}
                      onClick={() => navigate(`/leads/client/${rem.id}`)}
                      className="p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <p className="text-xs font-bold text-gray-900 truncate">{rem.name}</p>
                      <p className="text-[11px] text-gray-500">{rem.companyName || rem.phone || 'No contact'}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mt-1.5">
                        <span>{rem.callStatus}</span>
                        <span>{new Date(rem.nextFollowUp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leads Collected Card */}
          <div className="bg-white rounded-xl border border-gray-200/90 shadow-2xs overflow-hidden flex flex-col min-h-[340px]">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Leads Collected</h3>
              <button
                onClick={handleOpenFilterSettings}
                title="Filter Settings"
                className="w-8 h-8 bg-[#007bff] hover:bg-[#0069d9] text-white rounded-lg flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Disposition Breakdown List */}
              <div className="space-y-3 pt-1">
                {(() => {
                  const colorPalette = ['#facc15', '#f97316', '#38bdf8', '#10b981', '#8b5cf6', '#ec4899'];
                  const finalLeadsCollected = selectedCallStatuses.map((status, idx) => {
                    const found = (leadsCollected || []).find((item: any) =>
                      item.status?.toLowerCase() === status.toLowerCase() ||
                      (status.toLowerCase() === 'untouched' && item.status?.toLowerCase() === 'untouch')
                    );
                    const count = found ? found.count : 0;
                    const totalLeads = kpis.totalLead || 1;
                    const percentage = Math.round((count / totalLeads) * 100);
                    return {
                      status,
                      count,
                      percentage,
                      color: colorPalette[idx % colorPalette.length]
                    };
                  });

                  return finalLeadsCollected.map((item) => (
                    <div key={item.status} className="space-y-1">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-bold text-gray-800">{item.status}</span>
                        <span className="text-gray-900 font-bold">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: item.color,
                            width: `${item.count > 0 ? Math.min(100, item.percentage) : 0}%`
                          }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Status Legend at Bottom */}
              <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-gray-800">
                {(() => {
                  const colorPalette = ['#facc15', '#f97316', '#38bdf8', '#10b981', '#8b5cf6', '#ec4899'];
                  return selectedCallStatuses.map((status, idx) => {
                    const found = (leadsCollected || []).find((item: any) =>
                      item.status?.toLowerCase() === status.toLowerCase() ||
                      (status.toLowerCase() === 'untouched' && item.status?.toLowerCase() === 'untouch')
                    );
                    const count = found ? found.count : 0;
                    const totalLeads = kpis.totalLead || 1;
                    const percentage = Math.round((count / totalLeads) * 100);
                    const color = colorPalette[idx % colorPalette.length];
                    return (
                      <span key={status} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        {status} {count} ({percentage}%)
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER SETTINGS MODAL */}
      {showFilterSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Filter Settings</h2>
              <button
                onClick={() => setShowFilterSettings(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Select Call Status */}
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
                  Select Call Status:
                </label>

                {/* Multi-Select Tags Input Box */}
                <div className="relative">
                  <div
                    onClick={() => setShowStatusDropdown(true)}
                    className="min-h-[46px] p-2 bg-white border border-gray-300 rounded-md flex flex-wrap items-center gap-2 cursor-pointer focus-within:border-blue-500 transition-all"
                  >
                    {tempSelectedStatuses.map(status => (
                      <span
                        key={status}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-300 rounded text-xs font-medium text-gray-800 shadow-2xs"
                      >
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStatus(status);
                          }}
                          className="text-red-500 hover:text-red-700 font-bold cursor-pointer text-sm leading-none"
                        >
                          &times;
                        </span>
                        <span>{status}</span>
                      </span>
                    ))}

                    {tempSelectedStatuses.length < 6 && (
                      <input
                        type="text"
                        placeholder={tempSelectedStatuses.length === 0 ? "Click to select statuses..." : "Add status..."}
                        value={statusSearch}
                        onChange={(e) => {
                          setStatusSearch(e.target.value);
                          setShowStatusDropdown(true);
                        }}
                        onFocus={() => setShowStatusDropdown(true)}
                        className="flex-1 min-w-[120px] text-xs text-gray-800 outline-none bg-transparent py-0.5"
                      />
                    )}
                  </div>

                  {/* Dropdown with all 23 statuses */}
                  {showStatusDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowStatusDropdown(false)}
                      />
                      <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto z-50 divide-y divide-gray-50 py-1">
                        {ALL_CALL_STATUSES
                          .filter(s =>
                            s.toLowerCase().includes(statusSearch.toLowerCase()) &&
                            !tempSelectedStatuses.includes(s)
                          )
                          .map(status => (
                            <div
                              key={status}
                              onClick={() => handleAddStatus(status)}
                              className="px-3.5 py-2 hover:bg-blue-50 hover:text-blue-700 text-xs font-medium text-gray-700 cursor-pointer transition-colors flex items-center justify-between"
                            >
                              <span>{status}</span>
                              <span className="text-[11px] text-blue-600 font-semibold">+ Add</span>
                            </div>
                          ))}
                        {ALL_CALL_STATUSES.filter(s =>
                          s.toLowerCase().includes(statusSearch.toLowerCase()) &&
                          !tempSelectedStatuses.includes(s)
                        ).length === 0 && (
                          <div className="px-3.5 py-3 text-xs text-gray-400 text-center">
                            No matching or remaining statuses.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <p className="text-[11px] text-gray-500">You can select up to 6 statuses.</p>
              </div>

              {/* Select Time Frame */}
              <div className="space-y-2 pt-1">
                <label className="text-xs sm:text-sm font-semibold text-gray-700 block">
                  Select Time Frame:
                </label>

                <div className="flex items-center gap-2.5">
                  {(['Weekly', 'Monthly', 'Yearly'] as const).map(tf => {
                    const isSelected = tempTimeframe === tf;
                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTempTimeframe(tf)}
                        className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[#7c3aed] text-[#7c3aed] bg-white shadow-2xs'
                            : 'border border-gray-300 text-gray-700 hover:border-gray-400 bg-white'
                        }`}
                      >
                        {tf}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handleApplyFilterSettings}
                className="px-7 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
