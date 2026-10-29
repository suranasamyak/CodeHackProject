import React from 'react';
import { Check, Clock, AlertTriangle, X } from 'lucide-react';
import { BookingStatus } from '../../types';

interface BookingTimelineProps {
  status: BookingStatus;
  checkInAt?: string;
  checkOutAt?: string;
  returnedAt?: string;
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({
  status,
  checkInAt,
  checkOutAt,
  returnedAt,
}) => {
  const steps = [
    { id: 'pending', label: 'Requested' },
    { id: 'approved', label: 'Approved' },
    { id: 'checked_out', label: 'Checked Out' },
    { id: 'returned_pending_inspection', label: 'Inspection' },
    { id: 'completed', label: 'Completed' },
  ];

  const getStepIndex = (s: BookingStatus) => {
    switch (s) {
      case 'pending':
        return 0;
      case 'approved':
        return 1;
      case 'checked_out':
        return 2;
      case 'returned_pending_inspection':
        return 3;
      case 'completed':
        return 4;
      default:
        return -1;
    }
  };

  const currentIndex = getStepIndex(status);
  const isRejected = status === 'rejected' || status === 'cancelled';

  if (isRejected) {
    return (
      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs font-medium">
        <X className="w-4 h-4" />
        <span>This booking was {status}.</span>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-teal-600 transition-all duration-300 z-0"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (steps.length - 1)) * 100))}%`,
          }}
        />

        {steps.map((step, idx) => {
          const isDone = currentIndex > idx || (currentIndex === idx && status === 'completed');
          const isCurrent = currentIndex === idx;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isDone
                    ? 'bg-teal-600 text-white ring-4 ring-teal-50'
                    : isCurrent
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 ring-offset-1'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] font-medium mt-1.5 whitespace-nowrap ${
                  isCurrent ? 'text-teal-700 font-semibold' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
