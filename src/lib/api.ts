import axios, {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import toast from 'react-hot-toast';
import { getAuthToken, getTenantBaseUrl } from '@/lib/auth';

export const TENANT_LOOKUP_URL =
  process.env.NEXT_PUBLIC_TENANT_LOOKUP_URL?.trim() ||
  'https://pit-lookup.notprovision.com/';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, show a success toast using the response `message` field. */
    showSuccessToast?: boolean;
    /** When true, swallow the automatic error toast (caller handles it). */
    suppressErrorToast?: boolean;
    /** When true, attach the bearer token from storage. Default: true. */
    withAuthToken?: boolean;
    /** Override the tenant base URL for a single call. */
    tenantBaseUrl?: string;
  }
}

type Json = Record<string, unknown>;

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function extractMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'string' && payload.trim()) return payload;
  if (!isRecord(payload)) return fallback;

  if (typeof payload.message === 'string' && payload.message.trim()) {
    return payload.message;
  }

  const errors = payload.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    const details = errors
      .map((e) => (isRecord(e) && typeof e.detail === 'string' ? e.detail.trim() : null))
      .filter(Boolean);
    if (details.length) return details.join(' ') as string;
  }

  if (isRecord(errors)) {
    for (const value of Object.values(errors)) {
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  }

  if (typeof payload.error === 'string' && payload.error.trim()) return payload.error;

  return fallback;
}

function buildClient(): AxiosInstance {
  const client = axios.create({
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const baseUrl = config.tenantBaseUrl ?? getTenantBaseUrl();
    if (baseUrl && config.url?.startsWith('/')) {
      config.baseURL = baseUrl;
    }

    if (config.withAuthToken !== false) {
      const token = getAuthToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = token.toLowerCase().startsWith('bearer ')
          ? token
          : `Bearer ${token}`;
      }
    }
    return config;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      if (response.config.showSuccessToast && typeof window !== 'undefined') {
        const message = extractMessage(response.data, 'Done successfully.');
        toast.success(message);
      }
      return response;
    },
    (error: AxiosError) => {
      const status = error.response?.status;
      const message = extractMessage(
        error.response?.data,
        status ? `Request failed. (${status})` : `Network error.`
      );
      if (!error.config?.suppressErrorToast && typeof window !== 'undefined') {
        toast.error(message);
      }
      return Promise.reject(new Error(message));
    }
  );

  return client;
}

export const api = buildClient();

export async function lookupTenantBaseUrl(email: string): Promise<string> {
  const { data } = await api.post<Json>(
    TENANT_LOOKUP_URL,
    { email },
    { withAuthToken: false }
  );

  const candidates: unknown[] = [data?.base_url, data?.baseUrl, data?.url];
  if (isRecord(data?.data)) {
    candidates.push(data.data.base_url, data.data.baseUrl, data.data.url);
  }

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().replace(/\/+$/, '');
    }
  }

  throw new Error(extractMessage(data, 'Tenant lookup did not return a valid base URL.'));
}
