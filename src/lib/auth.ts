import { api, lookupTenantBaseUrl } from '@/lib/api';

const TOKEN_KEY = 'pit_auth_token';
const TENANT_KEY = 'pit_tenant_base_url';

const AUTH_PATHS = {
  login: '/auth/login',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyResetToken: '/auth/verify-reset-token',
} as const;

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY) || null;
}

export function setAuthToken(value: string | null) {
  if (typeof window === 'undefined') return;
  if (!value) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, value);
}

export function getTenantBaseUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(TENANT_KEY);
  return value ? value.replace(/\/+$/, '') : null;
}

export function setTenantBaseUrl(value: string | null) {
  if (typeof window === 'undefined') return;
  if (!value) {
    window.localStorage.removeItem(TENANT_KEY);
    return;
  }
  window.localStorage.setItem(TENANT_KEY, value.trim().replace(/\/+$/, ''));
}

export { lookupTenantBaseUrl };

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, unknown>;
  const candidates = [data.token, data.access_token, data.accessToken, data.jwt];

  if (data.data && typeof data.data === 'object') {
    const nested = data.data as Record<string, unknown>;
    candidates.push(nested.token, nested.access_token, nested.accessToken, nested.jwt);
  }

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c;
  }
  return null;
}

export async function login(payload: {
  email: string;
  password: string;
  tenantBaseUrl?: string;
}) {
  const baseUrl = payload.tenantBaseUrl ?? (await lookupTenantBaseUrl(payload.email));
  setTenantBaseUrl(baseUrl);

  const { data } = await api.post(
    AUTH_PATHS.login,
    { email: payload.email, password: payload.password },
    { withAuthToken: false, showSuccessToast: true, tenantBaseUrl: baseUrl }
  );

  setAuthToken(extractToken(data));
  return data;
}

export async function logout() {
  try {
    const { data } = await api.post(AUTH_PATHS.logout, undefined, {
      showSuccessToast: true,
    });
    return data;
  } finally {
    setAuthToken(null);
    setTenantBaseUrl(null);
  }
}

export async function requestPasswordReset(email: string) {
  const baseUrl = await lookupTenantBaseUrl(email);
  setTenantBaseUrl(baseUrl);
  const { data } = await api.post(
    AUTH_PATHS.forgotPassword,
    { email },
    { withAuthToken: false, showSuccessToast: true, tenantBaseUrl: baseUrl }
  );
  return data;
}

export async function verifyResetToken(payload: {
  email: string;
  token: string;
  tenantBaseUrl?: string;
}) {
  const baseUrl = payload.tenantBaseUrl ?? (await lookupTenantBaseUrl(payload.email));
  setTenantBaseUrl(baseUrl);
  const { data } = await api.post(
    AUTH_PATHS.verifyResetToken,
    { email: payload.email, token: payload.token },
    { withAuthToken: false, suppressErrorToast: true, tenantBaseUrl: baseUrl }
  );
  return data;
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const { data } = await api.post(
    AUTH_PATHS.resetPassword,
    payload,
    { withAuthToken: false, showSuccessToast: true }
  );
  return data;
}
