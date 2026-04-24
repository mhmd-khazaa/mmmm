import { NextResponse } from 'next/server';
import {
  AUTH_TOKEN_COOKIE,
  TENANT_BASE_URL_COOKIE,
  buildTenantUrl,
  normalizeBaseUrl,
  parseResponseBody,
  resolveTenantBaseUrl,
} from '@/lib/auth/tenant-auth';

type CookieStoreLike = {
  get(name: string): { value: string } | undefined;
};

type TenantApiRequestOptions = {
  path: string;
  method?: string;
  body?: unknown;
  tenantBaseUrl?: string;
  email?: string;
  cookieStore?: CookieStoreLike;
  includeAuthToken?: boolean;
  headers?: HeadersInit;
};

type TenantApiResult = {
  response: Response;
  payload: unknown;
  tenantBaseUrl: string;
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

function getTenantBaseUrlFromCookies(cookieStore?: CookieStoreLike) {
  const baseUrl = cookieStore?.get(TENANT_BASE_URL_COOKIE)?.value;

  if (!baseUrl) {
    return null;
  }

  return normalizeBaseUrl(baseUrl);
}

export async function resolveTenantBaseUrlForRequest({
  tenantBaseUrl,
  email,
  cookieStore,
}: {
  tenantBaseUrl?: string;
  email?: string;
  cookieStore?: CookieStoreLike;
}) {
  if (tenantBaseUrl) {
    return normalizeBaseUrl(tenantBaseUrl);
  }

  if (email) {
    return resolveTenantBaseUrl(email);
  }

  const cookieTenantBaseUrl = getTenantBaseUrlFromCookies(cookieStore);

  if (!cookieTenantBaseUrl) {
    throw new Error('No tenant base URL available for this request.');
  }

  return cookieTenantBaseUrl;
}

export async function tenantApiFetch({
  path,
  method = 'POST',
  body,
  tenantBaseUrl,
  email,
  cookieStore,
  includeAuthToken = false,
  headers: initialHeaders,
}: TenantApiRequestOptions): Promise<TenantApiResult> {
  const resolvedTenantBaseUrl = await resolveTenantBaseUrlForRequest({
    tenantBaseUrl,
    email,
    cookieStore,
  });

  const headers = new Headers(initialHeaders);

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (includeAuthToken) {
    const authToken = cookieStore?.get(AUTH_TOKEN_COOKIE)?.value;

    if (authToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }
  }

  const response = await fetch(buildTenantUrl(resolvedTenantBaseUrl, path), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await parseResponseBody(response);

  return {
    response,
    payload,
    tenantBaseUrl: resolvedTenantBaseUrl,
  };
}

export function setTenantSessionCookies(
  nextResponse: NextResponse,
  {
    tenantBaseUrl,
    authToken,
  }: {
    tenantBaseUrl: string;
    authToken?: string | null;
  }
) {
  nextResponse.cookies.set(TENANT_BASE_URL_COOKIE, tenantBaseUrl, COOKIE_OPTIONS);

  if (authToken) {
    nextResponse.cookies.set(AUTH_TOKEN_COOKIE, authToken, COOKIE_OPTIONS);
  }
}

export function clearTenantSessionCookies(nextResponse: NextResponse) {
  nextResponse.cookies.delete(TENANT_BASE_URL_COOKIE);
  nextResponse.cookies.delete(AUTH_TOKEN_COOKIE);
}