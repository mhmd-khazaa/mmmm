import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  TENANT_BASE_URL_COOKIE,
  extractMessage,
} from '@/lib/auth/tenant-auth';
import { clearTenantSessionCookies, tenantApiFetch } from '@/lib/auth/tenant-api';

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const tenantBaseUrl = cookieStore.get(TENANT_BASE_URL_COOKIE)?.value;
  const authorizationHeader = request.headers.get('authorization');
  const forwardHeaders: HeadersInit = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };

  if (authorizationHeader) {
    forwardHeaders.Authorization = authorizationHeader;
  }

  if (!tenantBaseUrl) {
    return NextResponse.json(
      { message: 'No tenant session found for logout.' },
      { status: 400 }
    );
  }

  try {
    const { response, payload } = await tenantApiFetch({
      path: '/auth/logout',
      cookieStore,
      includeAuthToken: true,
      headers: forwardHeaders,
    });
    const nextResponse = NextResponse.json(
      response.ok
        ? payload ?? { message: 'Logged out successfully.' }
        : { message: extractMessage(payload, 'Unable to logout.') },
      { status: response.ok ? response.status : response.status }
    );

    clearTenantSessionCookies(nextResponse);

    return nextResponse;
  } catch (error) {
    const nextResponse = NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Unable to process logout request.',
      },
      { status: 500 }
    );

    clearTenantSessionCookies(nextResponse);

    return nextResponse;
  }
}