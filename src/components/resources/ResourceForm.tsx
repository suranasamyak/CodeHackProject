import React, { useState } from 'react';
import { Resource, ResourceCategory } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ResourceFormProps {
  initialData?: Partial<Resource>;
  onSubmit: (data: Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { currentUser } = useAuth();

  const [name, setName] = useState(initialData?.name || '');
  const [category, setCategory] = useState<ResourceCategory>(initialData?.category || 'Electronics');
  const [description, setDescription] = useState(initialData?.description || '');
  const [specifications, setSpecifications] = useState(initialData?.specifications || '');
  const [imageUrl, setImageUrl] = useState(
    initialData?.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'
  );
  const [location, setLocation] = useState(initialData?.location || 'Central Instrumentation Lab, COEP');
  const [rentalPricePerDay, setRentalPricePerDay] = useState<number>(initialData?.rentalPricePerDay || 200);
  const [securityDeposit, setSecurityDeposit] = useState<number>(initialData?.securityDeposit || 2000);
  const [trainingRequired, setTrainingRequired] = useState<boolean>(initialData?.trainingRequired || false);
  const [trainingCourseName, setTrainingCourseName] = useState(initialData?.trainingCourseName || '');
  const [approvalRequired, setApprovalRequired] = useState<boolean>(initialData?.approvalRequired ?? true);
  const [fairShareMaxDays, setFairShareMaxDays] = useState<number>(initialData?.fairShareMaxDays || 5);
  const [accessoriesText, setAccessoriesText] = useState(
    initialData?.includedAccessories ? initialData.includedAccessories.join(', ') : 'Power Cable, User Manual'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const accessories = accessoriesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    await onSubmit({
      ownerId: currentUser?.id || 'user_owner_lab',
      ownerName: currentUser?.displayName || 'Campus Equipment Lead',
      ownerEmail: currentUser?.email || 'owner@coep.ac.in',
      institutionId: currentUser?.institutionId || 'inst_coep_tech',
      institutionName: currentUser?.institutionName || 'COEP Technological University',
      name,
      category,
      description,
      specifications,
      imageUrl,
      location,
      rentalPricePerDay: Number(rentalPricePerDay),
      securityDeposit: Number(securityDeposit),
      availability: initialData?.availability || 'available',
      condition: initialData?.condition || 'excellent',
      maintenanceStatus: initialData?.maintenanceStatus || 'operational',
      trainingRequired,
      trainingCourseName: trainingRequired ? trainingCourseName : undefined,
      approvalRequired,
      fairShareMaxDays: Number(fairShareMaxDays),
      includedAccessories: accessories,
    });
  };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rigol DS1054Z Digital Storage Oscilloscope"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
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

        {/* Location */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Physical Location / Room *</label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Room 204, North Wing, COEP"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Rental Price */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Rental Price / Day (₹ INR) *</label>
          <input
            type="number"
            min="0"
            required
            value={rentalPricePerDay}
            onChange={(e) => setRentalPricePerDay(Number(e.target.value))}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Security Deposit */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Security Deposit (₹ INR) *</label>
          <input
            type="number"
            min="0"
            required
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(Number(e.target.value))}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* FairShare Max Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            FairShare Max Rental (Consecutive Days)
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={fairShareMaxDays}
            onChange={(e) => setFairShareMaxDays(Number(e.target.value))}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
          <p className="text-[10px] text-slate-400 mt-1">Prevents resource monopolization across student cohorts.</p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Photo Image URL</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Overview</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the instrument, its capabilities and condition..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Specifications */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Specifications</label>
          <textarea
            rows={2}
            value={specifications}
            onChange={(e) => setSpecifications(e.target.value)}
            placeholder="Bandwidth, channels, tolerances, supply limits, resolution..."
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Accessories */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">Included Accessories (comma-separated)</label>
          <input
            type="text"
            value={accessoriesText}
            onChange={(e) => setAccessoriesText(e.target.value)}
            placeholder="e.g. 4x Probes, Power Adapter, Ground Clips, Carrying Case"
            className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
          />
        </div>

        {/* Training & Approval Governance */}
        <div className="md:col-span-2 pt-2 border-t border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Access Governance</h4>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={trainingRequired}
                onChange={(e) => setTrainingRequired(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Requires Certified Safety Training</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={approvalRequired}
                onChange={(e) => setApprovalRequired(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>Requires Owner / Lab In-Charge Approval</span>
            </label>
          </div>

          {trainingRequired && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">Training Course Name</label>
              <input
                type="text"
                value={trainingCourseName}
                onChange={(e) => setTrainingCourseName(e.target.value)}
                placeholder="e.g. Basic Electronics Safety, 3D Printing Safety Master"
                className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Equipment' : 'List Equipment'}
        </button>
      </div>
    </form>
  );
};
