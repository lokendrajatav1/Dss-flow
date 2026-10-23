import React from 'react';
import { FaBriefcase } from 'react-icons/fa6';
import { StageBreakdownItem } from '../types';

interface DealsPipelineFunnelProps {
  stageBreakdown: StageBreakdownItem[];
  totalDeals: number;
  totalDealValue: number;
  avgDealValue: number;
}

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

export function DealsPipelineFunnel({
  stageBreakdown,
  totalDeals,
  totalDealValue,
  avgDealValue
}: DealsPipelineFunnelProps) {
  // Won deals calculation
  const wonStage = stageBreakdown.find(
    s => s.stage.toLowerCase().includes('won') || s.stage.toLowerCase().includes('closed')
  );
  const wonCount = wonStage?.count || 0;
  const wonValue = wonStage?.value || 0;
  const winRate = totalDeals > 0 ? Math.round((wonCount / totalDeals) * 100) : 0;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900">
          <FaBriefcase className="w-5 h-5 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-gray-900">Deals Pipeline Stages</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            {winRate}% Win Rate
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
            {totalDeals} Deals
          </span>
        </div>
      </div>

      {/* Pipeline Summary Mini Strip */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-gray-50/70 border border-gray-100 text-xs">
        <div>
          <span className="text-gray-500 font-medium">Pipeline Value</span>
          <p className="font-bold text-gray-900 text-sm">₹{totalDealValue.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <span className="text-gray-500 font-medium">Won Settlements</span>
          <p className="font-bold text-emerald-700 text-sm">₹{wonValue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {stageBreakdown.length === 0 ? (
          <div className="text-center p-6 text-gray-400">
            <FaBriefcase className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-500" />
            <p className="text-xs font-semibold text-gray-700">No active deals recorded</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Pipeline stages will appear here as deals are updated.
            </p>
          </div>
        ) : (
          stageBreakdown.map((item, idx) => {
            const color = item.color || STAGE_COLORS[idx % STAGE_COLORS.length];
            const pct =
              item.percentage ??
              (totalDeals > 0 ? Math.round((item.count / totalDeals) * 100) : 0);

            return (
              <div key={item.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="font-semibold text-gray-800">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-gray-600">{item.count} deals</span>
                    <span className="font-bold text-gray-900">₹{item.value.toLocaleString('en-IN')}</span>
                    <span className="text-gray-500 w-8 text-right font-medium">{pct}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: color,
                      width: `${item.count > 0 ? Math.max(pct, 5) : 0}%`
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
