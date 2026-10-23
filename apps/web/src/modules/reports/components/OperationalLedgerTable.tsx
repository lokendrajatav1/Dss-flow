import React, { useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { BreakdownItem, StageBreakdownItem } from '../types';

interface OperationalLedgerTableProps {
  selectedTable: 'sources' | 'stages' | 'calls' | 'activities';
  onSelectTable: (table: 'sources' | 'stages' | 'calls' | 'activities') => void;
  tableSearch: string;
  onSearchChange: (query: string) => void;
  sourceBreakdown: BreakdownItem[];
  stageBreakdown: StageBreakdownItem[];
  callStatusList: Array<{ label: string; count: number; percentage: number }>;
  recentActivities: any[];
  totalLeads: number;
  totalDeals: number;
  lastRefreshed: Date;
}

export function OperationalLedgerTable({
  selectedTable,
  onSelectTable,
  tableSearch,
  onSearchChange,
  sourceBreakdown,
  stageBreakdown,
  callStatusList,
  recentActivities,
  totalLeads,
  totalDeals,
  lastRefreshed
}: OperationalLedgerTableProps) {
  const filteredRows = useMemo(() => {
    const q = tableSearch.toLowerCase().trim();

    if (selectedTable === 'sources') {
      return sourceBreakdown
        .filter(s => !q || (s.source || 'Direct').toLowerCase().includes(q))
        .map((s, i) => {
          const share = s.percentage ?? (totalLeads > 0 ? Math.round((s.count / totalLeads) * 100) : 0);
          return {
            id: `src-${i}`,
            col1: s.source || 'Direct',
            col2: 'Lead Source',
            col3: `${s.count} leads`,
            col4: `${share}% of total`,
            status: s.count > 0 ? 'Active' : 'No Activity'
          };
        });
    }

    if (selectedTable === 'stages') {
      return stageBreakdown
        .filter(st => !q || st.stage.toLowerCase().includes(q))
        .map((st, i) => {
          const share = st.percentage ?? (totalDeals > 0 ? Math.round((st.count / totalDeals) * 100) : 0);
          return {
            id: `stg-${i}`,
            col1: st.stage,
            col2: 'Pipeline Stage',
            col3: `${st.count} deals`,
            col4: `₹${st.value.toLocaleString('en-IN')}`,
            status: `${share}% share`
          };
        });
    }

    if (selectedTable === 'calls') {
      return callStatusList
        .filter(c => !q || c.label.toLowerCase().includes(q))
        .map((c, i) => ({
          id: `call-${i}`,
          col1: c.label,
          col2: 'Call Disposition',
          col3: `${c.count} leads`,
          col4: `${c.percentage}% share`,
          status: c.count > 0 ? 'Recorded' : 'Untouched'
        }));
    }

    return recentActivities
      .filter(a => !q || (a.title || '').toLowerCase().includes(q) || (a.description || '').toLowerCase().includes(q))
      .map((a, i) => ({
        id: a.id || `act-${i}`,
        col1: a.title || 'Event',
        col2: a.performedBy?.name || 'System',
        col3: a.description || '-',
        col4: a.createdAt
          ? new Date(a.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Recent',
        status: 'Logged'
      }));
  }, [
    selectedTable,
    tableSearch,
    sourceBreakdown,
    stageBreakdown,
    callStatusList,
    recentActivities,
    totalLeads,
    totalDeals
  ]);

  // Export only this selected table view to CSV
  const handleExportSectionCSV = () => {
    try {
      const rows: string[][] = [];
      const timestamp = new Date().toISOString().split('T')[0];

      rows.push([`CRM REPORT - ${selectedTable.toUpperCase()}`]);
      rows.push(['Generated On', new Date().toLocaleString()]);
      rows.push([]);
      rows.push(['Dimension / Name', 'Category', 'Volume / Detail', 'Value / Share', 'Status']);

      filteredRows.forEach(r => {
        rows.push([r.col1, r.col2, r.col3, r.col4, r.status]);
      });

      const csvContent =
        'data:text/csv;charset=utf-8,\uFEFF' +
        rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${selectedTable}_report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-900">
            Detailed Operational Ledger
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            Tabular view of all dimensions with search filtering and direct export
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Table Category Switcher */}
          <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5 text-xs font-semibold">
            {[
              { id: 'sources', label: 'Lead Sources' },
              { id: 'stages', label: 'Deals Stages' },
              { id: 'calls', label: 'Call Status' },
              { id: 'activities', label: 'Recent Activity' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => onSelectTable(t.id as any)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  selectedTable === t.id
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tableSearch}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Filter table rows..."
              className="h-8 pl-8 pr-3 w-40 sm:w-48 rounded border border-gray-300 text-xs text-gray-800 placeholder-gray-400 outline-none focus:border-blue-500"
            />
          </div>

          {/* Section CSV Export */}
          <button
            onClick={handleExportSectionCSV}
            title="Download this table view"
            className="flex items-center gap-1 h-8 px-2.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Tabular Grid */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold uppercase text-[11px] tracking-wider">
              <th className="py-2.5 px-3">
                {selectedTable === 'sources'
                  ? 'Lead Source'
                  : selectedTable === 'stages'
                  ? 'Pipeline Stage'
                  : selectedTable === 'calls'
                  ? 'Call Status'
                  : 'Activity Event'}
              </th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">
                {selectedTable === 'activities' ? 'Description' : 'Volume / Count'}
              </th>
              <th className="py-2.5 px-3">
                {selectedTable === 'stages'
                  ? 'Stage Value (INR)'
                  : selectedTable === 'activities'
                  ? 'Logged Time'
                  : 'Share / Detail'}
              </th>
              <th className="py-2.5 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500 font-medium">
                  No matching records found in this category.
                </td>
              </tr>
            ) : (
              filteredRows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{row.col1}</td>
                  <td className="py-2.5 px-3 text-gray-600">{row.col2}</td>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">{row.col3}</td>
                  <td className="py-2.5 px-3 text-gray-700">{row.col4}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
        <span>Showing {filteredRows.length} records in this view</span>
        <span>Last synced: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}
