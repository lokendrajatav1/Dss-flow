import React, { useState } from 'react';
import { Calendar as CalendarIcon, RotateCw, Download } from 'lucide-react';
import { FaChartColumn } from 'react-icons/fa6';
import { DateRangeState } from '../types';

interface ReportsHeaderProps {
  dateRange: DateRangeState;
  onDateRangeChange: (newRange: DateRangeState) => void;
  activeTab: 'overview' | 'revenue' | 'pipeline' | 'sources' | 'calls';
  onTabChange: (tab: 'overview' | 'revenue' | 'pipeline' | 'sources' | 'calls') => void;
  isLoading: boolean;
  onRefresh: () => void;
  onExportCSV: () => void;
}

export function ReportsHeader({
  dateRange,
  onDateRangeChange,
  activeTab,
  onTabChange,
  isLoading,
  onRefresh,
  onExportCSV
}: ReportsHeaderProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customStart, setCustomStart] = useState(dateRange.startDate);
  const [customEnd, setCustomEnd] = useState(dateRange.endDate);

  const handleApplyPreset = (preset: 'today' | '7d' | '30d' | 'month' | 'all') => {
    const end = new Date();
    const start = new Date();
    let rangeKey: DateRangeState['rangeKey'] = '30d';

    if (preset === 'today') {
      rangeKey = '7d';
    } else if (preset === '7d') {
      start.setDate(end.getDate() - 7);
      rangeKey = '7d';
    } else if (preset === '30d') {
      start.setDate(end.getDate() - 30);
      rangeKey = '30d';
    } else if (preset === 'month') {
      start.setDate(1);
      rangeKey = '30d';
    } else {
      rangeKey = 'all';
    }

    const sStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}/${start.getFullYear()}`;
    const eStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}/${end.getFullYear()}`;

    onDateRangeChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      display: preset === 'all' ? 'All Historical Time' : `${sStr} - ${eStr}`,
      rangeKey
    });
    setShowDatePicker(false);
  };

  const handleApplyCustom = () => {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    const sStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}/${start.getFullYear()}`;
    const eStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}/${end.getFullYear()}`;

    onDateRangeChange({
      startDate: customStart,
      endDate: customEnd,
      display: `${sStr} - ${eStr}`,
      rangeKey: '30d'
    });
    setShowDatePicker(false);
  };

  return (
    <div className="space-y-3">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
            <FaChartColumn className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-xs text-gray-600 font-medium">
              Sales performance, deal stages, channel attribution, and calling outcomes
            </p>
          </div>
        </div>

        {/* Action Controls: Split-border Date Picker + Refresh + Export */}
        <div className="flex items-center gap-2">
          {/* Split-border Date Picker Matching DashboardPage */}
          <div className="relative">
            <div
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-stretch bg-white border border-gray-300 rounded-md shadow-2xs text-xs text-gray-700 overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
            >
              <div className="px-3 py-1.5 flex items-center font-normal text-gray-700 tracking-wide select-none">
                {dateRange.display}
              </div>
              <div className="border-l border-gray-300 flex items-center justify-center px-2.5 text-gray-600 hover:bg-gray-50 transition-colors">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-600" />
              </div>
            </div>

            {/* Date Range Modal */}
            {showDatePicker && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDatePicker(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-72 space-y-3 text-xs">
                  <p className="font-bold text-gray-900 border-b border-gray-100 pb-1.5">
                    Select Date Range
                  </p>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => handleApplyPreset('today')}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors cursor-pointer"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleApplyPreset('7d')}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors cursor-pointer"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => handleApplyPreset('30d')}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors cursor-pointer"
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => handleApplyPreset('month')}
                      className="px-2.5 py-1.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded text-gray-700 font-medium text-left transition-colors cursor-pointer"
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
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApplyCustom}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Refresh Action */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh Data"
            className="flex items-center justify-center w-8 h-8 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={onExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Standard CRM Report Navigation Tabs (Zoho CRM / Salesforce style) */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 text-xs font-semibold overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'All Reports (Overview)' },
          { id: 'revenue', label: 'Revenue & Sales Trajectory' },
          { id: 'pipeline', label: 'Deals & Pipeline Funnel' },
          { id: 'sources', label: 'Channel Attribution' },
          { id: 'calls', label: 'Call Dispositions' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab.id
                ? 'bg-[#2563eb] text-white font-bold shadow-2xs'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
