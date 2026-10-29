import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrencyINR, formatDateTime } from '../../lib/formatters';
import { MaintenanceRecord } from '../../types';

export const MaintenanceDashboardPage: React.FC = () => {
  const { maintenanceRecords, createMaintenanceRecord, updateMaintenanceRecord, resources } = useData();
  const { currentUser, isManagerOrAdmin } = useAuth();

  const [showCreate, setShowCreate] = useState(false);
  const [resourceId, setResourceId] = useState(resources[0]?.id || '');
  const [issueDescription, setIssueDescription] = useState('');
  const [technician, setTechnician] = useState('');
  const [serviceCost, setServiceCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription.trim()) return;

    try {
      setIsSubmitting(true);
      const res = resources.find((r) => r.id === resourceId);

      await createMaintenanceRecord({
        resourceId,
        resourceName: res?.name || 'Equipment Unit',
        issueDescription,
        status: 'in_progress',
        technician: technician || currentUser?.displayName || 'Campus Metrology Technician',
        serviceCost: Number(serviceCost),
        notes: 'Resource locked from student reservations until calibration is certified.',
      });

      setShowCreate(false);
      setIssueDescription('');
      setTechnician('');
      setServiceCost(0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearMaintenance = async (record: MaintenanceRecord) => {
    await updateMaintenanceRecord(record.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      notes: `Cleared and recalibrated by ${currentUser?.displayName || 'Lab Manager'}. Restored to active catalog.`,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Maintenance & Servicing"
        description="Oversee equipment calibration, scheduled inspections, and repair lockouts. Equipment under maintenance is automatically locked from bookings."
        actions={
          isManagerOrAdmin && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {showCreate ? 'Cancel' : 'Log Maintenance Ticket'}
            </button>
          )
        }
      />

      {/* Lockout Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Safety Lockout Enforcement</p>
          <p className="mt-0.5 text-amber-700 leading-relaxed">
            When an instrument is placed under maintenance, the booking engine blocks all calendar dates and prevents student checkout until authorized lab personnel test and clear the unit.
          </p>
        </div>
      </div>

      {/* Form */}
      {showCreate && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-md space-y-4"
        >
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Wrench className="w-4 h-4 text-teal-600" />
            <span>Create Maintenance / Calibration Record</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Unit *</label>
              <select
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Technician / Service Agency</label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                placeholder="e.g. Rohde & Schwarz / Authorized Metrologist"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Cost (₹ INR)</label>
              <input
                type="number"
                min="0"
                value={serviceCost}
                onChange={(e) => setServiceCost(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Description & Servicing Scope *</label>
            <textarea
              rows={3}
              required
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="State calibration tolerance requirements, sensor drift, or replacement part numbers..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 text-xs text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
            >
              {isSubmitting ? 'Locking & Saving...' : 'Lock Resource & Log Ticket'}
            </button>
          </div>
        </form>
      )}

      {/* Maintenance Logs */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Servicing & Calibration History ({maintenanceRecords.length})</h3>

        <div className="space-y-4">
          {maintenanceRecords.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{rec.resourceName}</span>
                  <StatusBadge status={rec.status} size="sm" />
                </div>
                {rec.serviceCost && rec.serviceCost > 0 ? (
                  <span className="text-xs font-semibold text-slate-700">
                    Cost: {formatCurrencyINR(rec.serviceCost)}
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                {rec.issueDescription}
              </p>

              {rec.notes && (
                <p className="text-[11px] text-slate-500 italic">
                  Notes: {rec.notes}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                <span>Technician: {rec.technician || 'Central Lab Staff'} • Logged: {formatDateTime(rec.createdAt)}</span>

                {rec.status !== 'completed' && isManagerOrAdmin && (
                  <button
                    onClick={() => handleClearMaintenance(rec)}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Clear & Restore to Catalog
                  </button>
                )}

                {rec.status === 'completed' && (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Certified Operational
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
