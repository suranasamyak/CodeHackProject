import React, { useState } from 'react';
import { Repeat, CheckCircle2, Clock, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { ConditionChecklist } from '../../components/condition/ConditionChecklist';
import { EmptyState } from '../../components/ui/EmptyState';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatDate } from '../../lib/formatters';
import { Booking } from '../../types';

export const LifecyclePage: React.FC = () => {
  const { bookings, conditionReports, checkOutBooking, returnBooking, resources } = useData();
  const { currentUser } = useAuth();

  const [selectedBooking, setSelectedBooking] = useState<{
    booking: Booking;
    type: 'check_out' | 'return';
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active bookings requiring checkout or return
  const activeBookings = bookings.filter(
    (b) => b.status === 'approved' || b.status === 'checked_out'
  );

  const handleConditionSubmit = async (
    condition: string,
    notes: string,
    accessoriesConfirmed: boolean,
    discrepancies?: string
  ) => {
    if (!selectedBooking) return;
    try {
      setIsSubmitting(true);
      if (selectedBooking.type === 'check_out') {
        await checkOutBooking(selectedBooking.booking.id, condition, notes);
      } else {
        await returnBooking(selectedBooking.booking.id, condition, notes, discrepancies);
      }
      setSelectedBooking(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipment Lifecycle: Check-In & Return"
        description="Verify physical condition, confirm bundled accessories, and record digital evidence at both collection and handover."
      />

      {/* Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <ConditionChecklist
            type={selectedBooking.type}
            resourceName={selectedBooking.booking.resourceName}
            includedAccessories={
              resources.find((r) => r.id === selectedBooking.booking.resourceId)?.includedAccessories
            }
            onSubmit={handleConditionSubmit}
            onCancel={() => setSelectedBooking(null)}
            isLoading={isSubmitting}
          />
        </div>
      )}

      {/* Active Items Awaiting Lifecycle Action */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-teal-600" />
          <span>Active Equipment in Circulation ({activeBookings.length})</span>
        </h3>

        {activeBookings.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No equipment currently awaiting collection or return.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeBookings.map((b) => (
              <div
                key={b.id}
                className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{b.resourceName}</h4>
                  <p className="text-xs text-slate-500">
                    Booked by: <span className="text-slate-700 font-medium">{b.requesterName}</span> •
                    Dates: {formatDate(b.startDate)} to {formatDate(b.endDate)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {b.status === 'approved' && (
                    <button
                      onClick={() => setSelectedBooking({ booking: b, type: 'check_out' })}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-2xs"
                    >
                      Perform Check-Out Inspection
                    </button>
                  )}
                  {b.status === 'checked_out' && (
                    <button
                      onClick={() => setSelectedBooking({ booking: b, type: 'return' })}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-2xs"
                    >
                      Complete Return Handover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Condition Reports */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Digital Condition Documentation Log ({conditionReports.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Append-only evidence trail</span>
        </div>

        {conditionReports.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">
            No condition reports submitted yet. Complete a check-out or return above to log initial condition evidence.
          </p>
        ) : (
          <div className="space-y-3">
            {conditionReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    {report.resourceName || 'Certified Equipment'} ({report.reportType.toUpperCase()})
                  </span>
                  <span className="text-[11px] text-slate-400">{formatDateTime(report.createdAt)}</span>
                </div>
                <p className="text-slate-600">
                  <strong className="text-slate-700">Condition:</strong> {report.overallCondition} •{' '}
                  <strong className="text-slate-700">Inspector:</strong> {report.submitterName}
                </p>
                <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  "{report.notes}"
                </p>
                {report.discrepancies && (
                  <p className="text-rose-600 font-medium">
                    ⚠️ Discrepancy noted: {report.discrepancies}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
