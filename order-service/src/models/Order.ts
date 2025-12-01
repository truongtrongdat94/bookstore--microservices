import { query, transaction } from '../config/database';
import { Order, OrderItem, OrderStatus, PaymentStatus, CreateOrderDto } from '../types';
import winston from 'winston';
import axios from 'axios';
import config from '../config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

export class OrderModel {
  // Create a new order with items
  static async create(orderData: CreateOrderDto, userId: number): Promise<Order> {
    return await transaction(async (client) => {
      // Create order
      const orderSql = `
        INSERT INTO orders (user_id, shipping_address, payment_method, total_amount, status, payment_status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      // Calculate total with tax and processing fee
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const taxRate = 0.10; // 10% tax
      const processingFee = 1.99;
      const totalAmount = parseFloat((subtotal + (subtotal * taxRate) + processingFee).toFixed(2));
      
      const orderResult = await client.query(orderSql, [
        userId,
        orderData.shipping_address,
        orderData.payment_method,
        totalAmount,
        OrderStatus.PENDING,
        PaymentStatus.PENDING
      ]);
      
      const order = orderResult.rows[0];
      
      // Create order items
      for (const item of orderData.items) {
        const itemSql = `
          INSERT INTO order_items (order_id, book_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `;
        
        await client.query(itemSql, [
          order.order_id,
          item.book_id,
          item.quantity,
          item.price
        ]);
      }
      
      return order;
    });
  }
  
  // Find order by ID with items
  static async findById(orderId: number): Promise<(Order & { items: OrderItem[] }) | null> {
    const orderSql = `
      SELECT * FROM orders WHERE order_id = $1
    `;
    
    const itemsSql = `
      SELECT *
      FROM order_items
      WHERE order_id = $1
      ORDER BY item_id
    `;
    
    try {
      const [orderResult, itemsResult] = await Promise.all([
        query(orderSql, [orderId]),
        query(itemsSql, [orderId])
      ]);
      
      if (orderResult.rows.length === 0) {
        return null;
      }
      
      const order = orderResult.rows[0];
      const items = itemsResult.rows;
      
      // Enrich items with book details
      const enrichedItems = await OrderModel.enrichItemsWithBookDetails(items);
      
      return { ...order, items: enrichedItems };
    } catch (error) {
      logger.error('Error finding order by ID:', { orderId, error });
      throw error;
    }
  }
  
  // Find orders by user ID
  static async findByUserId(userId: number, limit: number = 10, offset: number = 0): Promise<Order[]> {
    const sql = `
      SELECT o.*, COUNT(oi.item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    try {
      const result = await query(sql, [userId, limit, offset]);
      return result.rows;
    } catch (error) {
      logger.error('Error finding orders by user ID:', { userId, error });
      throw error;
    }
  }
  
  // Find orders by user ID with items (for profile page)
  static async findByUserIdWithItems(
    userId: number, 
    limit: number = 10, 
    offset: number = 0
  ): Promise<{ orders: any[], total: number }> {
    const ordersSql = `
      SELECT 
        o.order_id,
        CONCAT('ORD-', LPAD(o.order_id::TEXT, 6, '0')) as order_number,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at,
        o.shipping_address,
        json_agg(
          json_build_object(
            'book_id', oi.book_id,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const countSql = 'SELECT COUNT(*) as total FROM orders WHERE user_id = $1';
    
    try {
      const [ordersResult, countResult] = await Promise.all([
        query(ordersSql, [userId, limit, offset]),
        query(countSql, [userId])
      ]);
      
      const orders = ordersResult.rows;
      const total = parseInt(countResult.rows[0].total);
      
      // Enrich items with book details from book service
      const enrichedOrders = await Promise.all(
        orders.map(async (order) => {
          try {
            const enrichedItems = await Promise.all(
              order.items.map(async (item: any) => {
                if (!item.book_id) return null; // Skip null items from LEFT JOIN
                
                try {
                  const response = await axios.get(`${config.services.bookService}/books/${item.book_id}`);
                  const book = response.data.data;
                  return {
                    ...item,
                    title: book.title
                  };
                } catch (error) {
                  logger.warn('Failed to fetch book details', { bookId: item.book_id });
                  return {
                    ...item,
                    title: 'Unknown Book'
                  };
                }
              })
            );
            
            return {
              ...order,
              items: enrichedItems.filter((item: any) => item !== null) // Remove null items
            };
          } catch (error) {
            logger.error('Error enriching order items:', { orderId: order.order_id, error });
            return order;
          }
        })
      );
      
      return {
        orders: enrichedOrders,
        total
      };
    } catch (error) {
      logger.error('Error finding orders by user ID with items:', { userId, error });
      throw error;
    }
  }
  
  // Update order status
  static async updateStatus(orderId: number, status: OrderStatus): Promise<Order | null> {
    const sql = `
      UPDATE orders
      SET status = $2, updated_at = NOW()
      WHERE order_id = $1
      RETURNING *
    `;
    
    try {
      const result = await query(sql, [orderId, status]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating order status:', { orderId, status, error });
      throw error;
    }
  }
  
  // Update payment status
  static async updatePaymentStatus(orderId: number, paymentStatus: PaymentStatus): Promise<Order | null> {
    const sql = `
      UPDATE orders
      SET payment_status = $2, updated_at = NOW()
      WHERE order_id = $1
      RETURNING *
    `;
    
    try {
      const result = await query(sql, [orderId, paymentStatus]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error updating payment status:', { orderId, paymentStatus, error });
      throw error;
    }
  }
  
  // Get all orders (admin)
  static async findAll(limit: number = 10, offset: number = 0, status?: OrderStatus): Promise<{ orders: Order[], total: number }> {
    let whereClause = '';
    let params: any[] = [limit, offset];
    
    if (status) {
      whereClause = 'WHERE o.status = $3';
      params.push(status);
    }
    
    const ordersSql = `
      SELECT o.*, COUNT(oi.item_id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      ${whereClause}
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const countSql = `
      SELECT COUNT(*) as total FROM orders o ${whereClause}
    `;
    
    try {
      const [ordersResult, countResult] = await Promise.all([
        query(ordersSql, params),
        query(countSql, status ? [status] : [])
      ]);
      
      return {
        orders: ordersResult.rows,
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      logger.error('Error finding all orders:', { error });
      throw error;
    }
  }
  
  // Cancel order
  static async cancel(orderId: number, userId?: number): Promise<Order | null> {
    let sql = `
      UPDATE orders
      SET status = $2, updated_at = NOW()
      WHERE order_id = $1 AND status IN ($3, $4)
    `;
    
    let params = [orderId, OrderStatus.CANCELLED, OrderStatus.PENDING, OrderStatus.CONFIRMED];
    
    if (userId) {
      sql += ' AND user_id = $5';
      params.push(userId);
    }
    
    sql += ' RETURNING *';
    
    try {
      const result = await query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error cancelling order:', { orderId, userId, error });
      throw error;
    }
  }
  
  /**
   * Find orders with pending payment (awaiting_confirmation)
   * Joins with payment_sessions and users for complete info
   * Requirements: 3.1, 3.2, 3.3
   */
  static async findPendingPaymentOrders(
    limit: number = 10,
    offset: number = 0,
    fromDate?: Date,
    toDate?: Date
  ): Promise<{ orders: any[], total: number }> {
    let whereClause = "WHERE o.payment_status = 'awaiting_confirmation'";
    const params: any[] = [limit, offset];
    let paramIndex = 3;

    if (fromDate) {
      whereClause += ` AND o.created_at >= $${paramIndex}`;
      params.push(fromDate);
      paramIndex++;
    }

    if (toDate) {
      whereClause += ` AND o.created_at <= $${paramIndex}`;
      params.push(toDate);
      paramIndex++;
    }

    const ordersSql = `
      SELECT 
        o.order_id,
        CONCAT('ORD-', LPAD(o.order_id::TEXT, 6, '0')) as order_number,
        o.user_id,
        o.total_amount,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.created_at,
        ps.transfer_content,
        ps.qr_data_url,
        ps.created_at as qr_created_at,
        ps.expires_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.order_id) as items_count
      FROM orders o
      LEFT JOIN payment_sessions ps ON o.order_id = ps.order_id AND ps.status = 'active'
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countSql = `
      SELECT COUNT(*) as total 
      FROM orders o 
      ${whereClause}
    `;

    try {
      const countParams = params.slice(2); // Remove limit and offset for count query
      const [ordersResult, countResult] = await Promise.all([
        query(ordersSql, params),
        query(countSql, countParams.length > 0 ? countParams : [])
      ]);

      // Enrich with customer info from user service
      const enrichedOrders = await Promise.all(
        ordersResult.rows.map(async (order) => {
          let customerInfo = {
            user_id: order.user_id,
            email: 'unknown@example.com',
            name: 'Unknown Customer'
          };

          try {
            const response = await axios.get(`${config.services.userService}/users/${order.user_id}`);
            if (response.data.success && response.data.data) {
              customerInfo = {
                user_id: order.user_id,
                email: response.data.data.email || 'unknown@example.com',
                name: response.data.data.full_name || response.data.data.name || 'Unknown Customer'
              };
            }
          } catch (error) {
            logger.warn('Failed to fetch customer info', { userId: order.user_id });
          }

          // Calculate time remaining
          const now = new Date();
          const expiresAt = order.expires_at ? new Date(order.expires_at) : null;
          const timeRemainingSeconds = expiresAt 
            ? Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000))
            : 0;

          return {
            order_id: order.order_id,
            order_number: order.order_number,
            customer: customerInfo,
            total_amount: parseFloat(order.total_amount),
            transfer_content: order.transfer_content || `DH${order.order_id.toString().padStart(6, '0')}`,
            qr_created_at: order.qr_created_at,
            expires_at: order.expires_at,
            time_remaining_seconds: timeRemainingSeconds,
            items_count: parseInt(order.items_count) || 0,
            status: order.status,
            payment_status: order.payment_status,
            shipping_address: order.shipping_address,
            created_at: order.created_at
          };
        })
      );

      return {
        orders: enrichedOrders,
        total: parseInt(countResult.rows[0].total)
      };
    } catch (error) {
      logger.error('Error finding pending payment orders:', { error });
      throw error;
    }
  }

  // Get order statistics
  static async getStatistics(userId?: number): Promise<any> {
    let whereClause = userId ? 'WHERE user_id = $1' : '';
    let params = userId ? [userId] : [];
    
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as avg_order_value
      FROM orders
      ${whereClause}
    `;
    
    try {
      const result = await query(sql, params);
      return result.rows[0];
    } catch (error) {
      logger.error('Error getting order statistics:', { userId, error });
      throw error;
    }
  }
  
  // Enrich order items with book details from book service
  static async enrichItemsWithBookDetails(items: OrderItem[]): Promise<OrderItem[]> {
    try {
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const response = await axios.get(`${config.services.bookService}/books/${item.book_id}`);
            const book = response.data.data;
            return {
              ...item,
              title: book.title,
              author: book.author
            };
          } catch (error) {
            // If book fetch fails, return item without enrichment
            logger.warn('Failed to fetch book details for enrichment', { bookId: item.book_id, error });
            return item;
          }
        })
      );
      return enrichedItems;
    } catch (error) {
      logger.error('Error enriching items with book details:', { error });
      // Return original items if enrichment fails
      return items;
    }
  }
}
