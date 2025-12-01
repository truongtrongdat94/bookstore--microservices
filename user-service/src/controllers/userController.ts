import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../models/User';
import { AddressModel } from '../models/Address';
import { ApiResponse, ApiError, AuthRequest, ChangePasswordDto, CreateAddressDto, UpdateAddressDto } from '../types';
import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import config from '../config';
import winston from 'winston';

// Create a simple logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.Console()]
});

export class UserController {
  // Get current user profile
  static async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }
      
      const user = await UserModel.findById(req.user.user_id);
      
      if (!user) {
        throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
      }
      
      const response: ApiResponse = {
        success: true,
        data: user
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get user by ID
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        throw new ApiError(400, 'Invalid user ID', 'INVALID_USER_ID');
      }
      
      const user = await UserModel.findById(userId);
      
      if (!user) {
        throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
      }
      
      const response: ApiResponse = {
        success: true,
        data: user
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get all users (with pagination)
  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const [users, total] = await Promise.all([
        UserModel.findAll(limit, offset),
        UserModel.count()
      ]);
      
      const response: ApiResponse = {
        success: true,
        data: users,
        meta: {
          page,
          limit,
          total
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Update current user
  static async updateCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }
      
      const updates = req.body;
      
      // Don't allow email or password updates through this endpoint
      delete updates.email;
      delete updates.password_hash;
      delete updates.user_id;
      
      const updatedUser = await UserModel.update(req.user.user_id, updates);
      
      if (!updatedUser) {
        throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
      }
      
      logger.info('User updated', { userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: updatedUser
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Delete user (soft delete or deactivate)
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }
      
      // In production, implement soft delete
      // For now, just return success
      logger.info('User deletion requested', { userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'User account scheduled for deletion'
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Check if email is available
  static async checkEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        throw new ApiError(400, 'Email is required', 'EMAIL_REQUIRED');
      }
      
      const exists = await UserModel.emailExists(email);
      
      const response: ApiResponse = {
        success: true,
        data: {
          available: !exists
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Check if username is available
  static async checkUsername(req: Request, res: Response, next: NextFunction) {
    try {
      const { username } = req.query;
      
      if (!username || typeof username !== 'string') {
        throw new ApiError(400, 'Username is required', 'USERNAME_REQUIRED');
      }
      
      const exists = await UserModel.usernameExists(username);
      
      const response: ApiResponse = {
        success: true,
        data: {
          available: !exists
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Change password
  static async changePassword(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const { oldPassword, newPassword }: ChangePasswordDto = req.body;

      // Get user with password hash
      const user = await UserModel.findByEmail(req.user!.email);
      if (!user) {
        throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
      }

      // Verify old password
      const isValid = await UserModel.verifyPassword(oldPassword, user.password_hash);
      if (!isValid) {
        throw new ApiError(401, 'Current password is incorrect', 'INVALID_PASSWORD');
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

      // Update password
      await query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE user_id = $2',
        [newPasswordHash, userId]
      );

      logger.info('Password changed successfully', { userId });

      const response: ApiResponse = {
        success: true,
        data: { message: 'Password changed successfully' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get all addresses
  static async getAddresses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const addresses = await AddressModel.findByUserId(userId);

      const response: ApiResponse = {
        success: true,
        data: { addresses }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Create address
  static async createAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const addressData: CreateAddressDto = req.body;

      const address = await AddressModel.create(userId, addressData);

      logger.info('Address created', { userId, addressId: address.address_id });

      const response: ApiResponse = {
        success: true,
        data: { address }
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update address
  static async updateAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const addressId = parseInt(req.params.id);
      const updateData: UpdateAddressDto = req.body;

      const address = await AddressModel.update(addressId, userId, updateData);
      if (!address) {
        throw new ApiError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
      }

      logger.info('Address updated', { userId, addressId });

      const response: ApiResponse = {
        success: true,
        data: { address }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Delete address
  static async deleteAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const addressId = parseInt(req.params.id);

      const deleted = await AddressModel.delete(addressId, userId);
      if (!deleted) {
        throw new ApiError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
      }

      logger.info('Address deleted', { userId, addressId });

      const response: ApiResponse = {
        success: true,
        data: { message: 'Address deleted successfully' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  // Set default address
  static async setDefaultAddress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.user_id;
      const addressId = parseInt(req.params.id);

      const address = await AddressModel.setDefault(addressId, userId);
      if (!address) {
        throw new ApiError(404, 'Address not found', 'ADDRESS_NOT_FOUND');
      }

      logger.info('Default address set', { userId, addressId });

      const response: ApiResponse = {
        success: true,
        data: { address }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
