import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Loader2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Deal } from '../types';
import { AddDealModal } from '../components/AddDealModal';
import { EditDealModal } from '../components/EditDealModal';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export function DealsListPage() {
  const [search, setSearch] = useState('');
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/deals');
      setDeals(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = () => {
    fetchDeals();
  };

  const handleEditDeal = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsEditModalOpen(true);
  };

  const handleDealUpdated = () => {
    fetchDeals();
    setIsEditModalOpen(false);
  };

  const filteredDeals = deals.filter(deal => 
    deal.title.toLowerCase().includes(search.toLowerCase()) ||
    (deal.customer?.name && deal.customer.name.toLowerCase().includes(search.toLowerCase())) ||
    (deal.lead?.name && deal.lead.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500">Manage all your deals in a single list</p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search deals..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Stage</th>
                  <th className="px-6 py-4">Close Date</th>
                  <th className="px-6 py-4">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeals.length > 0 ? (
                  filteredDeals.map((deal) => (
                    <tr 
                      key={deal.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleEditDeal(deal)}
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-indigo-500" />
                          {deal.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {deal.customer?.name || deal.lead?.name || '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        ₹{deal.value?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {deal.stage?.name || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {deal.expectedCloseDate ? format(new Date(deal.expectedCloseDate), 'MMM d, yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={deal.priority === 'High' ? 'destructive' : deal.priority === 'Medium' ? 'default' : 'secondary'}
                        >
                          {deal.priority}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No deals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddDealModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onDealAdded={handleAddDeal}
        />
      )}

      {isEditModalOpen && selectedDeal && (
        <EditDealModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onDealUpdated={handleDealUpdated}
          deal={selectedDeal}
        />
      )}
    </div>
  );
}
