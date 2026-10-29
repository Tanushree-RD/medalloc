'use client';

import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Package,
  History,
  Info,
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
  }> = [
    { name: 'Dashboard', icon: LayoutDashboard },
    {
      name: 'Emergency Requests',
      icon: AlertTriangle,
      badge: activeRequestsCount > 0 ? activeRequestsCount : undefined,
    },
    { name: 'Hospitals', icon: Building2 },
    {
      name: 'Inventory',
      icon: Package,
      badge: lowStockAlerts.length > 0 ? lowStockAlerts.length : undefined,
    },
    { name: 'Allocation History', icon: History },
    { name: 'About', icon: Info },
  ];

  const handleReset = () => {
    if (window.confirm('Reset all hospital inventories, requests, and notifications to initial mock seed?')) {
      resetAllData();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-neutral-950/20 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white/90 backdrop-blur-xl border-r border-black/[0.05] flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Brand & Navigation */}
        <div className="flex flex-col">
          {/* Brand Mark */}
          <div className="h-18 px-6 flex items-center justify-between border-b border-black/[0.04]">
            <div className="flex items-center gap-3">
              {/* Minimal geometric jewel icon */}
              <div className="h-8 w-8 rounded-xl bg-neutral-950 text-white flex items-center justify-center shadow-xs">
                <span className="text-base font-semibold tracking-tighter">M</span>
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight text-neutral-950 block leading-tight">
                  MedAlloc
                </span>
                <span className="text-[11px] font-normal text-neutral-400 block tracking-normal mt-0.5">
                  Emergency Dispatch
                </span>
              </div>
            </div>

            {/* Close on mobile */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition"
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-neutral-400">
              Workspace
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-950 font-medium'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50/80 font-normal'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 stroke-[1.75] transition-colors ${
                        isActive
                          ? 'text-neutral-950'
                          : 'text-neutral-400 group-hover:text-neutral-700'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-full transition-colors ${
                        isActive
                          ? 'bg-white text-neutral-900 shadow-2xs'
                          : 'bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200/70 group-hover:text-neutral-700'
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

        {/* Bottom Status & Reset Seed */}
        <div className="p-4 border-t border-black/[0.04] space-y-3">
          {/* Storage & Engine Status */}
          <div className="p-3 rounded-xl bg-neutral-50/80 border border-black/[0.03] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500">
                Network Storage
              </span>
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-breathing-dot" />
                Live Sync
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Encrypted browser persistence active across sessions.
            </p>
          </div>

          {/* Reset Seed Action */}
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-normal text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100/60 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3 stroke-[1.75]" />
            <span>Reset to mock seed</span>
          </button>
        </div>
      </aside>
    </>
  );
}
