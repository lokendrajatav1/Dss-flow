import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  Briefcase, 
  UserPlus, 
  Clock, 
  Layers, 
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CRM_RECIPES, WorkflowRecipe } from '../data/templates';

interface WorkflowTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: WorkflowRecipe | null) => void;
}

export function WorkflowTemplatesModal({
  isOpen,
  onClose,
  onSelectRecipe
}: WorkflowTemplatesModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredRecipes = selectedCategory === 'all'
    ? CRM_RECIPES
    : CRM_RECIPES.filter(r => r.category === selectedCategory);

  const getRecipeIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case 'Briefcase':     return <Briefcase className="w-5 h-5 text-blue-600" />;
      case 'UserPlus':      return <UserPlus className="w-5 h-5 text-indigo-600" />;
      case 'Clock':         return <Clock className="w-5 h-5 text-amber-600" />;
      default:              return <Sparkles className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-5xl max-h-[92vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 via-white to-indigo-50/40 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  Automation Recipes & Templates
                </h2>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CRM Library
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Launch tested high-converting workflows or build your own custom logic from scratch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-3 border-b border-gray-100 bg-white flex items-center gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'all', label: 'All Recipes' },
            { id: 'whatsapp', label: 'WhatsApp & SMS' },
            { id: 'deal', label: 'Deals & Pipeline' },
            { id: 'lead', label: 'Lead Routing & Nurture' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 custom-scrollbar">
          
          {/* Option: Start from Scratch */}
          <div 
            onClick={() => onSelectRecipe(null)}
            className="group relative bg-white border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  Start from Scratch (Blank Canvas)
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Begin with an empty workflow and configure custom triggers, conditions, and actions manually.
                </p>
              </div>
            </div>

            <Button 
              size="sm" 
              variant="outline"
              className="border-gray-200 group-hover:border-indigo-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-xs"
            >
              Start Blank <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Ready-to-Use Recipes ({filteredRecipes.length})
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map(recipe => (
              <div 
                key={recipe.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      {getRecipeIcon(recipe.icon)}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                      {recipe.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {recipe.name}
                  </h3>

                  <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                    {recipe.description}
                  </p>

                  {/* Steps Flow Pill Summary */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-500" />
                      Sequence ({recipe.workflow.actions.length + 1} Steps)
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded">
                        ⚡ {recipe.workflow.trigger.type.split('_')[0].toUpperCase()}
                      </span>
                      <ArrowRight className="w-3 h-3 text-gray-300" />
                      {recipe.workflow.actions.slice(0, 3).map((act, i) => (
                        <React.Fragment key={act.id}>
                          <span className="bg-slate-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                            {act.type.split('_')[1] || act.type}
                          </span>
                          {i < Math.min(recipe.workflow.actions.length - 1, 2) && (
                            <ArrowRight className="w-3 h-3 text-gray-300" />
                          )}
                        </React.Fragment>
                      ))}
                      {recipe.workflow.actions.length > 3 && (
                        <span className="text-[10px] text-gray-400">+{recipe.workflow.actions.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">
                    {recipe.categoryLabel}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => onSelectRecipe(recipe)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8 px-3"
                  >
                    Use Recipe <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Choose a recipe to pre-populate triggers and action sequences</span>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
