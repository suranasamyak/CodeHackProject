import React, { useState } from 'react';
import { Calendar, DollarSign, Clock, ArrowRight, Check, X, ShieldAlert, FileText } from 'lucide-react';
import { Booking, BookingStatus } from '../../types';
import { formatCurrencyINR, formatDate } from '../../lib/formatters';
import { StatusBadge } from '../ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface BookingCardProps {
  booking: Booking;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onCheckOut?: (booking: Booking) => void;
  onReturn?: (booking: Booking) => void;
  onViewDetails?: (booking: Booking) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onApprove,
  onReject,
  onCheckOut,
  onReturn,
  onViewDetails,
}) => {
  const { currentUser } = useAuth();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const isOwner = currentUser?.id === booking.ownerId || currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isRequester = currentUser?.id === booking.requesterId;

  const handleRejectConfirm = () => {
    if (onReject && reason.trim()) {
      onReject(booking.id, reason.trim());
      setRejecting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row gap-5 justify-between items-start md:items-center">
      {/* Left: Thumbnail & Info */}
      <div className="flex items-start gap-4 flex-1">
        {booking.resourceImageUrl && (
          <img
            src={booking.resourceImageUrl}
            alt={booking.resourceName}
            className="w-16 h-16 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
          />
        )}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-slate-900 text-sm">{booking.resourceName}</h4>
            <StatusBadge status={booking.status} size="sm" />
          </div>

          <p className="text-xs text-slate-500">
            Requester: <span className="font-medium text-slate-700">{booking.requesterName}</span> ({booking.requesterEmail})
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formatDate(booking.startDate)} → {formatDate(booking.endDate)} ({booking.totalDays} days)
            </span>
            <span className="flex items-center gap-1 font-semibold text-slate-800">
              Total: {formatCurrencyINR(booking.rentalCost)}
            </span>
            <span className="text-slate-400">
              (Deposit: {formatCurrencyINR(booking.securityDeposit)})
            </span>
          </div>

          {booking.purpose && (
            <p className="text-xs text-slate-600 bg-slate-50 rounded-md p-2 mt-2 border border-slate-100">
              <span className="font-medium text-slate-700">Project Purpose:</span> {booking.purpose}
            </p>
          )}

          {booking.rejectionReason && (
            <p className="text-xs text-rose-600 bg-rose-50 rounded-md p-2 mt-2 border border-rose-100 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>Rejection Reason: {booking.rejectionReason}</span>
            </p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
        {/* Pending Approval Controls for Owner */}
        {booking.status === 'pending' && isOwner && (
          <>
            {rejecting ? (
              <div className="flex flex-col gap-2 w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Reason for declining..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="text-xs p-1.5 border border-slate-300 rounded-md w-full"
                />
                <div className="flex gap-1 justify-end">
                  <button
                    onClick={() => setRejecting(false)}
                    className="text-xs px-2 py-1 text-slate-500 hover:bg-slate-100 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    disabled={!reason.trim()}
                    className="text-xs px-2.5 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700 disabled:opacity-50"
                  >
                    Confirm Reject
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRejecting(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
                <button
                  onClick={() => onApprove && onApprove(booking.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              </div>
            )}
          </>
        )}

        {/* Check-Out Action */}
        {booking.status === 'approved' && (
          <button
            onClick={() => onCheckOut && onCheckOut(booking)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs"
          >
            Check Out & Document <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Return Action */}
        {booking.status === 'checked_out' && (
          <button
            onClick={() => onReturn && onReturn(booking)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-2xs"
          >
            Return Equipment <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Inspection Pending */}
        {booking.status === 'returned_pending_inspection' && (
          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md border border-purple-200">
            Awaiting Owner Inspection
          </span>
        )}

        {booking.status === 'completed' && (
          <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            <Check className="w-3.5 h-3.5" /> Completed & Re-stocked
          </div>
        )}
      </div>
    </div>
  );
};
