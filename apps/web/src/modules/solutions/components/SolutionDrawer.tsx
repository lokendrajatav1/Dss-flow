import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SolutionArticle } from '../types';

interface SolutionDrawerProps {
  readingArticle: SolutionArticle | null;
  onClose: () => void;
  onEdit: (article: SolutionArticle) => void;
  onVoteHelpful: (id: string) => Promise<void>;
  getStatusBadge: (s: string) => string;
}

export const SolutionDrawer: React.FC<SolutionDrawerProps> = ({
  readingArticle,
  onClose,
  onEdit,
  onVoteHelpful,
  getStatusBadge,
}) => {
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  if (!readingArticle) return null;

  const handleCopy = () => {
    const text = `Solution: ${readingArticle.title}\n\nProblem:\n${readingArticle.problem}\n\nSteps to Resolve:\n${readingArticle.stepsToResolve.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nTips:\n${(readingArticle.tips || []).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  return createPortal(
    <>
      {/* Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9980] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-[9985] border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {readingArticle.category}
              </span>
              <span className={`text-xs border rounded-full px-2 py-0.5 font-medium ${getStatusBadge(readingArticle.status)}`}>
                {readingArticle.status}
              </span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-1 line-clamp-1">{readingArticle.title}</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs h-8 gap-1.5 text-gray-700"
            >
              {copiedSuccess ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSuccess ? 'Copied' : 'Copy'}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(readingArticle)}
              className="text-xs h-8 px-3"
            >
              Edit
            </Button>
            <button 
              type="button"
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs bg-gray-50/30">
          {/* Meta Bar */}
          <div className="flex items-center justify-between text-gray-500 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <span>Author: <strong className="text-gray-900">{readingArticle.author}</strong></span>
            <span>Last Updated: <strong className="text-gray-900">{readingArticle.updatedAt}</strong></span>
            <span>Views: <strong className="text-gray-900">{readingArticle.views}</strong></span>
          </div>

          {/* Problem Statement */}
          <div className="bg-white p-3.5 rounded-xl border border-rose-200 shadow-sm">
            <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">Problem / Symptoms</h4>
            <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-100 text-gray-800 leading-relaxed whitespace-pre-wrap">
              {readingArticle.problem}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Overview</h4>
            <p className="text-gray-700 leading-relaxed text-xs">{readingArticle.summary}</p>
          </div>

          {/* Steps to Resolve */}
          <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5">Step-by-Step Resolution</h4>
            <div className="space-y-2">
              {readingArticle.stepsToResolve.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[11px] mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-gray-800 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tips & Recommendations */}
          {readingArticle.tips && readingArticle.tips.length > 0 && (
            <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-sm">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Helpful Tips & Pro-Advice</h4>
              <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200 space-y-1.5">
                {readingArticle.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-amber-900">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1.5">
              {readingArticle.tags.map((t, idx) => (
                <span key={idx} className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-[11px] font-medium">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Helpful feedback */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-xs flex-shrink-0 z-10">
          <span className="text-gray-600 font-medium">Was this article helpful to your resolution?</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onVoteHelpful(readingArticle.id)}
            className="text-xs h-8 gap-1.5 hover:bg-emerald-50 hover:text-emerald-700 border-gray-300"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Helpful ({readingArticle.helpfulCount})</span>
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
};
