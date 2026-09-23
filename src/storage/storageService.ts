import { STORAGE_KEYS } from './storageKeys';

/**
 * Centralised localStorage abstraction.
 * Never call localStorage directly in components or slices — use this module.
 */

export function storageGet<T>(key: typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storageSet<T>(
  key: typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS],
  value: T,
): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or private mode — fail silently
  }
}

export function storageRemove(key: typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]): void {
  localStorage.removeItem(key);
}

export function storageClear(): void {
  // Only clear bw_ prefixed keys to avoid touching unrelated browser storage
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}
