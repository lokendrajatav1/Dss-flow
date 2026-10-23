import { useState, useEffect } from 'react';
import { ArrowLeft, Filter, Calendar as CalendarIcon, GripVertical, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/lib/api';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import { DealDetailModal } from '../components/DealDetailModal';
import { AddDealModal } from '../components/AddDealModal';
import { EditDealModal } from '../components/EditDealModal';

export function DealsPipelineBoardPage() {
  const { id } = useParams();
  const [pipeline, setPipeline] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedDeal, setDraggedDeal] = useState<any>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals
  const [selectedDeal, setSelectedDeal] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<any | null>(null);

  // Filters
  const [selectedTeamMember, setSelectedTeamMember] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

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

  const fetchDeals = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = `/deals/pipelines/${id}/stages?`;
      if (selectedTeamMember !== 'all') url += `&assignedToId=${selectedTeamMember}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;

      const res = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (Array.isArray(res.data)) {
        const allDeals = res.data.flatMap((stage: any) => stage.deals || []);
        setDeals(allDeals);
      } else {
        setDeals([]);
      }
    } catch (error) {
      console.error('Error fetching deals', error);
    }
  };

  useEffect(() => {
    if (pipeline) {
      fetchDeals();
    }
  }, [pipeline, selectedTeamMember, startDate, endDate, searchTerm]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading pipeline...</div>;
  }

  const columns = pipeline?.attribute ? pipeline.attribute.split(',') : [];

  const handleFilter = () => {
    fetchDeals();
  };

  const getDealsForColumn = (col: string) => {
    return deals.filter(deal => 
      deal.stage?.name === col
    );
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, deal: any) => {
    setDraggedDeal(deal);
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, column: string) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedDeal) return;
    
    const sourceColumn = draggedDeal.stage?.name;
    if (sourceColumn === targetColumn) return;
    
    const targetStage = pipeline?.stages?.find((stage: any) => stage.name === targetColumn);
    if (!targetStage) return;
    
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/deals/${draggedDeal.id}/stage`, {
        stageId: targetStage.id,
        value: draggedDeal.value,
        title: draggedDeal.title
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setDeals(prevDeals => prevDeals.map(deal => {
        if (deal.id === draggedDeal.id) {
          return { ...deal, stage: targetStage, stageId: targetStage.id };
        }
        return deal;
      }));
      
      Swal.fire({
        icon: 'success',
        title: 'Deal Updated',
        text: `Moved to ${targetColumn}`,
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error('Error updating deal stage:', error);
      Swal.fire('Error', error.response?.data?.message || 'Failed to update deal stage', 'error');
    } finally {
      setIsUpdating(false);
      setDraggedDeal(null);
    }
  };

  const getColumnColor = (index: number) => {
    const colors = [
      'border-blue-400 bg-blue-50/50',
      'border-green-400 bg-green-50/50', 
      'border-purple-400 bg-purple-50/50',
      'border-orange-400 bg-orange-50/50',
      'border-red-400 bg-red-50/50',
      'border-yellow-400 bg-yellow-50/50'
    ];
    return colors[index % colors.length];
  };

  const getStageByName = (name: string) => {
    return pipeline?.stages?.find((stage: any) => stage.name === name);
  };

  return (
    <div className="-m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-64px)] flex flex-col bg-[#e2e8f0]">
      {/* Header (matches LeadsPipelineBoardPage exact design) */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3 border-b border-gray-200 shadow-sm flex-shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <Link to="/deals-pipelines" className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Deals Pipeline
          </Link>
          <span className="text-gray-400 mx-1">{'>'}</span>
          <h1 className="text-sm font-bold text-gray-800">
            {pipeline?.name} <span className="text-gray-400 font-normal">({pipeline?.group?.name || 'No Group'})</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/deals"
            className="flex items-center px-3 h-9 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            List View
          </Link>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-3 h-9 text-sm font-medium text-white bg-[#007bff] rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Deal
          </button>

          <select 
            value={selectedTeamMember}
            onChange={(e) => setSelectedTeamMember(e.target.value)}
            className="h-9 px-3 text-sm border border-gray-200 rounded text-gray-600 bg-white min-w-[150px] focus:outline-none focus:border-blue-500"
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
            className="flex items-center px-4 h-9 text-sm font-medium text-white bg-[#007bff] rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Filter className="w-4 h-4 mr-1.5 fill-white" /> Filter
          </button>
        </div>
      </div>

      {/* Board Columns */}
      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <div className="flex items-start gap-4 h-full min-w-max">
          {columns.length === 0 ? (
            <div className="text-gray-500 w-full text-center mt-10">No attributes selected for this pipeline.</div>
          ) : (
            columns.map((col: string, idx: number) => {
              const colDeals = getDealsForColumn(col);
              const totalValue = colDeals.reduce((sum, d) => sum + (d.value || 0), 0);
              const isDragOver = dragOverColumn === col;
              
              return (
                <div key={idx} className="w-[300px] flex-shrink-0 flex flex-col">
                  <div className={`bg-white rounded-md shadow-sm p-3 mb-2 flex justify-between items-start border-t-4 transition-all duration-200 ${getColumnColor(idx)} ${isDragOver ? 'ring-2 ring-blue-400 scale-105' : ''}`}>
                    <div>
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{col}</h3>
                      <p className="text-xs text-gray-500 font-medium">{colDeals.length} Deals</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-700">₹{totalValue.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div 
                    className={`flex-1 overflow-y-auto space-y-2 min-h-[150px] p-2 rounded-lg transition-all duration-200 ${isDragOver ? 'bg-blue-100/50 border-2 border-dashed border-blue-400' : 'bg-transparent'}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      handleDragOver(e, col);
                    }}
                    onDrop={(e) => {
                      handleDrop(e, col);
                    }}
                    onDragLeave={() => setDragOverColumn(null)}
                  >
                    {colDeals.length === 0 ? (
                      <div className="text-sm text-gray-500 px-1 py-4 text-center">
                        <div className="text-gray-400 mb-1 text-xs">No deals</div>
                        <div className="text-[11px] text-gray-400">Drop deals here to move them</div>
                      </div>
                    ) : (
                      colDeals.map(deal => (
                        <div
                          key={deal.id}
                          className={`bg-white p-3 rounded shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-102 ${draggedDeal?.id === deal.id ? 'opacity-50 scale-95' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, deal)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setSelectedDeal(deal);
                            setIsDetailModalOpen(true);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-gray-900 text-sm mb-1 flex-1 pr-2">{deal.title}</h4>
                            <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0 cursor-grab" />
                          </div>
                          <div className="text-xs text-gray-600 mb-2 font-medium">₹{Number(deal.value || 0).toLocaleString('en-IN')}</div>
                          
                          {/* Client / Lead name */}
                          {(deal.lead?.name || deal.customer?.name) && (
                            <div className="text-xs text-gray-500 mb-2 truncate">
                              {deal.customer?.name || deal.lead?.name}
                              {deal.lead?.companyName && ` (${deal.lead.companyName})`}
                            </div>
                          )}

                          {deal.assignedTo && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex -space-x-1">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold border border-white" title={deal.assignedTo.name}>
                                  {deal.assignedTo.name.charAt(0)}
                                </div>
                              </div>
                              <span className="text-[10px] text-gray-400">{deal.createdAt ? format(new Date(deal.createdAt), 'MMM d') : ''}</span>
                            </div>
                          )}

                          <div className="mt-2 flex items-center justify-between pt-2 border-t border-gray-50">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${deal.priority === 'High' ? 'bg-red-100 text-red-700' : deal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                              {deal.priority || 'Medium'}
                            </span>
                            {deal.expectedCloseDate && (
                              <span className="text-[10px] text-gray-400 flex items-center">
                                <CalendarIcon className="w-3 h-3 mr-1" /> {format(new Date(deal.expectedCloseDate), 'MMM d')}
                              </span>
                            )}
                          </div>
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

      {/* Modals */}
      <DealDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDeal(null);
        }}
        deal={selectedDeal}
        pipelineStages={pipeline?.stages || []}
        onDealUpdated={() => {
          fetchDeals();
        }}
        onEditRequested={(deal) => {
          setEditingDeal(deal);
          setIsEditModalOpen(true);
        }}
      />

      {isAddModalOpen && (
        <AddDealModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          stages={pipeline?.stages || []}
          onDealAdded={() => {
            fetchDeals();
            setIsAddModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && editingDeal && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDeal(null);
          }}
          stages={pipeline?.stages || []}
          deal={editingDeal}
          onDealUpdated={() => {
            fetchDeals();
            setIsEditModalOpen(false);
          }}
        />
      )}

      {/* Status Bar */}
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          Updating deal stage...
        </div>
      )}
    </div>
  );
}
