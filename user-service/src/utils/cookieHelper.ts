import { Response } from 'express';

/**
 * Cookie options interface for auth cookies
 */
export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
}

/**
 * Cookie name for authentication token
 */
export const AUTH_COOKIE_NAME = 'auth_token';

/**
 * Default max age for auth cookie (24 hours in milliseconds)
 * This should match JWT expiration time
 */
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cookie options based on environment
 * - HttpOnly: true (always) - prevents JavaScript access
 * - Secure: true in production, false in development (allows HTTP in dev)
 * - SameSite: 'lax' - provides CSRF protection while allowing normal navigation
 * - Path: '/' - cookie available for all routes
 * - MaxAge: 24 hours (matching JWT expiration)
 * 
 * @returns CookieOptions object with appropriate settings for current environment
 */
export function getCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: DEFAULT_MAX_AGE_MS,
    path: '/',
  };
}

/**
 * Set authentication cookie with JWT token
 * Uses HttpOnly cookie to prevent XSS attacks from accessing the token
 * 
 * @param res - Express Response object
 * @param token - JWT token to store in cookie
 */
export function setAuthCookie(res: Response, token: string): void {
  const options = getCookieOptions();
  
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    maxAge: options.maxAge,
    path: options.path,
  });
}

/**
 * Clear authentication cookie
 * Sets the cookie with an expired date to remove it from the browser
 * Uses the same path as when setting to ensure proper clearing
 * 
 * @param res - Express Response object
 */
export function clearAuthCookie(res: Response): void {
  const options = getCookieOptions();
  
  res.cookie(AUTH_COOKIE_NAME, '', {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    maxAge: 0, // Expire immediately
    path: options.path,
  });
}
