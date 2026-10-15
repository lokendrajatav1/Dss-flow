import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Edit, 
  Folder, 
  ChevronLeft, 
  ChevronRight, 
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolutionArticle, SolutionCategory, SolutionStatus } from '../types';
import { SolutionDrawer } from '../components/SolutionDrawer';
import { SolutionModal } from '../components/SolutionModal';
import api from '@/lib/api';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuth } from '@/context/AuthContext';

const MySwal = withReactContent(Swal);

import { SOLUTION_CATEGORIES, SOLUTION_STATUSES } from '@/lib/constants';

const CATEGORIES = SOLUTION_CATEGORIES as unknown as SolutionCategory[];
const STATUSES = SOLUTION_STATUSES as unknown as SolutionStatus[];

export function SolutionsPage() {
  const { user } = useAuth();
  const [solutions, setSolutions] = useState<SolutionArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Drawer & Modal state
  const [readingArticle, setReadingArticle] = useState<SolutionArticle | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'WhatsApp Automation' as SolutionCategory,
    status: 'Published' as SolutionStatus,
    summary: '',
    problem: '',
    stepsText: '',
    tipsText: '',
    tagsText: '',
    author: user?.name || '',
  });

  // Fetch Solutions from API (with fallback)
  const fetchSolutions = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await api.get('/solutions', { params });
      setSolutions(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch solutions from API', err);
      MySwal.fire('Error', err.response?.data?.message || 'Failed to load solutions from server.', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, statusFilter]);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  // Sync reading article if updated
  useEffect(() => {
    if (readingArticle) {
      const found = solutions.find(s => s.id === readingArticle.id);
      if (found) setReadingArticle(found);
    }
  }, [solutions]);

  // Open modal for creating new solution
  const handleOpenCreateModal = () => {
    setEditingArticleId(null);
    setFormData({
      title: '',
      category: (selectedCategory !== 'all' ? selectedCategory : 'WhatsApp Automation') as SolutionCategory,
      status: 'Published',
      summary: '',
      problem: '',
      stepsText: '',
      tipsText: '',
      tagsText: '',
      author: user?.name || '',
    });
    setIsEditorOpen(true);
  };

  // Open modal for editing existing solution
  const handleOpenEditModal = (article: SolutionArticle) => {
    setEditingArticleId(article.id);
    setFormData({
      title: article.title,
      category: article.category,
      status: article.status,
      summary: article.summary,
      problem: article.problem,
      stepsText: article.stepsToResolve.join('\n'),
      tipsText: (article.tips || []).join('\n'),
      tagsText: article.tags.join(', '),
      author: article.author,
    });
    setIsEditorOpen(true);
  };

  // Save (Create or Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      MySwal.fire('Validation Error', 'Article title is required.', 'warning');
      return;
    }

    const stepsArray = formData.stepsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (stepsArray.length === 0) {
      MySwal.fire('Validation Error', 'Please specify at least one resolution step.', 'warning');
      return;
    }

    const tipsArray = formData.tipsText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const tagsArray = formData.tagsText
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const payload = {
      title: formData.title.trim(),
      category: formData.category,
      status: formData.status,
      summary: formData.summary.trim(),
      problem: formData.problem.trim(),
      stepsToResolve: stepsArray,
      tips: tipsArray,
      tags: tagsArray.length > 0 ? tagsArray : ['support'],
      author: formData.author.trim() || 'Support Team',
    };

    try {
      setSubmitting(true);
      if (editingArticleId) {
        await api.put(`/solutions/${editingArticleId}`, payload);
        MySwal.fire('Updated', 'Solution article updated.', 'success');
      } else {
        await api.post('/solutions', payload);
        MySwal.fire('Published', 'New solution article published.', 'success');
      }
      setIsEditorOpen(false);
      fetchSolutions();
    } catch (err: any) {
      MySwal.fire('Error', err.response?.data?.message || 'Failed to save solution.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete article
  const handleDelete = async (id: string, title: string) => {
    const confirm = await MySwal.fire({
      title: 'Delete Solution?',
      text: `Are you sure you want to delete "${title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/solutions/${id}`);
        if (readingArticle?.id === id) setReadingArticle(null);
        fetchSolutions();
        MySwal.fire('Deleted!', 'Solution article removed.', 'success');
      } catch (err: any) {
        MySwal.fire('Error', err.response?.data?.message || 'Failed to delete article.', 'error');
      }
    }
  };

  // Helpful vote
  const handleVoteHelpful = async (id: string) => {
    try {
      const res = await api.post(`/solutions/${id}/helpful`);
      if (readingArticle?.id === id) setReadingArticle(res.data);
      fetchSolutions();
    } catch (err) {
      console.error('Vote failed', err);
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Published': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Under Review': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(solutions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSolutions = solutions.slice(startIndex, startIndex + pageSize);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[15px] font-semibold text-gray-900">
            Available Articles : {solutions.length}
          </h2>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border-l border-gray-200 pl-3">
            <span>Published: <strong className="text-emerald-600">{solutions.filter(s => s.status === 'Published').length}</strong></span>
            <span>•</span>
            <span>Drafts: <strong className="text-gray-600">{solutions.filter(s => s.status === 'Draft').length}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button 
            onClick={handleOpenCreateModal} 
            className="bg-[#10b981] hover:bg-[#059669] text-white h-9 px-3 rounded-md text-sm font-medium"
          >
            + Add Solution
          </Button>

          <Button 
            variant="outline" 
            onClick={fetchSolutions}
            className="border-sky-400 text-sky-600 hover:bg-sky-50 h-9 px-3 rounded-md text-sm font-medium gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Sidebar: Knowledge Categories */}
        <div className="lg:col-span-1 bg-white p-3 rounded-md shadow-sm border border-gray-200 space-y-1">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
            Categories
          </div>
          <button
            onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left font-medium transition-colors ${
              selectedCategory === 'all' 
                ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>All Solutions</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
              {solutions.length}
            </span>
          </button>

          {CATEGORIES.map((cat) => {
            const count = solutions.filter(s => s.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setCurrentPage(1); }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-left transition-colors ${
                  isSelected 
                    ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="truncate pr-1 flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-gray-400" />
                  {cat}
                </span>
                <span className="text-[11px] px-1.5 py-0.2 rounded bg-gray-100 text-gray-500">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Section: Articles Table */}
        <div className="lg:col-span-3 space-y-3">
          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-100 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search solutions by title, problem, keyword or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded px-2.5 py-1.5 bg-gray-50 text-gray-700 focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Solutions Table */}
          <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="p-3">Solution Article</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Helpful</th>
                    <th className="p-3">Updated</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span>Loading solutions from API...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedSolutions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No articles found in this category. Click <strong>+ Add Solution</strong> to create one.
                      </td>
                    </tr>
                  ) : (
                    paginatedSolutions.map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50/75 transition-colors">
                        <td className="p-3 max-w-sm">
                          <div
                            onClick={() => setReadingArticle(art)}
                            className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-1"
                          >
                            {art.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            {art.summary || art.problem}
                          </div>
                        </td>

                        <td className="p-3 whitespace-nowrap text-gray-600">
                          {art.category}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <span className={`text-[11px] border rounded-full px-2 py-0.5 font-medium ${getStatusBadge(art.status)}`}>
                            {art.status}
                          </span>
                        </td>

                        <td className="p-3 whitespace-nowrap text-emerald-700 font-medium">
                          {art.helpfulCount} helpful
                        </td>

                        <td className="p-3 whitespace-nowrap text-xs text-gray-500">
                          {art.updatedAt}
                        </td>

                        <td className="p-3 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setReadingArticle(art)}
                            title="Read Solution"
                            className="p-1 text-gray-500 hover:text-blue-600 rounded hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(art)}
                            title="Edit Article"
                            className="p-1 text-gray-500 hover:text-amber-600 rounded hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(art.id, art.title)}
                            title="Delete Article"
                            className="p-1 text-gray-500 hover:text-red-600 rounded hover:bg-gray-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="p-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600 bg-gray-50">
              <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries (Showing {solutions.length === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + pageSize, solutions.length)} of {solutions.length})</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 py-1 font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reader Drawer */}
      <SolutionDrawer
        readingArticle={readingArticle}
        onClose={() => setReadingArticle(null)}
        onEdit={(art) => {
          setReadingArticle(null);
          handleOpenEditModal(art);
        }}
        onVoteHelpful={handleVoteHelpful}
        getStatusBadge={getStatusBadge}
      />

      {/* Create / Edit Modal */}
      <SolutionModal
        isOpen={isEditorOpen}
        isEditMode={!!editingArticleId}
        onClose={() => setIsEditorOpen(false)}
        onSubmit={handleSaveArticle}
        formData={formData}
        setFormData={setFormData}
        submitting={submitting}
        categories={CATEGORIES}
        statuses={STATUSES}
      />
    </div>
  );
}
