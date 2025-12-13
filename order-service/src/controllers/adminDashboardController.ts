/**
 * Admin Dashboard Controller
 * Handles dashboard statistics API endpoints
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
import { Request, Response } from 'express';
import { query } from '../config/database';
import winston from 'winston';
import axios from 'axios';
import config from '../config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service-admin' },
  transports: [new winston.transports.Console()]
});

/**
 * Get dashboard statistics
 * GET /admin/dashboard/stats
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Get revenue statistics (daily, weekly, monthly)
    const revenueStats = await getRevenueStats();
    
    // Get order statistics (new orders in last 24 hours)
    const orderStats = await getOrderStats();
    
    // Get user statistics from user service (new registrations in last 7 days)
    const userStats = await getUserStats();
    
    // Get top selling books from book service
    const topBooks = await getTopSellingBooks();

    const stats = {
      revenue: revenueStats,
      orders: orderStats,
      users: userStats,
      topBooks: topBooks
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard statistics'
      }
    });
  }
};

/**
 * Get revenue chart data
 * GET /admin/dashboard/revenue-chart
 * Requirements: 1.5
 */
export const getRevenueChart = async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'week';
    
    let intervalDays: number;
    let groupBy: string;
    
    switch (period) {
      case 'month':
        intervalDays = 30;
        groupBy = 'day';
        break;
      case 'year':
        intervalDays = 365;
        groupBy = 'month';
        break;
      case 'week':
      default:
        intervalDays = 7;
        groupBy = 'day';
        break;
    }

    const chartData = await getRevenueChartData(intervalDays, groupBy);

    res.json({
      success: true,
      data: chartData,
      meta: {
        period,
        intervalDays,
        groupBy
      }
    });
  } catch (error) {
    logger.error('Error fetching revenue chart:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch revenue chart data'
      }
    });
  }
};

/**
 * Calculate revenue statistics for daily, weekly, monthly periods
 * Requirement: 1.1
 */
async function getRevenueStats(): Promise<{ daily: number; weekly: number; monthly: number }> {
  const sql = `
    SELECT 
      COALESCE(SUM(CASE 
        WHEN created_at >= NOW() - INTERVAL '1 day' 
        THEN total_amount 
        ELSE 0 
      END), 0) as daily_revenue,
      COALESCE(SUM(CASE 
        WHEN created_at >= NOW() - INTERVAL '7 days' 
        THEN total_amount 
        ELSE 0 
      END), 0) as weekly_revenue,
      COALESCE(SUM(CASE 
        WHEN created_at >= NOW() - INTERVAL '30 days' 
        THEN total_amount 
        ELSE 0 
      END), 0) as monthly_revenue
    FROM orders
    WHERE status NOT IN ('cancelled', 'refunded')
      AND payment_status IN ('completed', 'awaiting_confirmation')
  `;

  const result = await query(sql);
  const row = result.rows[0];

  return {
    daily: parseFloat(row.daily_revenue) || 0,
    weekly: parseFloat(row.weekly_revenue) || 0,
    monthly: parseFloat(row.monthly_revenue) || 0
  };
}

/**
 * Get order statistics
 * Requirement: 1.2
 */
async function getOrderStats(): Promise<{ newCount: number; pendingCount: number; totalToday: number }> {
  const sql = `
    SELECT 
      COUNT(CASE 
        WHEN created_at >= NOW() - INTERVAL '24 hours' 
        THEN 1 
      END) as new_count,
      COUNT(CASE 
        WHEN status = 'pending' 
        THEN 1 
      END) as pending_count,
      COUNT(CASE 
        WHEN DATE(created_at) = CURRENT_DATE 
        THEN 1 
      END) as total_today
    FROM orders
  `;

  const result = await query(sql);
  const row = result.rows[0];

  return {
    newCount: parseInt(row.new_count) || 0,
    pendingCount: parseInt(row.pending_count) || 0,
    totalToday: parseInt(row.total_today) || 0
  };
}

/**
 * Get user statistics from user service
 * Requirement: 1.3
 */
async function getUserStats(): Promise<{ newRegistrations: number; activeCount: number }> {
  try {
    const response = await axios.get(`${config.services.userService}/admin/stats`);
    if (response.data.success) {
      return {
        newRegistrations: response.data.data.newRegistrations || 0,
        activeCount: response.data.data.activeCount || 0
      };
    }
  } catch (error) {
    logger.warn('Failed to fetch user stats from user service:', error);
  }
  
  // Return default values if user service is unavailable
  return {
    newRegistrations: 0,
    activeCount: 0
  };
}

/**
 * Get top selling books from book service
 * Requirement: 1.4
 */
async function getTopSellingBooks(): Promise<any[]> {
  try {
    const response = await axios.get(`${config.services.bookService}/admin/top-selling?limit=10`);
    if (response.data.success) {
      return response.data.data || [];
    }
  } catch (error) {
    logger.warn('Failed to fetch top selling books from book service:', error);
  }
  
  // Return empty array if book service is unavailable
  return [];
}

/**
 * Get revenue chart data for specified period
 * Requirement: 1.5
 */
async function getRevenueChartData(intervalDays: number, groupBy: string): Promise<any[]> {
  let dateFormat: string;
  let dateTrunc: string;
  
  if (groupBy === 'month') {
    dateFormat = 'YYYY-MM';
    dateTrunc = 'month';
  } else {
    dateFormat = 'YYYY-MM-DD';
    dateTrunc = 'day';
  }

  const sql = `
    WITH date_series AS (
      SELECT generate_series(
        DATE_TRUNC('${dateTrunc}', NOW() - INTERVAL '${intervalDays} days'),
        DATE_TRUNC('${dateTrunc}', NOW()),
        INTERVAL '1 ${dateTrunc}'
      )::date as date
    )
    SELECT 
      TO_CHAR(ds.date, '${dateFormat}') as date,
      COALESCE(SUM(o.total_amount), 0) as revenue,
      COUNT(o.order_id) as order_count
    FROM date_series ds
    LEFT JOIN orders o ON DATE_TRUNC('${dateTrunc}', o.created_at) = ds.date
      AND o.status NOT IN ('cancelled', 'refunded')
      AND o.payment_status IN ('completed', 'awaiting_confirmation')
    GROUP BY ds.date
    ORDER BY ds.date ASC
  `;

  const result = await query(sql);
  
  return result.rows.map(row => ({
    date: row.date,
    revenue: parseFloat(row.revenue) || 0,
    orderCount: parseInt(row.order_count) || 0
  }));
}

export default {
  getDashboardStats,
  getRevenueChart
};
