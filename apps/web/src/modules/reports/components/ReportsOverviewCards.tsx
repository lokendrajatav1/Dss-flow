import React from 'react';
import { ArrowUp } from 'lucide-react';
import { FaChartLine, FaTag, FaBriefcase, FaUsers } from 'react-icons/fa6';

interface ReportsOverviewCardsProps {
  totalRevenue: number;
  pendingRevenue: number;
  avgDealValue: number;
  totalDeals: number;
  totalDealValue: number;
  totalLeads: number;
  qualifiedLeads: number;
  conversionRate: number;
  lastRefreshed: Date;
}

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

const TotalLeadIcon = () => (
  <div className="relative inline-flex items-center justify-center shrink-0">
    <FaUsers className="w-8 h-8 text-[#2563eb]" />
  </div>
);

export function ReportsOverviewCards({
  totalRevenue,
  pendingRevenue,
  avgDealValue,
  totalDeals,
  totalDealValue,
  totalLeads,
  qualifiedLeads,
  conversionRate,
  lastRefreshed
}: ReportsOverviewCardsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-900">Account Overview</h2>
        <span className="text-xs text-gray-500 font-medium">
          Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <SalesTrendIcon />
            <div className="text-right">
              <p className="text-xs text-gray-700 font-bold">Total Sales</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                ₹{Number(totalRevenue).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center text-emerald-600 font-semibold gap-1">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>0%</span>
              <span className="text-gray-600 font-medium ml-1">From last period</span>
            </div>
            {pendingRevenue > 0 && (
              <span className="text-amber-700 font-bold text-[11px]">
                Pending: ₹{pendingRevenue.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Avg. Sale Value */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <PriceTagIcon />
            <div className="text-right">
              <p className="text-xs text-gray-700 font-bold">Avg. Sale Value</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">
                ₹{Number(avgDealValue).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-semibold gap-1">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>0%</span>
            <span className="text-gray-600 font-medium ml-1">From last period</span>
          </div>
        </div>

        {/* Card 3: Total Deals */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <TotalDealsBoardIcon />
            <div className="text-right">
              <p className="text-xs text-gray-700 font-bold">Total Deals</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{totalDeals}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center text-emerald-600 font-semibold gap-1">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>0%</span>
              <span className="text-gray-600 font-medium ml-1">From last period</span>
            </div>
            <span className="text-blue-700 font-bold text-[11px]">
              ₹{totalDealValue.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Card 4: Total Leads & Conversion */}
        <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <TotalLeadIcon />
            <div className="text-right">
              <p className="text-xs text-gray-700 font-bold">Total Leads</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{totalLeads}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-600">{conversionRate}% Conversion</span>
            <span className="text-gray-600 font-medium">{qualifiedLeads} Qualified</span>
          </div>
        </div>
      </div>
    </div>
  );
}
