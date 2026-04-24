import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractMessage } from '@/lib/auth/tenant-auth';
import { setTenantSessionCookies, tenantApiFetch } from '@/lib/auth/tenant-api';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid request data.' },
        { status: 400 }
      );
    }

    const { response, payload, tenantBaseUrl } = await tenantApiFetch({
      path: '/auth/forgot-password',
      body: parsed.data,
      email: parsed.data.email,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: extractMessage(payload, 'Unable to send reset code.') },
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
            : 'Unable to process forgot password request.',
      },
      { status: 500 }
    );
  }
}
