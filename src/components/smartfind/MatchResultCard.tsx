import React from 'react';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AIRecommendation } from '../../types';
import { formatCurrencyINR } from '../../lib/formatters';

interface MatchResultCardProps {
  recommendation: AIRecommendation;
  onBook: (resourceId: string) => void;
  onViewDetails: (resourceId: string) => void;
}

export const MatchResultCard: React.FC<MatchResultCardProps> = ({
  recommendation,
  onBook,
  onViewDetails,
}) => {
  return (
    <div
      className={`rounded-xl border p-4.5 transition-all shadow-2xs ${
        recommendation.isAlternative
          ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
          : 'bg-white border-teal-200 hover:border-teal-400'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                recommendation.isAlternative
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {recommendation.isAlternative ? 'Alternative Suggestion' : 'Exact Catalog Match'}
            </span>
            <span className="text-xs text-slate-500 font-medium">{recommendation.category}</span>
          </div>
          <h4 className="font-bold text-slate-900 text-base mt-1.5">{recommendation.resourceName}</h4>
        </div>

        {/* Match Score Badge */}
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold shadow-2xs">
            <Sparkles className="w-3 h-3 text-teal-400" />
            <span>{recommendation.matchScore}% Match</span>
          </div>
          <p className="text-xs font-semibold text-slate-800 mt-1">
            {formatCurrencyINR(recommendation.rentalPricePerDay)}
            <span className="text-[10px] font-normal text-slate-500"> /day</span>
          </p>
        </div>
      </div>

      {/* Rationale */}
      <p className="text-xs text-slate-600 bg-white/80 rounded-lg p-2.5 border border-slate-200/80 mb-3 leading-relaxed">
        <span className="font-semibold text-slate-800">Match Rationale:</span> {recommendation.matchReason}
      </p>

      {/* Alternative Explanation if applicable */}
      {recommendation.alternativeExplanation && (
        <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-100/60 rounded-lg p-2.5 mb-3 border border-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Alternative Substitution Note:</span>
            <p className="text-[11px] text-amber-900 mt-0.5">{recommendation.alternativeExplanation}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
        <button
          onClick={() => onViewDetails(recommendation.resourceId)}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Inspect Resource
        </button>
        <button
          onClick={() => onBook(recommendation.resourceId)}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
        >
          Proceed to Booking <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
