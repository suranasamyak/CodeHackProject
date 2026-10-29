import React, { useState, useMemo } from 'react';
import { Layers, Plus, Search, Filter, Sparkles, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ResourceCard } from '../../components/resources/ResourceCard';
import { ResourceFilters } from '../../components/resources/ResourceFilters';
import { SearchInput } from '../../components/ui/SearchInput';
import { PageHeader } from '../../components/layout/PageHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Resource, ResourceCategory } from '../../types';

interface ExploreResourcesPageProps {
  onSelectResource: (resource: Resource) => void;
  onNavigateToSmartFind: () => void;
  onCreateResource: () => void;
  initialQuery?: string;
}

export const ExploreResourcesPage: React.FC<ExploreResourcesPageProps> = ({
  onSelectResource,
  onNavigateToSmartFind,
  onCreateResource,
  initialQuery = '',
}) => {
  const { resources } = useData();
  const { isOwnerOrAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filters, setFilters] = useState({
    category: '',
    availability: '',
    maxPrice: 6000,
    trainingOnly: false,
    institution: '',
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Extract unique categories & institutions
  const categories = useMemo(() => {
    const cats = new Set<ResourceCategory>();
    resources.forEach((r) => cats.add(r.category));
    return Array.from(cats);
  }, [resources]);

  const institutions = useMemo(() => {
    const insts = new Set<string>();
    resources.forEach((r) => {
      if (r.institutionName) insts.add(r.institutionName);
    });
    return Array.from(insts);
  }, [resources]);

  const maxPrice = useMemo(() => {
    return Math.max(...resources.map((r) => r.rentalPricePerDay), 1000);
  }, [resources]);

  // Filtered list
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const haystack = `${res.name} ${res.category} ${res.description} ${res.specifications} ${res.location}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      if (filters.category && res.category !== filters.category) return false;
      if (filters.availability && res.availability !== filters.availability) return false;
      if (res.rentalPricePerDay > filters.maxPrice) return false;
      if (filters.trainingOnly && !res.trainingRequired) return false;
      if (filters.institution && res.institutionName !== filters.institution) return false;

      return true;
    });
  }, [resources, searchQuery, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Explore Campus Resources"
        description="Search and book certified engineering instruments, labs, workstations, and fabrication tools across participating consortium colleges."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToSmartFind}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              SmartFind Request
            </button>
            {isOwnerOrAdmin && (
              <button
                onClick={onCreateResource}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                List Equipment
              </button>
            )}
          </div>
        }
      />

      {/* Search Bar & Mobile Filter Trigger */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by instrument name, category, bandwidth, specs..."
          className="flex-1"
        />
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
        >
          <Filter className="w-4 h-4 text-teal-600" />
          <span>Filters ({filteredResources.length} items)</span>
        </button>
      </div>

      {/* Main Layout: Filters Sidebar + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Filters Sidebar */}
        <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'} lg:col-span-1`}>
          <ResourceFilters
            filters={filters}
            onChange={setFilters}
            categories={categories}
            institutions={institutions}
            maxAvailablePrice={maxPrice}
          />
        </div>

        {/* Resources Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredResources.length}</strong> equipment listings
            </span>
            {searchQuery && (
              <span className="text-teal-700">
                Filtered by: "{searchQuery}"
              </span>
            )}
          </div>

          {filteredResources.length === 0 ? (
            <div className="space-y-4">
              <EmptyState
                icon={Layers}
                title="No Matching Resources Found"
                description={`We couldn't find any equipment matching "${searchQuery || 'your active filter criteria'}".`}
              />
              {/* SmartFind Bridge Banner */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
                <Sparkles className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Need this equipment for an active project?</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 mb-4">
                  Don't worry! Publish a SmartFind equipment demand so registered labs and equipment owners can provide it.
                </p>
                <button
                  onClick={onNavigateToSmartFind}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
                >
                  Broadcast SmartFind Request
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onSelect={onSelectResource}
                  onBook={onSelectResource}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
