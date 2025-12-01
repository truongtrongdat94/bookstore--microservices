import amqp from 'amqplib';
import config from '../config';
import { OrderCreatedEvent, OrderUpdatedEvent, PaymentProcessedEvent } from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

class EventService {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isConnected = false;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(String(config.rabbitmq.url));
      this.channel = await this.connection.createChannel();
      
      // Assert exchange
      await this.channel!.assertExchange(config.rabbitmq.exchanges.orders, 'topic', {
        durable: true
      });
      
      // Assert queues for other services to consume
      await this.channel!.assertQueue(config.rabbitmq.queues.orderCreated, {
        durable: true
      });
      
      await this.channel!.assertQueue(config.rabbitmq.queues.orderUpdated, {
        durable: true
      });
      
      await this.channel!.assertQueue(config.rabbitmq.queues.paymentProcessed, {
        durable: true
      });
      
      // Bind queues to exchange
      await this.channel!.bindQueue(
        config.rabbitmq.queues.orderCreated,
        config.rabbitmq.exchanges.orders,
        'order.created'
      );
      
      await this.channel!.bindQueue(
        config.rabbitmq.queues.orderUpdated,
        config.rabbitmq.exchanges.orders,
        'order.updated'
      );
      
      await this.channel!.bindQueue(
        config.rabbitmq.queues.paymentProcessed,
        config.rabbitmq.exchanges.orders,
        'payment.processed'
      );
      
      this.isConnected = true;
      logger.info('RabbitMQ connected successfully');
      
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

  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.publishEvent('order.created', event);
    logger.info('Order created event published', { orderId: event.order_id });
  }

  async publishOrderUpdated(event: OrderUpdatedEvent): Promise<void> {
    await this.publishEvent('order.updated', event);
    logger.info('Order updated event published', { 
      orderId: event.order_id, 
      from: event.old_status, 
      to: event.new_status 
    });
  }

  async publishPaymentProcessed(event: PaymentProcessedEvent): Promise<void> {
    await this.publishEvent('payment.processed', event);
    logger.info('Payment processed event published', { 
      orderId: event.order_id, 
      status: event.payment_status 
    });
  }

  private async publishEvent(routingKey: string, event: any): Promise<void> {
    if (!this.isConnected || !this.channel) {
      logger.warn('RabbitMQ not connected, skipping event publish', { routingKey });
      return;
    }

    try {
      const message = Buffer.from(JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        service: 'order-service'
      }));

      await this.channel.publish(
        config.rabbitmq.exchanges.orders,
        routingKey,
        message,
        {
          persistent: true,
          messageId: `${routingKey}-${Date.now()}`,
          timestamp: Date.now()
        }
      );
    } catch (error) {
      logger.error('Failed to publish event:', { routingKey, error });
      throw error;
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
      logger.info('RabbitMQ disconnected');
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
export const eventService = new EventService();
export default eventService;
