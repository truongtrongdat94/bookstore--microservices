/**
 * Admin User Controller
 * Handles admin user management API endpoints
 * Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3
 */
import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import { sendEmail } from '../services/emailService';
import winston from 'winston';
import crypto from 'crypto';
import axios from 'axios';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service-admin' },
  transports: [new winston.transports.Console()]
});

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://order-service:3002';

/**
 * Get user list with pagination and search
 * GET /admin/users
 * Requirements: 9.1, 9.2
 */
export const getUserList = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const search = req.query.search as string;
    const status = req.query.status as string;
    
    // Sort parameters
    const sortField = req.query.sort as string || 'created_at';
    const sortOrder = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      const searchPattern = '%' + search + '%';
      conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`);
      params.push(searchPattern);
      paramIndex++;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['user_id', 'created_at', 'full_name', 'email', 'status'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';
    
    // Query for users with order count
    const usersSql = `
      SELECT 
        u.user_id, u.username, u.email, u.full_name, u.phone,
        u.is_email_verified, u.auth_provider, u.avatar_url,
        COALESCE(u.status, 'active') as status,
        u.created_at, u.updated_at
      FROM users u
      ${whereClause}
      ORDER BY u.${safeSortField} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    
    // Count query
    const countSql = `SELECT COUNT(*) as total FROM users u ${whereClause}`;
    
    const [usersResult, countResult] = await Promise.all([
      query(usersSql, params),
      query(countSql, params.slice(0, -2))
    ]);
    
    // Enrich users with order count
    const enrichedUsers = await enrichUsersWithOrderCount(usersResult.rows);
    
    res.json({
      success: true,
      data: enrichedUsers,
      meta: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching user list:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user list' }
    });
  }
};

/**
 * Get user detail by ID
 * GET /admin/users/:id
 * Requirements: 9.3
 */
export const getUserDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    const userSql = `
      SELECT 
        u.user_id, u.username, u.email, u.full_name, u.phone,
        u.is_email_verified, u.auth_provider, u.avatar_url,
        COALESCE(u.status, 'active') as status,
        u.created_at, u.updated_at
      FROM users u
      WHERE u.user_id = $1
    `;
    
    const userResult = await query(userSql, [userId]);
    
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with ID ${userId} not found` }
      });
      return;
    }
    
    const user = userResult.rows[0];
    
    // Get order statistics
    const orderStats = await getUserOrderStats(userId);
    
    // Get block history
    const blockHistorySql = `
      SELECT id, blocked_by, reason, blocked_at, unblocked_at, unblocked_by
      FROM user_blocks
      WHERE user_id = $1
      ORDER BY blocked_at DESC
      LIMIT 10
    `;
    const blockHistoryResult = await query(blockHistorySql, [userId]);
    
    res.json({
      success: true,
      data: {
        ...user,
        orderCount: orderStats.orderCount,
        totalSpent: orderStats.totalSpent,
        lastOrderAt: orderStats.lastOrderAt,
        blockHistory: blockHistoryResult.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching user detail:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user detail' }
    });
  }
};


/**
 * Get user orders
 * GET /admin/users/:id/orders
 * Requirements: 9.3
 */
export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    // Verify user exists
    const userExists = await query('SELECT 1 FROM users WHERE user_id = $1', [userId]);
    if (userExists.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with ID ${userId} not found` }
      });
      return;
    }
    
    // Fetch orders from order service
    try {
      const response = await axios.get(`${ORDER_SERVICE_URL}/admin/orders`, {
        params: { userId, page, limit }
      });
      
      if (response.data.success) {
        res.json(response.data);
        return;
      }
    } catch (orderError) {
      logger.warn('Failed to fetch orders from order service', { userId, error: orderError });
    }
    
    // Return empty if order service is unavailable
    res.json({
      success: true,
      data: [],
      meta: { page, limit, total: 0, totalPages: 0 }
    });
  } catch (error) {
    logger.error('Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user orders' }
    });
  }
};

/**
 * Get user activity
 * GET /admin/users/:id/activity
 * Requirements: 9.3
 */
export const getUserActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    // Verify user exists
    const userExists = await query('SELECT 1 FROM users WHERE user_id = $1', [userId]);
    if (userExists.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with ID ${userId} not found` }
      });
      return;
    }
    
    // Get activity from audit logs
    const activitySql = `
      SELECT id, action, entity_type, entity_id, old_value, new_value, created_at
      FROM admin_audit_logs
      WHERE entity_type = 'user' AND entity_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const activityResult = await query(activitySql, [userId, limit]);
    
    res.json({
      success: true,
      data: activityResult.rows
    });
  } catch (error) {
    logger.error('Error fetching user activity:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user activity' }
    });
  }
};


/**
 * Block a user
 * POST /admin/users/:id/block
 * Requirements: 10.1, 10.3, 10.4
 */
export const blockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const { reason } = req.body;
    const adminId = (req as any).user?.user_id || 0;
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    if (!reason || reason.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Block reason is required' }
      });
      return;
    }
    
    // Check if user exists and get their role
    const userResult = await query(
      `SELECT user_id, email, full_name, COALESCE(status, 'active') as status, 
       COALESCE(role, 'user') as role
       FROM users WHERE user_id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with ID ${userId} not found` }
      });
      return;
    }
    
    const user = userResult.rows[0];
    
    // Prevent blocking admin users (Requirement 10.4)
    if (user.role === 'admin') {
      res.status(403).json({
        success: false,
        error: { code: 'CANNOT_BLOCK_ADMIN', message: 'Cannot block an admin user' }
      });
      return;
    }
    
    // Check if user is already blocked
    if (user.status === 'blocked') {
      res.status(422).json({
        success: false,
        error: { code: 'USER_ALREADY_BLOCKED', message: 'User is already blocked' }
      });
      return;
    }
    
    // Block user and record in history
    await transaction(async (client) => {
      // Update user status
      await client.query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE user_id = $2',
        ['blocked', userId]
      );
      
      // Record block in user_blocks table
      await client.query(
        `INSERT INTO user_blocks (user_id, blocked_by, reason, blocked_at)
         VALUES ($1, $2, $3, NOW())`,
        [userId, adminId, reason]
      );
      
      // Record in audit log
      await client.query(
        `INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, old_value, new_value, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [adminId, 'block', 'user', userId, 
         JSON.stringify({ status: user.status }), 
         JSON.stringify({ status: 'blocked', reason }), 
         ipAddress]
      );
    });
    
    logger.info('User blocked', { userId, adminId, reason });
    
    res.json({
      success: true,
      data: { userId, status: 'blocked', reason },
      message: 'User has been blocked successfully'
    });
  } catch (error) {
    logger.error('Error blocking user:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to block user' }
    });
  }
};


/**
 * Unblock a user
 * POST /admin/users/:id/unblock
 * Requirements: 10.2
 */
export const unblockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const adminId = (req as any).user?.user_id || 0;
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    // Check if user exists
    const userResult = await query(
      `SELECT user_id, email, full_name, COALESCE(status, 'active') as status
       FROM users WHERE user_id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with ID ${userId} not found` }
      });
      return;
    }
    
    const user = userResult.rows[0];
    
    // Check if user is blocked
    if (user.status !== 'blocked') {
      res.status(422).json({
        success: false,
        error: { code: 'USER_NOT_BLOCKED', message: 'User is not blocked' }
      });
      return;
    }
    
    // Unblock user and update history
    await transaction(async (client) => {
      // Update user status
      await client.query(
        'UPDATE users SET status = $1, updated_at = NOW() WHERE user_id = $2',
        ['active', userId]
      );
      
      // Update the most recent block record
      await client.query(
        `UPDATE user_blocks 
         SET unblocked_at = NOW(), unblocked_by = $1
         WHERE user_id = $2 AND unblocked_at IS NULL`,
        [adminId, userId]
      );
      
      // Record in audit log
      await client.query(
        `INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, old_value, new_value, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [adminId, 'unblock', 'user', userId, 
         JSON.stringify({ status: 'blocked' }), 
         JSON.stringify({ status: 'active' }), 
         ipAddress]
      );
    });
    
    logger.info('User unblocked', { userId, adminId });
    
    res.json({
      success: true,
      data: { userId, status: 'active' },
      message: 'User has been unblocked successfully'
    });
  } catch (error) {
    logger.error('Error unblocking user:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to unblock user' }
    });
  }
};

/**
 * Reset user password
 * POST /admin/users/:id/reset-password
 * Requirements: 11.1, 11.2, 11.3
 */
export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    const adminId = (req as any).user?.user_id || 0;
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    // Check if user exists
    const userResult = await query(
      'SELECT user_id, email, full_name, auth_provider FROM users WHERE user_id = $1',
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: `User with ID ${userId} not found` }
      });
      return;
    }
    
    const user = userResult.rows[0];
    
    // Check if user uses OAuth (cannot reset password for OAuth users)
    if (user.auth_provider && user.auth_provider !== 'email') {
      res.status(422).json({
        success: false,
        error: { 
          code: 'OAUTH_USER', 
          message: `Cannot reset password for ${user.auth_provider} authenticated user` 
        }
      });
      return;
    }
    
    // Generate secure token (valid for 24 hours)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store token and send email
    await transaction(async (client) => {
      // Invalidate any existing tokens for this user
      await client.query(
        `UPDATE password_reset_tokens 
         SET used_at = NOW() 
         WHERE user_id = $1 AND used_at IS NULL`,
        [userId]
      );
      
      // Create new token
      await client.query(
        `INSERT INTO password_reset_tokens (user_id, token, initiated_by, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [userId, token, adminId, expiresAt]
      );
      
      // Record in audit log
      await client.query(
        `INSERT INTO admin_audit_logs (admin_id, action, entity_type, entity_id, new_value, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [adminId, 'reset_password', 'user', userId, 
         JSON.stringify({ email: user.email, expires_at: expiresAt }), 
         ipAddress]
      );
    });
    
    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    
    try {
      await sendEmail({
        to: user.email,
        subject: 'Đặt lại mật khẩu - Bookstore',
        html: `
          <h2>Đặt lại mật khẩu</h2>
          <p>Xin chào ${user.full_name},</p>
          <p>Quản trị viên đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Vui lòng nhấp vào liên kết bên dưới để đặt mật khẩu mới:</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
          <p>Trân trọng,<br>Bookstore Team</p>
        `
      });
      
      logger.info('Password reset email sent', { userId, adminId, email: user.email });
    } catch (emailError) {
      logger.error('Failed to send password reset email', { userId, error: emailError });
      // Don't fail the request if email fails - token is still valid
    }
    
    res.json({
      success: true,
      data: { 
        userId, 
        email: user.email,
        expiresAt,
        emailSent: true 
      },
      message: 'Password reset email has been sent'
    });
  } catch (error) {
    logger.error('Error resetting user password:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to reset user password' }
    });
  }
};


// Helper functions

/**
 * Enrich users with order count from order service
 */
async function enrichUsersWithOrderCount(users: any[]): Promise<any[]> {
  const enrichedUsers = await Promise.all(
    users.map(async (user) => {
      const orderStats = await getUserOrderStats(user.user_id);
      return {
        ...user,
        orderCount: orderStats.orderCount,
        totalSpent: orderStats.totalSpent
      };
    })
  );
  return enrichedUsers;
}

/**
 * Get order statistics for a user from order service
 */
async function getUserOrderStats(userId: number): Promise<{ orderCount: number; totalSpent: number; lastOrderAt: string | null }> {
  try {
    const response = await axios.get(`${ORDER_SERVICE_URL}/admin/users/${userId}/stats`);
    if (response.data.success && response.data.data) {
      return {
        orderCount: response.data.data.orderCount || 0,
        totalSpent: response.data.data.totalSpent || 0,
        lastOrderAt: response.data.data.lastOrderAt || null
      };
    }
  } catch (error) {
    logger.warn('Failed to fetch order stats from order service', { userId });
  }
  return { orderCount: 0, totalSpent: 0, lastOrderAt: null };
}

export default {
  getUserList,
  getUserDetail,
  getUserOrders,
  getUserActivity,
  blockUser,
  unblockUser,
  resetUserPassword
};
