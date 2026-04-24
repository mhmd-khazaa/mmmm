type JsonRecord = Record<string, unknown>;

const TENANT_LOOKUP_URL = 'https://pit-lookup.notprovision.com/';
export const TENANT_BASE_URL_STORAGE_KEY = 'pit_tenant_base_url';
export const AUTH_TOKEN_STORAGE_KEY = 'pit_auth_token';
let authTokenInMemory: string | null = null;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractMessage(payload: unknown, fallbackMessage: string) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (!isJsonRecord(payload)) {
    return fallbackMessage;
  }

  const directMessage = payload.message;

  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }

  const error = payload.error;

  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  return fallbackMessage;
}

function extractLookupBaseUrl(payload: unknown) {
  if (!isJsonRecord(payload)) {
    return null;
  }

  const directCandidates = [payload.base_url, payload.baseUrl, payload.url];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().replace(/\/+$/, '');
    }
  }

  const nested = payload.data;

  if (!isJsonRecord(nested)) {
    return null;
  }

  const nestedCandidates = [nested.base_url, nested.baseUrl, nested.url];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().replace(/\/+$/, '');
    }
  }

  return null;
}

function extractToken(payload: unknown) {
  if (!isJsonRecord(payload)) {
    return null;
  }

  const directCandidates = [
    payload.token,
    payload.access_token,
    payload.accessToken,
    payload.jwt,
  ];

  for (const candidate of directCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  const nested = payload.data;

  if (!isJsonRecord(nested)) {
    return null;
  }

  const nestedCandidates = [
    nested.token,
    nested.access_token,
    nested.accessToken,
    nested.jwt,
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

async function apiPost(path: string, body?: JsonRecord, headers?: HeadersInit) {
  let response: Response;

  try {
    const requestHeaders = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });

    if (headers) {
      const customHeaders = new Headers(headers);

      customHeaders.forEach((value, key) => {
        requestHeaders.set(key, value);
      });
    }

    response = await fetch(path, {
      method: 'POST',
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(`Network error while calling ${path}.`);
  }

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      extractMessage(data, `Request failed. (${response.status}) [${path}]`)
    );
  }

  return data;
}

async function resolveTenantBaseUrl(email: string) {
  const payload = await apiPost(TENANT_LOOKUP_URL, { email });
  const tenantBaseUrl = extractLookupBaseUrl(payload);

  if (!tenantBaseUrl) {
    throw new Error('Tenant lookup did not return a valid base URL.');
  }

  return tenantBaseUrl;
}

export function persistTenantBaseUrl(tenantBaseUrl: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    TENANT_BASE_URL_STORAGE_KEY,
    tenantBaseUrl.trim().replace(/\/+$/, '')
  );
}

function getStoredTenantBaseUrl() {
  if (typeof window === 'undefined') {
    return null;
  }

  const tenantBaseUrl = window.localStorage.getItem(TENANT_BASE_URL_STORAGE_KEY);

  if (!tenantBaseUrl?.trim()) {
    return null;
  }

  return tenantBaseUrl.trim().replace(/\/+$/, '');
}

function persistAuthToken(authToken: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!authToken) {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authToken);
}

function getStoredAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const authToken = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);

  if (!authToken?.trim()) {
    return null;
  }

  return authToken;
}

export async function lookupTenantBaseUrl(email: string) {
  const tenantBaseUrl = await resolveTenantBaseUrl(email);

  persistTenantBaseUrl(tenantBaseUrl);

  return tenantBaseUrl;
}

export async function loginUser(payload: {
  email: string;
  password: string;
  tenantBaseUrl?: string;
}) {
  const tenantBaseUrl = payload.tenantBaseUrl ?? (await lookupTenantBaseUrl(payload.email));

  persistTenantBaseUrl(tenantBaseUrl);

  const loginPayload = await apiPost(`${tenantBaseUrl}/auth/login`, {
    email: payload.email,
    password: payload.password,
  });

  authTokenInMemory = extractToken(loginPayload);
  persistAuthToken(authTokenInMemory);

  return loginPayload;
}

export function logoutUser() {
  const tenantBaseUrl = getStoredTenantBaseUrl();
  const authToken = authTokenInMemory ?? getStoredAuthToken();

  const cleanup = () => {
    authTokenInMemory = null;
    persistAuthToken(null);
  };

  if (!authToken) {
    throw new Error('No auth token available for logout.');
  }

  if (!tenantBaseUrl) {
    throw new Error('Tenant base URL is not available for logout.');
  }

  const normalizedAuthToken = authToken.toLowerCase().startsWith('bearer ')
    ? authToken
    : `Bearer ${authToken}`;

  const headers = { Authorization: normalizedAuthToken };

  return apiPost(`${tenantBaseUrl}/auth/logout`, undefined, headers).finally(cleanup);
}

export async function requestPasswordReset(payload: { email: string }) {
  const tenantBaseUrl =
    getStoredTenantBaseUrl() ?? (await lookupTenantBaseUrl(payload.email));

  persistTenantBaseUrl(tenantBaseUrl);

  return apiPost(`${tenantBaseUrl}/auth/forgot-password`, { email: payload.email });
}

export async function verifyResetToken(payload: {
  email: string;
  token: string;
  tenantBaseUrl?: string;
}) {
  const tenantBaseUrl =
    payload.tenantBaseUrl ??
    getStoredTenantBaseUrl() ??
    (await lookupTenantBaseUrl(payload.email));

  persistTenantBaseUrl(tenantBaseUrl);

  return apiPost(`${tenantBaseUrl}/auth/verify-reset-token`, {
    email: payload.email,
    token: payload.token,
  });
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const tenantBaseUrl =
    getStoredTenantBaseUrl() ?? (await lookupTenantBaseUrl(payload.email));

  return apiPost(`${tenantBaseUrl}/auth/reset-password`, {
    email: payload.email,
    token: payload.token,
    password: payload.password,
    password_confirmation: payload.password_confirmation,
  });
}