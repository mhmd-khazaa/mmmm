import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  extractMessage,
  extractToken,
  resolveTenantBaseUrl,
} from '@/lib/auth/tenant-auth';
import { setTenantSessionCookies, tenantApiFetch } from '@/lib/auth/tenant-api';
import { passwordSchema } from '@/validators/login.schema';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  tenantBaseUrl: z.string().url('Invalid tenant base URL').optional(),
});

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid login data.' },
        { status: 400 }
      );
    }

    const tenantBaseUrl = parsed.data.tenantBaseUrl
      ? parsed.data.tenantBaseUrl
      : await resolveTenantBaseUrl(parsed.data.email);

    const { response, payload } = await tenantApiFetch({
      path: '/auth/login',
      body: {
        email: parsed.data.email,
        password: parsed.data.password,
      },
      tenantBaseUrl,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: extractMessage(payload, 'Login failed.') },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(payload, { status: response.status });
    const authToken = extractToken(payload);

    setTenantSessionCookies(nextResponse, { tenantBaseUrl, authToken });

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Unable to process login request.',
      },
      { status: 500 }
    );
  }
}
