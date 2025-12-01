import { query } from '../config/database';
import { Notification, NotificationType, CreateNotificationDto } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-service' },
  transports: [new winston.transports.Console()]
});

export class NotificationModel {
  // Create a new notification
  static async create(notificationData: CreateNotificationDto): Promise<Notification> {
    const sql = `
      INSERT INTO notifications (user_id, type, title, message, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    try {
      const result = await query(sql, [
        notificationData.user_id,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        JSON.stringify(notificationData.data || {})
      ]);
      
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating notification:', { notificationData, error });
      throw error;
    }
  }
  
  // Find notifications by user ID
  static async findByUserId(
    userId: number, 
    limit: number = 20, 
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<{ notifications: Notification[], total: number, unread_count: number }> {
    let whereClause = 'WHERE user_id = $1';
    let params: any[] = [userId];
    
    if (unreadOnly) {
      whereClause += ' AND is_read = FALSE';
    }
    
    const notificationsSql = `
      SELECT * FROM notifications
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    const countSql = `
      SELECT COUNT(*) as total FROM notifications ${whereClause}
    `;
    
    const unreadCountSql = `
      SELECT COUNT(*) as unread_count FROM notifications 
      WHERE user_id = $1 AND is_read = FALSE
    `;
    
    try {
      const [notificationsResult, countResult, unreadResult] = await Promise.all([
        query(notificationsSql, [...params, limit, offset]),
        query(countSql, params),
        query(unreadCountSql, [userId])
      ]);
      
      return {
        notifications: notificationsResult.rows,
        total: parseInt(countResult.rows[0].total),
        unread_count: parseInt(unreadResult.rows[0].unread_count)
      };
    } catch (error) {
      logger.error('Error finding notifications by user ID:', { userId, error });
      throw error;
    }
  }
  
  // Mark notifications as read
  static async markAsRead(notificationIds: number[], userId: number): Promise<number> {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE notification_id = ANY($1) AND user_id = $2 AND is_read = FALSE
      RETURNING notification_id
    `;
    
    try {
      const result = await query(sql, [notificationIds, userId]);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error marking notifications as read:', { notificationIds, userId, error });
      throw error;
    }
  }
  
  // Mark all notifications as read for a user
  static async markAllAsRead(userId: number): Promise<number> {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE, read_at = NOW()
      WHERE user_id = $1 AND is_read = FALSE
      RETURNING notification_id
    `;
    
    try {
      const result = await query(sql, [userId]);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error marking all notifications as read:', { userId, error });
      throw error;
    }
  }
  
  // Delete old notifications
  static async deleteOldNotifications(days: number): Promise<number> {
    const sql = `
      DELETE FROM notifications
      WHERE created_at < NOW() - INTERVAL '${days} days'
      RETURNING notification_id
    `;
    
    try {
      const result = await query(sql);
      logger.info(`Deleted ${result.rowCount} old notifications older than ${days} days`);
      return result.rowCount || 0;
    } catch (error) {
      logger.error('Error deleting old notifications:', { days, error });
      throw error;
    }
  }
  
  // Get notification by ID
  static async findById(notificationId: number, userId?: number): Promise<Notification | null> {
    let sql = 'SELECT * FROM notifications WHERE notification_id = $1';
    let params = [notificationId];
    
    if (userId) {
      sql += ' AND user_id = $2';
      params.push(userId);
    }
    
    try {
      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error finding notification by ID:', { notificationId, userId, error });
      throw error;
    }
  }
  
  // Get notification statistics
  static async getStatistics(userId?: number): Promise<any> {
    let whereClause = userId ? 'WHERE user_id = $1' : '';
    let params = userId ? [userId] : [];
    
    const sql = `
      SELECT 
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread_notifications,
        COUNT(CASE WHEN type = 'order_created' THEN 1 END) as order_notifications,
        COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_notifications
      FROM notifications
      ${whereClause}
    `;
    
    try {
      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting notification statistics:', { userId, error });
      throw error;
    }
  }
  
  // Delete notification
  static async delete(notificationId: number, userId?: number): Promise<boolean> {
    let sql = 'DELETE FROM notifications WHERE notification_id = $1';
    let params = [notificationId];
    
    if (userId) {
      sql += ' AND user_id = $2';
      params.push(userId);
    }
    
    try {
      const result = await query(sql, params);
      return (result.rowCount || 0) > 0;
    } catch (error) {
      logger.error('Error deleting notification:', { notificationId, userId, error });
      throw error;
    }
  }
}
