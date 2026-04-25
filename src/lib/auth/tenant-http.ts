/**
 * tenant-http.ts
 *
 * Tenant-aware HTTP client. Acts as the request interceptor for the multi-tenant
 * sharded backend:
 *   1. Resolves the tenant base URL from localStorage, or by calling the lookup
 *      API when an email is available and nothing is stored.
 *   2. Persists the resolved base URL to localStorage so subsequent calls reuse it.
 *   3. Attaches the bearer token from localStorage when available.
 *   4. Delegates the actual request to httpPost / httpGet, which centralise
 *      success and error toasts via react-hot-toast.
 *
 * Callers pass relative paths (e.g. '/auth/login'); the base URL is injected here.
 */
import { TENANT_LOOKUP_URL } from '@/config/api';
import {
  HttpOptions,
  JsonRecord,
  extractApiMessage,
  httpGet,
  httpPost,
  httpPut,
  httpPatch,
  httpDelete,
} from '@/lib/http-client';
import {
  getStoredAuthToken,
  getStoredTenantBaseUrl,
  persistTenantBaseUrl,
} from '@/lib/auth/tenant-storage';

type TenantRequestOptions = HttpOptions & {
  /** Email to use for lookup if no tenant base URL is cached. */
  email?: string;
  /** Override the resolved tenant base URL for this single call. */
  tenantBaseUrl?: string;
  /** Attach the stored bearer token. Default: true. */
  withAuthToken?: boolean;
};

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractLookupBaseUrl(payload: unknown): string | null {
  const candidates: unknown[] = [];

  if (isJsonRecord(payload)) {
    candidates.push(payload.base_url, payload.baseUrl, payload.url);
    if (isJsonRecord(payload.data)) {
      candidates.push(payload.data.base_url, payload.data.baseUrl, payload.data.url);
    }
  }

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().replace(/\/+$/, '');
    }
  }

  return null;
}

/**
 * Calls the lookup API and persists the resolved base URL to localStorage.
 * Errors and any opt-in success toast are handled by the underlying httpPost.
 */
export async function lookupTenantBaseUrl(email: string): Promise<string> {
  const payload = await httpPost(
    TENANT_LOOKUP_URL,
    { email },
    { suppressErrorToast: false }
  );

  const baseUrl = extractLookupBaseUrl(payload);

  if (!baseUrl) {
    const message = extractApiMessage(
      payload,
      'Tenant lookup did not return a valid base URL.'
    );
    throw new Error(message);
  }

  persistTenantBaseUrl(baseUrl);
  return baseUrl;
}

async function resolveBaseUrl(options: TenantRequestOptions): Promise<string> {
  if (options.tenantBaseUrl) {
    const normalized = options.tenantBaseUrl.trim().replace(/\/+$/, '');
    persistTenantBaseUrl(normalized);
    return normalized;
  }

  const stored = getStoredTenantBaseUrl();
  if (stored) return stored;

  if (options.email) {
    return lookupTenantBaseUrl(options.email);
  }

  throw new Error(
    'No tenant base URL available. Sign in again to refresh tenant routing.'
  );
}

function withAuthHeader(
  headers: HeadersInit | undefined,
  withAuthToken: boolean
): HeadersInit | undefined {
  if (!withAuthToken) return headers;

  const token = getStoredAuthToken();
  if (!token) return headers;

  const merged = new Headers(headers);
  if (!merged.has('Authorization')) {
    const value = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`;
    merged.set('Authorization', value);
  }
  return merged;
}

async function buildRequestArgs(
  path: string,
  options: TenantRequestOptions
): Promise<{ url: string; httpOptions: HttpOptions }> {
  const baseUrl = await resolveBaseUrl(options);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${normalizedPath}`;

  const { email, tenantBaseUrl, withAuthToken = true, headers, ...rest } = options;
  const httpOptions: HttpOptions = {
    ...rest,
    headers: withAuthHeader(headers, withAuthToken),
  };

  return { url, httpOptions };
}

export async function tenantPost(
  path: string,
  body?: JsonRecord,
  options: TenantRequestOptions = {}
) {
  const { url, httpOptions } = await buildRequestArgs(path, options);
  return httpPost(url, body, httpOptions);
}

export async function tenantGet(path: string, options: TenantRequestOptions = {}) {
  const { url, httpOptions } = await buildRequestArgs(path, options);
  return httpGet(url, httpOptions);
}

export async function tenantPut(
  path: string,
  body?: JsonRecord,
  options: TenantRequestOptions = {}
) {
  const { url, httpOptions } = await buildRequestArgs(path, options);
  return httpPut(url, body, httpOptions);
}

export async function tenantPatch(
  path: string,
  body?: JsonRecord,
  options: TenantRequestOptions = {}
) {
  const { url, httpOptions } = await buildRequestArgs(path, options);
  return httpPatch(url, body, httpOptions);
}

export async function tenantDelete(
  path: string,
  body?: JsonRecord,
  options: TenantRequestOptions = {}
) {
  const { url, httpOptions } = await buildRequestArgs(path, options);
  return httpDelete(url, body, httpOptions);
}
