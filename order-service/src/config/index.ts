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
  { name: 'REDIS_PASSWORD', required: isProduction, sensitive: true, defaultValue: '' },
  { name: 'VIETQR_API_KEY', required: isProduction, sensitive: true, defaultValue: '' },
];

// Validate config on module load
validateAndThrow(configDefinitions, NODE_ENV);

export default {
  // Server config
  port: getEnvVar('PORT', { defaultValue: 3003 }),
  nodeEnv: NODE_ENV,
  
  // Database config
  database: {
    host: getEnvString('DB_HOST', { defaultValue: 'order-db' }),
    port: parseInt(String(getEnvVar('DB_PORT', { defaultValue: 5432 }))),
    name: getEnvString('DB_NAME', { defaultValue: 'orders_db' }),
    user: getEnvString('DB_USER', { defaultValue: 'postgres' }),
    password: getEnvString('DB_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : 'dev_password' 
    }),
    poolSize: parseInt(String(getEnvVar('DB_POOL_SIZE', { defaultValue: 10 }))),
  },
  
  // Redis config for cart storage
  redis: {
    host: getEnvString('REDIS_HOST', { defaultValue: 'redis' }),
    port: parseInt(String(getEnvVar('REDIS_PORT', { defaultValue: 6379 }))),
    password: getEnvString('REDIS_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : '' 
    }),
    ttl: { cart: 86400, session: 3600 }
  },

  // RabbitMQ config
  rabbitmq: {
    url: getEnvString('RABBITMQ_URL', { defaultValue: 'amqp://rabbitmq:5672' }),
    exchanges: { orders: 'orders.exchange' },
    queues: {
      orderCreated: 'order.created',
      orderUpdated: 'order.updated',
      paymentProcessed: 'payment.processed',
    }
  },
  
  // External service URLs
  services: {
    bookService: getEnvString('BOOK_SERVICE_URL', { defaultValue: 'http://book-service:3002' }),
    userService: getEnvString('USER_SERVICE_URL', { defaultValue: 'http://user-service:3001' }),
  },
  
  // Payment config (mock)
  payment: {
    processingFee: 2.99,
    taxRate: 0.08,
  },
  
  // VietQR API Configuration
  vietqr: {
    clientId: getEnvString('VIETQR_CLIENT_ID', { defaultValue: '' }),
    apiKey: getEnvString('VIETQR_API_KEY', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : '' 
    }),
    apiUrl: getEnvString('VIETQR_API_URL', { defaultValue: 'https://api.vietqr.io/v2/generate' }),
    accountNo: getEnvString('VIETQR_ACCOUNT_NO', { defaultValue: '' }),
    accountName: getEnvString('VIETQR_ACCOUNT_NAME', { defaultValue: '' }),
    acqId: parseInt(String(getEnvVar('VIETQR_ACQ_ID', { defaultValue: 970422 }))),
    template: (getEnvString('VIETQR_TEMPLATE', { defaultValue: 'compact' }) as 'compact' | 'compact2' | 'qr_only' | 'print'),
    qrExpiryMinutes: parseInt(String(getEnvVar('PAYMENT_QR_EXPIRY_MINUTES', { defaultValue: 15 }))),
  },
};
