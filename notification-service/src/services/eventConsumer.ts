import amqp, { Message } from 'amqplib';
import config from '../config';
import { NotificationModel } from '../models/Notification';
import { emailService } from './emailService';
import { 
  OrderCreatedEvent, 
  OrderUpdatedEvent, 
  PaymentProcessedEvent, 
  NotificationType,
  QueueMessage 
} from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-service' },
  transports: [new winston.transports.Console()]
});

class EventConsumer {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    const maxRetries = 10;
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        this.connection = await amqp.connect(String(config.rabbitmq.url));
        this.channel = await this.connection.createChannel();
        break;
      } catch (error: any) {
        retries++;
        logger.warn(`RabbitMQ connection attempt ${retries}/${maxRetries} failed, retrying in 5s...`, { error: error.message });
        if (retries >= maxRetries) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    try {
      
      // Set prefetch to process messages one at a time
      await this.channel!.prefetch(1);
      
      // Assert exchange and queues
      await this.channel!.assertExchange(config.rabbitmq.exchanges.orders, 'topic', {
        durable: true
      });
      
      // Assert and bind queues
      await this.setupQueues();
      
      this.isConnected = true;
      logger.info('RabbitMQ consumer connected successfully');
      
      // Handle connection events
      if (this.connection) {
        this.connection.on('error', (err) => {
          logger.error('RabbitMQ connection error:', err);
          this.isConnected = false;
        });
        
        this.connection.on('close', () => {
          logger.warn('RabbitMQ connection closed');
          this.isConnected = false;
        });
      }
      
    } catch (error) {
      logger.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  private async setupQueues(): Promise<void> {
    if (!this.channel) throw new Error('Channel not available');

    // Order Created Queue
    await this.channel.assertQueue(config.rabbitmq.queues.orderCreated, {
      durable: true
    });
    
    await this.channel.bindQueue(
      config.rabbitmq.queues.orderCreated,
      config.rabbitmq.exchanges.orders,
      'order.created'
    );

    // Order Updated Queue
    await this.channel.assertQueue(config.rabbitmq.queues.orderUpdated, {
      durable: true
    });
    
    await this.channel.bindQueue(
      config.rabbitmq.queues.orderUpdated,
      config.rabbitmq.exchanges.orders,
      'order.updated'
    );

    // Payment Processed Queue
    await this.channel.assertQueue(config.rabbitmq.queues.paymentProcessed, {
      durable: true
    });
    
    await this.channel.bindQueue(
      config.rabbitmq.queues.paymentProcessed,
      config.rabbitmq.exchanges.orders,
      'payment.processed'
    );
  }

  async startConsuming(): Promise<void> {
    if (!this.channel || !this.isConnected) {
      throw new Error('Not connected to RabbitMQ');
    }

    // Consume Order Created events
    await this.channel.consume(
      config.rabbitmq.queues.orderCreated,
      (message) => this.handleOrderCreated(message),
      { consumerTag: `${config.rabbitmq.consumerTag}-order-created` }
    );

    // Consume Order Updated events
    await this.channel.consume(
      config.rabbitmq.queues.orderUpdated,
      (message) => this.handleOrderUpdated(message),
      { consumerTag: `${config.rabbitmq.consumerTag}-order-updated` }
    );

    // Consume Payment Processed events
    await this.channel.consume(
      config.rabbitmq.queues.paymentProcessed,
      (message) => this.handlePaymentProcessed(message),
      { consumerTag: `${config.rabbitmq.consumerTag}-payment-processed` }
    );

    logger.info('Started consuming events from RabbitMQ');
  }

  private async handleOrderCreated(message: Message | null): Promise<void> {
    if (!message || !this.channel) return;

    try {
      const event: OrderCreatedEvent = JSON.parse(message.content.toString());
      
      logger.info('Processing order created event', { orderId: event.order_id });

      // Create notification
      await NotificationModel.create({
        user_id: event.user_id,
        type: NotificationType.ORDER_CREATED,
        title: 'Order Confirmed',
        message: `Your order #${event.order_id} has been confirmed and is being processed.`,
        data: {
          order_id: event.order_id,
          total_amount: event.total_amount,
          items_count: event.items.length
        }
      });

      // Send email notification
      await emailService.sendOrderConfirmation(event);

      // Acknowledge message
      this.channel.ack(message);
      
      logger.info('Order created event processed successfully', { orderId: event.order_id });
    } catch (error) {
      logger.error('Error processing order created event:', error);
      
      // Reject and requeue message for retry
      if (this.channel) {
        this.channel.nack(message, false, true);
      }
    }
  }

  private async handleOrderUpdated(message: Message | null): Promise<void> {
    if (!message || !this.channel) return;

    try {
      const event: OrderUpdatedEvent = JSON.parse(message.content.toString());
      
      logger.info('Processing order updated event', { 
        orderId: event.order_id,
        from: event.old_status,
        to: event.new_status
      });

      // Create notification for significant status changes
      if (['shipped', 'delivered', 'cancelled'].includes(event.new_status)) {
        const statusMessages = {
          shipped: 'Your order has been shipped and is on its way!',
          delivered: 'Your order has been delivered successfully.',
          cancelled: 'Your order has been cancelled.'
        };

        await NotificationModel.create({
          user_id: 0, // We need to get user_id from order service or store it in event
          type: NotificationType.ORDER_UPDATED,
          title: `Order ${event.new_status.charAt(0).toUpperCase() + event.new_status.slice(1)}`,
          message: statusMessages[event.new_status as keyof typeof statusMessages] || `Order status updated to ${event.new_status}`,
          data: {
            order_id: event.order_id,
            old_status: event.old_status,
            new_status: event.new_status
          }
        });

        // Send email for significant updates
        await emailService.sendOrderUpdate(event);
      }

      // Acknowledge message
      this.channel.ack(message);
      
      logger.info('Order updated event processed successfully', { orderId: event.order_id });
    } catch (error) {
      logger.error('Error processing order updated event:', error);
      
      if (this.channel) {
        this.channel.nack(message, false, true);
      }
    }
  }

  private async handlePaymentProcessed(message: Message | null): Promise<void> {
    if (!message || !this.channel) return;

    try {
      const event: PaymentProcessedEvent = JSON.parse(message.content.toString());
      
      logger.info('Processing payment processed event', { 
        orderId: event.order_id,
        status: event.payment_status
      });

      const isSuccess = event.payment_status === 'completed';
      const title = isSuccess ? 'Payment Successful' : 'Payment Failed';
      const notificationMessage = isSuccess 
        ? `Payment of $${event.amount} for order #${event.order_id} was processed successfully.`
        : `Payment for order #${event.order_id} failed. Please try again or contact support.`;

      await NotificationModel.create({
        user_id: 0, // We need to get user_id from order service or store it in event
        type: NotificationType.PAYMENT_PROCESSED,
        title,
        message: notificationMessage,
        data: {
          order_id: event.order_id,
          payment_status: event.payment_status,
          amount: event.amount
        }
      });

      // Send email notification
      await emailService.sendPaymentNotification(event);

      // Acknowledge message
      this.channel.ack(message);
      
      logger.info('Payment processed event handled successfully', { orderId: event.order_id });
    } catch (error) {
      logger.error('Error processing payment processed event:', error);
      
      if (this.channel) {
        this.channel.nack(message, false, true);
      }
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.isConnected = false;
      logger.info('RabbitMQ consumer disconnected');
    } catch (error) {
      logger.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  // Health check
  isHealthy(): boolean {
    return this.isConnected && this.connection !== null && this.channel !== null;
  }
}

// Singleton instance
export const eventConsumer = new EventConsumer();
export default eventConsumer;
