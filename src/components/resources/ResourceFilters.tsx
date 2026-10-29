import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { ResourceCategory, ResourceAvailability } from '../../types';

interface FilterState {
  category: string;
  availability: string;
  maxPrice: number;
  trainingOnly: boolean;
  institution: string;
}

interface ResourceFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories: ResourceCategory[];
  institutions: string[];
  maxAvailablePrice: number;
}

export const ResourceFilters: React.FC<ResourceFiltersProps> = ({
  filters,
  onChange,
  categories,
  institutions,
  maxAvailablePrice,
}) => {
  const handleReset = () => {
    onChange({
      category: '',
      availability: '',
      maxPrice: maxAvailablePrice,
      trainingOnly: false,
      institution: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Category</label>
        <select
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Availability</label>
        <select
          value={filters.availability}
          onChange={(e) => onChange({ ...filters, availability: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
        >
          <option value="">All Statuses</option>
          <option value="available">Available Now</option>
          <option value="booked">Currently Booked</option>
          <option value="maintenance">Under Maintenance</option>
          <option value="restricted">Restricted Access</option>
        </select>
      </div>

      {/* Institution Filter */}
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1.5">Institution</label>
        <select
          value={filters.institution}
          onChange={(e) => onChange({ ...filters, institution: e.target.value })}
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500"
        >
          <option value="">All Institutions</option>
          {institutions.map((inst) => (
            <option key={inst} value={inst}>
              {inst}
            </option>
          ))}
        </select>
      </div>

      {/* Max Price Range Slider */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <label className="font-medium text-slate-700">Max Price / Day</label>
          <span className="font-semibold text-teal-700">₹{filters.maxPrice}</span>
        </div>
        <input
          type="range"
          min={50}
          max={maxAvailablePrice || 1000}
          step={25}
          value={filters.maxPrice}
          onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-teal-600 cursor-pointer"
        />
      </div>

      {/* Training Checkbox */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
          <input
            type="checkbox"
            checked={filters.trainingOnly}
            onChange={(e) => onChange({ ...filters, trainingOnly: e.target.checked })}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
          />
          <span>Requires Safety Training</span>
        </label>
      </div>
    </div>
  );
};
