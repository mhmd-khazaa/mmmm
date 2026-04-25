import { TENANT_LOOKUP_URL } from '@/config/api';

export { TENANT_BASE_URL_COOKIE, AUTH_TOKEN_COOKIE } from '@/config/api';

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractLookupBaseUrl(payload: unknown) {
  if (!isJsonRecord(payload)) {
    return null;
  }

  const directCandidates = [
    payload.base_url,
    payload.baseUrl,
    payload.url,
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
    nested.base_url,
    nested.baseUrl,
    nested.url,
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

export function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}

export function buildTenantUrl(baseUrl: string, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`;
}

export async function parseResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

export function extractMessage(
  payload: unknown,
  fallbackMessage = 'Something went wrong.'
) {
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

  const errors = payload.errors;

  if (Array.isArray(errors) && typeof errors[0] === 'string') {
    return errors[0];
  }

  return fallbackMessage;
}

export function extractToken(payload: unknown) {
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

  const data = payload.data;

  if (!isJsonRecord(data)) {
    return null;
  }

  const nestedCandidates = [
    data.token,
    data.access_token,
    data.accessToken,
    data.jwt,
  ];

  for (const candidate of nestedCandidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate;
    }
  }

  return null;
}

export async function resolveTenantBaseUrl(email: string) {
  const response = await fetch(TENANT_LOOKUP_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    cache: 'no-store',
  });

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new Error(extractMessage(payload, 'Unable to resolve tenant base URL.'));
  }

  const baseUrl = extractLookupBaseUrl(payload);

  if (typeof baseUrl !== 'string' || !baseUrl.trim()) {
    throw new Error('Tenant lookup did not return a valid base URL.');
  }

  return normalizeBaseUrl(baseUrl);
}
