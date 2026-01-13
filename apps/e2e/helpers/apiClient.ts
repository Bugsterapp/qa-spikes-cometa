/**
 * Centralized API Client for E2E Tests
 * This module provides a single source of truth for API interactions,
 * eliminating duplication across helpers.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Api } from '@cometa/trpc/src/types';
import { dataConfig } from '../data/data';

type Environment = 'local' | 'stage' | 'dev' | 'demo' | 'qa';

// Environment configuration
// eslint-disable-next-line turbo/no-undeclared-env-vars
const envVar = (process.env.ENV_PLAYWRIGHT as Environment) || 'dev';
export const baseApiUrl = dataConfig[envVar]?.ADMIN_URL || 'https://api-cometa.dev.getcometa.com/';
const baseUrlWithoutSlash = baseApiUrl.substring(0, baseApiUrl.length - 1);

// Singleton ServiceClient instance
export const ServiceClient = new Api({ baseUrl: baseUrlWithoutSlash }).api;

// Token cache to avoid multiple auth requests
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;
const TOKEN_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get admin authentication token with caching
 */
export async function getAdminToken(username?: string, password?: string): Promise<string> {
  // If custom credentials provided, don't use cache
  if (username || password) {
    return fetchAdminToken(username, password);
  }

  // Check if cached token is still valid
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  // Fetch new token and cache it
  cachedToken = await fetchAdminToken();
  tokenExpiry = Date.now() + TOKEN_CACHE_DURATION;
  return cachedToken;
}

/**
 * Fetch admin token from API
 */
async function fetchAdminToken(username?: string, password?: string): Promise<string> {
  try {
    const headers = { Accept: 'application/json' };
    const data = {
      username: username || 'automationadmin@getcometa.com',
      password: password || 'barriletecosmico',
    };

    const response = await axios.post(`${baseApiUrl}api-token-auth/staff/`, data, { headers });
    return response.data.token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error obteniendo token: ${error.message}`);
    }
    throw new Error('Error desconocido obteniendo token');
  }
}

/**
 * Get authorization headers for API requests
 */
export async function getAuthHeaders(token?: string): Promise<Record<string, string>> {
  const authToken = token || (await getAdminToken());
  return {
    Authorization: `Token ${authToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * API request options
 */
export interface ApiRequestOptions<T = unknown> {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  endpoint: string;
  data?: T;
  token?: string;
  customHeaders?: Record<string, string>;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/**
 * Make an authenticated API request with standardized error handling
 */
export async function makeApiRequest<TResponse, TData = unknown>(
  options: ApiRequestOptions<TData>
): Promise<ApiResponse<TResponse>> {
  const { method, endpoint, data, token, customHeaders } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${baseApiUrl}${endpoint}`;

  try {
    const headers = await getAuthHeaders(token);
    const mergedHeaders = { ...headers, ...customHeaders };

    const requestConfig: AxiosRequestConfig = {
      method,
      url,
      headers: mergedHeaders,
      data,
    };

    const response: AxiosResponse<TResponse> = await axios(requestConfig);

    if (!response.status.toString().startsWith('2')) {
      throw new Error(`API Error - Status: ${response.status}, URL: ${url}`);
    }

    return {
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 'unknown';
      const message = error.response?.data?.message || error.message;
      throw new Error(`API request failed [${method.toUpperCase()} ${url}]: ${status} - ${message}`);
    }
    if (error instanceof Error) {
      throw new Error(`API request failed [${method.toUpperCase()} ${url}]: ${error.message}`);
    }
    throw new Error(`API request failed [${method.toUpperCase()} ${url}]: Unknown error`);
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, token?: string) => makeApiRequest<T>({ method: 'get', endpoint, token }),

  post: <TResponse, TData = unknown>(endpoint: string, data: TData, token?: string) =>
    makeApiRequest<TResponse, TData>({ method: 'post', endpoint, data, token }),

  put: <TResponse, TData = unknown>(endpoint: string, data: TData, token?: string) =>
    makeApiRequest<TResponse, TData>({ method: 'put', endpoint, data, token }),

  patch: <TResponse, TData = unknown>(endpoint: string, data: TData, token?: string) =>
    makeApiRequest<TResponse, TData>({ method: 'patch', endpoint, data, token }),

  delete: <T>(endpoint: string, token?: string) => makeApiRequest<T>({ method: 'delete', endpoint, token }),
};

/**
 * Clear the token cache (useful for tests that need fresh auth)
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = null;
}

/**
 * Get the current environment
 */
export function getEnvironment(): Environment {
  return envVar;
}

/**
 * Get environment-specific URLs
 */
export function getUrls() {
  return {
    dashboard: dataConfig[envVar]?.DASHBOARD_URL,
    portal: dataConfig[envVar]?.PORTAL_URL,
    admin: dataConfig[envVar]?.ADMIN_URL,
  };
}
