import React from 'react';
import { MapPin, ShieldAlert, Clock, ArrowRight, Wrench } from 'lucide-react';
import { Resource } from '../../types';
import { formatCurrencyINR } from '../../lib/formatters';
import { StatusBadge } from '../ui/StatusBadge';

interface ResourceCardProps {
  resource: Resource;
  onSelect: (resource: Resource) => void;
  onBook?: (resource: Resource) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ resource, onSelect, onBook }) => {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-200">
      {/* Image Container with Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={resource.imageUrl}
          alt={resource.name}
          className="h-full w-full object-cover object-center group-hover:scale-102 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <StatusBadge status={resource.availability} size="sm" />
          {resource.isDemo && (
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
              Demo
            </span>
          )}
        </div>

        {resource.trainingRequired && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
            <ShieldAlert className="w-3 h-3" />
            Safety Training Required
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & College */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-medium text-teal-700">{resource.category}</span>
          <span className="truncate max-w-[140px]">{resource.institutionName?.split(' ')[0] || 'Campus Lab'}</span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onSelect(resource)}
          className="font-semibold text-slate-900 line-clamp-1 hover:text-teal-700 cursor-pointer text-base transition-colors"
          title={resource.name}
        >
          {resource.name}
        </h3>

        {/* Description snippet */}
        <p className="text-xs text-slate-500 line-clamp-2 mt-1 mb-3">
          {resource.description}
        </p>

        {/* Location & Specs */}
        <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{resource.location}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Max rental: {resource.fairShareMaxDays || 5} days (FairShare)</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-base font-bold text-slate-900">
              {formatCurrencyINR(resource.rentalPricePerDay)}
            </span>
            <span className="text-[11px] text-slate-500"> /day</span>
            <div className="text-[10px] text-slate-400">
              Deposit: {formatCurrencyINR(resource.securityDeposit)}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(resource)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Details
            </button>
            {resource.availability === 'available' ? (
              <button
                onClick={() => onBook ? onBook(resource) : onSelect(resource)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
              >
                Book <ArrowRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                disabled
                className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
              >
                Unavailable
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
