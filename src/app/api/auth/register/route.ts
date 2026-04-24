import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(32, "Password can't be more than 32 characters"),
});

type StoredUser = {
  firstName?: string;
  lastName?: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

const usersByEmail = new Map<string, StoredUser>();

function hashPassword(password: string) {
  return createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? 'Invalid request data',
        },
        { status: 400 }
      );
    }

    const payload = parsed.data;
    const normalizedEmail = payload.email.toLowerCase().trim();

    if (usersByEmail.has(normalizedEmail)) {
      return NextResponse.json(
        { message: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    usersByEmail.set(normalizedEmail, {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: normalizedEmail,
      passwordHash: hashPassword(payload.password),
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json(
      { message: 'Account created successfully.' },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: 'Unable to process registration request.' },
      { status: 500 }
    );
  }
}
