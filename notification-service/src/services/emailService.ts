import nodemailer, { Transporter } from 'nodemailer';
import config from '../config';
import { 
  OrderCreatedEvent, 
  OrderUpdatedEvent, 
  PaymentProcessedEvent,
  EmailData,
  EmailTemplate 
} from '../types';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'notification-service' },
  transports: [new winston.transports.Console()]
});

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: String(config.email.host),
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: String(config.email.auth.user),
        pass: String(config.email.auth.pass)
      }
    });
  }

  // Send order confirmation email
  async sendOrderConfirmation(event: OrderCreatedEvent): Promise<void> {
    try {
      // In a real implementation, we would fetch user email from user service
      const userEmail = 'customer@example.com'; // Mock email
      
      const template = this.getOrderConfirmationTemplate(event);
      
      const emailData: EmailData = {
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      };
      
      await this.sendEmail(emailData);
      
      logger.info('Order confirmation email sent', { 
        orderId: event.order_id, 
        email: userEmail 
      });
    } catch (error) {
      logger.error('Failed to send order confirmation email:', error);
      // Don't throw error to prevent message requeue in consumer
    }
  }

  // Send order update email
  async sendOrderUpdate(event: OrderUpdatedEvent): Promise<void> {
    try {
      const userEmail = 'customer@example.com'; // Mock email
      
      const template = this.getOrderUpdateTemplate(event);
      
      const emailData: EmailData = {
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      };
      
      await this.sendEmail(emailData);
      
      logger.info('Order update email sent', { 
        orderId: event.order_id, 
        status: event.new_status,
        email: userEmail 
      });
    } catch (error) {
      logger.error('Failed to send order update email:', error);
    }
  }

  // Send payment notification email
  async sendPaymentNotification(event: PaymentProcessedEvent): Promise<void> {
    try {
      const userEmail = 'customer@example.com'; // Mock email
      
      const template = this.getPaymentNotificationTemplate(event);
      
      const emailData: EmailData = {
        to: userEmail,
        subject: template.subject,
        html: template.html,
        text: template.text
      };
      
      await this.sendEmail(emailData);
      
      logger.info('Payment notification email sent', { 
        orderId: event.order_id, 
        status: event.payment_status,
        email: userEmail 
      });
    } catch (error) {
      logger.error('Failed to send payment notification email:', error);
    }
  }

  // Generic email sending method
  async sendEmail(emailData: EmailData): Promise<void> {
    const mailOptions = {
      from: String(config.email.from),
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text
    };

    if (config.nodeEnv === 'production') {
      await this.transporter.sendMail(mailOptions);
    } else {
      // Mock email sending in development
      logger.info('Mock email sent:', {
        to: emailData.to,
        subject: emailData.subject
      });
    }
  }

  // Email templates
  private getOrderConfirmationTemplate(event: OrderCreatedEvent): EmailTemplate {
    const itemsList = event.items.map(item => 
      `<li>${item.quantity}x Book ID: ${item.book_id} - $${item.price}</li>`
    ).join('');

    return {
      subject: `Order Confirmation - Order #${event.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Order Confirmation</h2>
          <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${event.order_id}</p>
            <p><strong>Order Date:</strong> ${new Date(event.created_at).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${event.total_amount}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3>Items Ordered</h3>
            <ul>${itemsList}</ul>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Bookstore. Please do not reply to this email.</p>
        </div>
      `,
      text: `Order Confirmation - Order #${event.order_id}\n\nThank you for your order! Total: $${event.total_amount}\nItems: ${event.items.length}`
    };
  }

  private getOrderUpdateTemplate(event: OrderUpdatedEvent): EmailTemplate {
    const statusMessages = {
      shipped: 'Your order has been shipped and is on its way to you!',
      delivered: 'Your order has been delivered successfully.',
      cancelled: 'Your order has been cancelled.'
    };

    const message = statusMessages[event.new_status as keyof typeof statusMessages] 
      || `Your order status has been updated to ${event.new_status}.`;

    return {
      subject: `Order Update - Order #${event.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">Order Status Update</h2>
          <p>${message}</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #${event.order_id}</p>
            <p><strong>Previous Status:</strong> ${event.old_status}</p>
            <p><strong>Current Status:</strong> ${event.new_status}</p>
            <p><strong>Updated:</strong> ${new Date(event.updated_at).toLocaleString()}</p>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Bookstore.</p>
        </div>
      `,
      text: `Order Update - Order #${event.order_id}\n\n${message}\nStatus: ${event.new_status}`
    };
  }

  private getPaymentNotificationTemplate(event: PaymentProcessedEvent): EmailTemplate {
    const isSuccess = event.payment_status === 'completed';
    
    return {
      subject: `Payment ${isSuccess ? 'Successful' : 'Failed'} - Order #${event.order_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${isSuccess ? '#27ae60' : '#e74c3c'};">
            Payment ${isSuccess ? 'Successful' : 'Failed'}
          </h2>
          
          <p>
            ${isSuccess 
              ? `Your payment of $${event.amount} has been processed successfully.`
              : 'We were unable to process your payment. Please try again or contact support.'
            }
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Order ID:</strong> #${event.order_id}</p>
            <p><strong>Amount:</strong> $${event.amount}</p>
            <p><strong>Payment Status:</strong> ${event.payment_status}</p>
            <p><strong>Processed:</strong> ${new Date(event.processed_at).toLocaleString()}</p>
          </div>
          
          ${!isSuccess ? '<p>If you continue to experience issues, please contact our support team.</p>' : ''}
          
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message from Bookstore.</p>
        </div>
      `,
      text: `Payment ${isSuccess ? 'Successful' : 'Failed'} - Order #${event.order_id}\n\nAmount: $${event.amount}\nStatus: ${event.payment_status}`
    };
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      if (config.nodeEnv === 'production') {
        await this.transporter.verify();
      }
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Singleton instance
export const emailService = new EmailService();
export default emailService;
