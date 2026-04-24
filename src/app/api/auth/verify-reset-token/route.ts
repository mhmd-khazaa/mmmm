import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractMessage } from '@/lib/auth/tenant-auth';
import { setTenantSessionCookies, tenantApiFetch } from '@/lib/auth/tenant-api';

const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
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

    const parsed = verifyResetTokenSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid request data.' },
        { status: 400 }
      );
    }

    const { response, payload, tenantBaseUrl } = await tenantApiFetch({
      path: '/auth/verify-reset-token',
      body: {
        token: parsed.data.token,
        email: parsed.data.email,
      },
      email: parsed.data.email,
      tenantBaseUrl: parsed.data.tenantBaseUrl,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: extractMessage(payload, 'Invalid or expired reset token.') },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(payload, { status: response.status });

    setTenantSessionCookies(nextResponse, { tenantBaseUrl });

    return nextResponse;
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Unable to verify reset token.',
      },
      { status: 500 }
    );
  }
}
