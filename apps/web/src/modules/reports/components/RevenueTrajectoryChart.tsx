import React, { useState } from 'react';
import { Menu, ArrowUp } from 'lucide-react';
import { FaChartColumn } from 'react-icons/fa6';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface RevenueTrajectoryChartProps {
  revenueChartData: Array<{ date: string; invoiceSales: number; leadSales: number }>;
  leadChartData: Array<{ date: string; leads: number }>;
  trendMetric: 'revenue' | 'leads';
  onTrendMetricChange: (metric: 'revenue' | 'leads') => void;
  totalRevenue: number;
  totalLeads: number;
  onDownloadSVG: () => void;
  onDownloadPNG: () => void;
  onDownloadCSV: () => void;
}

export function RevenueTrajectoryChart({
  revenueChartData,
  leadChartData,
  trendMetric,
  onTrendMetricChange,
  totalRevenue,
  totalLeads,
  onDownloadSVG,
  onDownloadPNG,
  onDownloadCSV
}: RevenueTrajectoryChartProps) {
  const [showChartMenu, setShowChartMenu] = useState(false);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900">
          <FaChartColumn className="w-5 h-5 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-gray-900">
            {trendMetric === 'revenue' ? 'Revenue Trajectory' : 'Lead Acquisition Trend'}
          </h2>
        </div>

        {/* Metric Switcher + Period Status */}
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs font-semibold">
            <button
              onClick={() => onTrendMetricChange('revenue')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${trendMetric === 'revenue' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-gray-700'
                }`}
            >
              Revenue Sales
            </button>
            <button
              onClick={() => onTrendMetricChange('leads')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${trendMetric === 'leads' ? 'bg-white text-blue-600 shadow-2xs font-bold' : 'text-gray-700'
                }`}
            >
              Leads Intake
            </button>
          </div>

          <div className="text-xs text-gray-700 font-semibold hidden sm:block">
            Total Target <strong className="text-red-600 font-bold">0</strong> / <strong className="text-gray-900 font-bold">0</strong>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            {trendMetric === 'revenue'
              ? `₹${Number(totalRevenue).toFixed(2)}`
              : `${totalLeads} Leads`}
          </span>
          <span className="flex items-center text-xs font-semibold text-emerald-600 gap-0.5">
            <ArrowUp className="w-3 h-3" /> 0%
          </span>
          <span className="text-xs text-gray-600 font-medium">from last period</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-800 font-semibold">
          {trendMetric === 'revenue' ? (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                Invoice Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" />
                Lead Sales
              </span>
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
              Daily Leads Volume
            </span>
          )}

          {/* Chart Hamburger Menu with SVG, PNG, CSV options */}
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
                    onClick={() => {
                      onDownloadSVG();
                      setShowChartMenu(false);
                    }}
                    className="w-full text-right px-3 py-1.5 hover:bg-gray-100 transition-colors block cursor-pointer"
                  >
                    Download SVG
                  </button>
                  <button
                    onClick={() => {
                      onDownloadPNG();
                      setShowChartMenu(false);
                    }}
                    className="w-full text-right px-3 py-1.5 hover:bg-gray-100 transition-colors block cursor-pointer"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={() => {
                      onDownloadCSV();
                      setShowChartMenu(false);
                    }}
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
      <div id="reports-chart-container" className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {trendMetric === 'revenue' ? (
            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
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
                tickFormatter={(val: number) => `₹${val.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '6px', border: 'none', color: '#FFF', fontSize: '11px' }}
                formatter={(val: any, name: any) => [
                  `₹${Number(val).toFixed(2)}`,
                  name === 'invoiceSales' ? 'Invoice Sales' : 'Lead Sales'
                ]}
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
          ) : (
            <AreaChart data={leadChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
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
                tickFormatter={(val: number) => `${val}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', borderRadius: '6px', border: 'none', color: '#FFF', fontSize: '11px' }}
                formatter={(val: any) => [`${val} Leads`, 'Intake Volume']}
              />
              <Area
                type="monotone"
                dataKey="leads"
                stroke="#2563EB"
                strokeWidth={2}
                fill="#2563EB"
                fillOpacity={0.08}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
