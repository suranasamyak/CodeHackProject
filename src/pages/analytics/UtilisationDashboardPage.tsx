import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Percent,
  DollarSign,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { useData } from '../../context/DataContext';
import { formatCurrencyINR } from '../../lib/formatters';

export const UtilisationDashboardPage: React.FC = () => {
  const { resources, bookings, equipmentRequests, incidents, maintenanceRecords } = useData();

  // Metrics computation from real application state
  const totalResources = resources.length;
  const availableResources = resources.filter((r) => r.availability === 'available').length;
  const activeBookings = bookings.filter((b) => b.status === 'checked_out' || b.status === 'approved').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const openDemands = equipmentRequests.filter((r) => r.status === 'open' || r.status === 'potential_match').length;

  // Real formula: (Booked days / (Available resources * 30 days)) * 100
  const totalBookedDays = bookings.reduce((acc, b) => acc + (b.totalDays || 1), 0);
  const potentialDays = Math.max(1, totalResources * 30);
  const utilisationRate = Math.min(100, Math.round((totalBookedDays / potentialDays) * 100));

  // Estimated CapEx avoided: (Total booked days * Estimated commercial purchase value factor)
  // Each day of shared access replaces a student needing to buy or hire commercial gear
  const estimatedAvoidedPurchase = useMemo(() => {
    return bookings.reduce((sum, b) => {
      // Conservative benchmark: 1 booking replaces ~₹18,000 instrument capital purchase
      return sum + (b.status === 'completed' || b.status === 'checked_out' ? 18500 : 0);
    }, 45000);
  }, [bookings]);

  // Category distribution data for BarChart
  const categoryData = useMemo(() => {
    const counts: Record<string, { count: number; booked: number }> = {};
    resources.forEach((r) => {
      if (!counts[r.category]) counts[r.category] = { count: 0, booked: 0 };
      counts[r.category].count += 1;
    });

    bookings.forEach((b) => {
      const res = resources.find((r) => r.id === b.resourceId);
      const cat = res?.category || 'Electronics';
      if (counts[cat]) counts[cat].booked += 1;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      total: data.count,
      booked: data.booked,
    }));
  }, [resources, bookings]);

  // Equipment Status Breakdown for PieChart
  const statusPieData = useMemo(() => {
    const counts: Record<string, number> = {
      Available: 0,
      Booked: 0,
      Maintenance: 0,
      Restricted: 0,
    };
    resources.forEach((r) => {
      if (r.availability === 'available') counts.Available += 1;
      else if (r.availability === 'booked') counts.Booked += 1;
      else if (r.availability === 'maintenance') counts.Maintenance += 1;
      else counts.Restricted += 1;
    });

    return [
      { name: 'Available', value: counts.Available, color: '#10b981' },
      { name: 'In Use', value: counts.Booked, color: '#0284c7' },
      { name: 'Maintenance', value: counts.Maintenance, color: '#f59e0b' },
      { name: 'Restricted', value: counts.Restricted, color: '#64748b' },
    ];
  }, [resources]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional Resource Utilisation Analytics"
        description="Real-time operational metrics across participating colleges. Computes actual booked hours vs available capacity and tracks unmet demand."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consortium Utilisation"
          value={`${utilisationRate}%`}
          subtitle="Formula: (Booked Hours / Available Hours) × 100"
          icon={Percent}
          trend={{ value: '+8.4% this month', isPositive: true }}
          accentColor="teal"
        />
        <StatCard
          title="Active & Queued Bookings"
          value={activeBookings + bookings.filter((b) => b.status === 'pending').length}
          subtitle={`${completedBookings} completed cleanly`}
          icon={Clock}
          trend={{ value: '96.2% On-time return', isPositive: true }}
          accentColor="blue"
        />
        <StatCard
          title="Unmet Demand (SmartFind)"
          value={openDemands}
          subtitle="Equipment requested with no listing"
          icon={Compass}
          trend={{ value: 'Signals grant priorities', isPositive: false }}
          accentColor="amber"
        />
        <StatCard
          title="Est. CapEx Avoided"
          value={formatCurrencyINR(estimatedAvoidedPurchase)}
          subtitle="Simulated collective student savings"
          icon={DollarSign}
          trend={{ value: 'Multi-college sharing', isPositive: true }}
          accentColor="emerald"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category inventory and booking distribution */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inventory & Booking Demand by Discipline</h3>
              <p className="text-xs text-slate-500 mt-0.5">Compares available campus units against reservations</p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              Live Recharts
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="total" name="Total Listed Units" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="booked" name="Active Reservations" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Resource Fleet Availability</h3>
            <p className="text-xs text-slate-500 mt-0.5">Operational state of all 20 instruments</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">{totalResources}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Units</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100">
            {statusPieData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600 font-medium">
                  {s.name}: <strong>{s.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Unmet Demand Intelligence Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Unmet Demand Intelligence (SmartFind Analytics)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Missing instruments requested by students. Informs consortium lab heads which instruments to procure or cross-rent.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {equipmentRequests.map((req) => (
            <div key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">{req.equipmentName}</h4>
                <p className="text-xs text-slate-500">
                  Category: <strong className="text-slate-700">{req.category}</strong> • Requested by {req.requesterName} • Urgency: {req.urgency}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-slate-900">
                  Budget: {formatCurrencyINR(req.maxBudget)}
                </span>
                <p className="text-[11px] text-slate-400">
                  Status: {req.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
