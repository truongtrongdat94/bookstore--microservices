/**
 * Admin Order Controller
 * Handles admin order management API endpoints
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4
 */
import { Request, Response } from 'express';
import { query, transaction } from '../config/database';
import winston from 'winston';
import axios from 'axios';
import config from '../config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service-admin' },
  transports: [new winston.transports.Console()]
});

// Valid status transitions as per design document
const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

/**
 * Get order list with filters and pagination
 * GET /admin/orders
 * Requirements: 6.1, 6.2, 6.3
 */
export const getOrderList = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    
    // Filter parameters
    const status = req.query.status as string;
    const paymentStatus = req.query.paymentStatus as string;
    const paymentMethod = req.query.paymentMethod as string;
    const dateFrom = req.query.dateFrom as string;
    const dateTo = req.query.dateTo as string;
    const search = req.query.search as string;
    
    // Sort parameters
    const sortField = req.query.sort as string || 'created_at';
    const sortOrder = (req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Build WHERE clause
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      conditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    
    if (paymentStatus) {
      conditions.push(`o.payment_status = $${paramIndex}`);
      params.push(paymentStatus);
      paramIndex++;
    }
    
    if (paymentMethod) {
      conditions.push(`o.payment_method = $${paramIndex}`);
      params.push(paymentMethod);
      paramIndex++;
    }
    
    if (dateFrom) {
      conditions.push(`o.created_at >= $${paramIndex}`);
      params.push(new Date(dateFrom));
      paramIndex++;
    }
    
    if (dateTo) {
      conditions.push(`o.created_at <= $${paramIndex}`);
      params.push(new Date(dateTo));
      paramIndex++;
    }
    
    if (search) {
      const searchPattern = '%' + search + '%';
      conditions.push(`(CONCAT('ORD-', LPAD(o.order_id::TEXT, 6, '0')) ILIKE $${paramIndex} OR o.order_id::TEXT ILIKE $${paramIndex})`);
      params.push(searchPattern);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    
    // Validate sort field to prevent SQL injection
    const allowedSortFields = ['order_id', 'created_at', 'total_amount', 'status', 'payment_status'];
    const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'created_at';
    
    // Query for orders
    const ordersSql = `SELECT o.order_id, 
      CONCAT('ORD-', LPAD(o.order_id::TEXT, 6, '0')) as order_number, 
      o.user_id, o.total_amount, o.status, o.payment_status, o.payment_method, 
      o.shipping_address, o.created_at, o.updated_at, COUNT(oi.item_id) as item_count 
      FROM orders o LEFT JOIN order_items oi ON o.order_id = oi.order_id 
      ${whereClause} GROUP BY o.order_id ORDER BY o.${safeSortField} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    
    params.push(limit, offset);
    
    // Count query
    const countSql = `SELECT COUNT(DISTINCT o.order_id) as total FROM orders o ${whereClause}`;
    
    const [ordersResult, countResult] = await Promise.all([
      query(ordersSql, params),
      query(countSql, params.slice(0, -2))
    ]);
    
    // Enrich orders with customer info
    const enrichedOrders = await enrichOrdersWithCustomerInfo(ordersResult.rows);
    
    res.json({
      success: true,
      data: enrichedOrders,
      meta: {
        page,
        limit,
        total: parseInt(countResult.rows[0].total),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching order list:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order list' }
    });
  }
};

/**
 * Get order detail by ID
 * GET /admin/orders/:id
 * Requirements: 6.4
 */
export const getOrderDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid order ID' }
      });
      return;
    }
    
    const orderSql = `SELECT o.order_id, CONCAT('ORD-', LPAD(o.order_id::TEXT, 6, '0')) as order_number, 
      o.user_id, o.total_amount, o.status, o.payment_status, o.payment_method, 
      o.shipping_address, o.created_at, o.updated_at FROM orders o WHERE o.order_id = $1`;
    
    const itemsSql = `SELECT oi.item_id, oi.book_id, oi.quantity, oi.price, oi.created_at 
      FROM order_items oi WHERE oi.order_id = $1 ORDER BY oi.item_id`;
    
    const statusHistorySql = `SELECT id, from_status, to_status, changed_by, reason, created_at 
      FROM order_status_history WHERE order_id = $1 ORDER BY created_at DESC`;
    
    const [orderResult, itemsResult, historyResult] = await Promise.all([
      query(orderSql, [orderId]),
      query(itemsSql, [orderId]),
      query(statusHistorySql, [orderId])
    ]);
    
    if (orderResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: `Order with ID ${orderId} not found` }
      });
      return;
    }
    
    const order = orderResult.rows[0];
    const enrichedItems = await enrichItemsWithBookDetails(itemsResult.rows);
    const customerInfo = await getCustomerInfo(order.user_id);
    
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
      try { shippingAddress = JSON.parse(shippingAddress); } catch (e) { /* keep as string */ }
    }
    
    res.json({
      success: true,
      data: {
        ...order,
        shipping_address: shippingAddress,
        customer: customerInfo,
        items: enrichedItems,
        statusHistory: historyResult.rows
      }
    });
  } catch (error) {
    logger.error('Error fetching order detail:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch order detail' }
    });
  }
};


/**
 * Update order status
 * PUT /admin/orders/:id/status
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    const { status, reason } = req.body;
    const adminId = (req as any).user?.user_id || 0;
    
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid order ID' }
      });
      return;
    }
    
    if (!status) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Status is required' }
      });
      return;
    }
    
    const currentOrderResult = await query(
      'SELECT order_id, status, user_id FROM orders WHERE order_id = $1',
      [orderId]
    );
    
    if (currentOrderResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: `Order with ID ${orderId} not found` }
      });
      return;
    }
    
    const currentOrder = currentOrderResult.rows[0];
    const currentStatus = currentOrder.status;
    
    // Validate status transition
    const allowedTransitions = ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(status)) {
      res.status(422).json({
        success: false,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: `Cannot transition from '${currentStatus}' to '${status}'. Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
        }
      });
      return;
    }
    
    // Update order status and record history
    const result = await transaction(async (client) => {
      const updateResult = await client.query(
        'UPDATE orders SET status = $1, updated_at = NOW() WHERE order_id = $2 RETURNING *',
        [status, orderId]
      );
      
      await client.query(
        'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
        [orderId, currentStatus, status, adminId, reason || null]
      );
      
      return updateResult.rows[0];
    });
    
    // Trigger notification if status changed to 'shipped'
    if (status === 'shipped') {
      await sendShippedNotification(orderId, currentOrder.user_id);
    }
    
    res.json({
      success: true,
      data: { ...result, order_number: 'ORD-' + result.order_id.toString().padStart(6, '0') },
      message: `Order status updated from '${currentStatus}' to '${status}'`
    });
  } catch (error) {
    logger.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update order status' }
    });
  }
};

/**
 * Confirm payment for an order
 * POST /admin/orders/:id/confirm-payment
 * Requirements: 8.1, 8.4
 */
export const confirmPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    const adminId = (req as any).user?.user_id || 0;
    
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid order ID' }
      });
      return;
    }
    
    const currentOrderResult = await query(
      'SELECT order_id, status, payment_status, user_id FROM orders WHERE order_id = $1',
      [orderId]
    );
    
    if (currentOrderResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: `Order with ID ${orderId} not found` }
      });
      return;
    }
    
    const currentOrder = currentOrderResult.rows[0];
    
    if (currentOrder.payment_status === 'completed') {
      res.status(422).json({
        success: false,
        error: { code: 'PAYMENT_ALREADY_CONFIRMED', message: 'Payment has already been confirmed for this order' }
      });
      return;
    }
    
    const result = await transaction(async (client) => {
      const updateResult = await client.query(
        `UPDATE orders SET payment_status = 'completed', 
        status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END, 
        updated_at = NOW() WHERE order_id = $1 RETURNING *`,
        [orderId]
      );
      
      await client.query(
        `UPDATE payment_sessions SET status = 'completed', confirmed_by = $1, confirmed_at = NOW(), updated_at = NOW() 
        WHERE order_id = $2 AND status = 'active'`,
        [adminId, orderId]
      );
      
      if (currentOrder.status === 'pending') {
        await client.query(
          'INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, reason) VALUES ($1, $2, $3, $4, $5)',
          [orderId, 'pending', 'confirmed', adminId, 'Payment confirmed by admin']
        );
      }
      
      return updateResult.rows[0];
    });
    
    await sendPaymentConfirmationNotification(orderId, currentOrder.user_id);
    
    res.json({
      success: true,
      data: { ...result, order_number: 'ORD-' + result.order_id.toString().padStart(6, '0') },
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    logger.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to confirm payment' }
    });
  }
};


/**
 * Generate invoice for an order
 * GET /admin/orders/:id/invoice
 * Requirements: 8.2, 8.3
 */
export const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id);
    
    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid order ID' }
      });
      return;
    }
    
    const orderSql = `SELECT o.order_id, CONCAT('ORD-', LPAD(o.order_id::TEXT, 6, '0')) as order_number, 
      o.user_id, o.total_amount, o.status, o.payment_status, o.payment_method, 
      o.shipping_address, o.created_at FROM orders o WHERE o.order_id = $1`;
    
    const itemsSql = `SELECT oi.item_id, oi.book_id, oi.quantity, oi.price 
      FROM order_items oi WHERE oi.order_id = $1 ORDER BY oi.item_id`;
    
    const [orderResult, itemsResult] = await Promise.all([
      query(orderSql, [orderId]),
      query(itemsSql, [orderId])
    ]);
    
    if (orderResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        error: { code: 'ORDER_NOT_FOUND', message: `Order with ID ${orderId} not found` }
      });
      return;
    }
    
    const order = orderResult.rows[0];
    const items = await enrichItemsWithBookDetails(itemsResult.rows);
    const customer = await getCustomerInfo(order.user_id);
    
    let shippingAddress = order.shipping_address;
    if (typeof shippingAddress === 'string') {
      try { shippingAddress = JSON.parse(shippingAddress); } 
      catch (e) { shippingAddress = { address: order.shipping_address }; }
    }
    
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.10;
    const tax = subtotal * taxRate;
    const processingFee = 1.99;
    
    const invoiceData = {
      invoiceNumber: 'INV-' + order.order_number,
      orderNumber: order.order_number,
      orderId: order.order_id,
      createdAt: order.created_at,
      customer: { name: customer.name, email: customer.email, phone: customer.phone || 'N/A' },
      shippingAddress: shippingAddress,
      items: items.map((item: any) => ({
        title: item.title || 'Book #' + item.book_id,
        author: item.author || 'Unknown',
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.price * item.quantity
      })),
      summary: { subtotal, tax, taxRate: taxRate * 100, processingFee, total: order.total_amount },
      paymentInfo: { method: order.payment_method, status: order.payment_status },
      orderStatus: order.status
    };
    
    res.json({ success: true, data: invoiceData });
  } catch (error) {
    logger.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate invoice' }
    });
  }
};

/**
 * Get user order statistics
 * GET /admin/users/:id/stats
 * Requirements: 9.3
 */
export const getUserOrderStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid user ID' }
      });
      return;
    }
    
    const statsSql = `
      SELECT 
        COUNT(*) as order_count,
        COALESCE(SUM(total_amount), 0) as total_spent,
        MAX(created_at) as last_order_at
      FROM orders
      WHERE user_id = $1
    `;
    
    const result = await query(statsSql, [userId]);
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        orderCount: parseInt(stats.order_count) || 0,
        totalSpent: parseFloat(stats.total_spent) || 0,
        lastOrderAt: stats.last_order_at || null
      }
    });
  } catch (error) {
    logger.error('Error fetching user order stats:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user order statistics' }
    });
  }
};

// Helper functions

async function enrichOrdersWithCustomerInfo(orders: any[]): Promise<any[]> {
  const enrichedOrders = await Promise.all(
    orders.map(async (order) => {
      const customerInfo = await getCustomerInfo(order.user_id);
      return { ...order, customer_name: customerInfo.name, customer_email: customerInfo.email };
    })
  );
  return enrichedOrders;
}

async function getCustomerInfo(userId: number): Promise<{ name: string; email: string; phone?: string }> {
  try {
    const response = await axios.get(`${config.services.userService}/users/${userId}`);
    if (response.data.success && response.data.data) {
      return {
        name: response.data.data.full_name || response.data.data.name || 'Unknown',
        email: response.data.data.email || 'unknown@example.com',
        phone: response.data.data.phone
      };
    }
  } catch (error) {
    logger.warn('Failed to fetch customer info', { userId, error });
  }
  return { name: 'Unknown Customer', email: 'unknown@example.com' };
}

async function enrichItemsWithBookDetails(items: any[]): Promise<any[]> {
  const enrichedItems = await Promise.all(
    items.map(async (item) => {
      try {
        const response = await axios.get(`${config.services.bookService}/books/${item.book_id}`);
        if (response.data.success && response.data.data) {
          const book = response.data.data;
          return { ...item, title: book.title, author: book.author, cover_image: book.cover_image };
        }
      } catch (error) {
        logger.warn('Failed to fetch book details', { bookId: item.book_id });
      }
      return { ...item, title: 'Book #' + item.book_id, author: 'Unknown' };
    })
  );
  return enrichedItems;
}

async function sendShippedNotification(orderId: number, userId: number): Promise<void> {
  try {
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';
    await axios.post(`${notificationServiceUrl}/notifications`, {
      user_id: userId,
      type: 'order_shipped',
      title: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
      message: `Đơn hàng ORD-${orderId.toString().padStart(6, '0')} của bạn đã được giao cho đơn vị vận chuyển.`,
      data: { order_id: orderId, order_number: `ORD-${orderId.toString().padStart(6, '0')}` }
    });
    logger.info('Shipped notification sent', { orderId, userId });
  } catch (error) {
    logger.warn('Failed to send shipped notification', { orderId, userId, error });
  }
}

async function sendPaymentConfirmationNotification(orderId: number, userId: number): Promise<void> {
  try {
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3004';
    await axios.post(`${notificationServiceUrl}/notifications`, {
      user_id: userId,
      type: 'payment_confirmed',
      title: 'Thanh toán đã được xác nhận',
      message: `Thanh toán cho đơn hàng ORD-${orderId.toString().padStart(6, '0')} đã được xác nhận.`,
      data: { order_id: orderId, order_number: `ORD-${orderId.toString().padStart(6, '0')}` }
    });
    logger.info('Payment confirmation notification sent', { orderId, userId });
  } catch (error) {
    logger.warn('Failed to send payment confirmation notification', { orderId, userId, error });
  }
}

export default {
  getOrderList,
  getOrderDetail,
  updateOrderStatus,
  confirmPayment,
  generateInvoice,
  getUserOrderStats
};
