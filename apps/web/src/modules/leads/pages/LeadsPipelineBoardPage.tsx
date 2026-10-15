import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Calendar as CalendarIcon, Phone, Mail } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { format } from 'date-fns';

export function LeadsPipelineBoardPage() {
  const { id } = useParams();
  const [pipeline, setPipeline] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTeamMember, setSelectedTeamMember] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchPipeline = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get(`/pipelines/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPipeline(res.data);
      } catch (error) {
        console.error('Error fetching pipeline', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPipeline();
  }, [id]);

  const fetchLeads = async () => {
    if (!pipeline?.groupId) return;
    try {
      const token = localStorage.getItem('token');
      let url = `/leads?groupId=${pipeline.groupId}`;
      if (selectedTeamMember !== 'all') url += `&assignedToId=${selectedTeamMember}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(res.data);
    } catch (error) {
      console.error('Error fetching leads', error);
    }
  };

  useEffect(() => {
    if (pipeline) {
      fetchLeads();
    }
  }, [pipeline]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading pipeline...</div>;
  }

  const columns = pipeline?.attribute ? pipeline.attribute.split(',') : [];

  const handleFilter = () => {
    fetchLeads();
  };

  const getLeadsForColumn = (col: string) => {
    return leads.filter(lead => 
      lead.status === col || 
      lead.callStatus === col || 
      lead.source === col || 
      lead.priority === col ||
      lead.type === col
    );
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-64px)] flex flex-col bg-[#e2e8f0]">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-3 border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2">
          <Link to="/leads-pipelines" className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Leads Pipeline
          </Link>
          <span className="text-gray-400 mx-1">{'>'}</span>
          <h1 className="text-sm font-bold text-gray-800">{pipeline?.name} <span className="text-gray-400 font-normal">({pipeline?.group?.name || 'No Group'})</span></h1>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={selectedTeamMember}
            onChange={(e) => setSelectedTeamMember(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded text-gray-600 bg-white min-w-[160px] focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Team Members</option>
            {pipeline?.assignedUsers?.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
          
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded text-gray-600 bg-white focus:outline-none focus:border-blue-500"
          />
          
          <input 
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded text-gray-600 bg-white focus:outline-none focus:border-blue-500"
          />

          <button 
            onClick={handleFilter}
            className="flex items-center px-4 h-9 text-sm font-medium text-white bg-[#007bff] rounded hover:bg-blue-700 transition-colors"
          >
            <Filter className="w-4 h-4 mr-1.5 fill-white" /> Filter
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <div className="flex items-start gap-4 h-full min-w-max">
          {columns.length === 0 ? (
            <div className="text-gray-500 w-full text-center mt-10">No attributes selected for this pipeline.</div>
          ) : (
            columns.map((col: string, idx: number) => {
              const colLeads = getLeadsForColumn(col);
              return (
                <div key={idx} className="w-[300px] flex-shrink-0 flex flex-col">
                  <div className={`bg-white rounded-md shadow-sm p-3 mb-2 flex justify-between items-start border-t-4 ${idx % 3 === 0 ? 'border-blue-400' : idx % 3 === 1 ? 'border-green-400' : 'border-purple-400'}`}>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{col}</h3>
                      <p className="text-xs text-gray-500 font-medium">{colLeads.length} Leads</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">₹0</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {colLeads.length === 0 ? (
                      <div className="text-sm text-gray-500 px-1 py-2">
                        No leads
                      </div>
                    ) : (
                      colLeads.map(lead => (
                        <div key={lead.id} className="bg-white p-3 rounded shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                          <Link to={`/clients/${lead.id}`} className="hover:underline text-blue-600">
                            <h4 className="font-medium text-sm mb-1">{lead.name}</h4>
                          </Link>
                          <div className="flex flex-col gap-1 mt-2">
                            {lead.phone && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Phone className="w-3 h-3 mr-1.5 text-gray-400" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center text-xs text-gray-500">
                                <Mail className="w-3 h-3 mr-1.5 text-gray-400" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                          </div>
                          {lead.assignedTo && (
                            <div className="mt-3 flex items-center justify-between">
                              <div className="flex -space-x-1">
                                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white font-bold border border-white" title={lead.assignedTo.name}>
                                  {lead.assignedTo.name.charAt(0)}
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400">{format(new Date(lead.createdAt), 'MMM d')}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
