/**
 * Admin Routes for Order Service
 * Handles admin dashboard and order management endpoints
 */
import { Router } from 'express';
import { getDashboardStats, getRevenueChart } from '../controllers/adminDashboardController';
import {
  getOrderList,
  getOrderDetail,
  updateOrderStatus,
  confirmPayment,
  generateInvoice,
  getUserOrderStats
} from '../controllers/adminOrderController';

const router = Router();

/**
 * Dashboard Statistics Routes
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

// GET /admin/dashboard/stats - Get dashboard statistics
router.get('/dashboard/stats', getDashboardStats);

// GET /admin/dashboard/revenue-chart - Get revenue chart data
router.get('/dashboard/revenue-chart', getRevenueChart);

/**
 * Order Management Routes
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4
 */

// GET /admin/orders - Get order list with filters and pagination
router.get('/orders', getOrderList);

// GET /admin/orders/:id - Get order detail
router.get('/orders/:id', getOrderDetail);

// PUT /admin/orders/:id/status - Update order status
router.put('/orders/:id/status', updateOrderStatus);

// POST /admin/orders/:id/confirm-payment - Confirm payment
router.post('/orders/:id/confirm-payment', confirmPayment);

// GET /admin/orders/:id/invoice - Generate invoice
router.get('/orders/:id/invoice', generateInvoice);

/**
 * User Order Statistics Route
 * Requirements: 9.3
 */
// GET /admin/users/:id/stats - Get user order statistics
router.get('/users/:id/stats', getUserOrderStats);

export default router;
