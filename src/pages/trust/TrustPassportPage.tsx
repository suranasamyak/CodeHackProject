import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Building,
  User,
  BookOpen,
  Plus,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

export const TrustPassportPage: React.FC = () => {
  const { currentUser, isManagerOrAdmin, updateProfile } = useAuth();
  const { resources, bookings, incidents } = useData();

  const [newTrainingInput, setNewTrainingInput] = useState('');
  const [showAddTraining, setShowAddTraining] = useState(false);

  // Active user's completed trainings
  const trainings = currentUser?.completedTrainings || ['Basic Electronics Safety'];
  const qualifications = currentUser?.approvedQualifications || ['B.Tech Final Year Student'];

  // Calculate return reliability based on actual bookings
  const myCompletedBookings = bookings.filter(
    (b) => (b.requesterId === currentUser?.id || b.requesterEmail === currentUser?.email) && b.status === 'completed'
  );
  const myIncidents = incidents.filter(
    (inc) => inc.reportedBy === currentUser?.id || inc.reporterName === currentUser?.displayName
  );

  const handleAddTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainingInput.trim()) return;

    const updated = [...trainings, newTrainingInput.trim()];
    await updateProfile({ completedTrainings: updated });
    setNewTrainingInput('');
    setShowAddTraining(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Digital Trust Passport"
        description="Transparent qualification and safety compliance system. We verify eligibility per resource rather than reducing researchers to arbitrary reputation scores."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Institutional Verified
          </span>
        }
      />

      {/* User Passport Identity Card */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-2xl shadow-sm ring-4 ring-teal-50">
            {currentUser?.displayName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{currentUser?.displayName}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200 capitalize">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{currentUser?.email} • {currentUser?.phone}</p>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {currentUser?.institutionName || 'COEP Technological University'} ({currentUser?.department || 'Engineering'})
            </p>
          </div>
        </div>

        {/* Passport Stats */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 w-full md:w-auto justify-between md:justify-start">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Verified Returns</p>
            <p className="text-lg font-bold text-slate-900">{myCompletedBookings.length} completed</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Open Incidents</p>
            <p className="text-lg font-bold text-emerald-600">{myIncidents.length === 0 ? '0 (Clean)' : myIncidents.length}</p>
          </div>
        </div>
      </div>

      {/* Training & Qualifications Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed Safety Training Certifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <h3 className="font-bold text-slate-900 text-sm">Completed Safety Certifications</h3>
            </div>
            {isManagerOrAdmin && (
              <button
                onClick={() => setShowAddTraining(!showAddTraining)}
                className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Certify New
              </button>
            )}
          </div>

          {showAddTraining && (
            <form onSubmit={handleAddTraining} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Course / Workshop Title</label>
              <input
                type="text"
                required
                value={newTrainingInput}
                onChange={(e) => setNewTrainingInput(e.target.value)}
                placeholder="e.g. 3D Printing Safety Master, High Voltage Lab"
                className="w-full text-xs p-2 bg-white border border-slate-300 rounded-md"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTraining(false)}
                  className="px-2.5 py-1 text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-semibold bg-teal-600 text-white rounded-md"
                >
                  Issue Certification
                </button>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {trainings.map((cert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-teal-50/50 border border-teal-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">{cert}</p>
                    <p className="text-[11px] text-slate-500">Verified by Consortium FabLab Coordinator</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-white px-2 py-0.5 rounded-full border border-teal-200">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Approved Qualifications */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Award className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Academic Qualifications & Clearance</h3>
          </div>

          <div className="space-y-2">
            {qualifications.map((qual, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/40 border border-emerald-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">{qual}</p>
                    <p className="text-[11px] text-slate-500">COEP Registrar & Department Attestation</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment-Specific Access Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Resource-Specific Access Matrix</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time evaluation of your eligibility across registered high-value campus instruments.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {resources.slice(0, 6).map((res) => {
            const meetsTraining =
              !res.trainingRequired ||
              (res.trainingCourseName && trainings.includes(res.trainingCourseName));

            return (
              <div key={res.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{res.name}</h4>
                  <p className="text-xs text-slate-500">
                    {res.category} • {res.location}
                    {res.trainingRequired && (
                      <span className="text-amber-700 ml-1.5 font-medium">
                        (Prerequisite: {res.trainingCourseName})
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  {meetsTraining ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Eligible for Booking
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> Training Required
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
