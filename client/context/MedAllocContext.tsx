'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  EmergencyRequest,
  Hospital,
  InventoryItem,
  AllocationHistoryItem,
  NotificationItem,
  LowStockAlert,
  Settings,
  CreateRequestInput,
  AllocationResultData,
  RequestStatus,
  InventoryStockStatus,
} from '@/lib/types';
import { storage } from '@/lib/storage';

export type AppPage = 'Dashboard' | 'Emergency Requests' | 'Hospitals' | 'Inventory' | 'Allocation History' | 'About';

export interface AllocationSimulationState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  stepMessage: string;
  requestId: string | null;
  progressPercent: number;
}

interface MedAllocContextType {
  // Collections
  requests: EmergencyRequest[];
  hospitals: Hospital[];
  inventory: InventoryItem[];
  allocationHistory: AllocationHistoryItem[];
  notifications: NotificationItem[];
  settings: Settings;

  // Derived / Real-time Computations
  unreadNotificationsCount: number;
  lowStockAlerts: LowStockAlert[];
  isHydrated: boolean;
  activePage: AppPage;
  setActivePage: (page: AppPage) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Simulation State
  simulationState: AllocationSimulationState;

  // Actions
  submitEmergencyRequest: (input: CreateRequestInput) => Promise<AllocationResultData>;
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  cancelRequest: (requestId: string) => void;
  completeRequest: (requestId: string) => void;
  updateInventoryItemStock: (id: string, newStock: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>) => void;
  deleteInventoryItem: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllData: () => void;

  // Modal helpers
  selectedProcessData: AllocationResultData | null;
  setSelectedProcessData: (data: AllocationResultData | null) => void;
  isProcessModalOpen: boolean;
  setIsProcessModalOpen: (open: boolean) => void;
  openProcessModalWithData: (data: AllocationResultData) => void;
}

const MedAllocContext = createContext<MedAllocContextType | undefined>(undefined);

const SIMULATION_STEPS = [
  'Receiving request...',
  'Prioritizing request...',
  'Locating nearby hospitals...',
  'Checking inventory...',
  'Selecting best hospital...',
  'Allocating resources...',
  'Completed.',
];

export function MedAllocProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [activePage, setActivePage] = useState<AppPage>('Dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Primary Collections
  const [requests, setRequests] = useState<EmergencyRequest[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [allocationHistory, setAllocationHistory] = useState<AllocationHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [settings, setSettings] = useState<Settings>({
    simulationDelayMs: 750,
    autoOpenProcessModal: true,
    enableSoundEffects: false,
    enableAutoAlerts: true,
  });

  // Modal State
  const [selectedProcessData, setSelectedProcessData] = useState<AllocationResultData | null>(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);

  // Simulation State
  const [simulationState, setSimulationState] = useState<AllocationSimulationState>({
    isActive: false,
    currentStep: 0,
    totalSteps: SIMULATION_STEPS.length,
    stepMessage: '',
    requestId: null,
    progressPercent: 0,
  });

  // 1. Hydrate from localStorage on client mount
  useEffect(() => {
    const loadedRequests = storage.getRequests();
    const loadedHospitals = storage.getHospitals();
    const loadedInventory = storage.getInventory();
    const loadedHistory = storage.getHistory();
    const loadedNotifications = storage.getNotifications();
    const loadedSettings = storage.getSettings();

    setRequests(loadedRequests);
    setHospitals(loadedHospitals);
    setInventory(loadedInventory);
    setAllocationHistory(loadedHistory);
    setNotifications(loadedNotifications);
    setSettings(loadedSettings);
    setIsHydrated(true);
  }, []);

  // Compute Unread Notifications Count
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  // Compute Low Stock Alerts across both inventory items and hospitals
  const lowStockAlerts = useMemo<LowStockAlert[]>(() => {
    const alerts: LowStockAlert[] = [];

    // From inventory items
    inventory.forEach((item) => {
      if (item.stock <= item.minThreshold) {
        alerts.push({
          id: `ALERT-${item.id}`,
          hospitalName: item.hospitalName,
          hospitalId: item.hospitalId,
          resourceName: item.name,
          category: item.category,
          remainingStock: item.stock,
          minThreshold: item.minThreshold,
          unit: item.unit,
          severity: item.stock <= Math.floor(item.minThreshold / 2) ? 'Critical' : 'Low',
          timestamp: item.lastUpdated || 'Just now',
        });
      }
    });

    return alerts;
  }, [inventory]);

  // Helper: Add Notification
  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newItem: NotificationItem = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newItem, ...prev];
      storage.saveNotifications(updated);
      return updated;
    });
  }, []);

  // Action: Submit Emergency Request & Run Realistic Allocation Simulation
  const submitEmergencyRequest = useCallback(
    async (input: CreateRequestInput): Promise<AllocationResultData> => {
      // Format readable resource string
      let resourceSummary = input.resourceType;
      let resourceDetail = '';

      if (input.resourceType === 'Blood Products') {
        const bg = input.bloodGroup || 'A+';
        resourceDetail = bg;
        resourceSummary = `${bg} Blood (${input.quantity} Unit${input.quantity > 1 ? 's' : ''})`;
      } else if (input.resourceType === 'Pharmaceuticals') {
        const med = input.medicineName || 'Emergency Medicine';
        resourceDetail = med;
        resourceSummary = `${med} (${input.quantity} Units)`;
      } else if (input.resourceType === 'ICU Bed') {
        resourceDetail = 'Adult Critical Care Bed';
        resourceSummary = `ICU Bed (${input.quantity} Bed${input.quantity > 1 ? 's' : ''})`;
      } else if (input.resourceType === 'Medical Oxygen') {
        resourceDetail = '50L Cylinders';
        resourceSummary = `Medical Oxygen (${input.quantity * 50}L)`;
      } else if (input.resourceType === 'Ventilator') {
        resourceDetail = 'Mechanical Ventilator';
        resourceSummary = `Ventilator (${input.quantity} Unit${input.quantity > 1 ? 's' : ''})`;
      } else if (input.resourceType === 'Ambulance') {
        resourceDetail = 'ALS Rapid Response';
        resourceSummary = `Ambulance (${input.quantity} Vehicle${input.quantity > 1 ? 's' : ''})`;
      }

      const reqId = `REQ-${Math.floor(100 + Math.random() * 900)}`;
      const newRequest: EmergencyRequest = {
        id: reqId,
        patientName: input.patientName.trim(),
        patientAge: input.patientAge || 42,
        patientGender: input.patientGender || 'M',
        patientLocation: input.patientLocation || 'Downtown Sector 1',
        originHospital: input.originHospital || 'City Hospital',
        resourceType: input.resourceType,
        resourceDetail,
        resource: resourceSummary,
        quantity: Number(input.quantity) || 1,
        priority: input.priority,
        emergencyNotes: input.emergencyNotes || 'Emergency clinical triage intake dispatch.',
        status: 'Pending',
        timestamp: 'Just now',
        createdAt: Date.now(),
      };

      // 1. Save Request in Pending state
      setRequests((prev) => {
        const updated = [newRequest, ...prev];
        storage.saveRequests(updated);
        return updated;
      });

      // 2. Add Notification: Request submitted
      addNotification({
        type: 'request_submitted',
        title: 'Emergency Request Submitted',
        message: `Intake registered for ${newRequest.patientName} (${newRequest.resource}) at ${newRequest.originHospital}.`,
        timestamp: 'Just now',
        severity: newRequest.priority === 'Critical' ? 'critical' : 'info',
        targetPage: 'Emergency Requests',
      });

      // 3. Realistic Step-by-Step Simulation (600 - 900 ms per step)
      const stepDelay = Math.max(600, Math.min(900, settings.simulationDelayMs || 750));

      const runStep = (stepIdx: number): Promise<void> => {
        return new Promise((resolve) => {
          const message = SIMULATION_STEPS[stepIdx];
          const progress = Math.round(((stepIdx + 1) / SIMULATION_STEPS.length) * 100);

          setSimulationState({
            isActive: true,
            currentStep: stepIdx + 1,
            totalSteps: SIMULATION_STEPS.length,
            stepMessage: message,
            requestId: reqId,
            progressPercent: progress,
          });

          // In step 2, update request status to 'Processing'
          if (stepIdx === 1) {
            setRequests((prev) => {
              const updated = prev.map((r) =>
                r.id === reqId ? { ...r, status: 'Processing' as RequestStatus } : r
              );
              storage.saveRequests(updated);
              return updated;
            });
          }

          setTimeout(resolve, stepDelay);
        });
      };

      // Execute simulated steps
      for (let i = 0; i < SIMULATION_STEPS.length; i++) {
        await runStep(i);
      }

      // 4. Hospital Matching Algorithm
      // Match candidate hospitals with actual stock
      const currentHospitals = storage.getHospitals();
      const currentInventory = storage.getInventory();

      let matchedHospital = currentHospitals[0];
      let distanceKm = 0;
      let availableUnits = 12;
      let matchedInventoryItem: InventoryItem | undefined;

      // Find matching item in inventory
      if (input.resourceType === 'Blood Products') {
        const group = input.bloodGroup || 'A+';
        const candidateItems = currentInventory.filter(
          (inv) => inv.category === 'Blood' && inv.name.includes(group) && inv.stock >= input.quantity
        );

        if (candidateItems.length > 0) {
          // Pick closest hospital
          const candidatesWithDist = candidateItems.map((item) => {
            const h = currentHospitals.find((hosp) => hosp.id === item.hospitalId);
            return { item, hospital: h, distance: h?.distanceKm ?? 99 };
          });
          candidatesWithDist.sort((a, b) => a.distance - b.distance);
          matchedInventoryItem = candidatesWithDist[0].item;
          matchedHospital = candidatesWithDist[0].hospital || currentHospitals[0];
          distanceKm = matchedHospital.distanceKm;
          availableUnits = matchedInventoryItem.stock;
        } else {
          // Fallback to origin hospital or City Hospital
          matchedHospital = currentHospitals.find((h) => h.name === input.originHospital) || currentHospitals[0];
          distanceKm = matchedHospital.distanceKm;
          availableUnits = matchedHospital.bloodAvailability[group] || 10;
        }
      } else if (input.resourceType === 'ICU Bed') {
        const candidates = currentHospitals.filter((h) => h.icuBeds.available >= input.quantity);
        if (candidates.length > 0) {
          candidates.sort((a, b) => a.distanceKm - b.distanceKm);
          matchedHospital = candidates[0];
        } else {
          matchedHospital = currentHospitals[0];
        }
        distanceKm = matchedHospital.distanceKm;
        availableUnits = matchedHospital.icuBeds.available;
        matchedInventoryItem = currentInventory.find(
          (inv) => inv.hospitalId === matchedHospital.id && inv.category === 'ICU Beds'
        );
      } else if (input.resourceType === 'Pharmaceuticals') {
        const medName = (input.medicineName || 'Paracetamol').toLowerCase();
        matchedInventoryItem = currentInventory.find(
          (inv) => inv.category === 'Medicine' && inv.name.toLowerCase().includes(medName) && inv.stock >= input.quantity
        );
        if (matchedInventoryItem) {
          matchedHospital = currentHospitals.find((h) => h.id === matchedInventoryItem?.hospitalId) || currentHospitals[0];
          distanceKm = matchedHospital.distanceKm;
          availableUnits = matchedInventoryItem.stock;
        } else {
          matchedHospital = currentHospitals[0];
          distanceKm = matchedHospital.distanceKm;
          availableUnits = 50;
        }
      } else {
        matchedHospital = currentHospitals.find((h) => h.name === input.originHospital) || currentHospitals[0];
        distanceKm = matchedHospital.distanceKm;
        availableUnits = 8;
        matchedInventoryItem = currentInventory.find(
          (inv) => inv.hospitalId === matchedHospital.id && inv.name.toLowerCase().includes(input.resourceType.toLowerCase())
        );
      }

      // Calculate travel time
      const etaMins = Math.max(3, Math.round(distanceKm * 1.5 + 4));
      const allocationId = `ALC-${Math.floor(1000 + Math.random() * 9000)}`;
      const prevStock = availableUnits;
      const updatedStock = Math.max(0, prevStock - input.quantity);

      // 5. Automatically Decrease Inventory & Update Hospital Record
      setInventory((prev) => {
        const updated: InventoryItem[] = prev.map((item) => {
          if (matchedInventoryItem && item.id === matchedInventoryItem.id) {
            const nextStock = Math.max(0, item.stock - input.quantity);
            const status: InventoryStockStatus = nextStock <= Math.floor(item.minThreshold / 2) ? 'Critical' : nextStock <= item.minThreshold ? 'Low' : 'Adequate';
            return {
              ...item,
              stock: nextStock,
              status,
              lastUpdated: 'Just now',
            };
          }
          return item;
        });
        storage.saveInventory(updated);
        return updated;
      });

      // Update Hospital record inventory
      setHospitals((prev) => {
        const updated = prev.map((hosp) => {
          if (hosp.id === matchedHospital.id) {
            const updatedHosp = { ...hosp };
            if (input.resourceType === 'Blood Products') {
              const bg = input.bloodGroup || 'A+';
              const curBlood = updatedHosp.bloodAvailability[bg] || 0;
              updatedHosp.bloodAvailability = {
                ...updatedHosp.bloodAvailability,
                [bg]: Math.max(0, curBlood - input.quantity),
              };
            } else if (input.resourceType === 'ICU Bed') {
              updatedHosp.icuBeds = {
                ...updatedHosp.icuBeds,
                occupied: updatedHosp.icuBeds.occupied + input.quantity,
                available: Math.max(0, updatedHosp.icuBeds.available - input.quantity),
              };
            }
            return updatedHosp;
          }
          return hosp;
        });
        storage.saveHospitals(updated);
        return updated;
      });

      // 6. Update Request status to 'Allocated'
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setRequests((prev) => {
        const updated = prev.map((r) => {
          if (r.id === reqId) {
            return {
              ...r,
              status: 'Allocated' as RequestStatus,
              assignedHospital: matchedHospital.name,
              distanceKm,
              estimatedArrivalTime: `${etaMins} mins`,
              allocationId,
              timestamp: 'Just now',
            };
          }
          return r;
        });
        storage.saveRequests(updated);
        return updated;
      });

      // 7. Store in Allocation History
      const historyItem: AllocationHistoryItem = {
        id: allocationId,
        requestId: reqId,
        patient: input.patientName.trim(),
        hospital: matchedHospital.name,
        resource: resourceSummary,
        quantity: input.quantity,
        priority: input.priority,
        distance: distanceKm,
        estimatedArrivalTime: `${etaMins} mins`,
        timestamp: timeStr,
        createdAt: Date.now(),
        status: 'Allocated',
        reasonSelected: 'Lowest transit distance with guaranteed reserve.',
      };

      setAllocationHistory((prev) => {
        const updated = [historyItem, ...prev];
        storage.saveHistory(updated);
        return updated;
      });

      // 8. Notifications
      addNotification({
        type: 'allocation_completed',
        title: 'Allocation Completed',
        message: `Patient ${input.patientName} allocated to ${matchedHospital.name} for ${resourceSummary}.`,
        timestamp: 'Just now',
        severity: 'success',
        targetPage: 'Emergency Requests',
      });

      addNotification({
        type: 'inventory_updated',
        title: 'Inventory Updated Successfully',
        message: `${matchedHospital.name}: ${input.resourceType} stock updated (${prevStock} → ${updatedStock} units).`,
        timestamp: 'Just now',
        severity: 'info',
        targetPage: 'Inventory',
      });

      // Check if low stock reached
      if (updatedStock <= 3) {
        addNotification({
          type: 'low_stock',
          title: `Low ${input.resourceType} Stock`,
          message: `${matchedHospital.name}: Only ${updatedStock} units remaining.`,
          timestamp: 'Just now',
          severity: updatedStock <= 1 ? 'critical' : 'warning',
          targetPage: 'Inventory',
        });
      }

      // Finish simulation
      setSimulationState({
        isActive: false,
        currentStep: SIMULATION_STEPS.length,
        totalSteps: SIMULATION_STEPS.length,
        stepMessage: 'Completed.',
        requestId: reqId,
        progressPercent: 100,
      });

      const finalResult: AllocationResultData = {
        requestId: reqId,
        allocationId,
        patientName: input.patientName.trim(),
        resource: resourceSummary,
        quantity: input.quantity,
        priority: input.priority,
        assignedHospital: matchedHospital.name,
        distanceKm,
        estimatedArrivalTime: `${etaMins} mins`,
        timestamp: timeStr,
        availableUnits: prevStock,
        previousInventoryStock: prevStock,
        updatedInventoryStock: updatedStock,
        reasonSelected: 'Lowest transit distance with guaranteed reserve.',
        emergencyReason: input.emergencyNotes || 'Emergency clinical triage intake dispatch.',
        status: 'Allocated',
      };

      setSelectedProcessData(finalResult);
      return finalResult;
    },
    [settings, addNotification]
  );

  // Action: Update Request Status (Completed, Cancelled, etc.)
  const updateRequestStatus = useCallback((requestId: string, status: RequestStatus) => {
    setRequests((prev) => {
      const updated = prev.map((r) => (r.id === requestId ? { ...r, status } : r));
      storage.saveRequests(updated);
      return updated;
    });

    // Also update matching history item
    setAllocationHistory((prev) => {
      const updated = prev.map((h) => {
        if (h.requestId === requestId) {
          return {
            ...h,
            status: status === 'Completed' ? 'Completed' : status === 'Cancelled' ? 'Cancelled' : h.status,
          };
        }
        return h;
      });
      storage.saveHistory(updated);
      return updated;
    });

    addNotification({
      type: 'info',
      title: `Request ${status}`,
      message: `Request ${requestId} status updated to ${status}.`,
      timestamp: 'Just now',
      severity: status === 'Completed' ? 'success' : 'info',
    });
  }, [addNotification]);

  const cancelRequest = useCallback((requestId: string) => {
    updateRequestStatus(requestId, 'Cancelled');
  }, [updateRequestStatus]);

  const completeRequest = useCallback((requestId: string) => {
    updateRequestStatus(requestId, 'Completed');
  }, [updateRequestStatus]);

  // Action: Update Inventory Item Stock (Editable Inventory Table)
  const updateInventoryItemStock = useCallback((id: string, newStock: number) => {
    const safeStock = Math.max(0, newStock);
    let targetItem: InventoryItem | undefined;

    setInventory((prev) => {
      const updated: InventoryItem[] = prev.map((item) => {
        if (item.id === id) {
          targetItem = item;
          const status: InventoryStockStatus = safeStock <= Math.floor(item.minThreshold / 2) ? 'Critical' : safeStock <= item.minThreshold ? 'Low' : 'Adequate';
          return {
            ...item,
            stock: safeStock,
            status,
            lastUpdated: 'Just now',
          };
        }
        return item;
      });
      storage.saveInventory(updated);
      return updated;
    });

    if (targetItem) {
      // Sync hospital model
      setHospitals((prev) => {
        const updated = prev.map((hosp) => {
          if (hosp.id === targetItem?.hospitalId) {
            const copy = { ...hosp };
            if (targetItem.category === 'Blood') {
              const bgMatch = targetItem.name.match(/(A\+|O\+|B\+|AB\+|A-|O-|B-|AB-)/);
              if (bgMatch) {
                copy.bloodAvailability = {
                  ...copy.bloodAvailability,
                  [bgMatch[0]]: safeStock,
                };
              }
            } else if (targetItem.category === 'ICU Beds') {
              copy.icuBeds = {
                ...copy.icuBeds,
                available: safeStock,
              };
            }
            return copy;
          }
          return hosp;
        });
        storage.saveHospitals(updated);
        return updated;
      });

      addNotification({
        type: 'inventory_updated',
        title: 'Inventory Updated Successfully',
        message: `${targetItem.hospitalName}: ${targetItem.name} stock updated to ${safeStock} ${targetItem.unit}.`,
        timestamp: 'Just now',
        severity: 'info',
        targetPage: 'Inventory',
      });

      if (safeStock <= targetItem.minThreshold) {
        addNotification({
          type: 'low_stock',
          title: `Low Stock: ${targetItem.name}`,
          message: `${targetItem.hospitalName}: Only ${safeStock} ${targetItem.unit} remaining.`,
          timestamp: 'Just now',
          severity: safeStock <= Math.floor(targetItem.minThreshold / 2) ? 'critical' : 'warning',
          targetPage: 'Inventory',
        });
      }
    }
  }, [addNotification]);

  // Action: Add new Inventory Item
  const addInventoryItem = useCallback(
    (item: Omit<InventoryItem, 'id' | 'lastUpdated' | 'status'>) => {
      const status: InventoryStockStatus = item.stock <= Math.floor(item.minThreshold / 2) ? 'Critical' : item.stock <= item.minThreshold ? 'Low' : 'Adequate';
      const newItem: InventoryItem = {
        ...item,
        id: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        status,
        lastUpdated: 'Just now',
      };

      setInventory((prev) => {
        const updated = [newItem, ...prev];
        storage.saveInventory(updated);
        return updated;
      });

      addNotification({
        type: 'inventory_updated',
        title: 'New Inventory Item Added',
        message: `Added ${newItem.name} (${newItem.stock} ${newItem.unit}) at ${newItem.hospitalName}.`,
        timestamp: 'Just now',
        severity: 'success',
        targetPage: 'Inventory',
      });
    },
    [addNotification]
  );

  // Action: Delete Inventory Item
  const deleteInventoryItem = useCallback(
    (id: string) => {
      setInventory((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        storage.saveInventory(updated);
        return updated;
      });
    },
    []
  );

  // Action: Notification operations
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      storage.saveNotifications(updated);
      return updated;
    });
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      storage.saveNotifications(updated);
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    storage.saveNotifications([]);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.saveSettings(updated);
      return updated;
    });
  }, []);

  // Action: Reset All Data to Initial Seed
  const resetAllData = useCallback(() => {
    const fresh = storage.resetAll();
    setRequests(fresh.requests);
    setHospitals(fresh.hospitals);
    setInventory(fresh.inventory);
    setAllocationHistory(fresh.history);
    setNotifications(fresh.notifications);
    setSettings(fresh.settings);
  }, []);

  const openProcessModalWithData = useCallback((data: AllocationResultData) => {
    setSelectedProcessData(data);
    setIsProcessModalOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      requests,
      hospitals,
      inventory,
      allocationHistory,
      notifications,
      settings,
      unreadNotificationsCount,
      lowStockAlerts,
      isHydrated,
      activePage,
      setActivePage,
      globalSearchQuery,
      setGlobalSearchQuery,
      simulationState,
      submitEmergencyRequest,
      updateRequestStatus,
      cancelRequest,
      completeRequest,
      updateInventoryItemStock,
      addInventoryItem,
      deleteInventoryItem,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      updateSettings,
      resetAllData,
      selectedProcessData,
      setSelectedProcessData,
      isProcessModalOpen,
      setIsProcessModalOpen,
      openProcessModalWithData,
    }),
    [
      requests,
      hospitals,
      inventory,
      allocationHistory,
      notifications,
      settings,
      unreadNotificationsCount,
      lowStockAlerts,
      isHydrated,
      activePage,
      globalSearchQuery,
      simulationState,
      submitEmergencyRequest,
      updateRequestStatus,
      cancelRequest,
      completeRequest,
      updateInventoryItemStock,
      addInventoryItem,
      deleteInventoryItem,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      clearAllNotifications,
      updateSettings,
      resetAllData,
      selectedProcessData,
      isProcessModalOpen,
      openProcessModalWithData,
    ]
  );

  return <MedAllocContext.Provider value={value}>{children}</MedAllocContext.Provider>;
}

export function useMedAlloc() {
  const context = useContext(MedAllocContext);
  if (!context) {
    throw new Error('useMedAlloc must be used within a MedAllocProvider');
  }
  return context;
}
