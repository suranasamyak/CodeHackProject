import React, { useState } from 'react';
import { CheckSquare, Square, AlertCircle, Camera } from 'lucide-react';
import { Resource } from '../../types';

interface ConditionChecklistProps {
  type: 'check_out' | 'return';
  resourceName: string;
  includedAccessories?: string[];
  onSubmit: (condition: string, notes: string, accessoriesConfirmed: boolean, discrepancies?: string) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ConditionChecklist: React.FC<ConditionChecklistProps> = ({
  type,
  resourceName,
  includedAccessories = ['Power Adapter', 'Connection Cables', 'Protective Case'],
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [condition, setCondition] = useState<'pristine' | 'good' | 'wear_and_tear' | 'damaged'>('good');
  const [notes, setNotes] = useState('');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    includedAccessories.forEach((acc) => (init[acc] = true));
    return init;
  });
  const [discrepancies, setDiscrepancies] = useState('');

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const allAccessoriesChecked = includedAccessories.every((item) => checkedItems[item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(condition, notes, allAccessoriesChecked, discrepancies);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-md max-w-xl w-full space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">
          {type === 'check_out' ? 'Check-Out Condition Verification' : 'Return Equipment & Inspection'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Documenting state for: <span className="font-semibold text-slate-700">{resourceName}</span>
        </p>
      </div>

      {/* Condition Selection */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">Overall Physical Condition *</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'pristine', label: 'Pristine / Like New', color: 'border-emerald-200 hover:border-emerald-500' },
            { id: 'good', label: 'Good Working', color: 'border-teal-200 hover:border-teal-500' },
            { id: 'wear_and_tear', label: 'Normal Wear', color: 'border-amber-200 hover:border-amber-500' },
            { id: 'damaged', label: 'Issue / Damaged', color: 'border-rose-200 hover:border-rose-500' },
          ].map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setCondition(item.id as any)}
              className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                condition === item.id
                  ? 'border-teal-600 bg-teal-50/50 text-teal-800 font-semibold ring-1 ring-teal-600'
                  : `bg-slate-50 text-slate-700 ${item.color}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accessories Verification Checklist */}
      <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200/80">
        <label className="block text-xs font-semibold text-slate-800 mb-2">
          Verify Included Accessories & Bundled Parts:
        </label>
        <div className="space-y-2">
          {includedAccessories.map((item) => {
            const isChecked = checkedItems[item];
            return (
              <div
                key={item}
                onClick={() => toggleItem(item)}
                className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 hover:text-slate-900 select-none"
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-teal-600 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-slate-300 shrink-0" />
                )}
                <span className={isChecked ? 'font-medium' : 'text-slate-400 line-through'}>{item}</span>
              </div>
            );
          })}
        </div>

        {!allAccessoriesChecked && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <label className="block text-xs font-semibold text-amber-800 mb-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Missing Accessory Details:
            </label>
            <input
              type="text"
              required
              value={discrepancies}
              onChange={(e) => setDiscrepancies(e.target.value)}
              placeholder="Specify missing cables or components..."
              className="w-full text-xs bg-white border border-amber-300 rounded-md p-2 focus:ring-1 focus:ring-amber-500"
            />
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Inspection Notes & Test Observations *
        </label>
        <textarea
          rows={3}
          required
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Powered on successfully; screen clean; calibrated on channel 1; battery at 100%..."
          className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* Button controls */}
      <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !notes.trim()}
          className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
        >
          {isLoading ? 'Saving Report...' : type === 'check_out' ? 'Confirm Check-Out' : 'Confirm Return'}
        </button>
      </div>
    </form>
  );
};
