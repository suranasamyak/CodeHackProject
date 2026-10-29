import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-5">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
