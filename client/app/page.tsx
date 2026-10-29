'use client';

import React, { useState } from 'react';
import { MedAllocProvider, useMedAlloc } from '@/context/MedAllocContext';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopBar } from '@/components/layout/AppTopBar';
import { DashboardView } from '@/components/views/DashboardView';
import { EmergencyRequestsView } from '@/components/views/EmergencyRequestsView';
import { HospitalsView } from '@/components/views/HospitalsView';
import { InventoryView } from '@/components/views/InventoryView';
import { AllocationHistoryView } from '@/components/views/AllocationHistoryView';
import { AboutView } from '@/components/views/AboutView';
import { AllocationProcessModal } from '@/components/modals/AllocationProcessModal';

function MedAllocAppContent() {
  const {
    activePage,
    setActivePage,
    isProcessModalOpen,
    setIsProcessModalOpen,
    selectedProcessData,
    openProcessModalWithData,
    isHydrated,
  } = useMedAlloc();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedHospitalIdForDetails, setSelectedHospitalIdForDetails] = useState<number | null>(null);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-slate-500">
            Initializing MedAlloc Prototype...
          </span>
        </div>
      </div>
    );
  }

  const handleSelectHospitalDetails = (hospitalId: number) => {
    setSelectedHospitalIdForDetails(hospitalId);
    setActivePage('Hospitals');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-blue-500/10">
      {/* 1. App Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar with Global Search & Notification Center */}
        <AppTopBar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {activePage === 'Dashboard' && (
            <DashboardView
              onNavigateToRequests={() => setActivePage('Emergency Requests')}
              onNavigateToHospitals={() => setActivePage('Hospitals')}
              onNavigateToInventory={() => setActivePage('Inventory')}
              onNavigateToHistory={() => setActivePage('Allocation History')}
              onSelectHospitalDetails={handleSelectHospitalDetails}
            />
          )}

          {activePage === 'Emergency Requests' && (
            <EmergencyRequestsView
              onOpenProcessModal={openProcessModalWithData}
            />
          )}

          {activePage === 'Hospitals' && (
            <HospitalsView
              initialSelectedHospitalId={selectedHospitalIdForDetails}
            />
          )}

          {activePage === 'Inventory' && (
            <InventoryView />
          )}

          {activePage === 'Allocation History' && (
            <AllocationHistoryView />
          )}

          {activePage === 'About' && (
            <AboutView />
          )}
        </main>
      </div>

      {/* 3. Global Allocation Process Modal */}
      <AllocationProcessModal
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        data={selectedProcessData}
      />
    </div>
  );
}

export default function MedAllocApp() {
  return (
    <MedAllocProvider>
      <MedAllocAppContent />
    </MedAllocProvider>
  );
}
