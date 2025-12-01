import dotenv from 'dotenv';
import path from 'path';
import { getEnvVar, ConfigDefinition, validateAndThrow } from './validation';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = (process.env.NODE_ENV || 'development') as string;
const isProduction = NODE_ENV === 'production';

// Define config requirements for validation
const configDefinitions: ConfigDefinition[] = [
  { name: 'DB_PASSWORD', required: true, sensitive: true, defaultValue: 'dev_password' },
  { name: 'REDIS_PASSWORD', required: isProduction, sensitive: true, defaultValue: '' },
];

// Validate config on module load
validateAndThrow(configDefinitions, NODE_ENV);

export default {
  // Server config
  port: getEnvVar('PORT', { defaultValue: 3002 }),
  nodeEnv: NODE_ENV,
  
  // Database config
  database: {
    host: String(getEnvVar('DB_HOST', { defaultValue: 'book-db' })),
    port: parseInt(String(getEnvVar('DB_PORT', { defaultValue: 5432 }))),
    name: String(getEnvVar('DB_NAME', { defaultValue: 'books_db' })),
    user: String(getEnvVar('DB_USER', { defaultValue: 'postgres' })),
    password: String(getEnvVar('DB_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? undefined : 'dev_password' 
    })),
    poolSize: parseInt(String(getEnvVar('DB_POOL_SIZE', { defaultValue: 10 }))),
  },
  
  // Redis config for caching
  redis: {
    host: String(getEnvVar('REDIS_HOST', { defaultValue: 'redis' })),
    port: parseInt(String(getEnvVar('REDIS_PORT', { defaultValue: 6379 }))),
    password: String(getEnvVar('REDIS_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? undefined : '' 
    })),
    ttl: {
      bookList: 300, // 5 minutes
      bookDetail: 600, // 10 minutes
      categories: 900, // 15 minutes
    }
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
};
