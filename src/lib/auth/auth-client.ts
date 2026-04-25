import { AUTH_PATHS } from '@/config/api';
import { JsonRecord } from '@/lib/http-client';
import { tenantPost } from '@/lib/auth/tenant-http';
import {
  clearTenantBaseUrl,
  getStoredAuthToken,
  getStoredTenantBaseUrl,
  persistAuthToken,
} from '@/lib/auth/tenant-storage';

export {
  TENANT_BASE_URL_STORAGE_KEY,
  AUTH_TOKEN_STORAGE_KEY,
} from '@/config/api';
export { lookupTenantBaseUrl } from '@/lib/auth/tenant-http';
export { persistTenantBaseUrl } from '@/lib/auth/tenant-storage';

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractToken(payload: unknown): string | null {
  const candidates: unknown[] = [];

  if (isJsonRecord(payload)) {
    candidates.push(payload.token, payload.access_token, payload.accessToken, payload.jwt);
    if (isJsonRecord(payload.data)) {
      candidates.push(
        payload.data.token,
        payload.data.access_token,
        payload.data.accessToken,
        payload.data.jwt
      );
    }
  }

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

export async function loginUser(payload: {
  email: string;
  password: string;
  tenantBaseUrl?: string;
}) {
  const response = await tenantPost(
    AUTH_PATHS.login,
    { email: payload.email, password: payload.password },
    {
      email: payload.email,
      tenantBaseUrl: payload.tenantBaseUrl,
      withAuthToken: false,
      showSuccessToast: true,
    }
  );

  const token = extractToken(response);
  persistAuthToken(token);

  return response;
}

export async function logoutUser() {
  const tenantBaseUrl = getStoredTenantBaseUrl();
  const authToken = getStoredAuthToken();

  if (!tenantBaseUrl) {
    throw new Error('Tenant base URL is not available for logout.');
  }
  if (!authToken) {
    throw new Error('No auth token available for logout.');
  }

  try {
    return await tenantPost(AUTH_PATHS.logout, undefined, { showSuccessToast: true });
  } finally {
    persistAuthToken(null);
    clearTenantBaseUrl();
  }
}

export async function requestPasswordReset(payload: { email: string }) {
  return tenantPost(
    AUTH_PATHS.forgotPassword,
    { email: payload.email },
    {
      email: payload.email,
      withAuthToken: false,
      showSuccessToast: true,
    }
  );
}

export async function verifyResetToken(payload: {
  email: string;
  token: string;
  tenantBaseUrl?: string;
}) {
  return tenantPost(
    AUTH_PATHS.verifyResetToken,
    { email: payload.email, token: payload.token },
    {
      email: payload.email,
      tenantBaseUrl: payload.tenantBaseUrl,
      withAuthToken: false,
      suppressErrorToast: true,
    }
  );
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  return tenantPost(
    AUTH_PATHS.resetPassword,
    {
      email: payload.email,
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
    },
    {
      email: payload.email,
      withAuthToken: false,
      showSuccessToast: true,
    }
  );
}
