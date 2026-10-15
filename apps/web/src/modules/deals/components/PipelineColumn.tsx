import { ReactNode } from 'react';

interface PipelineColumnProps {
  id: string;
  title: string;
  count: number;
  totalValue: number;
  color?: string;
  probability?: number;
  children: ReactNode;
  onDrop: (stageId: string, dealId: string) => void;
}

export function PipelineColumn({ id, title, count, totalValue, color = '#4F46E5', probability = 0, children, onDrop }: PipelineColumnProps) {
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const forecastedValue = (totalValue * probability) / 100;

  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-gray-50/80 rounded-xl border border-gray-200 max-h-full overflow-hidden shadow-sm" style={{ borderTop: `4px solid ${color}` }}>
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200/60 sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          </div>
          <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
            {count}
          </span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total</span>
            <span className="text-xs font-bold text-gray-900">{formatINR(totalValue)}</span>
          </div>
          {probability > 0 && (
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Forecast ({probability}%)</span>
              <span className="text-xs font-bold" style={{ color }}>{formatINR(forecastedValue)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Column Content (Cards) */}
      <div 
        className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }}
        onDrop={(e) => {
          e.preventDefault();
          const dealId = e.dataTransfer.getData('dealId');
          if (dealId) {
            onDrop(id, dealId);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
