import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiClientError, ApiProblemDetail } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1';

// Memory-only short-lived access token store (never stored in localStorage/sessionStorage per Part 7)
let inMemoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (inMemoryAccessToken && config.headers) {
    config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
  }
  return config;
});

async function refreshSession(): Promise<string | null> {
  try {
    const response = await axios.post<{ accessToken: string }>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      },
    );
    const nextToken = response.data.accessToken;
    inMemoryAccessToken = nextToken;
    return nextToken;
  } catch {
    inMemoryAccessToken = null;
    return null;
  }
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiProblemDetail>) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthRoute =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/register');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshSession().finally(() => {
          refreshPromise = null;
        });
      }
      const nextToken = await refreshPromise;
      if (nextToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${nextToken}`;
        return httpClient(originalRequest);
      }
    }

    if (error.response?.data && typeof error.response.data === 'object') {
      throw new ApiClientError({
        ...error.response.data,
        status: error.response.status,
      });
    }

    throw new ApiClientError({
      status: error.response?.status ?? 0,
      errorCode: 'NETWORK_ERROR',
      detail: error.message || 'Unable to connect to AkRealtors API',
    });
  },
);
