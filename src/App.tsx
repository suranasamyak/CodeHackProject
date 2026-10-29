import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { ExploreResourcesPage } from './pages/resources/ExploreResourcesPage';
import { ResourceDetailsPage } from './pages/resources/ResourceDetailsPage';
import { CreateResourcePage } from './pages/resources/CreateResourcePage';
import { SmartFindPage } from './pages/smartfind/SmartFindPage';
import { ResourceAssistantPage } from './pages/ai/ResourceAssistantPage';
import { MyBookingsPage } from './pages/bookings/MyBookingsPage';
import { TrustPassportPage } from './pages/trust/TrustPassportPage';
import { LifecyclePage } from './pages/lifecycle/LifecyclePage';
import { IncidentReportPage } from './pages/lifecycle/IncidentReportPage';
import { MaintenanceDashboardPage } from './pages/maintenance/MaintenanceDashboardPage';
import { UtilisationDashboardPage } from './pages/analytics/UtilisationDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { Resource } from './types';

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>('/resources');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>('');
  const { resources } = useData();

  // Support browser back/forward buttons smoothly
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.hash.replace('#', '') || '/resources';
      setCurrentPath(path);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectResource = (resource: Resource) => {
    setSelectedResource(resource);
    navigateTo(`/resource/${resource.id}`);
  };

  const handleNavigateToBooking = (resourceId: string) => {
    const res = resources.find((r) => r.id === resourceId);
    if (res) {
      setSelectedResource(res);
      navigateTo(`/resource/${res.id}`);
    } else {
      navigateTo('/bookings');
    }
  };

  const handleLandingSearch = (query: string) => {
    setSearchInitialQuery(query);
    navigateTo('/resources');
  };

  // Render appropriate view based on path
  const renderCurrentView = () => {
    if (currentPath === '/') {
      return (
        <LandingPage
          onNavigate={navigateTo}
          onSearch={handleLandingSearch}
        />
      );
    }

    if (currentPath.startsWith('/resource/')) {
      const resId = currentPath.replace('/resource/', '');
      const activeRes = selectedResource || resources.find((r) => r.id === resId) || resources[0];
      return (
        <ResourceDetailsPage
          resource={activeRes}
          onBack={() => navigateTo('/resources')}
          onBookingSuccess={() => navigateTo('/bookings')}
        />
      );
    }

    if (currentPath === '/resources/create') {
      return (
        <CreateResourcePage
          onBack={() => navigateTo('/resources')}
          onSuccess={() => navigateTo('/resources')}
        />
      );
    }

    if (currentPath === '/smartfind') {
      return (
        <SmartFindPage
          onNavigateToBooking={handleNavigateToBooking}
          onNavigateToResource={handleNavigateToBooking}
        />
      );
    }

    if (currentPath === '/ai-assistant') {
      return (
        <ResourceAssistantPage
          onNavigateToBooking={handleNavigateToBooking}
          onNavigateToResource={handleNavigateToBooking}
        />
      );
    }

    if (currentPath === '/bookings') {
      return <MyBookingsPage onNavigateToExplore={() => navigateTo('/resources')} />;
    }

    if (currentPath === '/trust-passport') {
      return <TrustPassportPage />;
    }

    if (currentPath === '/lifecycle') {
      return <LifecyclePage />;
    }

    if (currentPath === '/incidents') {
      return <IncidentReportPage />;
    }

    if (currentPath === '/maintenance') {
      return <MaintenanceDashboardPage />;
    }

    if (currentPath === '/analytics') {
      return <UtilisationDashboardPage />;
    }

    if (currentPath === '/admin') {
      return <AdminDashboardPage />;
    }

    // Default to explore resources catalog
    return (
      <ExploreResourcesPage
        initialQuery={searchInitialQuery}
        onSelectResource={handleSelectResource}
        onNavigateToSmartFind={() => navigateTo('/smartfind')}
        onCreateResource={() => navigateTo('/resources/create')}
      />
    );
  };

  return (
    <AppLayout currentPath={currentPath} onNavigate={navigateTo}>
      {renderCurrentView()}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}
