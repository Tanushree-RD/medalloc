'use client';

import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Package,
  History,
  Info,
  HeartPulse,
  X,
  RotateCcw,
} from 'lucide-react';
import { AppPage, useMedAlloc } from '@/context/MedAllocContext';

interface AppSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const { activePage, setActivePage, resetAllData, requests, lowStockAlerts } = useMedAlloc();

  const activeRequestsCount = requests.filter(
    (r) => r.status === 'Pending' || r.status === 'Processing' || r.status === 'Allocated'
  ).length;

  const navItems: Array<{
    name: AppPage;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { name: 'Dashboard', icon: LayoutDashboard },
    {
      name: 'Emergency Requests',
      icon: AlertTriangle,
      badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    { name: 'Hospitals', icon: Building2 },
    {
      name: 'Inventory',
      icon: Package,
      badge: lowStockAlerts.length > 0 ? `${lowStockAlerts.length} alert` : undefined,
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    { name: 'Allocation History', icon: History },
    { name: 'About', icon: Info },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all hospital inventories, requests, and notifications to initial mock seed?')) {
      resetAllData();
      alert('Application reset to initial seed data successfully.');
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100/90">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-xs shadow-blue-500/20">
                <HeartPulse className="h-5 w-5 stroke-[2.3]" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
                  MedAlloc
                </span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                  Regional Medical Grid
                </span>
              </div>
            </div>

            {/* Close on mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 space-y-1 overflow-y-auto">
            <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Operations Center
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.name;

              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-2xs ring-1 ring-blue-500/15'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Minimal clean footer with Reset Seed action & Persistence badge */}
        <div className="p-3.5 border-t border-slate-100 space-y-2 bg-slate-50/40">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Data Storage</span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                localStorage Active
              </span>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-[11px] font-medium transition flex items-center justify-center gap-1.5"
              title="Restore default mock data"
            >
              <RotateCcw className="h-3 w-3 text-slate-400" />
              <span>Reset Demo Seed</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
