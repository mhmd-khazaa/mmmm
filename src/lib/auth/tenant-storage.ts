import {
  AUTH_TOKEN_STORAGE_KEY,
  TENANT_BASE_URL_STORAGE_KEY,
} from '@/config/api';

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function getStoredTenantBaseUrl() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(TENANT_BASE_URL_STORAGE_KEY);
  if (!value?.trim()) return null;
  return normalizeBaseUrl(value);
}

export function persistTenantBaseUrl(value: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TENANT_BASE_URL_STORAGE_KEY, normalizeBaseUrl(value));
}

export function clearTenantBaseUrl() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TENANT_BASE_URL_STORAGE_KEY);
}

export function getStoredAuthToken() {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  if (!value?.trim()) return null;
  return value;
}

export function persistAuthToken(value: string | null) {
  if (typeof window === 'undefined') return;
  if (!value) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, value);
}
