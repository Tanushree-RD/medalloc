'use client';

import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Package,
  Cpu,
  BarChart3,
  Info,
  ChevronLeft,
  ChevronRight,
  Activity,
  HeartPulse,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type SidebarTab =
  | 'Dashboard'
  | 'Emergency Requests'
  | 'Hospitals'
  | 'Inventory'
  | 'Allocation Engine'
  | 'Analytics'
  | 'About';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const menuItems = [
    {
      name: 'Dashboard' as SidebarTab,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: 'Emergency Requests' as SidebarTab,
      icon: AlertTriangle,
      badge: '14',
      badgeColor: 'bg-red-100 text-red-700 border-red-200',
    },
    {
      name: 'Hospitals' as SidebarTab,
      icon: Building2,
      badge: '5 Hubs',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    {
      name: 'Inventory' as SidebarTab,
      icon: Package,
      badge: 'Live',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    },
    {
      name: 'Allocation Engine' as SidebarTab,
      icon: Cpu,
      badge: 'C17',
      badgeColor: 'bg-violet-100 text-violet-700 border-violet-200',
    },
    {
      name: 'Analytics' as SidebarTab,
      icon: BarChart3,
      badge: null,
    },
    {
      name: 'About' as SidebarTab,
      icon: Info,
      badge: null,
    },
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
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen bg-white border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out shadow-xs',
          collapsed ? 'lg:w-20' : 'lg:w-64',
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Brand */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white flex items-center justify-center shadow-sm shadow-blue-500/25">
              <HeartPulse className="h-5 w-5 animate-pulse" />
            </div>

            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                  MedAlloc
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60 px-1.5 py-0.5 rounded-md">
                    v1.0
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 truncate font-medium">
                  Emergency Resource Allocator
                </span>
              </div>
            )}
          </div>

          {/* Close on mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse button on desktop */}
          <button
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Live Status Chip */}
        {(!collapsed || mobileOpen) && (
          <div className="px-4 py-3 border-b border-slate-100">
            <div className="rounded-xl bg-emerald-50/70 border border-emerald-200/60 p-2.5 flex items-center gap-2.5 text-xs text-emerald-800">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <div className="flex flex-col truncate">
                <span className="font-semibold text-[11px] text-emerald-900">Engine Online</span>
                <span className="text-[10px] text-emerald-700 truncate">Kuhn Bipartite + Dijkstra</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;

            return (
              <button
                key={item.name}
                onClick={() => {
                  onSelectTab(item.name);
                  onCloseMobile();
                }}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group text-left relative',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                  )}
                />

                {(!collapsed || mobileOpen) && (
                  <span className="flex-1 truncate">{item.name}</span>
                )}

                {(!collapsed || mobileOpen) && item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                      isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor
                    )}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Collapsed dot for active */}
                {collapsed && !mobileOpen && isActive && (
                  <div className="absolute right-1.5 h-1.5 w-1.5 rounded-full bg-blue-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer / System Info */}
        <div className="p-3 border-t border-slate-100">
          {(!collapsed || mobileOpen) ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  Regional Dispatch
                </span>
                <span className="text-[10px] font-mono text-slate-400">Hub #1</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                City Hospital Emergency Grid connected to 5 tertiary centers.
              </p>
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500">
                <span>IPC Response: <strong className="text-slate-800">1.2ms</strong></span>
                <span className="text-emerald-600 font-semibold">Ready</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500" title="Regional Dispatch Hub #1">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
