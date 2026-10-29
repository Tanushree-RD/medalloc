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
      <div className="min-h-screen bg-[#fafafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin" />
          <span className="text-xs font-medium text-neutral-400">
            Initializing MedAlloc...
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
    <div className="min-h-screen bg-[#fafafc] text-neutral-950 flex font-sans antialiased selection:bg-neutral-950 selection:text-white">
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
        <main className="flex-1 overflow-y-auto px-6 sm:px-8 lg:px-12 py-8 sm:py-10 max-w-7xl mx-auto w-full">
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
