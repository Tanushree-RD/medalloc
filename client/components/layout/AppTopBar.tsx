'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Menu,
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
        <div className="h-7 w-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-3.5 w-3.5 stroke-[1.75]" />
        </div>
      );
    }
    if (type === 'allocation_completed') {
      return (
        <div className="h-7 w-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.75]" />
        </div>
      );
    }
    if (type === 'inventory_updated') {
      return (
        <div className="h-7 w-7 rounded-full bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0">
          <Package className="h-3.5 w-3.5 stroke-[1.75]" />
        </div>
      );
    }
    return (
      <div className="h-7 w-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0">
        <Info className="h-3.5 w-3.5 stroke-[1.75]" />
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-black/[0.04] px-6 lg:px-10 flex items-center justify-between gap-4">
      {/* Left: Mobile menu & Raycast-style Global Search */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 stroke-[1.75]" />
        </button>

        {/* Raycast-style Search Input */}
        <div className="relative w-full max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none group-focus-within:text-neutral-900 transition-colors" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search network, patients, inventory..."
            className="w-full h-9 pl-9 pr-14 rounded-full bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white text-xs font-normal text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900/20 border border-transparent focus:border-neutral-200 transition-all"
          />
          {globalSearchQuery ? (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 bg-white px-1.5 py-0.5 rounded border border-black/[0.06] shadow-2xs pointer-events-none hidden sm:inline-block">
              ⌘K
            </kbd>
          )}
        </div>
      </div>

      {/* Right: Network Status, Notifications, Operator Avatar */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Network Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 border border-black/[0.04]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-breathing-dot" />
          <span className="text-xs font-normal text-neutral-500">
            5 hubs online
          </span>
        </div>

        {/* Notifications Popover Trigger */}
        <div className="relative" ref={popoverRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 transition cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4 stroke-[1.75]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-neutral-950 ring-2 ring-white" />
            )}
          </button>

          {/* Floating Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-black/[0.06] shadow-editorial-float overflow-hidden z-50 animate-in fade-in duration-150">
              {/* Popover Header */}
              <div className="p-4 border-b border-black/[0.04] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                    Notifications
                  </h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {unreadNotificationsCount} unread alert{unreadNotificationsCount === 1 ? '' : 's'}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="p-1.5 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition"
                      title="Mark all as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="p-1.5 text-xs text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Clear all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="px-4 py-2 border-b border-black/[0.03] bg-neutral-50/50 flex gap-2">
                <button
                  onClick={() => setNotificationTab('all')}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                    notificationTab === 'all'
                      ? 'bg-neutral-950 text-white'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  onClick={() => setNotificationTab('unread')}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition cursor-pointer ${
                    notificationTab === 'unread'
                      ? 'bg-neutral-950 text-white'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  Unread ({unreadNotificationsCount})
                </button>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-black/[0.03]">
                {displayedNotifications.length === 0 ? (
                  <div className="py-12 text-center text-xs text-neutral-400 font-normal">
                    No notifications to display
                  </div>
                ) : (
                  displayedNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-neutral-50/80 transition cursor-pointer ${
                        !n.read ? 'bg-neutral-50/40' : ''
                      }`}
                    >
                      {getNotificationIcon(n.type, n.severity)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs ${!n.read ? 'font-medium text-neutral-900' : 'text-neutral-700'}`}>
                            {n.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {n.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Minimal Dispatch Officer Identifier */}
        <div className="flex items-center gap-2 pl-2 border-l border-black/[0.05]">
          <div className="h-7 w-7 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[11px] font-medium tracking-tight">
            DO
          </div>
          <span className="text-xs font-normal text-neutral-600 hidden sm:inline">
            Officer
          </span>
        </div>
      </div>
    </header>
  );
}
