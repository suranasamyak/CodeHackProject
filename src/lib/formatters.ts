/**
 * ResourceLoop - Formatting utilities for currency, dates, and statuses
 */

export function formatCurrencyINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string | undefined | null): string {
  if (!dateTimeString) return '—';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateTimeString;
  }
}

export function calculateDurationDays(start: string, end: string): number {
  if (!start || !end) return 1;
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (isNaN(s) || isNaN(e) || e < s) return 1;
  const diffDays = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function getStatusColor(status: string): { bg: string; text: string; border: string; dot: string } {
  switch (status.toLowerCase()) {
    case 'available':
    case 'approved':
    case 'completed':
    case 'operational':
    case 'verified':
    case 'matched':
    case 'fulfilled':
    case 'pristine':
    case 'resolved':
      return {
        bg: 'bg-emerald-50 text-emerald-700',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'pending':
    case 'awaiting_provider':
    case 'potential_match':
    case 'scheduled':
    case 'under_review':
    case 'investigating':
      return {
        bg: 'bg-amber-50 text-amber-700',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'checked_out':
    case 'in_progress':
    case 'open':
    case 'good':
      return {
        bg: 'bg-sky-50 text-sky-700',
        text: 'text-sky-700',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'returned_pending_inspection':
    case 'needs_service':
    case 'in_repair':
    case 'wear_and_tear':
      return {
        bg: 'bg-purple-50 text-purple-700',
        text: 'text-purple-700',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'rejected':
    case 'cancelled':
    case 'maintenance':
    case 'restricted':
    case 'damaged':
    case 'closed':
    case 'unverified':
      return {
        bg: 'bg-rose-50 text-rose-700',
        text: 'text-rose-700',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function formatStatusLabel(status: string): string {
  if (!status) return '';
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
