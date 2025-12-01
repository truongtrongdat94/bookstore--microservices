import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No token provided'
        }
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        userId: number;
        email: string;
        role: string;
      };

      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication error'
      }
    });
    return;
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      userId: number;
      email: string;
      role: string;
    };
    req.user = decoded;
  } catch (error) {
    // Ignore invalid token for optional auth
  }

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Admin access required'
      }
    });
    return;
  }

  next();
};
