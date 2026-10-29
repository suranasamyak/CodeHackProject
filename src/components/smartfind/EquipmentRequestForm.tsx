import React, { useState } from 'react';
import { EquipmentRequest, ResourceCategory, UrgencyLevel } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface EquipmentRequestFormProps {
  onSubmit: (data: Omit<EquipmentRequest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const EquipmentRequestForm: React.FC<EquipmentRequestFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { currentUser } = useAuth();

  const [equipmentName, setEquipmentName] = useState('');
  const [category, setCategory] = useState<ResourceCategory>('Electronics');
  const [technicalRequirements, setTechnicalRequirements] = useState('');
  const [purpose, setPurpose] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3600000 * 24 * 3).toISOString().split('T')[0]
  );
  const [maxBudget, setMaxBudget] = useState(1000);
  const [preferredLocation, setPreferredLocation] = useState('Pune (within 10 km of COEP or MIT-WPU)');
  const [urgency, setUrgency] = useState<UrgencyLevel>('medium');

  const categories: ResourceCategory[] = [
    'Electronics',
    'Laboratory',
    'Computing',
    'Fabrication',
    'Audio & Video',
    'Robotics',
    'Engineering Tools',
    'Workspaces',
    'Specialized',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentName.trim()) return;

    await onSubmit({
      requesterId: currentUser?.id || 'user_student_rohit',
      requesterName: currentUser?.displayName || 'Campus Researcher',
      equipmentName,
      category,
      technicalRequirements,
      purpose,
      quantity: Number(quantity),
      startDate,
      endDate,
      maxBudget: Number(maxBudget),
      preferredLocation,
      urgency,
      status: 'open',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900">Broadcast Missing Equipment Demand</h3>
        <p className="text-xs text-slate-500 mt-1">
          Can't find what you need in the catalog? Post a SmartFind request to notify participating institutional laboratories and equipment owners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Equipment Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment / Instrument Name *</label>
          <input
            type="text"
            required
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
            placeholder="e.g. FLIR Thermal Imaging Camera or High-Speed Digital Storage Oscilloscope"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-1 focus:ring-teal-500"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ResourceCategory)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level</label>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          >
            <option value="low">Low (Next few weeks)</option>
            <option value="medium">Medium (Within 7 days)</option>
            <option value="high">High (Urgent Capstone / Demo)</option>
            <option value="critical">Critical (Immediate 48h deadline)</option>
          </select>
        </div>

        {/* Technical Requirements */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Requirements & Specifications *</label>
          <textarea
            rows={3}
            required
            value={technicalRequirements}
            onChange={(e) => setTechnicalRequirements(e.target.value)}
            placeholder="Minimum bandwidth, channels, resolution, operating temperature, probe types, sensitivity..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Purpose */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Project Purpose & Academic Context</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="e.g. Final Year B.Tech Capstone Project on EV Motor Driver Thermal Profiling"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Required Start Date *</label>
          <input
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Required End Date *</label>
          <input
            type="date"
            required
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Max Budget */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Max Total Budget (₹ INR) *</label>
          <input
            type="number"
            min="0"
            required
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Location Preference */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Location / Distance Limit</label>
          <input
            type="text"
            value={preferredLocation}
            onChange={(e) => setPreferredLocation(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-2xs disabled:opacity-50"
        >
          {isLoading ? 'Broadcasting...' : 'Publish Equipment Demand'}
        </button>
      </div>
    </form>
  );
};
