/**
 * Admin Routes for User Service
 * Handles admin-related user endpoints
 * Requirements: 1.3, 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3
 */
import { Router } from 'express';
import { getUserStats } from '../controllers/adminController';
import {
  getUserList,
  getUserDetail,
  getUserOrders,
  getUserActivity,
  blockUser,
  unblockUser,
  resetUserPassword
} from '../controllers/adminUserController';

const router = Router();

/**
 * User Statistics Route
 * Requirement: 1.3
 */
// GET /admin/stats - Get user statistics for dashboard
router.get('/stats', getUserStats);

/**
 * User Management Routes
 * Requirements: 9.1, 9.2, 9.3
 */
// GET /admin/users - Get user list with pagination and search
router.get('/users', getUserList);

// GET /admin/users/:id - Get user detail
router.get('/users/:id', getUserDetail);

// GET /admin/users/:id/orders - Get user orders
router.get('/users/:id/orders', getUserOrders);

// GET /admin/users/:id/activity - Get user activity
router.get('/users/:id/activity', getUserActivity);

/**
 * User Block/Unblock Routes
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */
// POST /admin/users/:id/block - Block a user
router.post('/users/:id/block', blockUser);

// POST /admin/users/:id/unblock - Unblock a user
router.post('/users/:id/unblock', unblockUser);

/**
 * Password Reset Route
 * Requirements: 11.1, 11.2, 11.3
 */
// POST /admin/users/:id/reset-password - Reset user password
router.post('/users/:id/reset-password', resetUserPassword);

export default router;
