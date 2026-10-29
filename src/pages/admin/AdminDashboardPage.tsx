import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Building,
  FileText,
  Activity,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../lib/formatters';
import { DEMO_INSTITUTIONS, DEMO_USERS } from '../../data/seedData';

export const AdminDashboardPage: React.FC = () => {
  const { auditLogs, resources, bookings, incidents } = useData();
  const { currentUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'institutions' | 'users'>('audit');

  if (!isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center max-w-lg mx-auto my-12 space-y-3">
        <Lock className="w-10 h-10 text-amber-600 mx-auto" />
        <h3 className="font-bold text-slate-900 text-lg">Consortium Administrator Access Only</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Platform-wide moderation and immutable audit logs are restricted to Consortium Administrators. Use the persona switcher in the top bar to switch to the <strong>admin</strong> role for evaluation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consortium Administration & Audit Trail"
        description="System governance, participating institution agreements, user verification records, and immutable audit logging."
        badge={
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
            <ShieldAlert className="w-3.5 h-3.5 text-teal-400" /> SuperAdmin Mode
          </span>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 transition-colors ${
            activeTab === 'audit'
              ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Append-Only Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('institutions')}
          className={`pb-3 transition-colors ${
            activeTab === 'institutions'
              ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Participating Colleges ({DEMO_INSTITUTIONS.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 transition-colors ${
            activeTab === 'users'
              ? 'text-teal-700 border-b-2 border-teal-600 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Verified Personas ({DEMO_USERS.length})
        </button>
      </div>

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Immutable Security & State Transition Ledger</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every booking state update, condition handover, and moderation event is appended with server-validated timestamps.
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Append-Only / No Overwrites</span>
          </div>

          <div className="divide-y divide-slate-100 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-900 text-teal-300 rounded-sm font-bold text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-900 font-semibold">{log.entityType}: {log.entityId}</span>
                  </div>
                  {log.details && <p className="text-slate-600 text-[11px]">{log.details}</p>}
                </div>
                <div className="text-right text-slate-400 text-[11px] shrink-0">
                  <p>Actor: <span className="text-slate-700 font-semibold">{log.actorName}</span></p>
                  <p>{formatDateTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'institutions' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DEMO_INSTITUTIONS.map((inst) => (
            <div key={inst.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-teal-600" />
                <h4 className="font-bold text-slate-900 text-sm leading-tight">{inst.name}</h4>
              </div>
              <p className="text-xs text-slate-500">{inst.address}</p>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Sharing Policy:</span>
                <p className="text-[11px] mt-0.5 text-slate-500">{inst.resourceSharingPolicy}</p>
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-teal-700 font-semibold">
                <span>Verified Consortium Partner</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Registered Consortium Personas</h3>
          <div className="divide-y divide-slate-100">
            {DEMO_USERS.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{user.displayName}</h4>
                  <p className="text-xs text-slate-500">
                    {user.email} • {user.institutionName} • <span className="capitalize font-semibold text-teal-700">{user.role}</span>
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  Verified Contact
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
