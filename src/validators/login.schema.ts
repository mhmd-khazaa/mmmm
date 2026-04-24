import { z } from 'zod';

// form zod validation schema
export const lookupLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

export const loginSchema = lookupLoginSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password must be at most 100 characters long'),
});

// generate form types from zod validation schema
export type LoginSchema = z.infer<typeof lookupLoginSchema>;
export type LoginWithPasswordSchema = z.infer<typeof loginSchema>;
