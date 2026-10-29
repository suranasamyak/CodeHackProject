import React from 'react';
import { Layers, Search, Sparkles, CalendarCheck, Repeat } from 'lucide-react';

interface MobileNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ currentPath, onNavigate }) => {
  const items = [
    { label: 'Catalog', path: '/resources', icon: Layers },
    { label: 'SmartFind', path: '/smartfind', icon: Search },
    { label: 'AI Match', path: '/ai-assistant', icon: Sparkles },
    { label: 'Bookings', path: '/bookings', icon: CalendarCheck },
    { label: 'Check-in', path: '/lifecycle', icon: Repeat },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 flex h-16 border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md md:hidden justify-around items-center">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path;
        return (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center justify-center w-16 py-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-teal-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};
