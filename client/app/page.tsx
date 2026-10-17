'use client';

import React, { useState } from 'react';
import { Sidebar, SidebarTab } from '@/components/dashboard/Sidebar';
import { TopNavbar } from '@/components/dashboard/TopNavbar';
import { StatCards } from '@/components/dashboard/StatCards';
import { ChartsSection } from '@/components/dashboard/ChartsSection';
import { RecentRequestsTable } from '@/components/dashboard/RecentRequestsTable';
import { EmergencyAlertsPanel } from '@/components/dashboard/EmergencyAlertsPanel';
import { HeartPulse, RefreshCw, Cpu } from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('Dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-blue-500/20">
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
                Real-time multi-hospital triage powered by Max-Heap, Dijkstra Roadway Routing & Kuhn Bipartite Matching
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs text-xs font-medium text-slate-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>C Allocator IPC: <strong className="text-slate-900">Live</strong></span>
              </span>

              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs text-xs font-semibold transition-all hover:shadow-blue-500/20"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Sync Network</span>
              </button>
            </div>
          </div>

          {/* Tab Content Rendering */}
          {activeTab === 'Dashboard' && (
            <>
              {/* 1. Statistic Cards (6 Cards) */}
              <section aria-label="Key Performance Indicators">
                <StatCards />
              </section>

              {/* 2. Emergency Alerts Panel */}
              <section aria-label="Emergency Alerts">
                <EmergencyAlertsPanel />
              </section>

              {/* 3. Recharts Section (Trend, Distribution, Capacity) */}
              <section aria-label="Resource and Allocation Charts">
                <ChartsSection />
              </section>

              {/* 4. Recent Requests Table */}
              <section aria-label="Recent Emergency Requests">
                <RecentRequestsTable searchFilter={searchQuery} />
              </section>
            </>
          )}

          {activeTab === 'Emergency Requests' && (
            <div className="space-y-6">
              <RecentRequestsTable searchFilter={searchQuery} />
              <EmergencyAlertsPanel />
            </div>
          )}

          {activeTab === 'Hospitals' && (
            <div className="space-y-6">
              <ChartsSection />
              <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-xs">
                <h3 className="font-bold text-slate-900 text-lg mb-2">Connected Regional Network Hubs</h3>
                <p className="text-xs text-slate-500 mb-4">
                  All 5 tertiary medical facilities are actively connected to the C Dijkstra routing graph.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { id: 1, name: 'City Hospital', role: 'Central Hub', lat: '40.7128° N', lon: '74.0060° W', dist: '0 km' },
                    { id: 2, name: 'General Hospital', role: 'Trauma Center', lat: '40.7306° N', lon: '73.9352° W', dist: '5 km' },
                    { id: 3, name: 'Sunrise Medical Center', role: 'Midtown Center', lat: '40.7589° N', lon: '73.9851° W', dist: '8 km' },
                    { id: 4, name: 'Apollo Care', role: 'Uptown Facility', lat: '40.7829° N', lon: '73.9654° W', dist: '12 km' },
                    { id: 5, name: 'Metro Hospital', role: 'South Division', lat: '40.6782° N', lon: '73.9442° W', dist: '12 km' },
                  ].map((hosp) => (
                    <div key={hosp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">#{hosp.id} {hosp.name}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                          {hosp.dist}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block">{hosp.role}</span>
                      <span className="text-[11px] font-mono text-slate-400 block">{hosp.lat}, {hosp.lon}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Inventory' && (
            <div className="space-y-6">
              <StatCards />
              <ChartsSection />
            </div>
          )}

          {activeTab === 'Allocation Engine' && (
            <div className="rounded-2xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                  <Cpu className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">C Algorithm Engine (C17)</h3>
                  <p className="text-xs text-slate-500">
                    High-performance binary executing Max-Heap Priority Queue, Hash Map O(1) Search, Dijkstra, and Kuhn Augmenting Path
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
                  <p className="font-mono text-xs font-semibold text-slate-900">stdin / stdout JSON streams</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Matching Complexity</span>
                  <p className="font-mono text-xs font-semibold text-emerald-600">O(V × E) Kuhn Algorithm</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-xs text-slate-500 font-medium">Average Latency</span>
                  <p className="font-mono text-xs font-semibold text-blue-600">&lt; 0.1ms</p>
                </div>
              </div>

              <RecentRequestsTable searchFilter={searchQuery} />
            </div>
          )}

          {activeTab === 'Analytics' && (
            <div className="space-y-6">
              <ChartsSection />
              <StatCards />
            </div>
          )}

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
                  <span className="text-xs font-bold text-blue-700 uppercase">Frontend</span>
                  <p className="text-xs text-slate-600">Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Recharts, Lucide Icons</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                  <span className="text-xs font-bold text-emerald-700 uppercase">Backend</span>
                  <p className="text-xs text-slate-600">Node.js, Express, child_process IPC, RESTful API endpoints</p>
                </div>
                <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-200/70 space-y-1">
                  <span className="text-xs font-bold text-violet-700 uppercase">Engine</span>
                  <p className="text-xs text-slate-600">Pure C (C17), GCC, Max-Heap, Hash Map Chaining, Dijkstra, Kuhn Bipartite</p>
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
