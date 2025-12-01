import dotenv from 'dotenv';
import path from 'path';
import { getEnvVar, getEnvString, ConfigDefinition, validateAndThrow } from './validation';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = (process.env.NODE_ENV || 'development') as string;
const isProduction = NODE_ENV === 'production';

// Define config requirements for validation
const configDefinitions: ConfigDefinition[] = [
  { name: 'DB_PASSWORD', required: true, sensitive: true, defaultValue: 'dev_password' },
  { name: 'SMTP_PASS', required: isProduction, sensitive: true, defaultValue: 'test123' },
];

// Validate config on module load
validateAndThrow(configDefinitions, NODE_ENV);

export default {
  // Server config
  port: getEnvVar('PORT', { defaultValue: 3005 }),
  nodeEnv: NODE_ENV,
  
  // Database config
  database: {
    host: getEnvString('DB_HOST', { defaultValue: 'notification-db' }),
    port: parseInt(String(getEnvVar('DB_PORT', { defaultValue: 5432 }))),
    name: getEnvString('DB_NAME', { defaultValue: 'notifications_db' }),
    user: getEnvString('DB_USER', { defaultValue: 'postgres' }),
    password: getEnvString('DB_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : 'dev_password' 
    }),
    poolSize: parseInt(String(getEnvVar('DB_POOL_SIZE', { defaultValue: 10 }))),
  },
  
  // RabbitMQ config for consuming events
  rabbitmq: {
    url: getEnvString('RABBITMQ_URL', { defaultValue: 'amqp://rabbitmq:5672' }),
    exchanges: { orders: 'orders.exchange' },
    queues: {
      orderCreated: 'order.created',
      orderUpdated: 'order.updated',
      paymentProcessed: 'payment.processed',
    },
    consumerTag: 'notification-service-consumer'
  },

  // Email config
  email: {
    host: getEnvString('SMTP_HOST', { defaultValue: 'smtp.ethereal.email' }),
    port: parseInt(String(getEnvVar('SMTP_PORT', { defaultValue: 587 }))),
    secure: false,
    auth: {
      user: getEnvString('SMTP_USER', { defaultValue: 'test@example.com' }),
      pass: getEnvString('SMTP_PASS', { 
        required: isProduction, 
        sensitive: true, 
        defaultValue: isProduction ? '' : 'test123' 
      })
    },
    from: getEnvString('EMAIL_FROM', { defaultValue: 'Bookstore <noreply@bookstore.com>' })
  },
  
  // External service URLs
  services: {
    userService: getEnvString('USER_SERVICE_URL', { defaultValue: 'http://user-service:3001' }),
    bookService: getEnvString('BOOK_SERVICE_URL', { defaultValue: 'http://book-service:3002' }),
    orderService: getEnvString('ORDER_SERVICE_URL', { defaultValue: 'http://order-service:3003' }),
  },
  
  // Notification settings
  notifications: {
    retentionDays: 30,
    batchSize: 100,
  }
};
