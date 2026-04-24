/**
 * http-client.ts
 *
 * Centralised HTTP utility – mirrors the interceptor pattern from http-config.ts.
 * All API responses are funnelled through here so errors and success messages
 * are displayed consistently with react-hot-toast across the whole application.
 *
 * Usage:
 *   import { httpPost, httpGet } from '@/lib/http-client';
 *
 *   const data = await httpPost('/some/endpoint', { key: 'value' });
 *   const data = await httpGet('/some/endpoint');
 */

import toast from 'react-hot-toast';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type JsonRecord = Record<string, unknown>;

export type HttpOptions = {
  /** Extra headers to merge into every request. */
  headers?: HeadersInit;
  /**
   * When true, a success toast is shown using the response `message` field.
   * Default: false (callers decide when to show success messages).
   */
  showSuccessToast?: boolean;
  /**
   * Override the success message text instead of reading it from the response.
   */
  successMessage?: string;
  /**
   * When true, the error toast is suppressed (caller handles it manually).
   * Default: false (errors are always toasted automatically).
   */
  suppressErrorToast?: boolean;
};

// ---------------------------------------------------------------------------
// Message extraction – handles all API error shapes used by the backend
// ---------------------------------------------------------------------------

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Extracts a human-readable message from any API response/error payload.
 *
 * Supported shapes:
 *   { message: "..." }
 *   { error: "..." }
 *   { errors: [{ code: "...", detail: "..." }] }   ← PIT backend format
 *   { errors: { field: ["error1"] } }               ← Laravel 422 format
 *   { errors: { field: "error" } }
 */
export function extractApiMessage(
  payload: unknown,
  fallback: string
): string {
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (!isJsonRecord(payload)) {
    return fallback;
  }

  // Top-level message field
  const directMessage = payload.message;
  if (typeof directMessage === 'string' && directMessage.trim()) {
    return directMessage;
  }

  // errors array: [{ code: "...", detail: "..." }]
  const errorsValue = payload.errors;
  if (Array.isArray(errorsValue) && errorsValue.length > 0) {
    const details = errorsValue
      .map((e) =>
        isJsonRecord(e) && typeof e.detail === 'string' ? e.detail.trim() : null
      )
      .filter(Boolean);

    if (details.length > 0) return details.join(' ') as string;
  }

  // errors object: { field: ["msg"] } or { field: "msg" }
  if (isJsonRecord(errorsValue)) {
    for (const value of Object.values(errorsValue)) {
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  // Fallback to top-level error string
  const error = payload.error;
  if (typeof error === 'string' && error.trim()) return error;

  return fallback;
}

// ---------------------------------------------------------------------------
// Core request function
// ---------------------------------------------------------------------------

async function request(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  body?: JsonRecord,
  options: HttpOptions = {}
): Promise<unknown> {
  const { headers, showSuccessToast, successMessage, suppressErrorToast } =
    options;

  // Build headers
  const requestHeaders = new Headers({
    Accept: 'application/json',
    'Content-Type': 'application/json',
  });

  if (headers) {
    new Headers(headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });
  }

  // Execute
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    const networkMessage = `Network error – could not reach ${url}.`;
    if (!suppressErrorToast && typeof window !== 'undefined') {
      toast.error(networkMessage);
    }
    throw new Error(networkMessage);
  }

  // Parse body (may be empty for 204 No Content etc.)
  let data: unknown = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // ── Error handling ───────────────────────────────────────────────────────
  if (!response.ok) {
    const message = extractApiMessage(
      data,
      `Request failed. (${response.status})`
    );

    if (!suppressErrorToast && typeof window !== 'undefined') {
      toast.error(message);
    }

    throw new Error(message);
  }

  // ── Success toast (opt-in) ───────────────────────────────────────────────
  if (showSuccessToast && typeof window !== 'undefined') {
    const message =
      successMessage ?? extractApiMessage(data, 'Done successfully.');
    toast.success(message);
  }

  return data;
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

export function httpPost(
  url: string,
  body?: JsonRecord,
  options?: HttpOptions
): Promise<unknown> {
  return request('POST', url, body, options);
}

export function httpGet(
  url: string,
  options?: HttpOptions
): Promise<unknown> {
  return request('GET', url, undefined, options);
}

export function httpPut(
  url: string,
  body?: JsonRecord,
  options?: HttpOptions
): Promise<unknown> {
  return request('PUT', url, body, options);
}

export function httpPatch(
  url: string,
  body?: JsonRecord,
  options?: HttpOptions
): Promise<unknown> {
  return request('PATCH', url, body, options);
}

export function httpDelete(
  url: string,
  body?: JsonRecord,
  options?: HttpOptions
): Promise<unknown> {
  return request('DELETE', url, body, options);
}
