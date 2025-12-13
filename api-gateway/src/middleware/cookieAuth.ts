import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

/**
 * JWT payload structure from auth_token cookie
 */
export interface JwtPayload {
  user_id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Extended Request interface with user info from cookie
 */
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Error codes for cookie authentication failures
 */
export const CookieAuthErrorCodes = {
  NO_AUTH_COOKIE: 'NO_AUTH_COOKIE',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  COOKIE_PARSE_ERROR: 'COOKIE_PARSE_ERROR',
} as const;

/**
 * Extract JWT from auth_token cookie
 * @param req - Express request object
 * @returns JWT token string or null if not found
 */
export function extractTokenFromCookie(req: Request): string | null {
  // Check if cookies exist and auth_token is present
  if (req.cookies && req.cookies.auth_token) {
    return req.cookies.auth_token;
  }
  return null;
}

/**
 * Extract JWT from Authorization header (fallback)
 * @param req - Express request object
 * @returns JWT token string or null if not found
 */
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}


/**
 * Verify JWT token and return decoded payload
 * @param token - JWT token string
 * @returns Decoded JWT payload or throws error
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      const err = new Error('Authentication token has expired');
      (err as any).code = CookieAuthErrorCodes.TOKEN_EXPIRED;
      throw err;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      const err = new Error('Invalid authentication token');
      (err as any).code = CookieAuthErrorCodes.INVALID_TOKEN;
      throw err;
    }
    throw error;
  }
}

/**
 * Add user headers to the request for downstream services
 * @param req - Express request object
 * @param payload - Decoded JWT payload
 */
export function addUserHeaders(req: Request, payload: JwtPayload): void {
  // Set headers that will be forwarded to downstream services
  (req as any).userHeaders = {
    'x-user-id': payload.user_id.toString(),
    'x-user-email': payload.email,
    'x-user-role': payload.role || 'user',
  };
}

/**
 * Cookie authentication middleware for protected routes
 * Extracts JWT from cookie (prioritized) or Authorization header,
 * verifies it, and adds user headers for downstream services.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function cookieAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Priority: Cookie > Authorization header (per Requirements 3.3)
    let token = extractTokenFromCookie(req);
    
    // Fallback to Authorization header if no cookie
    if (!token) {
      token = extractTokenFromHeader(req);
    }

    // No token found in either location
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: CookieAuthErrorCodes.NO_AUTH_COOKIE,
          message: 'Authentication required',
        },
      });
      return;
    }

    // Verify token and extract payload
    const payload = verifyToken(token);

    // Store user info on request object
    req.user = payload;

    // Add user headers for downstream services
    addUserHeaders(req, payload);

    next();
  } catch (error: any) {
    const errorCode = error.code || CookieAuthErrorCodes.INVALID_TOKEN;
    const statusCode = 401;

    res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || 'Authentication failed',
      },
    });
  }
}

/**
 * Optional cookie authentication middleware
 * Similar to cookieAuthMiddleware but doesn't require authentication.
 * If a valid token is present, it extracts user info; otherwise, continues without error.
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export function optionalCookieAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    // Priority: Cookie > Authorization header
    let token = extractTokenFromCookie(req);
    
    if (!token) {
      token = extractTokenFromHeader(req);
    }

    if (token) {
      try {
        const payload = verifyToken(token);
        req.user = payload;
        addUserHeaders(req, payload);
      } catch {
        // Token invalid but optional, continue without user info
      }
    }

    next();
  } catch {
    // Any error in optional auth, just continue
    next();
  }
}

export default cookieAuthMiddleware;
