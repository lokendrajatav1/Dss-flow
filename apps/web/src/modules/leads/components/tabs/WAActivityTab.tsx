import React from 'react';

export function WAActivityTab() {
  return (
    <div className="w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50/50 border-b border-gray-100">
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">TITLE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">DATE</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide">STATUS</th>
            <th className="py-3 px-4 text-[12px] font-bold text-gray-900 uppercase tracking-wide text-right">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4} className="py-12 text-center text-[14px] text-gray-500 font-medium">
              No trigger found in timeline.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
