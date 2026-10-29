import React, { useState } from 'react';
import {
  Sparkles,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { EquipmentRequestCard } from '../../components/requests/EquipmentRequestCard';
import { EquipmentRequestForm } from '../../components/smartfind/EquipmentRequestForm';
import { MatchResultCard } from '../../components/smartfind/MatchResultCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../lib/api-client';
import { AIRecommendation, EquipmentRequest } from '../../types';

interface SmartFindPageProps {
  onNavigateToBooking: (resourceId: string) => void;
  onNavigateToResource: (resourceId: string) => void;
}

export const SmartFindPage: React.FC<SmartFindPageProps> = ({
  onNavigateToBooking,
  onNavigateToResource,
}) => {
  const { equipmentRequests, createEquipmentRequest, resources } = useData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'create'>('all');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiMatches, setAiMatches] = useState<AIRecommendation[] | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const myRequests = equipmentRequests.filter(
    (req) => req.requesterId === currentUser?.id || req.requesterName === currentUser?.displayName
  );

  const handleNaturalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalQuery.trim()) return;

    try {
      setIsSearchingAI(true);
      setSearchExecuted(true);

      const res = await ApiClient.matchWithAI(naturalQuery);
      setAiMatches(res.recommendations);
      setAiAdvice(res.advice);
    } catch (err) {
      console.warn('AI search error, falling back to local search:', err);
      // Local fallback search
      const q = naturalQuery.toLowerCase();
      const localMatches = resources
        .filter((r) => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
        .map((r, idx) => ({
          resourceId: r.id,
          resourceName: r.name,
          category: r.category,
          rentalPricePerDay: r.rentalPricePerDay,
          matchScore: 85 - idx * 10,
          matchReason: `Matches keyword in registered catalog (${r.category}).`,
          isAlternative: idx > 1,
        }));

      setAiMatches(localMatches);
      setAiAdvice('Searched across local institutional catalog records.');
    } finally {
      setIsSearchingAI(false);
    }
  };

  const handleCreateSubmit = async (
    data: Omit<EquipmentRequest, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      setIsCreating(true);
      const newId = await createEquipmentRequest(data);
      setActiveTab('my');
      return newId;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="SmartFind Equipment Discovery & Demand"
        description="Search for hard-to-find instruments or publish a demand request when equipment is unlisted so consortium providers can fulfil it."
        actions={
          <button
            onClick={() => setActiveTab(activeTab === 'create' ? 'all' : 'create')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            {activeTab === 'create' ? 'View Requests' : 'Post Equipment Demand'}
          </button>
        }
      />

      {/* Flagship SmartFind Search Section */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 md:p-8 text-white shadow-lg border border-slate-700">
        <div className="max-w-2xl mb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            SmartFind Intelligent Search
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">
            Describe what you need in plain English
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Example: <span className="text-teal-300 italic">"I need an oscilloscope for an electronics mini-project for 3 days under ₹800"</span> or <span className="text-teal-300 italic">"thermal camera for PCB troubleshooting"</span>
          </p>
        </div>

        <form onSubmit={handleNaturalSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={naturalQuery}
              onChange={(e) => setNaturalQuery(e.target.value)}
              placeholder="What instrument, tool, or workstation do you need?"
              className="w-full pl-11 pr-4 py-3 bg-white/10 text-white placeholder-slate-400 text-sm rounded-xl border border-white/20 focus:outline-hidden focus:bg-white/15 focus:border-teal-400"
            />
          </div>
          <button
            type="submit"
            disabled={isSearchingAI || !naturalQuery.trim()}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isSearchingAI ? (
              <span>Analyzing Catalog...</span>
            ) : (
              <>
                <span>Run SmartFind Match</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Live Search Results */}
        {searchExecuted && (
          <div className="mt-6 pt-6 border-t border-slate-700/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Match Results & Recommendations ({aiMatches?.length || 0})
              </h3>
              {aiAdvice && <p className="text-[11px] text-slate-300 italic">{aiAdvice}</p>}
            </div>

            {aiMatches && aiMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiMatches.map((match, idx) => (
                  <MatchResultCard
                    key={idx}
                    recommendation={match}
                    onBook={onNavigateToBooking}
                    onViewDetails={onNavigateToResource}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                <h4 className="font-bold text-sm text-white">No Suitable Resource Found in Current Listings</h4>
                <p className="text-xs text-slate-300 max-w-lg mx-auto">
                  No suitable resource was found in the current listings. Create an equipment request and let registered providers know what you need.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('create');
                    setNaturalQuery('');
                  }}
                  className="px-4 py-2 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors"
                >
                  Create & Broadcast Request Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'all'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Community Demands ({equipmentRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'my'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Demands ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'create'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            + Post New Demand
          </button>
        </div>
      </div>

      {/* Content depending on tab */}
      {activeTab === 'create' ? (
        <EquipmentRequestForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setActiveTab('all')}
          isLoading={isCreating}
        />
      ) : activeTab === 'my' ? (
        <div>
          {myRequests.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="You haven't posted any equipment requests"
              description="When you need an instrument that isn't available in your college labs, broadcast a request here."
              action={{
                label: 'Post an Equipment Demand',
                onClick: () => setActiveTab('create'),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myRequests.map((req) => (
                <EquipmentRequestCard
                  key={req.id}
                  request={req}
                  onBookMatch={onNavigateToBooking}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {equipmentRequests.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No Open Equipment Demands"
              description="All requested instruments have been matched or satisfied."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {equipmentRequests.map((req) => (
                <EquipmentRequestCard
                  key={req.id}
                  request={req}
                  onBookMatch={onNavigateToBooking}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
