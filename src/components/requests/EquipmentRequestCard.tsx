import React from 'react';
import { Sparkles, Calendar, DollarSign, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { EquipmentRequest } from '../../types';
import { formatCurrencyINR, formatDate } from '../../lib/formatters';
import { StatusBadge } from '../ui/StatusBadge';

interface EquipmentRequestCardProps {
  request: EquipmentRequest;
  onBookMatch?: (resourceId: string) => void;
  onViewDetails?: (request: EquipmentRequest) => void;
}

export const EquipmentRequestCard: React.FC<EquipmentRequestCardProps> = ({
  request,
  onBookMatch,
  onViewDetails,
}) => {
  const urgencyColor = {
    low: 'text-slate-500 bg-slate-100',
    medium: 'text-blue-700 bg-blue-50 border-blue-200',
    high: 'text-amber-700 bg-amber-50 border-amber-200',
    critical: 'text-rose-700 bg-rose-50 border-rose-200',
  }[request.urgency];

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Header badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider">
              {request.category}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${urgencyColor}`}>
              {request.urgency} Urgency
            </span>
          </div>
          <StatusBadge status={request.status} size="sm" />
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-base mb-1">{request.equipmentName}</h3>

        <p className="text-xs text-slate-500 mb-3">
          Requested by: <span className="font-medium text-slate-700">{request.requesterName}</span>
        </p>

        {/* Tech Specs */}
        <p className="text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 leading-relaxed">
          <span className="font-semibold text-slate-700">Specifications:</span> {request.technicalRequirements}
        </p>

        {/* Purpose */}
        {request.purpose && (
          <p className="text-xs text-slate-500 mb-3">
            <span className="font-medium text-slate-600">Project:</span> {request.purpose}
          </p>
        )}

        {/* Dates & Budget */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100 mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatDate(request.startDate)} → {formatDate(request.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
            <span>Max Budget: <strong className="text-slate-800">{formatCurrencyINR(request.maxBudget)}</strong></span>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{request.preferredLocation}</span>
          </div>
        </div>

        {/* Matched Banner if matched */}
        {request.matchedResourceId && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-800 mb-4 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Matching Resource Identified:</p>
              <p className="text-emerald-900 font-medium">{request.matchedResourceName || 'Campus Laboratory Unit'}</p>
              {request.providerResponse && (
                <p className="text-emerald-700 text-[11px] mt-1 italic">{request.providerResponse}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Qty: {request.quantity} unit(s)</span>
        <div className="flex items-center gap-2">
          {request.matchedResourceId && onBookMatch && (
            <button
              onClick={() => onBookMatch(request.matchedResourceId!)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
            >
              Book Match <ArrowRight className="w-3 h-3" />
            </button>
          )}
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(request)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              View Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
