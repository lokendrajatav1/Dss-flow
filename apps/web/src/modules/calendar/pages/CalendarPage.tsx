import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Phone,
  AlertCircle,
  Check,
  Monitor,
  Search,
  Sparkles,
  Palmtree,
  Clock,
  Mail,
  ChevronLeft,
  ChevronRight,
  Edit3
} from 'lucide-react';
import api from '@/lib/api';
import { startOfWeek, addDays, format, isToday, isWeekend, isSameDay, isBefore, startOfDay, endOfDay } from 'date-fns';
import { RemarksModal } from '../components/RemarksModal';
import { CALL_STATUSES } from '@/lib/constants';

export function CalendarPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remarksLead, setRemarksLead] = useState<any>(null);

  // Filter States
  const defaultStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const defaultEnd = addDays(defaultStart, 6);
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMember, setTeamMember] = useState('All Team Member');
  const [callStatusFilter, setCallStatusFilter] = useState('All Call Status');
  const [fromDate, setFromDate] = useState(format(defaultStart, 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(defaultEnd, 'yyyy-MM-dd'));

  useEffect(() => {
    fetchReminders();
    fetchEvents();
  }, [fromDate, toDate]);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/leads', { headers: { Authorization: `Bearer ${token}` } });
      const leadsWithFollowUp = res.data.filter((l: any) => l.nextFollowUp != null);

      // Sort by time
      leadsWithFollowUp.sort((a: any, b: any) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime());

      setLeads(leadsWithFollowUp);
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params: any = {};
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      const res = await api.get('/calendar/events', { headers: { Authorization: `Bearer ${token}` }, params });
      setEvents(res.data.events || res.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  // Determine Kanban Days
  const start = fromDate ? new Date(fromDate) : defaultStart;
  const end = toDate ? new Date(toDate) : defaultEnd;
  const validStart = !isNaN(start.getTime()) ? start : defaultStart;
  const validEnd = !isNaN(end.getTime()) && end >= validStart ? end : addDays(validStart, 6);

  const diffDays = Math.ceil(Math.abs(validEnd.getTime() - validStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const maxDays = Math.min(diffDays, 31); // Cap at 31 days to prevent rendering massive grids
  const kanbanDays = Array.from({ length: maxDays }).map((_, i) => addDays(validStart, i));

  // Extract unique filter options from the raw data
  const uniqueTeamMembers = Array.from(new Set(leads.map(l => l.assignedTo?.name).filter(Boolean))) as string[];

  // Filter Leads
  const filteredLeads = leads.filter(lead => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matches =
        lead.name?.toLowerCase().includes(q) ||
        lead.companyName?.toLowerCase().includes(q) ||
        lead.phone?.toLowerCase().includes(q) ||
        lead.email?.toLowerCase().includes(q) ||
        lead.notes?.toLowerCase().includes(q);
      if (!matches) return false;
    }

    if (teamMember !== 'All Team Member') {
      if (lead.assignedTo?.name !== teamMember) return false;
    }

    if (callStatusFilter !== 'All Call Status') {
      if (lead.callStatus !== callStatusFilter) return false;
    }

    return true;
  });

  // Merge leads and events into unified kanban items
  const mergedItems: any[] = [
    ...filteredLeads.map((l: any) => ({ ...l, type: 'lead', date: l.nextFollowUp })),
    ...events.map((e: any) => ({ ...e, type: 'event', date: e.startAt })),
  ];

  // Compute stats based on FILTERED leads + events
  const today = new Date();

  const weekTotal = mergedItems.filter((item: any) => {
    const d = new Date(item.date);
    return d >= startOfDay(validStart) && d <= endOfDay(validEnd);
  }).length;

  const todayCount = mergedItems.filter((item: any) => isSameDay(new Date(item.date), today)).length;

  const overdueCount = mergedItems.filter((item: any) =>
    isBefore(new Date(item.date), startOfDay(today)) && item.status !== 'Completed' && item.callStatus !== 'Completed'
  ).length;

  const callbacksCount = mergedItems.filter((item: any) => item.status === 'Callback Scheduled' || item.callStatus === 'Callback Scheduled').length;
  const demosCount = mergedItems.filter((item: any) => item.status === 'Demo Scheduled' || item.callStatus === 'Demo Scheduled').length;
  const eventsCount = events.length;

  const handlePrevWeek = () => {
    if (!fromDate || !toDate) return;
    setFromDate(format(addDays(new Date(fromDate), -7), 'yyyy-MM-dd'));
    setToDate(format(addDays(new Date(toDate), -7), 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    if (!fromDate || !toDate) return;
    setFromDate(format(addDays(new Date(fromDate), 7), 'yyyy-MM-dd'));
    setToDate(format(addDays(new Date(toDate), 7), 'yyyy-MM-dd'));
  };



  const getStatusColorClass = (lead: any) => {
    const d = new Date(lead.nextFollowUp);
    if (isBefore(d, startOfDay(today)) && lead.status !== 'Completed' && lead.callStatus !== 'Completed') return 'bg-red-500';
    if (lead.status === 'Demo Scheduled' || lead.callStatus === 'Demo Scheduled') return 'bg-blue-500';
    if (lead.status === 'Callback Scheduled' || lead.callStatus === 'Callback Scheduled') return 'bg-orange-500';
    if (lead.status === 'Completed' || lead.callStatus === 'Completed') return 'bg-green-500';
    return 'bg-yellow-400'; // Default / Follow-up Required
  };

  const getEventColorClass = (event: any) => {
    const d = new Date(event.startAt);
    if (isBefore(d, startOfDay(today))) return 'bg-red-500';
    return 'bg-purple-500';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Reminder Calendar</h1>
        <p className="text-sm text-gray-500">All upcoming follow-ups, demos and callbacks across your team {diffDays <= 7 ? `· ${diffDays}-day kanban view` : `· Kanban view`}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{weekTotal}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{diffDays === 7 ? 'Week Total' : 'Range Total'}</div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{todayCount}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Today ({format(today, 'd MMM')})</div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{overdueCount}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Overdue</div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{callbacksCount}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Callbacks Scheduled</div>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{demosCount}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Demos Scheduled</div>
          </div>
        </div>

        {/* Card 6 - Calendar Events */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900">{eventsCount}</div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Calendar Events</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={teamMember}
          onChange={(e) => setTeamMember(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
        >
          <option>All Team Member</option>
          {uniqueTeamMembers.map(member => (
            <option key={member} value={member}>{member}</option>
          ))}
        </select>

        <select
          value={callStatusFilter}
          onChange={(e) => setCallStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-[150px]"
        >
          <option>All Call Status</option>
          {CALL_STATUSES.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="text-xs font-bold uppercase tracking-wider">From</span>
          <div className="relative">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider ml-1">To</span>
          <div className="relative">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Status Legend */}
      <div className="bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-center text-xs font-medium text-gray-500">
        <span className="text-gray-900 font-bold">Status:</span>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500"></div> Demo Scheduled</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-orange-500"></div> Callback Scheduled</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-yellow-400"></div> Follow-Up Required</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-green-500"></div> Completed</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-500"></div> Missed / Overdue</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-purple-500"></div> Calendar Event</div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-sm font-medium">Loading calendar...</span>
          </div>
        </div>
      ) : (
      <div className="grid gap-1.5 min-h-[500px] overflow-x-auto pb-2" style={{ gridTemplateColumns: `repeat(${kanbanDays.length}, minmax(130px, 1fr))` }}>
        {kanbanDays.map((day, idx) => {
          const isTodayDate = isToday(day);
          const isWeekendDate = isWeekend(day);
          const dateFormatted = format(day, 'd');
          const monthFormatted = format(day, 'MMM');
          const dayName = format(day, 'EEE').toUpperCase();

          const dayLeads = filteredLeads.filter(l => isSameDay(new Date(l.nextFollowUp), day));
          const dayEvents = events.filter(e => isSameDay(new Date(e.startAt), day));
          const dayCount = dayLeads.length + dayEvents.length;

          return (
            <div
              key={idx}
              className={`flex flex-col bg-white rounded-xl shadow-sm border ${isTodayDate ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}
            >
              {/* Column Header */}
              <div className="px-2.5 py-2 border-b border-gray-100 flex items-start justify-between bg-white z-10">
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${isTodayDate ? 'text-green-600' : 'text-gray-500'}`}>
                    {dayName} {isTodayDate && '· TODAY'}
                  </div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className={`text-xl font-bold ${isTodayDate ? 'text-green-600' : 'text-gray-900'}`}>{dateFormatted}</span>
                    <span className="text-[10px] font-medium text-gray-500">{monthFormatted}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isTodayDate ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {dayCount}
                </div>
              </div>

              {/* Column Body */}
              <div className="flex-1 p-1.5 flex flex-col bg-gray-50/50">
                {(dayLeads.length > 0 || dayEvents.length > 0) ? (
                  <div className="space-y-1.5">
                    {dayLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className={`absolute left-0 top-0 bottom-1 w-1 ${getStatusColorClass(lead)}`} />
                        <div className="p-2.5 pl-3">
                          {/* Top row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded text-[11px] font-bold font-mono">
                              {format(new Date(lead.nextFollowUp), 'h:mm a')}
                            </div>
                          </div>

                          {/* Name */}
                          <Link to={`/clients/${lead.id}`} className="block font-bold text-[#253f86] hover:text-blue-600 hover:underline text-[13px] truncate mb-2" title={lead.name}>{lead.name}</Link>

                          {/* Status badge */}
                          <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[11px] font-bold mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                            {lead.callStatus || lead.status || 'Connected'}
                          </div>

                          {/* Phone */}
                          {(lead.phone || lead.email) && (
                            <div className="group/phone text-gray-600 flex items-center text-xs font-semibold mb-2 cursor-default" title={lead.phone || lead.email}>
                              {lead.phone ? <Phone className="w-3 h-3 mr-1.5 text-gray-400" /> : <Mail className="w-3 h-3 mr-1.5 text-gray-400" />}
                              <span className="truncate">
                                {lead.phone ? (
                                  <>
                                    <span className="inline group-hover/phone:hidden">{lead.phone.length > 7 ? lead.phone.slice(0, 7) + '*'.repeat(Math.max(4, lead.phone.length - 7)) : lead.phone}</span>
                                    <span className="hidden group-hover/phone:inline">{lead.phone}</span>
                                  </>
                                ) : (
                                  lead.email
                                )}
                              </span>
                            </div>
                          )}

                          {/* Divider */}
                          <div className="border-t border-dashed border-gray-200 my-2 -mx-1"></div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold tracking-wider">
                                {lead.assignedTo?.name ? lead.assignedTo.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
                              </div>
                              <span className="text-xs font-semibold text-gray-600">{lead.assignedTo?.name || 'Unassigned'}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); setRemarksLead(lead); }}
                              className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {dayEvents.map((event: any) => (
                      <div
                        key={event.id}
                        className="bg-white rounded-xl border border-purple-200 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <div className={`absolute left-0 top-0 bottom-1 w-1 ${getEventColorClass(event)}`} />
                        <div className="p-2.5 pl-3">
                          {/* Top row */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[11px] font-bold font-mono">
                              {format(new Date(event.startAt), 'h:mm a')}
                            </div>
                          </div>

                          {/* Event Title */}
                          <div className="font-bold text-[#253f86] hover:text-blue-600 hover:underline text-[13px] truncate mb-2" title={event.title}>
                            {event.title}
                          </div>

                          {/* Description */}
                          {event.description && (
                            <p className="text-[11px] text-gray-500 mb-2 truncate">{event.description}</p>
                          )}

                          {/* Status badge */}
                          <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[11px] font-bold mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            {event.status || 'Scheduled'}
                          </div>

                          {/* Location */}
                          {event.location && (
                            <div className="text-xs font-semibold text-gray-600 mb-2" title={event.location}>
                              📍 {event.location}
                            </div>
                          )}

                          {/* Divider */}
                          <div className="border-t border-dashed border-gray-200 my-2 -mx-1"></div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-bold tracking-wider">
                                E
                              </div>
                              <span className="text-xs font-semibold text-gray-600">Calendar</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center py-10">
                    {isWeekendDate ? (
                      <div className="text-center">
                        <Palmtree className="w-8 h-8 text-green-300 mx-auto mb-2 opacity-80" />
                        <p className="text-[11px] text-gray-400 font-medium leading-tight">Weekend<br />no reminders</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 text-amber-200 mx-auto mb-2 opacity-80" />
                        <p className="text-[11px] text-gray-400 font-medium">Nothing scheduled</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      )}

      {/* Footer Navigation */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
        <button
          onClick={handlePrevWeek}
          className="flex items-center gap-1.5 bg-[#253f86] text-white px-5 py-2.5 rounded shadow hover:bg-[#1a2d61] transition-colors text-sm font-bold tracking-wide"
        >
          <ChevronLeft className="w-4 h-4" /> Previous Week
        </button>

        <div className="text-center">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
            Currently Viewing
          </div>
          <div className="text-sm font-bold text-gray-900">
            {format(validStart, 'EEE d MMM')} - {format(validEnd, 'EEE d MMM yyyy')}
          </div>
        </div>

        <button
          onClick={handleNextWeek}
          className="flex items-center gap-1.5 bg-[#253f86] text-white px-5 py-2.5 rounded shadow hover:bg-[#1a2d61] transition-colors text-sm font-bold tracking-wide"
        >
          Next Week <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <RemarksModal
        isOpen={!!remarksLead}
        onClose={() => setRemarksLead(null)}
        lead={remarksLead}
        onSaved={fetchReminders}
      />
    </div>
  );
}
