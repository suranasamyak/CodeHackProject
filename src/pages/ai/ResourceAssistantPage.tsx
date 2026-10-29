import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MatchResultCard } from '../../components/smartfind/MatchResultCard';
import { ApiClient } from '../../lib/api-client';
import { AIMatchResponse, AIRecommendation } from '../../types';
import { formatCurrencyINR } from '../../lib/formatters';

interface ResourceAssistantPageProps {
  onNavigateToBooking: (resourceId: string) => void;
  onNavigateToResource: (resourceId: string) => void;
}

export const ResourceAssistantPage: React.FC<ResourceAssistantPageProps> = ({
  onNavigateToBooking,
  onNavigateToResource,
}) => {
  const [prompt, setPrompt] = useState(
    'I need an oscilloscope for an electronics mini-project for three days. My budget is ₹800, and I can travel up to 10 km.'
  );
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<AIMatchResponse | null>(null);

  const samplePrompts = [
    'I need an oscilloscope for an electronics mini-project for 3 days under ₹800.',
    'Need a thermal imaging camera to detect hot spots on a PCB for 2 days.',
    'Looking for a 3D printer for rapid prototyping of a drone chassis.',
    'Need a GPU workstation with CUDA support for training a deep learning vision model.',
    'Looking for a cryogenic liquid nitrogen dewar flask for 2 days under ₹2000.',
  ];

  const handleSearch = async (queryText: string) => {
    try {
      setLoading(true);
      const res = await ApiClient.matchWithAI(queryText);
      setMatchData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      handleSearch(prompt);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="AI Resource Assistant"
        description="Explain your experimental setup, project deadline, and budget in natural language. Powered by Gemini on the server side with deterministic catalog validation."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Sparkles className="w-3 h-3 text-teal-600" /> Gemini 3.8 Flash
          </span>
        }
      />

      {/* Interactive Input Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-xs space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I need an oscilloscope for an electronics mini-project for three days. My budget is ₹800, and I can travel up to 10 km."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Quick prompts:</span>
              {samplePrompts.slice(0, 2).map((sp, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setPrompt(sp);
                    handleSearch(sp);
                  }}
                  className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] truncate max-w-[200px]"
                >
                  {sp}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 self-end sm:self-auto disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Analyzing with AI...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Consult Assistant</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Analysis & Output Display */}
      {matchData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Extracted Specifications & Requirements Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400 uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>Extracted Requirements (Stage 1 Parsing)</span>
              </div>
              <span className="text-[11px] text-slate-400">
                {matchData.deterministicFallbackUsed
                  ? 'Deterministic Baseline Engine'
                  : 'Gemini Model Structured Output'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Category</p>
                <p className="font-semibold text-white mt-0.5">
                  {matchData.extractedRequirements.category || 'Electronics'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Equipment Target</p>
                <p className="font-semibold text-white mt-0.5">
                  {matchData.extractedRequirements.equipment || 'Oscilloscope'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Max Budget</p>
                <p className="font-semibold text-teal-400 mt-0.5">
                  {formatCurrencyINR(matchData.extractedRequirements.budget || 800)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Location Limit</p>
                <p className="font-semibold text-white mt-0.5">
                  {matchData.extractedRequirements.location || 'Within 10 km'}
                </p>
              </div>
            </div>

            {/* AI Technical Advice */}
            {matchData.advice && (
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 flex items-start gap-2.5">
                <Compass className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-300">Governance & Usage Advice:</span>
                  <p className="mt-0.5 text-slate-300 leading-relaxed">{matchData.advice}</p>
                </div>
              </div>
            )}
          </div>

          {/* Catalog Matches & Technical Alternatives */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Ranked Catalog Matches & Alternatives ({matchData.recommendations.length})
              </h3>
              <span className="text-xs text-slate-500">
                Verified against live institutional catalog records
              </span>
            </div>

            {matchData.recommendations.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">No Suitable Match Found in Existing Inventory</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Neither exact instruments nor viable alternatives are currently registered matching this exact criterion.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchData.recommendations.map((rec, idx) => (
                  <MatchResultCard
                    key={idx}
                    recommendation={rec}
                    onBook={onNavigateToBooking}
                    onViewDetails={onNavigateToResource}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
