import React from 'react';
import {
  FaGlobe,
  FaBullhorn,
  FaPhone,
  FaShareNodes,
  FaFileCsv,
  FaComments,
  FaBuilding
} from 'react-icons/fa6';
import { BreakdownItem } from '../types';

interface LeadSourcesAttributionProps {
  sourceBreakdown: BreakdownItem[];
  totalLeads: number;
}

export function LeadSourcesAttribution({
  sourceBreakdown,
  totalLeads
}: LeadSourcesAttributionProps) {
  const getSourceIcon = (name?: string) => {
    const s = (name || 'Direct').toLowerCase();
    if (s.includes('indiamart')) return { icon: FaBullhorn, color: 'text-rose-600', label: 'IndiaMart Inbound' };
    if (s.includes('justdial')) return { icon: FaPhone, color: 'text-amber-600', label: 'JustDial Telephony' };
    if (s.includes('facebook') || s.includes('meta')) return { icon: FaShareNodes, color: 'text-blue-600', label: 'Meta / Facebook Ads' };
    if (s.includes('sheet') || s.includes('google')) return { icon: FaFileCsv, color: 'text-emerald-600', label: 'Google Sheets Sync' };
    if (s.includes('whatsapp')) return { icon: FaComments, color: 'text-emerald-600', label: 'WhatsApp Business' };
    if (s.includes('sulekha')) return { icon: FaBuilding, color: 'text-orange-600', label: 'Sulekha Leads' };
    return { icon: FaGlobe, color: 'text-indigo-600', label: name || 'Direct Organic' };
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200/90 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900">
          <FaGlobe className="w-5 h-5 text-[#2563eb]" />
          <h2 className="text-sm font-bold text-gray-900">Lead Sources & Integrations</h2>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
          {totalLeads} Leads Total
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {sourceBreakdown.length === 0 ? (
          <div className="text-center p-6 text-gray-400">
            <FaGlobe className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-500" />
            <p className="text-xs font-semibold text-gray-700">No leads captured yet</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Connect IndiaMart, JustDial, or Meta to track lead sources.
            </p>
          </div>
        ) : (
          sourceBreakdown.map((item, idx) => {
            const sourceName = item.source || 'Direct';
            const { icon: Icon, color: iconColor, label: channelLabel } = getSourceIcon(sourceName);
            const pct =
              item.percentage ??
              (totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                    <span className="font-semibold text-gray-800">{channelLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-gray-900">{item.count} leads</span>
                    <span className="text-gray-500 font-medium">({pct}%)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${item.count > 0 ? Math.max(pct, 5) : 0}%` }}
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
