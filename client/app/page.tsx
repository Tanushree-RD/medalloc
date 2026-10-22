'use client';

import React, { useState } from 'react';
import { AppSidebar, AppPage } from '@/components/layout/AppSidebar';
import { AppTopBar } from '@/components/layout/AppTopBar';
import { DashboardView, DashboardRequestItem } from '@/components/views/DashboardView';
import { EmergencyRequestsView } from '@/components/views/EmergencyRequestsView';
import { HospitalsView } from '@/components/views/HospitalsView';
import { InventoryView } from '@/components/views/InventoryView';
import { AboutView } from '@/components/views/AboutView';
import { AllocationProcessModal, AllocationProcessData } from '@/components/modals/AllocationProcessModal';

export default function MedAllocApp() {
  const [activePage, setActivePage] = useState<AppPage>('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Allocation Process Modal State
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [processModalData, setProcessModalData] = useState<AllocationProcessData>({
    patientName: 'John Doe',
    resource: 'A+ Blood',
    quantity: 2,
    priority: 'Critical',
    assignedHospital: 'General Hospital',
    distanceKm: 5,
    estimatedArrivalTime: '11 mins',
    timestamp: '10:42 AM',
    allocationId: 'ALC-4819',
    availableUnits: 18,
    reasonSelected: 'Lowest transit distance with guaranteed reserve.',
    emergencyReason: 'Acute traumatic hemorrhage requiring emergent transfusion.',
  });

  // Recent Emergency Requests Store
  const [requestsList, setRequestsList] = useState<DashboardRequestItem[]>([
    {
      id: 'REQ-101',
      patient: 'John Doe',
      resource: 'A+ Blood (2 Units)',
      priority: 'Critical',
      assignedHospital: 'General Hospital',
      status: 'Allocated',
      timestamp: '5 mins ago',
    },
    {
      id: 'REQ-102',
      patient: 'Sarah Chen',
      resource: 'Ventilator',
      priority: 'High',
      assignedHospital: 'Apollo Care',
      status: 'Allocated',
      timestamp: '14 mins ago',
    },
    {
      id: 'REQ-103',
      patient: 'Michael Brown',
      resource: 'Medical Oxygen (50L)',
      priority: 'High',
      assignedHospital: 'General Hospital',
      status: 'Processing',
      timestamp: '22 mins ago',
    },
    {
      id: 'REQ-104',
      patient: 'Alice Thorne',
      resource: 'ICU Bed',
      priority: 'Medium',
      assignedHospital: 'Metro Hospital',
      status: 'Completed',
      timestamp: '45 mins ago',
    },
    {
      id: 'REQ-105',
      patient: 'Robert Taylor',
      resource: 'O- Blood (3 Units)',
      priority: 'Critical',
      assignedHospital: 'Sunrise Medical Center',
      status: 'Allocated',
      timestamp: '1 hour ago',
    },
  ]);

  const handleOpenProcessModal = (data: AllocationProcessData) => {
    setProcessModalData(data);
    setProcessModalOpen(true);
  };

  const handleViewRequestFromDashboard = (req: DashboardRequestItem) => {
    setProcessModalData({
      patientName: req.patient,
      resource: req.resource,
      quantity: 1,
      priority: req.priority,
      assignedHospital: req.assignedHospital,
      distanceKm: req.assignedHospital === 'City Hospital' ? 0 : 5,
      estimatedArrivalTime: '10 mins',
      timestamp: req.timestamp,
      allocationId: `ALC-${req.id.replace('REQ-', '')}`,
      availableUnits: 14,
      reasonSelected: 'Nearest facility holding verified inventory stock.',
      emergencyReason: 'Emergency medical referral under critical dispatch triage.',
    });
    setProcessModalOpen(true);
  };

  const handleNewRequestAdded = (newReq: DashboardRequestItem) => {
    setRequestsList((prev) => [newReq, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-blue-500/10">
      {/* 1. Clean Modern Sidebar (5 links, no badges, no version) */}
      <AppSidebar
        activePage={activePage}
        onSelectPage={setActivePage}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar (Search, Notifications, Profile only) */}
        <AppTopBar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto w-full">
          {activePage === 'Dashboard' && (
            <DashboardView
              requests={requestsList}
              onNavigateToRequests={() => setActivePage('Emergency Requests')}
              onViewRequestProcess={handleViewRequestFromDashboard}
            />
          )}

          {activePage === 'Emergency Requests' && (
            <EmergencyRequestsView
              onOpenProcessModal={handleOpenProcessModal}
              onNewRequestAdded={handleNewRequestAdded}
            />
          )}

          {activePage === 'Hospitals' && (
            <HospitalsView />
          )}

          {activePage === 'Inventory' && (
            <InventoryView />
          )}

          {activePage === 'About' && (
            <AboutView />
          )}
        </main>
      </div>

      {/* 3. View Allocation Process Modal (Clean vertical timeline + hidden educational mode) */}
      <AllocationProcessModal
        isOpen={processModalOpen}
        onClose={() => setProcessModalOpen(false)}
        data={processModalData}
      />
    </div>
  );
}
