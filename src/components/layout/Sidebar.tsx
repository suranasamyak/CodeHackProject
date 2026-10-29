import React from 'react';
import {
  Layers,
  Search,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  Repeat,
  AlertTriangle,
  Wrench,
  BarChart3,
  ShieldAlert,
  Home,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isOpen = false,
  onClose,
}) => {
  const { currentUser, isOwnerOrAdmin, isAdmin } = useAuth();

  const mainNav = [
    { label: 'Explore Catalog', path: '/resources', icon: Layers },
    { label: 'SmartFind Requests', path: '/smartfind', icon: Search, badge: 'Demands' },
    { label: 'AI Matcher', path: '/ai-assistant', icon: Sparkles, highlight: true },
    { label: 'My Bookings', path: '/bookings', icon: CalendarCheck },
    { label: 'Trust Passport', path: '/trust-passport', icon: ShieldCheck },
    { label: 'Check-in & Return', path: '/lifecycle', icon: Repeat },
  ];

  const operationalNav = [
    { label: 'Incident Reports', path: '/incidents', icon: AlertTriangle },
    { label: 'Equipment Maintenance', path: '/maintenance', icon: Wrench },
    { label: 'Utilisation Analytics', path: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ label: 'Consortium Admin', path: '/admin', icon: ShieldAlert }] : []),
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div
            onClick={() => handleLinkClick('/')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="h-9 w-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <Repeat className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Resource<span className="text-teal-600">Loop</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Institutional Network
              </span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Workflows */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resource Operations
            </p>
            <nav className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleLinkClick(item.path)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-teal-600'
                            : item.highlight
                            ? 'text-teal-500'
                            : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Institutional Management */}
          <div>
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Trust & Governance
            </p>
            <nav className="space-y-1">
              {operationalNav.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleLinkClick(item.path)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-teal-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Action: List Equipment */}
          {isOwnerOrAdmin && (
            <div className="pt-2 px-1">
              <button
                onClick={() => handleLinkClick('/resources/create')}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white px-3 py-2 text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <PlusCircle className="w-4 h-4 text-teal-400" />
                List New Equipment
              </button>
            </div>
          )}
        </div>

        {/* Footer info: Hackathon Badge */}
        <div className="border-t border-slate-200 p-3 bg-slate-50/50">
          <div className="rounded-lg bg-white p-3 border border-slate-200/80 shadow-2xs text-xs">
            <div className="flex items-center gap-2 text-slate-800 font-medium mb-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Multi-College Network</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Consortium of 3 participating colleges sharing lab and fabrication instruments.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
