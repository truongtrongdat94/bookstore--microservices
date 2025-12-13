/**
 * Admin Controller for User Service
 * Handles admin-related user statistics
 * Requirement: 1.3
 */
import { Request, Response } from 'express';
import { query } from '../config/database';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service-admin' },
  transports: [new winston.transports.Console()]
});

/**
 * Get user statistics for admin dashboard
 * GET /admin/stats
 * Requirement: 1.3
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT 
        COUNT(CASE 
          WHEN created_at >= NOW() - INTERVAL '7 days' 
          THEN 1 
        END) as new_registrations,
        COUNT(CASE 
          WHEN is_email_verified = true 
          THEN 1 
        END) as active_count,
        COUNT(*) as total_users
      FROM users
    `;

    const result = await query(sql);
    const row = result.rows[0];

    res.json({
      success: true,
      data: {
        newRegistrations: parseInt(row.new_registrations) || 0,
        activeCount: parseInt(row.active_count) || 0,
        totalUsers: parseInt(row.total_users) || 0
      }
    });
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user statistics'
      }
    });
  }
};

export default {
  getUserStats
};
