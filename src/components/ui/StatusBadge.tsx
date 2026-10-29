import React from 'react';
import { getStatusColor, formatStatusLabel } from '../../lib/formatters';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const colors = getStatusColor(status);
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colors.bg} ${colors.border} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />}
      {formatStatusLabel(status)}
    </span>
  );
};
