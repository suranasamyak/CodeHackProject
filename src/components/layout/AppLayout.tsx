import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNavigation } from './MobileNavigation';

interface AppLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentPath, onNavigate, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900 antialiased flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* Topbar */}
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />

        {/* Dynamic page content */}
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-7xl w-full mx-auto pb-24 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation currentPath={currentPath} onNavigate={onNavigate} />
    </div>
  );
};
