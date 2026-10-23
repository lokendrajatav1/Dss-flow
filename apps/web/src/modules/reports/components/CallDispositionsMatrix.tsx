import React from 'react';
import { FaPhone } from 'react-icons/fa6';

interface CallStatusItem {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

interface CallDispositionsMatrixProps {
  callStatusList: CallStatusItem[];
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

export function CallDispositionsMatrix({ callStatusList }: CallDispositionsMatrixProps) {
  const totalCalls = callStatusList.reduce((acc, c) => acc + c.count, 0);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900">
          <FaPhone className="w-5 h-5 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-gray-900">Call Dispositions & Outcomes</h2>
        </div>
        <span className="text-xs font-semibold text-gray-700">
          {totalCalls} Logged Calls
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {callStatusList.length === 0 ? (
          <div className="col-span-full text-center p-8 text-gray-500">
            <FaPhone className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
            <p className="text-xs font-semibold text-gray-700">No telecalling outcomes logged</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Call logs from telephony integration will appear here.
            </p>
          </div>
        ) : (
          callStatusList.map((item, idx) => {
            const color = item.color || STAGE_COLORS[idx % STAGE_COLORS.length];
            return (
              <div
                key={idx}
                className="p-3 bg-white rounded-lg border border-gray-200 shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 truncate" title={item.label}>
                    {item.label}
                  </span>
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-xl font-bold text-gray-900">{item.count}</span>
                  <span className="text-xs font-semibold text-gray-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: color,
                      width: `${item.count > 0 ? Math.max(item.percentage, 4) : 0}%`
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
