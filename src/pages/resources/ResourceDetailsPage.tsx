import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  Check,
  DollarSign,
} from 'lucide-react';
import { Resource } from '../../types';
import { formatCurrencyINR, formatDate, calculateDurationDays } from '../../lib/formatters';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface ResourceDetailsPageProps {
  resource: Resource;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export const ResourceDetailsPage: React.FC<ResourceDetailsPageProps> = ({
  resource,
  onBack,
  onBookingSuccess,
}) => {
  const { currentUser } = useAuth();
  const { createBooking, bookings } = useData();

  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 3600000 * 24).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3600000 * 24 * 3).toISOString().split('T')[0]
  );
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calculate rental cost
  const durationDays = calculateDurationDays(startDate, endDate);
  const totalRentalCost = durationDays * resource.rentalPricePerDay;

  // Eligibility check
  const hasRequiredTraining = !resource.trainingRequired || (
    currentUser?.completedTrainings &&
    resource.trainingCourseName &&
    currentUser.completedTrainings.includes(resource.trainingCourseName)
  );

  // Concurrency-safe overlap conflict detection
  const hasDateConflict = () => {
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();

    return bookings.some((b) => {
      if (b.resourceId !== resource.id) return false;
      if (b.status === 'rejected' || b.status === 'cancelled' || b.status === 'completed') return false;

      const bs = new Date(b.startDate).getTime();
      const be = new Date(b.endDate).getTime();

      // Check date range intersection: max(s, bs) <= min(e, be)
      return Math.max(s, bs) <= Math.min(e, be);
    });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    // 1. Validation checks
    if (new Date(endDate) < new Date(startDate)) {
      setBookingError('End date cannot be earlier than start date.');
      return;
    }

    if (resource.fairShareMaxDays && durationDays > resource.fairShareMaxDays) {
      setBookingError(
        `FairShare Policy Limit: You can only book this resource for a maximum of ${resource.fairShareMaxDays} consecutive days.`
      );
      return;
    }

    // 2. Training requirement enforcement
    if (resource.trainingRequired && !hasRequiredTraining) {
      setBookingError(
        `Eligibility Restriction: You have not completed the required "${resource.trainingCourseName}" training certification.`
      );
      return;
    }

    // 3. Concurrency check
    if (hasDateConflict()) {
      setBookingError('Conflict Detected: This equipment already has an approved reservation for the selected dates.');
      return;
    }

    try {
      setIsSubmitting(true);
      await createBooking({
        resourceId: resource.id,
        resourceName: resource.name,
        resourceCategory: resource.category,
        resourceImageUrl: resource.imageUrl,
        requesterId: currentUser?.id || 'user_student_rohit',
        requesterName: currentUser?.displayName || 'Campus Researcher',
        requesterEmail: currentUser?.email || 'harshsuryawanshi1976@gmail.com',
        ownerId: resource.ownerId,
        ownerName: resource.ownerName,
        startDate,
        endDate,
        totalDays: durationDays,
        rentalCost: totalRentalCost,
        securityDeposit: resource.securityDeposit,
        purpose: purpose || 'Academic research project.',
        status: resource.approvalRequired ? 'pending' : 'approved',
      });

      setBookingSuccess(true);
      setTimeout(() => {
        onBookingSuccess();
      }, 1500);
    } catch (err) {
      setBookingError('Failed to submit booking reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Equipment Catalog
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Equipment Info & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs">
            {/* Image */}
            <div className="relative aspect-16/9 w-full bg-slate-100">
              <img
                src={resource.imageUrl}
                alt={resource.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <StatusBadge status={resource.availability} size="md" />
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                  {resource.category}
                </span>
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="p-6">
              <h1 className="text-2xl font-extrabold text-slate-900">{resource.name}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{resource.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-slate-400" />
                  <span>{resource.institutionName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Managed by {resource.ownerName}</span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Overview</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{resource.description}</p>
              </div>

              {/* Specifications */}
              {resource.specifications && (
                <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Technical Specifications
                  </h3>
                  <p className="text-xs text-slate-600 font-mono leading-relaxed">{resource.specifications}</p>
                </div>
              )}

              {/* Included Accessories */}
              {resource.includedAccessories && resource.includedAccessories.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Included Bundled Components
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resource.includedAccessories.map((acc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Booking Request & Eligibility Box */}
        <div className="space-y-6">
          {/* Eligibility Badge Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Trust & Eligibility</h3>

            {resource.trainingRequired ? (
              hasRequiredTraining ? (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Training Requirement Met</p>
                    <p className="text-emerald-700 text-[11px] mt-0.5">
                      Your profile verifies completion of "{resource.trainingCourseName}".
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 text-amber-800 text-xs border border-amber-200">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Safety Certification Required</p>
                    <p className="text-amber-700 text-[11px] mt-0.5">
                      Requires certified completion of "{resource.trainingCourseName}" before checkout.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 text-slate-700 text-xs border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Open Student Access</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">No specialized safety training prerequisite.</p>
                </div>
              </div>
            )}

            <div className="text-xs text-slate-500 space-y-1.5 pt-2">
              <div className="flex justify-between">
                <span>FairShare Limit:</span>
                <span className="font-semibold text-slate-800">{resource.fairShareMaxDays || 5} days max</span>
              </div>
              <div className="flex justify-between">
                <span>Approval Policy:</span>
                <span className="font-semibold text-slate-800">
                  {resource.approvalRequired ? 'Lab In-Charge Sign-off' : 'Instant Confirmation'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Security Deposit:</span>
                <span className="font-semibold text-slate-800">{formatCurrencyINR(resource.securityDeposit)}</span>
              </div>
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div>
              <span className="text-2xl font-extrabold text-slate-900">
                {formatCurrencyINR(resource.rentalPricePerDay)}
              </span>
              <span className="text-xs text-slate-500"> /day</span>
            </div>

            {bookingSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-center space-y-2 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Booking Request Submitted!</h4>
                <p className="text-xs text-emerald-700">
                  Your reservation is logged. Redirecting to your bookings...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5">
                {bookingError && (
                  <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Purpose / Capstone Topic
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Briefly state your experimental plan or capstone project..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
                  />
                </div>

                {/* Calculation summary */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>
                      {formatCurrencyINR(resource.rentalPricePerDay)} × {durationDays} day(s)
                    </span>
                    <span>{formatCurrencyINR(totalRentalCost)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Refundable Deposit</span>
                    <span>{formatCurrencyINR(resource.securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-100 text-sm">
                    <span>Estimated Total</span>
                    <span className="text-teal-700">{formatCurrencyINR(totalRentalCost)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || resource.availability !== 'available'}
                  className="w-full py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Confirming Reservation...'
                    : resource.availability !== 'available'
                    ? 'Currently Unavailable'
                    : 'Request Reservation'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
