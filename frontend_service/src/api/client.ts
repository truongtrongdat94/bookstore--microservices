import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ApiResponse } from '../types';

/**
 * Get the API base URL from environment variable.
 * In development: Uses '/api' which is proxied by Vite to localhost:3000
 * In production: Uses VITE_API_URL environment variable (e.g., https://api.bookstore.com)
 * 
 * @returns The API base URL to use for all API calls
 */
export function getApiBaseUrl(): string {
  // VITE_API_URL should be set in production builds
  // In development, we use '/api' which Vite proxies to localhost:3000
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Default to '/api' for development (proxied by Vite)
  return '/api';
}

/**
 * Validates that the API URL is using HTTPS in production.
 * This is a runtime check to ensure security requirements are met.
 * 
 * @param url - The API URL to validate
 * @param mode - The current environment mode
 * @returns true if valid, false otherwise
 */
export function isValidProductionApiUrl(url: string, mode: string): boolean {
  if (mode !== 'production') {
    return true; // No HTTPS requirement in development
  }
  
  // In production, API URL must use HTTPS
  return url.startsWith('https://');
}

// Create axios instance with environment-aware base URL
export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Handle 401 - Unauthorized
    // Don't redirect here to avoid race conditions and loops
    // Let the calling component/hook handle it properly
    if (error.response?.status === 401) {
      // Only clear auth token, let useAuth hook handle the rest
      // Don't clear auth-storage here to avoid race conditions with Zustand
      localStorage.removeItem('auth_token');
    }

    // Extract error message with validation details
    let errorMessage = 
      error.response?.data?.error?.message || 
      error.message || 
      'An unexpected error occurred';

    // If validation errors exist, format them
    if (error.response?.data?.error?.details && Array.isArray(error.response.data.error.details)) {
      const validationErrors = error.response.data.error.details
        .map((detail: any) => detail.message)
        .join(', ');
      errorMessage = `${errorMessage}: ${validationErrors}`;
    }

    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default apiClient;
