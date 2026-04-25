export const TENANT_LOOKUP_URL =
  process.env.NEXT_PUBLIC_TENANT_LOOKUP_URL?.trim() ||
  'https://pit-lookup.notprovision.com/';

export const TENANT_BASE_URL_STORAGE_KEY = 'pit_tenant_base_url';
export const AUTH_TOKEN_STORAGE_KEY = 'pit_auth_token';

export const TENANT_BASE_URL_COOKIE = 'pit_tenant_base_url';
export const AUTH_TOKEN_COOKIE = 'pit_auth_token';

export const AUTH_PATHS = {
  login: '/auth/login',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  verifyResetToken: '/auth/verify-reset-token',
} as const;
