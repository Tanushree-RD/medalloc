'use client';

import React, { useState } from 'react';
import { Search, Bell, Menu, User } from 'lucide-react';

interface AppTopBarProps {
  onOpenMobileSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function AppTopBar({
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
}: AppTopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const sampleNotifications = [
    {
      id: 'n1',
      title: 'Allocation Complete',
      desc: 'Blood units dispatched to City Hospital for Sarah Chen.',
      time: '5m ago',
    },
    {
      id: 'n2',
      title: 'ICU Bed Allocated',
      desc: 'Bed reserved at General Hospital for critical trauma patient.',
      time: '18m ago',
    },
    {
      id: 'n3',
      title: 'Ventilator Dispatch',
      desc: 'Ventilator transfer route confirmed to Apollo Care.',
      time: '42m ago',
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenMobileSidebar}
          aria-label="Open Navigation Menu"
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search patients, resources, hospitals..."
            className="w-full h-9 pl-9 pr-4 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-lg p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1 font-semibold text-slate-800">
                <span>Notifications</span>
                <span className="text-[10px] text-blue-600 font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-slate-100 mt-1 max-h-60 overflow-y-auto">
                {sampleNotifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 rounded-lg transition">
                    <div className="font-semibold text-slate-800 flex items-center justify-between">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/80">
          <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
            <User className="h-4 w-4 text-slate-500" />
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <div className="font-semibold text-slate-800">Dispatch Officer</div>
            <div className="text-[10px] text-slate-400">Emergency Ops</div>
          </div>
        </div>
      </div>
    </header>
  );
}
