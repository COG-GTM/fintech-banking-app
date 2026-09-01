'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ErrorBoundary from '@/components/analytics/ErrorBoundary';
import { DemoModeProvider } from '@/contexts/DemoModeContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { AlertProvider } from '@/contexts/AlertContext';
import OnboardingModal from '@/components/mobile/OnboardingModal';
import DemoNotifications from '@/components/demo/DemoNotifications';
import CommandPalette from '@/components/ui/CommandPalette';
import SessionTimeoutModal, { AutoLogoutHandler } from '@/components/security/SessionTimeoutModal';
import { performanceMonitor } from '@/utils/PerformanceMonitor';
import dynamic from 'next/dynamic';

// Lazy load performance dashboard only in development
const PerformanceDashboard = dynamic(
  () => import('@/components/performance/PerformanceDashboard'),
  { ssr: false }
);

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Track layout render performance
  useEffect(() => {
    performanceMonitor.mark('authenticated-layout-mount');
    return () => {
      performanceMonitor.measure('authenticated-layout', 'authenticated-layout-mount');
    };
  }, []);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  return (
    <ProtectedRoute>
      <AlertProvider>
        <SecurityProvider>
          <DemoModeProvider>
            <ErrorBoundary>
            <div className="min-h-screen flex flex-col relative">
              <Header />
              <main className="min-h-screen flex-1 relative bg-[var(--bg-color-alpha)] backdrop-blur-sm">
                <div className="h-16"></div>
                {children}
              </main>
              <Footer />
            </div>
            <OnboardingModal 
              isOpen={showOnboarding} 
              onClose={() => setShowOnboarding(false)} 
            />
            <CommandPalette />
            <DemoNotifications />
            <SessionTimeoutModal />
            <AutoLogoutHandler />
              {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
            </ErrorBoundary>
          </DemoModeProvider>
        </SecurityProvider>
      </AlertProvider>
    </ProtectedRoute>
  );
}