import { z } from 'zod';
import { messages } from '@/config/messages';
import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './common-rules';

// form zod validation schema
export const signUpSchema = z
  .object({
    // Some sign-up variants include names, others only email/password.
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: validateEmail,
    password: validatePassword,
    confirmPassword: validateConfirmPassword.optional(),
    isAgreed: z.boolean().refine((value) => value, {
      message: 'You must agree to the Terms and Privacy Policy',
    }),
  })
  .refine(
    (data) => {
      if (!data.confirmPassword) return true;
      return data.password === data.confirmPassword;
    },
    {
      message: messages.passwordsDidNotMatch,
      path: ['confirmPassword'],
    }
  );

// generate form types from zod validation schema
export type SignUpSchema = z.infer<typeof signUpSchema>;
