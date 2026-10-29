'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
  User,
  Check,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Package,
  Info,
  X,
} from 'lucide-react';
import { useMedAlloc, AppPage } from '@/context/MedAllocContext';
import { NotificationItem } from '@/lib/types';

interface AppTopBarProps {
  onOpenMobileSidebar: () => void;
}

export function AppTopBar({ onOpenMobileSidebar }: AppTopBarProps) {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    globalSearchQuery,
    setGlobalSearchQuery,
    setActivePage,
    hospitals,
  } = useMedAlloc();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close notifications popover on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const displayedNotifications = notifications.filter((n) => {
    if (notificationTab === 'unread') return !n.read;
    return true;
  });

  const handleNotificationClick = (item: NotificationItem) => {
    markNotificationAsRead(item.id);
    if (item.targetPage) {
      setActivePage(item.targetPage as AppPage);
      setShowNotifications(false);
    }
  };

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === 'critical' || type === 'low_stock') {
      return (
        <div className="h-6 w-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-3.5 w-3.5" />
        </div>
      );
    }
    if (type === 'allocation_completed') {
      return (
        <div className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5" />
        </div>
      );
    }
    if (type === 'inventory_updated') {
      return (
        <div className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Package className="h-3.5 w-3.5" />
        </div>
      );
    }
    return (
      <div className="h-6 w-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
        <Info className="h-3.5 w-3.5" />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
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
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search patients, hospitals, inventory, or history..."
            className="w-full h-9 pl-9 pr-8 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-xl border border-slate-200/80 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all shadow-2xs"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Center/Right: Live Network Status badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 font-medium">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span>Regional Grid Online</span>
        <span className="text-slate-300">•</span>
        <span className="text-slate-500 font-mono">{hospitals.length} Hubs Synchronized</span>
      </div>

      {/* Right: Notifications & Dispatcher Profile */}
      <div className="flex items-center gap-2 sm:gap-3" ref={popoverRef}>
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white shadow-xs">
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-84 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {unreadNotificationsCount} unread
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="p-1 text-slate-500 hover:text-blue-600 rounded text-[11px] font-medium"
                    title="Mark all as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={clearAllNotifications}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title="Clear all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabs: All / Unread */}
              <div className="flex items-center gap-2 py-2 px-1 text-xs border-b border-slate-100 font-semibold">
                <button
                  onClick={() => setNotificationTab('all')}
                  className={`px-2 py-1 rounded-lg transition ${
                    notificationTab === 'all'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotificationTab('unread')}
                  className={`px-2 py-1 rounded-lg transition ${
                    notificationTab === 'unread'
                      ? 'bg-slate-100 text-slate-900 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Unread ({unreadNotificationsCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="divide-y divide-slate-100 mt-1 max-h-72 overflow-y-auto">
                {displayedNotifications.length > 0 ? (
                  displayedNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`py-2.5 px-2 rounded-xl transition cursor-pointer flex items-start gap-2.5 ${
                        !n.read ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="mt-0.5">
                        {getNotificationIcon(n.type, n.severity)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-800 flex items-center justify-between gap-1">
                          <span className="truncate">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal shrink-0">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                          {n.message}
                        </p>
                      </div>

                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-slate-400 italic text-[11px]">
                    No notifications in this view.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dispatcher Profile */}
        <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold text-xs shadow-2xs">
            <User className="h-4 w-4 text-slate-600" />
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <div className="font-bold text-slate-800">Dispatch Officer</div>
            <div className="text-[10px] text-slate-400 font-medium">Emergency Ops Hub</div>
          </div>
        </div>
      </div>
    </header>
  );
}
