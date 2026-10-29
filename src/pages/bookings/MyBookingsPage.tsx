import React, { useState } from 'react';
import { CalendarCheck, Filter, AlertCircle, CheckCircle2, Repeat, Clock } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { BookingCard } from '../../components/bookings/BookingCard';
import { BookingTimeline } from '../../components/bookings/BookingTimeline';
import { ConditionChecklist } from '../../components/condition/ConditionChecklist';
import { EmptyState } from '../../components/ui/EmptyState';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Booking, BookingStatus } from '../../types';

interface MyBookingsPageProps {
  onNavigateToExplore: () => void;
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = ({ onNavigateToExplore }) => {
  const { bookings, updateBookingStatus, checkOutBooking, returnBooking, resources } = useData();
  const { currentUser, isOwnerOrAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'my' | 'incoming' | 'all'>('my');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<{
    booking: Booking;
    type: 'check_out' | 'return';
  } | null>(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Filter bookings based on active user and tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'my') {
      return b.requesterId === currentUser?.id || b.requesterEmail === currentUser?.email;
    }
    if (activeTab === 'incoming') {
      return b.ownerId === currentUser?.id || isOwnerOrAdmin;
    }
    return true;
  });

  const handleApprove = async (id: string) => {
    await updateBookingStatus(id, 'approved');
  };

  const handleReject = async (id: string, reason: string) => {
    await updateBookingStatus(id, 'rejected', reason);
  };

  const handleConditionSubmit = async (
    condition: string,
    notes: string,
    accessoriesConfirmed: boolean,
    discrepancies?: string
  ) => {
    if (!selectedBookingForAction) return;
    try {
      setIsSubmittingReport(true);
      if (selectedBookingForAction.type === 'check_out') {
        await checkOutBooking(selectedBookingForAction.booking.id, condition, notes);
      } else {
        await returnBooking(selectedBookingForAction.booking.id, condition, notes, discrepancies);
      }
      setSelectedBookingForAction(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings & Reservations"
        description="Track your reserved equipment lifecycle, manage owner approvals, and document digital check-in and check-out evidence."
      />

      {/* Condition Checklist Modal */}
      {selectedBookingForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <ConditionChecklist
            type={selectedBookingForAction.type}
            resourceName={selectedBookingForAction.booking.resourceName}
            includedAccessories={
              resources.find((r) => r.id === selectedBookingForAction.booking.resourceId)?.includedAccessories
            }
            onSubmit={handleConditionSubmit}
            onCancel={() => setSelectedBookingForAction(null)}
            isLoading={isSubmittingReport}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('my')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'my'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            My Reservations ({bookings.filter((b) => b.requesterId === currentUser?.id).length})
          </button>
          {isOwnerOrAdmin && (
            <button
              onClick={() => setActiveTab('incoming')}
              className={`pb-3 text-xs font-semibold transition-colors relative ${
                activeTab === 'incoming'
                  ? 'text-teal-700 border-b-2 border-teal-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Lab In-Charge Incoming Requests (
              {bookings.filter((b) => b.ownerId === currentUser?.id || isOwnerOrAdmin).length}
              )
            </button>
          )}
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-semibold transition-colors relative ${
              activeTab === 'all'
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Consortium Activity ({bookings.length})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Bookings in this view"
          description="You haven't requested any equipment or received any incoming requests yet."
          action={{
            label: 'Explore Catalog to Book',
            onClick: onNavigateToExplore,
          }}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div key={b.id} className="space-y-2">
              <BookingCard
                booking={b}
                onApprove={handleApprove}
                onReject={handleReject}
                onCheckOut={(booking) => setSelectedBookingForAction({ booking, type: 'check_out' })}
                onReturn={(booking) => setSelectedBookingForAction({ booking, type: 'return' })}
              />
              <div className="px-5 bg-white/50 rounded-lg pb-1">
                <BookingTimeline status={b.status} checkInAt={b.checkInAt} checkOutAt={b.checkOutAt} returnedAt={b.returnedAt} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
