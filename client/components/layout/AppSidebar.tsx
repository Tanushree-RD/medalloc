'use client';

import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Package,
  Info,
  HeartPulse,
  X,
} from 'lucide-react';

export type AppPage = 'Dashboard' | 'Emergency Requests' | 'Hospitals' | 'Inventory' | 'About';

interface AppSidebarProps {
  activePage: AppPage;
  onSelectPage: (page: AppPage) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AppSidebar({
  activePage,
  onSelectPage,
  mobileOpen,
  onCloseMobile,
}: AppSidebarProps) {
  const navItems: Array<{ name: AppPage; icon: React.ComponentType<{ className?: string }> }> = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Emergency Requests', icon: AlertTriangle },
    { name: 'Hospitals', icon: Building2 },
    { name: 'Inventory', icon: Package },
    { name: 'About', icon: Info },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              MedAlloc
            </span>
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
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  onSelectPage(item.name);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Minimal clean footer */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
          Healthcare Resource Allocation
        </div>
      </aside>
    </>
  );
}
