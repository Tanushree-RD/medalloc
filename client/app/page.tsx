'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarTab } from '@/components/dashboard/Sidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { StatCards } from '@/components/dashboard/StatCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { RecentRequestsTable } from '@/components/dashboard/RecentRequestsTable';
import { EmergencyAlertsPanel } from '@/components/dashboard/EmergencyAlertsPanel';
import { EmergencyRequestView } from '@/components/views/EmergencyRequestView';
import { HospitalsView } from '@/components/views/HospitalsView';
import { InventoryView } from '@/components/views/InventoryView';
import { AnalyticsView } from '@/components/views/AnalyticsView';
import { ErrorCard } from '@/components/ui/ErrorCard';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { useDashboard } from '@/hooks/useDashboard';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useRequests } from '@/hooks/useRequests';
import { HeartPulse, RefreshCw, Cpu } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Live Backend Hooks
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboard();
  const { analytics, isLoading: analyticsLoading, error: analyticsError, refetch: refetchAnalytics } = useAnalytics();
  const { requests, isLoading: requestsLoading, error: requestsError, refetch: refetchRequests } = useRequests();

  // Helper to add toast notifications
  const addToast = (type: 'error' | 'success' | 'info', message: string, title?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Show toast notification on error
  useEffect(() => {
    if (statsError) {
      addToast('error', statsError, 'Dashboard Stats Error');
    }
  }, [statsError]);

  useEffect(() => {
    if (analyticsError) {
      addToast('error', analyticsError, 'Analytics Stream Error');
    }
  }, [analyticsError]);

  useEffect(() => {
    if (requestsError) {
      addToast('error', requestsError, 'Emergency Requests Error');
    }
  }, [requestsError]);

  const handleGlobalRefresh = () => {
    refetchStats();
    refetchAnalytics();
    refetchRequests();
    addToast('info', 'Synchronizing regional hospital telemetries with Express API...', 'Network Sync');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-blue-500/20">
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Collapsible Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Top Navigation Bar */}
        <TopNavbar
          onOpenMobileSidebar={() => setMobileOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto w-full">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">
                <HeartPulse className="h-4 w-4" />
                <span>Regional Medical Dispatch & Resource Optimization</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {activeTab === 'Dashboard' ? 'Emergency Dispatch Command Center' : activeTab}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time multi-hospital triage connected to Express.js API & C17 Algorithmic Engine
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-medium text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Express Backend: <strong className="text-slate-900">Connected</strong></span>
              </span>

              <button
                onClick={handleGlobalRefresh}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs font-semibold transition-all hover:shadow-blue-500/20"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync Network</span>
              </button>
            </div>
          </div>

          {/* Connection Error Banner if backend is offline */}
          {(statsError || analyticsError || requestsError) && (
            <ErrorCard
              title="Backend Telemetry Alert"
              message={statsError || analyticsError || requestsError || 'Unable to communicate with the Express backend service.'}
              onRetry={handleGlobalRefresh}
            />
          )}

          {/* Tab 1: Main Dashboard */}
          {activeTab === 'Dashboard' && (
            <>
              {/* 1. Statistic Cards (6 Cards powered by backend API) */}
              <section aria-label="Key Performance Indicators">
                <StatCards cards={stats?.statCards} isLoading={statsLoading} />
              </section>

              {/* 2. Emergency Alerts Panel */}
              <section aria-label="Emergency Alerts">
                <EmergencyAlertsPanel />
              </section>

              {/* 3. Recharts Section (Trend, Distribution, Capacity) */}
              <section aria-label="Resource and Allocation Charts">
                <ChartsSection data={analytics} isLoading={analyticsLoading} />
              </section>

              {/* 4. Recent Requests Table (Live Requests from Backend) */}
              <section aria-label="Recent Emergency Requests">
                <RecentRequestsTable
                  requests={requests}
                  isLoading={requestsLoading}
                  searchFilter={searchQuery}
                  onRefresh={refetchRequests}
                />
              </section>
            </>
          )}

          {/* Tab 2: Emergency Requests View */}
          {activeTab === 'Emergency Requests' && (
            <div className="space-y-8">
              <EmergencyRequestView
                onSuccessAllocation={(res) => {
                  refetchRequests();
                  refetchStats();
                  addToast(
                    'success',
                    `Patient allocated to ${res.assignedHospital} (${res.distance} km away). Estimated response: ${res.estimatedResponseTime}`,
                    'Allocation Confirmed'
                  );
                }}
                onErrorToast={(msg) => addToast('error', msg, 'Allocation Error')}
              />

              <div className="pt-4">
                <RecentRequestsTable
                  requests={requests}
                  isLoading={requestsLoading}
                  searchFilter={searchQuery}
                  onRefresh={refetchRequests}
                />
              </div>
            </div>
          )}

          {/* Tab 3: Hospitals View */}
          {activeTab === 'Hospitals' && (
            <HospitalsView />
          )}

          {/* Tab 4: Live Inventory View */}
          {activeTab === 'Inventory' && (
            <InventoryView />
          )}

          {/* Tab 5: Allocation Engine View */}
          {activeTab === 'Allocation Engine' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">C Algorithm Engine (C17)</h3>
                    <p className="text-xs text-slate-500">
                      Independent compiled binary executing Max-Heap Priority Queue, Hash Map O(1) Search, Dijkstra, and Kuhn Augmenting Path
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Binary Location</span>
                    <p className="font-mono text-xs font-semibold text-slate-900">dsa/build/allocator.exe</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">IPC Protocol</span>
                    <p className="font-mono text-xs font-semibold text-slate-900">child_process.spawn() JSON</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Matching Complexity</span>
                    <p className="font-mono text-xs font-semibold text-emerald-600">O(V × E) Kuhn Algorithm</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs text-slate-500 font-medium">Average Latency</span>
                    <p className="font-mono text-xs font-semibold text-blue-600">&lt; 0.1ms execution</p>
                  </div>
                </div>
              </div>

              <EmergencyRequestView
                onSuccessAllocation={(res) => {
                  refetchRequests();
                  refetchStats();
                  addToast(
                    'success',
                    `C Engine dispatched request to ${res.assignedHospital} (${res.distance} km).`,
                    'Engine Matched'
                  );
                }}
                onErrorToast={(msg) => addToast('error', msg, 'Engine Error')}
              />
            </div>
          )}

          {/* Tab 6: Analytics View */}
          {activeTab === 'Analytics' && (
            <AnalyticsView />
          )}

          {/* Tab 7: About View */}
          {activeTab === 'About' && (
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 max-w-4xl">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">About MedAlloc Full-Stack Platform</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  MedAlloc is an advanced emergency hospital resource allocation system designed to
                  optimally distribute critical assets (blood units, ICU beds, oxygen cylinders, ventilators,
                  and emergency pharmaceuticals) across regional networks during high-volume crisis events.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200/70 space-y-1">
                  <span className="text-xs font-bold text-blue-700 uppercase">Frontend Layer</span>
                  <p className="text-xs text-slate-600">Next.js 15, TypeScript, Tailwind CSS, Recharts, Custom Skeletons & Hooks</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Express API</span>
                  <p className="text-xs text-slate-600">RESTful Controllers, Telemetry Store, Child Process IPC, Real-time Error Handling</p>
                </div>
                <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-200/70 space-y-1">
                  <span className="text-xs font-bold text-violet-700 uppercase">C Algorithm Engine</span>
                  <p className="text-xs text-slate-600">C17 GCC, Max-Heap Priority Queue, Hash Map O(1), Dijkstra, Kuhn Bipartite</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-500">
          MedAlloc Emergency Dispatch Platform • Clean Architecture • Next.js + Express + C Allocation Engine
        </footer>
      </div>
    </div>
  );
}
