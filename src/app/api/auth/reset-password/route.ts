import { NextResponse } from 'next/server';
import { z } from 'zod';
import { extractMessage } from '@/lib/auth/tenant-auth';
import { setTenantSessionCookies, tenantApiFetch } from '@/lib/auth/tenant-api';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be at most 100 characters long'),
  password_confirmation: z
    .string()
    .min(8, 'Password confirmation must be at least 8 characters long')
    .max(100, 'Password confirmation must be at most 100 characters long'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match.',
  path: ['password_confirmation'],
});

export async function POST(request: Request) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid request data.' },
        { status: 400 }
      );
    }

    const { response, payload, tenantBaseUrl } = await tenantApiFetch({
      path: '/auth/reset-password',
      body: parsed.data,
      email: parsed.data.email,
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: extractMessage(payload, 'Unable to reset password.') },
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
          error instanceof Error ? error.message : 'Unable to reset password.',
      },
      { status: 500 }
    );
  }
}
