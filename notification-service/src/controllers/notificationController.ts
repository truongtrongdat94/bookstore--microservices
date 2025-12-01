import { Request, Response, NextFunction } from 'express';
import { NotificationModel } from '../models/Notification';
import { emailService } from '../services/emailService';
import { 
  ApiResponse, 
  ApiError, 
  AuthRequest, 
  CreateNotificationDto, 
  MarkAsReadDto, 
  SendEmailDto,
  NotificationType 
} from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-service' },
  transports: [new winston.transports.Console()]
});

export class NotificationController {
  // Get user's notifications
  static async getUserNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unread === 'true';
      const offset = (page - 1) * limit;
      
      const result = await NotificationModel.findByUserId(
        req.user.user_id, 
        limit, 
        offset, 
        unreadOnly
      );
      
      const response: ApiResponse = {
        success: true,
        data: result.notifications,
        meta: {
          page,
          limit,
          total: result.total,
          unread_count: result.unread_count
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get notification by ID
  static async getNotificationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        throw new ApiError(400, 'Invalid notification ID', 'INVALID_NOTIFICATION_ID');
      }
      
      const notification = await NotificationModel.findById(
        notificationId, 
        req.user.user_id
      );
      
      if (!notification) {
        throw new ApiError(404, 'Notification not found', 'NOTIFICATION_NOT_FOUND');
      }
      
      const response: ApiResponse = {
        success: true,
        data: notification
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Mark notifications as read
  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const { notification_ids }: MarkAsReadDto = req.body;
      
      if (!Array.isArray(notification_ids) || notification_ids.length === 0) {
        throw new ApiError(400, 'Invalid notification IDs', 'INVALID_NOTIFICATION_IDS');
      }
      
      const updatedCount = await NotificationModel.markAsRead(
        notification_ids, 
        req.user.user_id
      );
      
      logger.info('Notifications marked as read', { 
        userId: req.user.user_id, 
        count: updatedCount 
      });
      
      const response: ApiResponse = {
        success: true,
        data: {
          marked_as_read: updatedCount,
          message: `${updatedCount} notification(s) marked as read`
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const updatedCount = await NotificationModel.markAllAsRead(req.user.user_id);
      
      logger.info('All notifications marked as read', { 
        userId: req.user.user_id, 
        count: updatedCount 
      });
      
      const response: ApiResponse = {
        success: true,
        data: {
          marked_as_read: updatedCount,
          message: `All ${updatedCount} notification(s) marked as read`
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Delete notification
  static async deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const notificationId = parseInt(req.params.id);
      
      if (isNaN(notificationId)) {
        throw new ApiError(400, 'Invalid notification ID', 'INVALID_NOTIFICATION_ID');
      }
      
      const deleted = await NotificationModel.delete(
        notificationId, 
        req.user.user_id
      );
      
      if (!deleted) {
        throw new ApiError(404, 'Notification not found', 'NOTIFICATION_NOT_FOUND');
      }
      
      logger.info('Notification deleted', { 
        notificationId, 
        userId: req.user.user_id 
      });
      
      const response: ApiResponse = {
        success: true,
        data: { message: 'Notification deleted successfully' }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Create notification (admin only)
  static async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const notificationData: CreateNotificationDto = req.body;
      
      const notification = await NotificationModel.create(notificationData);
      
      logger.info('Notification created', { 
        notificationId: notification.notification_id,
        userId: notification.user_id,
        type: notification.type
      });
      
      const response: ApiResponse = {
        success: true,
        data: notification
      };
      
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Send email notification (admin only)
  static async sendEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { to, subject, message, template }: SendEmailDto = req.body;
      
      // Send email to each recipient
      const results = [];
      
      for (const email of to) {
        try {
          await emailService.sendEmail({
            to: email,
            subject,
            html: `<div style="font-family: Arial, sans-serif;">${message}</div>`,
            text: message
          });
          results.push({ email, status: 'sent' });
        } catch (error) {
          results.push({ email, status: 'failed', error: (error as Error).message });
        }
      }
      
      logger.info('Bulk email sent', { 
        recipients: to.length, 
        successful: results.filter(r => r.status === 'sent').length 
      });
      
      const response: ApiResponse = {
        success: true,
        data: {
          results,
          summary: {
            total: to.length,
            sent: results.filter(r => r.status === 'sent').length,
            failed: results.filter(r => r.status === 'failed').length
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get notification statistics
  static async getStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const userId = req.user.role === 'admin' ? undefined : req.user.user_id;
      const stats = await NotificationModel.getStatistics(userId);
      
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get all notifications (admin only)
  static async getAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const type = req.query.type as NotificationType;
      const offset = (page - 1) * limit;
      
      // This would need to be implemented in the model
      // For now, return empty result
      const response: ApiResponse = {
        success: true,
        data: [],
        meta: {
          page,
          limit,
          total: 0
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
