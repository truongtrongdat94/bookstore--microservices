import { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../models/Order';
import { PaymentSessionModel } from '../models/PaymentSession';
import { cartService } from '../config/redis';
import eventService from '../services/eventService';
import { vietqrService } from '../services/vietqrService';
import { ApiResponse, ApiError, AuthRequest, CheckoutDto, OrderStatus, PaymentStatus, PaymentMethod, PaymentSessionStatus } from '../types';
import winston from 'winston';
import config from '../config';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

export class OrderController {
  // Checkout - Create order from cart with VietQR payment
  // Requirements: 1.1, 1.2, 1.3, 1.4
  static async checkout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const checkoutData: CheckoutDto = req.body;
      
      // Get user's cart
      const cart = await cartService.getCart(req.user.user_id);
      
      if (!cart || cart.items.length === 0) {
        throw new ApiError(400, 'Cart is empty', 'EMPTY_CART');
      }
      
      // Create order data from cart
      const orderData = {
        items: cart.items.map(item => ({
          book_id: item.book_id,
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: checkoutData.shipping_address,
        payment_method: checkoutData.payment_method
      };
      
      // Create order with pending status
      const order = await OrderModel.create(orderData, req.user.user_id);
      
      // Check if payment method is bank_transfer - use VietQR flow
      if (checkoutData.payment_method === PaymentMethod.BANK_TRANSFER) {
        // VietQR Payment Flow
        // Requirements: 1.1, 1.2, 1.3
        const qrResult = await OrderController.processVietQRPayment(
          order.order_id,
          typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
          req.user.user_id
        );
        
        if (qrResult.success && qrResult.paymentSession) {
          // Update payment status to awaiting_confirmation
          await OrderModel.updatePaymentStatus(order.order_id, PaymentStatus.AWAITING_CONFIRMATION);
          
          // Publish order created event
          await eventService.publishOrderCreated({
            order_id: order.order_id,
            user_id: req.user.user_id,
            user_email: req.user.email,
            total_amount: order.total_amount,
            items: orderData.items.map((item, index) => ({
              item_id: index + 1,
              order_id: order.order_id,
              book_id: item.book_id,
              quantity: item.quantity,
              price: item.price,
              created_at: new Date()
            })),
            created_at: order.created_at
          });
          
          logger.info('Order created with VietQR payment', { 
            orderId: order.order_id,
            userId: req.user.user_id,
            total: order.total_amount,
            sessionId: qrResult.paymentSession.session_id
          });
          
          // Calculate remaining seconds
          const remainingSeconds = PaymentSessionModel.calculateRemainingSeconds(
            qrResult.paymentSession.expires_at
          );
          
          const response: ApiResponse = {
            success: true,
            data: {
              order_id: order.order_id,
              order_number: `ORD-${order.order_id.toString().padStart(6, '0')}`,
              status: OrderStatus.PENDING,
              payment_status: PaymentStatus.AWAITING_CONFIRMATION,
              total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
              payment: {
                qr_data_url: qrResult.paymentSession.qr_data_url,
                transfer_content: qrResult.paymentSession.transfer_content,
                bank_info: vietqrService.getBankInfo(),
                expires_at: qrResult.paymentSession.expires_at,
                expires_in_seconds: remainingSeconds
              },
              message: 'Order created. Please complete payment by scanning the QR code.'
            }
          };
          
          res.status(201).json(response);
        } else {
          // VietQR API failed - keep order in pending state
          // Requirements: 1.4
          logger.error('VietQR payment failed', { 
            orderId: order.order_id,
            error: qrResult.error 
          });
          
          throw new ApiError(
            503, 
            'Payment service temporarily unavailable. Please try again later.', 
            'PAYMENT_SERVICE_ERROR',
            { orderId: order.order_id }
          );
        }
      } else {
        // Legacy payment flow for other payment methods
        const paymentResult = await OrderController.processPayment(
          order.order_id,
          order.total_amount,
          checkoutData.payment_method
        );
        
        if (paymentResult.success) {
          // Update payment status
          await OrderModel.updatePaymentStatus(order.order_id, PaymentStatus.COMPLETED);
          await OrderModel.updateStatus(order.order_id, OrderStatus.CONFIRMED);
          
          // Clear cart after successful order
          await cartService.clearCart(req.user.user_id);
          
          // Publish order created event
          await eventService.publishOrderCreated({
            order_id: order.order_id,
            user_id: req.user.user_id,
            user_email: req.user.email,
            total_amount: order.total_amount,
            items: orderData.items.map((item, index) => ({
              item_id: index + 1,
              order_id: order.order_id,
              book_id: item.book_id,
              quantity: item.quantity,
              price: item.price,
              created_at: new Date()
            })),
            created_at: order.created_at
          });
          
          // Publish payment processed event
          await eventService.publishPaymentProcessed({
            order_id: order.order_id,
            user_email: req.user.email,
            payment_status: PaymentStatus.COMPLETED,
            amount: order.total_amount,
            processed_at: new Date()
          });
          
          logger.info('Order created successfully', { 
            orderId: order.order_id,
            userId: req.user.user_id,
            total: order.total_amount
          });
          
          const response: ApiResponse = {
            success: true,
            data: {
              order_id: order.order_id,
              status: OrderStatus.CONFIRMED,
              payment_status: PaymentStatus.COMPLETED,
              total_amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
              message: 'Order placed successfully'
            }
          };
          
          res.status(201).json(response);
        } else {
          // Payment failed
          await OrderModel.updatePaymentStatus(order.order_id, PaymentStatus.FAILED);
          await OrderModel.updateStatus(order.order_id, OrderStatus.CANCELLED);
          
          throw new ApiError(402, 'Payment processing failed', 'PAYMENT_FAILED');
        }
      }
    } catch (error) {
      next(error);
    }
  }
  
  // Get user's orders
  static async getUserOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const orders = await OrderModel.findByUserId(req.user.user_id, limit, offset);
      
      const response: ApiResponse = {
        success: true,
        data: orders,
        meta: {
          page,
          limit
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get my orders with full details (for profile page)
  static async getMyOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const userId = req.user.user_id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      
      const { orders, total } = await OrderModel.findByUserIdWithItems(userId, limit, offset);
      const totalPages = Math.ceil(total / limit);
      
      const response: ApiResponse = {
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get order by ID
  static async getOrderById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        throw new ApiError(400, 'Invalid order ID', 'INVALID_ORDER_ID');
      }
      
      const order = await OrderModel.findById(orderId);
      
      if (!order) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }
      
      // Check if user owns this order (or is admin)
      if (order.user_id !== req.user.user_id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Access denied', 'ACCESS_DENIED');
      }
      
      const response: ApiResponse = {
        success: true,
        data: order
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Cancel order
  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        throw new ApiError(400, 'Invalid order ID', 'INVALID_ORDER_ID');
      }
      
      // Get current order status
      const currentOrder = await OrderModel.findById(orderId);
      
      if (!currentOrder) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }
      
      if (currentOrder.user_id !== req.user.user_id && req.user.role !== 'admin') {
        throw new ApiError(403, 'Access denied', 'ACCESS_DENIED');
      }
      
      const order = await OrderModel.cancel(orderId, req.user.user_id);
      
      if (!order) {
        throw new ApiError(400, 'Order cannot be cancelled at this time', 'CANCEL_NOT_ALLOWED');
      }
      
      // Publish order updated event
      await eventService.publishOrderUpdated({
        order_id: orderId,
        old_status: currentOrder.status,
        new_status: OrderStatus.CANCELLED,
        updated_at: new Date()
      });
      
      logger.info('Order cancelled', { orderId, userId: req.user.user_id });
      
      const response: ApiResponse = {
        success: true,
        data: order
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Get all orders (admin only)
  static async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as OrderStatus;
      const offset = (page - 1) * limit;
      
      const { orders, total } = await OrderModel.findAll(limit, offset, status);
      
      const response: ApiResponse = {
        success: true,
        data: orders,
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
  
  // Update order status (admin only)
  static async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (isNaN(orderId)) {
        throw new ApiError(400, 'Invalid order ID', 'INVALID_ORDER_ID');
      }
      
      // Get current order
      const currentOrder = await OrderModel.findById(orderId);
      
      if (!currentOrder) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }
      
      const order = await OrderModel.updateStatus(orderId, status);
      
      if (!order) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }
      
      // Publish order updated event
      await eventService.publishOrderUpdated({
        order_id: orderId,
        old_status: currentOrder.status,
        new_status: status,
        updated_at: new Date()
      });
      
      logger.info('Order status updated', { orderId, newStatus: status });
      
      const response: ApiResponse = {
        success: true,
        data: order
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  // Mock payment processing
  private static async processPayment(
    orderId: number,
    amount: number,
    paymentMethod: string
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add tax and processing fee
    const totalWithTax = amount + (amount * config.payment.taxRate) + config.payment.processingFee;
    
    // Simulate payment success/failure (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        transactionId: `TXN_${orderId}_${Date.now()}`
      };
    } else {
      return {
        success: false,
        error: 'Payment declined by payment processor'
      };
    }
  }
  
  /**
   * Process VietQR payment with retry logic
   * Requirements: 1.1, 1.2, 1.3, 1.4
   * 
   * @param orderId - The order ID
   * @param amount - The payment amount
   * @param userId - The user ID (for logging)
   * @returns Result with payment session or error
   */
  private static async processVietQRPayment(
    orderId: number,
    amount: number,
    userId: number
  ): Promise<{ 
    success: boolean; 
    paymentSession?: import('../types').PaymentSession; 
    error?: string 
  }> {
    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000; // 1 second base delay
    
    let lastError: string = '';
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info('Attempting VietQR API call', { 
          orderId, 
          attempt, 
          maxRetries: MAX_RETRIES 
        });
        
        // Call VietQR service to generate QR code
        const qrResult = await vietqrService.generateQR(orderId, amount);
        
        if (qrResult.success && qrResult.qrDataURL && qrResult.qrCode) {
          // Create payment session
          // Requirements: 1.2, 1.5
          const paymentSession = await PaymentSessionModel.create({
            order_id: orderId,
            qr_code: qrResult.qrCode,
            qr_data_url: qrResult.qrDataURL,
            amount: amount,
            transfer_content: qrResult.transferContent || `DH${orderId.toString().padStart(6, '0')}`
          });
          
          logger.info('VietQR payment session created', { 
            orderId, 
            sessionId: paymentSession.session_id,
            expiresAt: paymentSession.expires_at
          });
          
          return {
            success: true,
            paymentSession
          };
        }
        
        // QR generation failed
        lastError = qrResult.error || 'Unknown VietQR API error';
        logger.warn('VietQR API returned error', { 
          orderId, 
          attempt, 
          error: lastError 
        });
        
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
        logger.error('VietQR API call failed', { 
          orderId, 
          attempt, 
          error: lastError 
        });
      }
      
      // If not the last attempt, wait with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        logger.info('Retrying VietQR API call', { 
          orderId, 
          nextAttempt: attempt + 1, 
          delayMs 
        });
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    // All retries exhausted
    // Requirements: 1.4 - Order remains in pending state (no payment session created)
    logger.error('VietQR payment failed after all retries', { 
      orderId, 
      userId,
      totalAttempts: MAX_RETRIES,
      lastError 
    });
    
    return {
      success: false,
      error: lastError
    };
  }
  
  /**
   * Get or regenerate QR code for an order
   * Requirements: 2.2, 6.1, 6.2, 6.3
   * 
   * - Check if order belongs to user
   * - Check if Payment Session is still valid
   * - Return existing QR if valid, regenerate if expired
   */
  static async getOrderQR(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const orderId = parseInt(req.params.id);
      
      if (isNaN(orderId)) {
        throw new ApiError(400, 'Invalid order ID', 'INVALID_ORDER_ID');
      }
      
      // Get order and verify ownership
      const order = await OrderModel.findById(orderId);
      
      if (!order) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }
      
      // Check if user owns this order
      if (order.user_id !== req.user.user_id) {
        throw new ApiError(403, 'Access denied', 'ACCESS_DENIED');
      }
      
      // Check if order is in a state that allows QR retrieval
      if (order.status === OrderStatus.CANCELLED) {
        throw new ApiError(400, 'Cannot get QR for cancelled order', 'ORDER_CANCELLED');
      }
      
      if (order.payment_status === PaymentStatus.COMPLETED) {
        throw new ApiError(400, 'Payment already completed for this order', 'PAYMENT_COMPLETED');
      }
      
      // Find existing payment session
      const existingSession = await PaymentSessionModel.findActiveByOrderId(orderId);
      
      let paymentSession: import('../types').PaymentSession;
      let isRegenerated = false;
      
      if (existingSession) {
        // Check if session is still valid
        // Requirements: 2.2, 6.1
        const { isValid, remainingSeconds } = PaymentSessionModel.isSessionValid(existingSession);
        
        if (isValid) {
          // Return existing QR
          // Requirements: 6.1
          paymentSession = existingSession;
          
          logger.info('Returning existing QR for order', { 
            orderId, 
            sessionId: existingSession.session_id,
            remainingSeconds 
          });
        } else {
          // Session expired - regenerate QR
          // Requirements: 6.2, 6.3
          const regenerateResult = await OrderController.regenerateQR(orderId, order.total_amount, req.user.user_id);
          
          if (!regenerateResult.success || !regenerateResult.paymentSession) {
            throw new ApiError(
              503, 
              'Failed to regenerate QR code. Please try again later.', 
              'QR_REGENERATION_FAILED'
            );
          }
          
          paymentSession = regenerateResult.paymentSession;
          isRegenerated = true;
          
          logger.info('Regenerated QR for order', { 
            orderId, 
            newSessionId: paymentSession.session_id 
          });
        }
      } else {
        // No existing session - check if order should have one
        if (order.payment_status !== PaymentStatus.AWAITING_CONFIRMATION && 
            order.payment_status !== PaymentStatus.PENDING) {
          throw new ApiError(400, 'Order is not awaiting payment', 'INVALID_ORDER_STATE');
        }
        
        // Generate new QR
        // Requirements: 6.2
        const generateResult = await OrderController.regenerateQR(orderId, order.total_amount, req.user.user_id);
        
        if (!generateResult.success || !generateResult.paymentSession) {
          throw new ApiError(
            503, 
            'Failed to generate QR code. Please try again later.', 
            'QR_GENERATION_FAILED'
          );
        }
        
        paymentSession = generateResult.paymentSession;
        isRegenerated = true;
        
        // Update payment status to awaiting_confirmation if it was pending
        if (order.payment_status === PaymentStatus.PENDING) {
          await OrderModel.updatePaymentStatus(orderId, PaymentStatus.AWAITING_CONFIRMATION);
        }
        
        logger.info('Generated new QR for order', { 
          orderId, 
          sessionId: paymentSession.session_id 
        });
      }
      
      // Calculate remaining seconds
      const remainingSeconds = PaymentSessionModel.calculateRemainingSeconds(paymentSession.expires_at);
      
      const response: ApiResponse = {
        success: true,
        data: {
          order_id: orderId,
          qr_data_url: paymentSession.qr_data_url,
          transfer_content: paymentSession.transfer_content,
          bank_info: vietqrService.getBankInfo(),
          expires_at: paymentSession.expires_at,
          expires_in_seconds: remainingSeconds,
          is_regenerated: isRegenerated
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
  
  /**
   * Regenerate QR code for an order
   * Invalidates previous sessions and creates a new one
   * Requirements: 6.2, 6.3
   */
  private static async regenerateQR(
    orderId: number,
    amount: number | string,
    userId: number
  ): Promise<{ 
    success: boolean; 
    paymentSession?: import('../types').PaymentSession; 
    error?: string 
  }> {
    try {
      // Invalidate previous sessions
      // Requirements: 6.3
      await PaymentSessionModel.invalidatePreviousSessions(orderId);
      
      const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
      
      // Generate new QR using VietQR service
      const qrResult = await vietqrService.generateQR(orderId, numericAmount);
      
      if (!qrResult.success || !qrResult.qrDataURL || !qrResult.qrCode) {
        logger.error('VietQR API failed during regeneration', { 
          orderId, 
          error: qrResult.error 
        });
        return {
          success: false,
          error: qrResult.error || 'VietQR API error'
        };
      }
      
      // Create new payment session with fresh 15-minute expiry
      // Requirements: 6.2
      const paymentSession = await PaymentSessionModel.create({
        order_id: orderId,
        qr_code: qrResult.qrCode,
        qr_data_url: qrResult.qrDataURL,
        amount: numericAmount,
        transfer_content: qrResult.transferContent || `DH${orderId.toString().padStart(6, '0')}`
      });
      
      logger.info('QR regenerated successfully', { 
        orderId, 
        sessionId: paymentSession.session_id,
        expiresAt: paymentSession.expires_at
      });
      
      return {
        success: true,
        paymentSession
      };
    } catch (error) {
      logger.error('Error regenerating QR', { orderId, error });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Get order statistics
  static async getOrderStatistics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }
      
      const userId = req.user.role === 'admin' ? undefined : req.user.user_id;
      const stats = await OrderModel.getStatistics(userId);
      
      const response: ApiResponse = {
        success: true,
        data: stats
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get pending payment orders (Admin only)
   * Requirements: 3.1, 3.2, 3.3
   * 
   * Returns paginated list of orders with payment_status = awaiting_confirmation
   * Includes customer info, QR info, and time remaining
   */
  static async getPendingPaymentOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }

      // Check admin role
      if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Admin access required', 'FORBIDDEN');
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      // Parse date filters
      let fromDate: Date | undefined;
      let toDate: Date | undefined;

      if (req.query.from_date) {
        fromDate = new Date(req.query.from_date as string);
        if (isNaN(fromDate.getTime())) {
          throw new ApiError(400, 'Invalid from_date format', 'INVALID_DATE');
        }
      }

      if (req.query.to_date) {
        toDate = new Date(req.query.to_date as string);
        if (isNaN(toDate.getTime())) {
          throw new ApiError(400, 'Invalid to_date format', 'INVALID_DATE');
        }
      }

      const { orders, total } = await OrderModel.findPendingPaymentOrders(
        limit,
        offset,
        fromDate,
        toDate
      );

      const totalPages = Math.ceil(total / limit);

      logger.info('Admin fetched pending payment orders', {
        adminId: req.user.user_id,
        page,
        limit,
        total,
        fromDate,
        toDate
      });

      const response: ApiResponse = {
        success: true,
        data: {
          orders,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm payment for an order (Admin only)
   * Requirements: 4.1, 4.2, 4.3, 4.4
   * 
   * - Validate order exists and has payment_status = awaiting_confirmation
   * - Update order status to confirmed, payment_status to completed
   * - Update payment_session with confirmed_by and confirmed_at
   * - Clear customer cart
   * - Publish payment confirmed event
   */
  static async confirmPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }

      // Check admin role
      if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Admin access required', 'FORBIDDEN');
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        throw new ApiError(400, 'Invalid order ID', 'INVALID_ORDER_ID');
      }

      // Get order with current state
      const order = await OrderModel.findById(orderId);

      if (!order) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }

      // Requirements: 4.4 - Reject confirmation for expired/cancelled orders
      if (order.status === OrderStatus.CANCELLED) {
        throw new ApiError(
          400, 
          'Cannot confirm payment for cancelled order', 
          'ORDER_CANCELLED',
          { current_status: order.status }
        );
      }

      // Check payment session status
      const paymentSession = await PaymentSessionModel.findByOrderId(orderId);
      
      if (paymentSession) {
        // Requirements: 4.4 - Reject if payment session is expired or cancelled
        if (paymentSession.status === PaymentSessionStatus.EXPIRED) {
          throw new ApiError(
            400, 
            'Cannot confirm payment for expired payment session', 
            'PAYMENT_SESSION_EXPIRED',
            { session_status: paymentSession.status }
          );
        }

        if (paymentSession.status === PaymentSessionStatus.CANCELLED) {
          throw new ApiError(
            400, 
            'Cannot confirm payment for cancelled payment session', 
            'PAYMENT_SESSION_CANCELLED',
            { session_status: paymentSession.status }
          );
        }

        if (paymentSession.status === PaymentSessionStatus.COMPLETED) {
          throw new ApiError(
            400, 
            'Payment has already been confirmed', 
            'PAYMENT_ALREADY_CONFIRMED',
            { confirmed_at: paymentSession.confirmed_at }
          );
        }
      }

      // Requirements: 4.4 - Validate payment_status is awaiting_confirmation
      if (order.payment_status !== PaymentStatus.AWAITING_CONFIRMATION) {
        throw new ApiError(
          400, 
          'Order is not awaiting payment confirmation', 
          'INVALID_PAYMENT_STATUS',
          { current_payment_status: order.payment_status }
        );
      }

      // Requirements: 4.1 - Update order status to confirmed, payment_status to completed
      await OrderModel.updateStatus(orderId, OrderStatus.CONFIRMED);
      await OrderModel.updatePaymentStatus(orderId, PaymentStatus.COMPLETED);

      // Requirements: 4.2 - Update payment_session with confirmed_by and confirmed_at
      if (paymentSession) {
        await PaymentSessionModel.markCompleted(paymentSession.session_id, req.user.user_id);
      }

      // Requirements: 4.3 - Clear customer cart
      await cartService.clearCart(order.user_id);

      // Publish payment confirmed event
      // Note: user_email should be fetched from user-service in production
      // For now, we use a placeholder that notification-service will handle
      await eventService.publishPaymentProcessed({
        order_id: orderId,
        user_email: '', // Will be fetched by notification-service if empty
        payment_status: PaymentStatus.COMPLETED,
        amount: typeof order.total_amount === 'string' ? parseFloat(order.total_amount) : order.total_amount,
        processed_at: new Date()
      });

      logger.info('Payment confirmed by admin', {
        orderId,
        adminId: req.user.user_id,
        userId: order.user_id,
        amount: order.total_amount
      });

      const response: ApiResponse = {
        success: true,
        data: {
          order_id: orderId,
          status: OrderStatus.CONFIRMED,
          payment_status: PaymentStatus.COMPLETED,
          confirmed_at: new Date().toISOString(),
          confirmed_by: req.user.user_id
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject an order (Admin only)
   * Requirements: 5.1, 5.2, 5.3
   * 
   * - Validate rejection reason is provided
   * - Update order status to cancelled, payment_status to failed
   * - Update payment_session with rejection_reason and admin info
   */
  static async rejectOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required', 'UNAUTHORIZED');
      }

      // Check admin role
      if (req.user.role !== 'admin') {
        throw new ApiError(403, 'Admin access required', 'FORBIDDEN');
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        throw new ApiError(400, 'Invalid order ID', 'INVALID_ORDER_ID');
      }

      // Requirements: 5.2 - Validate rejection reason is provided
      const { reason } = req.body;

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        throw new ApiError(
          400, 
          'Rejection reason is required', 
          'REJECTION_REASON_REQUIRED'
        );
      }

      const trimmedReason = reason.trim();

      // Get order with current state
      const order = await OrderModel.findById(orderId);

      if (!order) {
        throw new ApiError(404, 'Order not found', 'ORDER_NOT_FOUND');
      }

      // Check if order is already cancelled
      if (order.status === OrderStatus.CANCELLED) {
        throw new ApiError(
          400, 
          'Order is already cancelled', 
          'ORDER_ALREADY_CANCELLED',
          { current_status: order.status }
        );
      }

      // Check if payment is already completed
      if (order.payment_status === PaymentStatus.COMPLETED) {
        throw new ApiError(
          400, 
          'Cannot reject order with completed payment', 
          'PAYMENT_ALREADY_COMPLETED',
          { current_payment_status: order.payment_status }
        );
      }

      // Requirements: 5.1 - Update order status to cancelled, payment_status to failed
      await OrderModel.updateStatus(orderId, OrderStatus.CANCELLED);
      await OrderModel.updatePaymentStatus(orderId, PaymentStatus.FAILED);

      // Requirements: 5.3 - Update payment_session with rejection_reason and admin info
      const paymentSession = await PaymentSessionModel.findByOrderId(orderId);
      
      if (paymentSession) {
        await PaymentSessionModel.markCancelled(
          paymentSession.session_id, 
          trimmedReason, 
          req.user.user_id
        );
      }

      // Publish order cancelled event
      await eventService.publishOrderUpdated({
        order_id: orderId,
        old_status: order.status,
        new_status: OrderStatus.CANCELLED,
        updated_at: new Date()
      });

      logger.info('Order rejected by admin', {
        orderId,
        adminId: req.user.user_id,
        userId: order.user_id,
        reason: trimmedReason
      });

      const response: ApiResponse = {
        success: true,
        data: {
          order_id: orderId,
          status: OrderStatus.CANCELLED,
          payment_status: PaymentStatus.FAILED,
          rejection_reason: trimmedReason,
          rejected_at: new Date().toISOString(),
          rejected_by: req.user.user_id
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
