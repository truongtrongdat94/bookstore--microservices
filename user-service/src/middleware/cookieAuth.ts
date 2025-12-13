import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, ApiResponse, JwtPayload } from '../types';
import config from '../config';
import { AUTH_COOKIE_NAME } from '../utils/cookieHelper';
import logger from '../utils/logger';

/**
 * Cookie-based authentication middleware
 * Extracts JWT from auth_token cookie and verifies it
 * Attaches decoded user info to req.user
 * 
 * Requirements: 5.2 - Protected /auth/me endpoint
 */
export const cookieAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Extract token from cookie
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    
    if (!token) {
      logger.warn('Cookie auth failed: No auth cookie present');
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NO_AUTH_COOKIE',
          message: 'Authentication required'
        }
      };
      return res.status(401).json(response);
    }
    
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
      
      logger.debug('Cookie auth successful', { userId: decoded.user_id, email: decoded.email });
      next();
    } catch (jwtError) {
      logger.warn('Cookie auth failed: Invalid or expired token', {
        error: jwtError instanceof Error ? jwtError.message : 'Unknown error'
      });
      
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired authentication token'
        }
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    logger.error('Cookie auth error', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Authentication failed'
      }
    };
    return res.status(500).json(response);
  }
};
