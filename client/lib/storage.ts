/**
 * Safe LocalStorage Persistence Layer for MedAlloc Prototype
 * Handles browser localStorage hydration, JSON serialization, and fallback initial mock data.
 */

import {
  EmergencyRequest,
  Hospital,
  InventoryItem,
  AllocationHistoryItem,
  NotificationItem,
  Settings,
} from './types';
import {
  INITIAL_HOSPITALS,
  INITIAL_INVENTORY,
  INITIAL_REQUESTS,
  INITIAL_ALLOCATION_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_SETTINGS,
} from './initialData';

export const STORAGE_KEYS = {
  REQUESTS: 'medalloc_requests',
  HOSPITALS: 'medalloc_hospitals',
  INVENTORY: 'medalloc_inventory',
  HISTORY: 'medalloc_history',
  NOTIFICATIONS: 'medalloc_notifications',
  SETTINGS: 'medalloc_settings',
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser()) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      // Initialize with default value immediately
      window.localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to localStorage key "${key}":`, err);
  }
}

export const storage = {
  getRequests: (): EmergencyRequest[] =>
    getFromStorage<EmergencyRequest[]>(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS),
  saveRequests: (data: EmergencyRequest[]): void =>
    saveToStorage(STORAGE_KEYS.REQUESTS, data),

  getHospitals: (): Hospital[] =>
    getFromStorage<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS),
  saveHospitals: (data: Hospital[]): void =>
    saveToStorage(STORAGE_KEYS.HOSPITALS, data),

  getInventory: (): InventoryItem[] =>
    getFromStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, INITIAL_INVENTORY),
  saveInventory: (data: InventoryItem[]): void =>
    saveToStorage(STORAGE_KEYS.INVENTORY, data),

  getHistory: (): AllocationHistoryItem[] =>
    getFromStorage<AllocationHistoryItem[]>(STORAGE_KEYS.HISTORY, INITIAL_ALLOCATION_HISTORY),
  saveHistory: (data: AllocationHistoryItem[]): void =>
    saveToStorage(STORAGE_KEYS.HISTORY, data),

  getNotifications: (): NotificationItem[] =>
    getFromStorage<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  saveNotifications: (data: NotificationItem[]): void =>
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, data),

  getSettings: (): Settings =>
    getFromStorage<Settings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS),
  saveSettings: (data: Settings): void =>
    saveToStorage(STORAGE_KEYS.SETTINGS, data),

  resetAll: (): {
    requests: EmergencyRequest[];
    hospitals: Hospital[];
    inventory: InventoryItem[];
    history: AllocationHistoryItem[];
    notifications: NotificationItem[];
    settings: Settings;
  } => {
    if (isBrowser()) {
      window.localStorage.removeItem(STORAGE_KEYS.REQUESTS);
      window.localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
      window.localStorage.removeItem(STORAGE_KEYS.INVENTORY);
      window.localStorage.removeItem(STORAGE_KEYS.HISTORY);
      window.localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
      window.localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    }
    const freshData = {
      requests: INITIAL_REQUESTS,
      hospitals: INITIAL_HOSPITALS,
      inventory: INITIAL_INVENTORY,
      history: INITIAL_ALLOCATION_HISTORY,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
    };
    saveToStorage(STORAGE_KEYS.REQUESTS, freshData.requests);
    saveToStorage(STORAGE_KEYS.HOSPITALS, freshData.hospitals);
    saveToStorage(STORAGE_KEYS.INVENTORY, freshData.inventory);
    saveToStorage(STORAGE_KEYS.HISTORY, freshData.history);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, freshData.notifications);
    saveToStorage(STORAGE_KEYS.SETTINGS, freshData.settings);
    return freshData;
  },
};

