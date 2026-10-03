'use client';

import * as React from 'react';

/**
 * Persisted notification state hook.
 *
 * - Loads from localStorage on first mount (per-role key).
 * - If nothing is stored, initializes from mockData respecting each item's read value.
 * - Saves to localStorage on every state change.
 * - Never re-initializes from mock after first load.
 */

export interface PersistedNotification {
  id: string;
  read: boolean;
}

function getStorageKey(role: string): string {
  return `aptis-ai-notifications-${role.toLowerCase()}`;
}

function loadFromStorage<T extends { id: string; read: boolean }>(
  key: string
): T[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as T[];
  } catch {
    return null;
  }
}

function saveToStorage<T extends { id: string; read: boolean }>(
  key: string,
  notifications: T[]
): void {
  if (typeof window === 'undefined') return;
  try {
    const minimal: PersistedNotification[] = notifications.map((n) => ({
      id: n.id,
      read: n.read,
    }));
    window.localStorage.setItem(key, JSON.stringify(minimal));
  } catch {
    // ignore quota / serialization errors
  }
}

export function useNotificationState<T extends { id: string; read: boolean }>(
  role: string,
  mockData: T[]
): [T[], React.Dispatch<React.SetStateAction<T[]>>] {
  const key = getStorageKey(role);
  const [notifications, setNotifications] = React.useState<T[]>([]);
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    const stored = loadFromStorage<T>(key);
    if (stored && stored.length > 0) {
      // Merge stored read states onto mock data to preserve full notification content
      const storedMap = new Map(stored.map((s) => [s.id, s.read]));
      const merged = mockData
        .filter((m) => storedMap.has(m.id))
        .map((m) => ({ ...m, read: storedMap.get(m.id)! }));
      // Include any stored items that no longer exist in mock (deleted)
      const mockIds = new Set(mockData.map((m) => m.id));
      const extraDeleted = stored.filter((s) => !mockIds.has(s.id));
      if (merged.length > 0) {
        setNotifications(merged);
      } else {
        // Stored items no longer match mock — re-init from mock as-is
        setNotifications(mockData.map((m) => ({ ...m })));
      }
    } else {
      // First time: initialize from mock data as-is (respecting each item's read value)
      setNotifications(mockData.map((m) => ({ ...m })));
    }
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (initialized && notifications.length > 0) {
      saveToStorage(key, notifications);
    }
  }, [key, notifications, initialized]);

  return [notifications, setNotifications];
}
