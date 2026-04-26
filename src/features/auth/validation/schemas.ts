import { z } from 'zod';
import { messages } from '@/config/messages';

const email = z
  .string()
  .min(1, { message: messages.emailIsRequired })
  .email({ message: messages.invalidEmail });

const password = z
  .string()
  .min(1, { message: messages.passwordRequired })
  .min(6, { message: messages.passwordLengthMin })
  .regex(/.*[A-Z].*/, { message: messages.passwordOneUppercase })
  .regex(/.*[a-z].*/, { message: messages.passwordOneLowercase })
  .regex(/.*\d.*/, { message: messages.passwordOneNumeric });

const confirmPassword = z
  .string()
  .min(1, { message: messages.confirmPasswordRequired });

export const lookupLoginSchema = z.object({
  email,
  password: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

export const loginSchema = lookupLoginSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export type LoginSchema = z.infer<typeof lookupLoginSchema>;

export const signUpSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email,
    password,
    confirmPassword: confirmPassword.optional(),
    isAgreed: z.boolean().refine((v) => v, {
      message: 'You must agree to the Terms and Privacy Policy',
    }),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    { message: messages.passwordsDidNotMatch, path: ['confirmPassword'] }
  );

export type SignUpSchema = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    email,
    password,
    confirmPassword: password,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: messages.passwordsDidNotMatch,
    path: ['confirmPassword'],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
