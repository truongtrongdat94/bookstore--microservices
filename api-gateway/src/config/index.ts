import { ConfigDefinition, validateAndThrow } from './validation';

const NODE_ENV = (process.env.NODE_ENV || 'development') as string;
const isProduction = NODE_ENV === 'production';

// Define config requirements for validation
const configDefinitions: ConfigDefinition[] = [
  { name: 'JWT_SECRET', required: true, sensitive: true, defaultValue: 'dev-jwt-secret-key' },
  { name: 'USER_SERVICE_URL', required: false, sensitive: false, defaultValue: 'http://user-service:3001' },
  { name: 'BOOK_SERVICE_URL', required: false, sensitive: false, defaultValue: 'http://book-service:3002' },
  { name: 'ORDER_SERVICE_URL', required: false, sensitive: false, defaultValue: 'http://order-service:3003' },
  { name: 'NOTIFICATION_SERVICE_URL', required: false, sensitive: false, defaultValue: 'http://notification-service:3005' },
  { name: 'BLOG_SERVICE_URL', required: false, sensitive: false, defaultValue: 'http://blog-service:3004' },
];

// Validate config on module load
validateAndThrow(configDefinitions, NODE_ENV);

// Helper to get string env var with default
const getStringEnv = (name: string, defaultValue: string): string => {
  return process.env[name] || defaultValue;
};

const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV,
  JWT_SECRET: getStringEnv('JWT_SECRET', isProduction ? '' : 'dev-jwt-secret-key'),
  USER_SERVICE_URL: getStringEnv('USER_SERVICE_URL', 'http://user-service:3001'),
  BOOK_SERVICE_URL: getStringEnv('BOOK_SERVICE_URL', 'http://book-service:3002'),
  ORDER_SERVICE_URL: getStringEnv('ORDER_SERVICE_URL', 'http://order-service:3003'),
  NOTIFICATION_SERVICE_URL: getStringEnv('NOTIFICATION_SERVICE_URL', 'http://notification-service:3005'),
  BLOG_SERVICE_URL: getStringEnv('BLOG_SERVICE_URL', 'http://blog-service:3004'),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '*',
};

export default config;
export { configDefinitions };
