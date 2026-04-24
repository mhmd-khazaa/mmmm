import { z } from 'zod';
import { messages } from '@/config/messages';
import { validateEmail } from './common-rules';

const resetPasswordValueSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .max(100, { message: 'Password must be at most 100 characters long' });

// form zod validation schema
export const resetPasswordSchema = z
  .object({
    email: validateEmail,
    password: resetPasswordValueSchema,
    confirmPassword: resetPasswordValueSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordsDidNotMatch,
    path: ['confirmPassword'], // Correct path for the confirmedPassword field
  });

// generate form types from zod validation schema
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
