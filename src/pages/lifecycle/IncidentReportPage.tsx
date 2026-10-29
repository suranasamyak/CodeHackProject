import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../lib/formatters';
import { ApiClient } from '../../lib/api-client';
import { Incident, IncidentType, IncidentSeverity } from '../../types';

export const IncidentReportPage: React.FC = () => {
  const { incidents, createIncident, updateIncident, resources } = useData();
  const { currentUser, isOwnerOrAdmin } = useAuth();

  const [showReportForm, setShowReportForm] = useState(false);
  const [resourceId, setResourceId] = useState(resources[0]?.id || '');
  const [incidentType, setIncidentType] = useState<IncidentType>('malfunction');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolution response modal
  const [activeIncidentForResolution, setActiveIncidentForResolution] = useState<Incident | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  const handleAiSummarize = async () => {
    if (!description.trim()) return;
    try {
      setIsSummarizing(true);
      const summary = await ApiClient.summarizeIncident(description, incidentType);
      setAiSummary(summary);
    } catch {
      setAiSummary(description);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setIsSubmitting(true);
      const res = resources.find((r) => r.id === resourceId);

      await createIncident({
        resourceId,
        resourceName: res?.name || 'Lab Instrument',
        reportedBy: currentUser?.id || 'user_student_rohit',
        reporterName: currentUser?.displayName || 'Campus User',
        incidentType,
        severity,
        description: aiSummary ? `${description}\n\n[AI Technical Summary]: ${aiSummary}` : description,
        reviewStatus: 'under_review',
      });

      setShowReportForm(false);
      setDescription('');
      setAiSummary('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIncidentForResolution || !resolutionText.trim()) return;

    await updateIncident(activeIncidentForResolution.id, {
      reviewStatus: 'resolved',
      resolution: resolutionText,
      resolvedBy: currentUser?.displayName || 'Lab Manager',
    });

    setActiveIncidentForResolution(null);
    setResolutionText('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Incident & Damage Reporting"
        description="Structured dispute and damage resolution. AI assists by drafting neutral technical summaries for human lab managers without assigning unilateral blame."
        actions={
          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            {showReportForm ? 'Cancel Report' : 'File Incident Report'}
          </button>
        }
      />

      {/* Resolution Modal */}
      {activeIncidentForResolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <form
            onSubmit={handleResolveSubmit}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-xl max-w-lg w-full space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-base">Record Incident Resolution</h3>
            <p className="text-xs text-slate-500">
              Equipment: <strong className="text-slate-800">{activeIncidentForResolution.resourceName}</strong>
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Decision & Agreed Actions *
              </label>
              <textarea
                rows={4}
                required
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                placeholder="e.g. Minor calibration drift addressed under lab warranty. Security deposit fully refunded without penalty."
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveIncidentForResolution(null)}
                className="px-3 py-1.5 text-xs text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Mark Resolved
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Report Form */}
      {showReportForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4"
        >
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-slate-900 text-base">Submit New Incident Report</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Involved *</label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Classification *</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentType)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                <option value="damage">Physical Damage</option>
                <option value="malfunction">Technical Malfunction</option>
                <option value="missing_accessory">Missing Accessory</option>
                <option value="late_return">Late Return</option>
                <option value="dispute">Condition Dispute</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                <option value="low">Low (Cosmetic / Minor)</option>
                <option value="medium">Medium (Requires Servicing)</option>
                <option value="high">High (Non-functional)</option>
                <option value="critical">Critical (Safety Hazard)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Detailed Description *</label>
              <button
                type="button"
                onClick={handleAiSummarize}
                disabled={isSummarizing || !description.trim()}
                className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isSummarizing ? 'Summarizing with AI...' : 'Generate AI Technical Summary'}
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, any error codes, physical signs of wear, or missing parts..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white"
            />
          </div>

          {aiSummary && (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-xs text-teal-900">
              <p className="font-bold flex items-center gap-1.5 text-teal-800 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> AI Objective Technical Digest:
              </p>
              <p className="leading-relaxed">{aiSummary}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="px-4 py-2 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
            >
              {isSubmitting ? 'Filing Report...' : 'Submit Incident Report'}
            </button>
          </div>
        </form>
      )}

      {/* Incidents List */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Consortium Incident Log ({incidents.length})</h3>

        {incidents.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No active incidents logged. Equipment operating smoothly.</p>
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => (
              <div
                key={inc.id}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{inc.resourceName}</span>
                    <span className="text-xs uppercase font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {inc.incidentType}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {inc.severity} Severity
                    </span>
                  </div>
                  <StatusBadge status={inc.reviewStatus} size="sm" />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/80 whitespace-pre-line">
                  {inc.description}
                </p>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                  <span>Reported by: {inc.reporterName} • {formatDateTime(inc.createdAt)}</span>
                  {inc.reviewStatus !== 'resolved' && isOwnerOrAdmin && (
                    <button
                      onClick={() => setActiveIncidentForResolution(inc)}
                      className="px-3 py-1 bg-teal-600 text-white rounded-md text-xs font-semibold hover:bg-teal-700"
                    >
                      Resolve Incident
                    </button>
                  )}
                  {inc.resolution && (
                    <span className="text-emerald-700 font-medium">
                      Resolved: {inc.resolution} (by {inc.resolvedBy || 'Lab In-Charge'})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
