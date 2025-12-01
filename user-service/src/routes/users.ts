import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';
import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, ApiResponse, JwtPayload } from '../types';
import config from '../config';

const router = Router();

// Simple auth middleware inline for now
const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: 'No authentication token provided'
        }
      };
      return res.status(401).json(response);
    }
    
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      req.user = decoded;
      next();
    } catch (jwtError) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired token'
        }
      };
      return res.status(401).json(response);
    }
  } catch (error) {
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

// Public routes
router.get('/check-email', UserController.checkEmail);
router.get('/check-username', UserController.checkUsername);

// Protected routes
router.get('/profile', authenticate as any, UserController.getCurrentUser);
router.put('/profile', authenticate as any, validate(schemas.updateUser), UserController.updateCurrentUser);
router.delete('/profile', authenticate as any, UserController.deleteUser);

// Password management
router.post('/change-password', authenticate as any, validate(schemas.changePassword), UserController.changePassword);

// Address management
router.get('/addresses', authenticate as any, UserController.getAddresses);
router.post('/addresses', authenticate as any, validate(schemas.createAddress), UserController.createAddress);
router.put('/addresses/:id', authenticate as any, validate(schemas.updateAddress), UserController.updateAddress);
router.delete('/addresses/:id', authenticate as any, UserController.deleteAddress);
router.put('/addresses/:id/default', authenticate as any, UserController.setDefaultAddress);

// Admin routes (would need role-based auth)
router.get('/', validateQuery(schemas.pagination), UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

export default router;
