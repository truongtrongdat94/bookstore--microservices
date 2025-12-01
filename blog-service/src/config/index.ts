import dotenv from 'dotenv';
import { getEnvVar, ConfigDefinition, validateAndThrow } from './validation';

dotenv.config();

const NODE_ENV = (process.env.NODE_ENV || 'development') as string;
const isProduction = NODE_ENV === 'production';

// Define config requirements for validation
const configDefinitions: ConfigDefinition[] = [
  { name: 'DB_PASSWORD', required: true, sensitive: true, defaultValue: 'postgres' },
  { name: 'REDIS_PASSWORD', required: isProduction, sensitive: true, defaultValue: '' },
];

// Validate config on module load
validateAndThrow(configDefinitions, NODE_ENV);

export default {
  NODE_ENV,
  PORT: parseInt(String(getEnvVar('PORT', { defaultValue: 3004 })), 10),
  
  // PostgreSQL Database Configuration
  DB_HOST: getEnvVar('DB_HOST', { defaultValue: 'blog-db' }),
  DB_PORT: parseInt(String(getEnvVar('DB_PORT', { defaultValue: 5432 })), 10),
  DB_USER: getEnvVar('DB_USER', { defaultValue: 'postgres' }),
  DB_PASSWORD: getEnvVar('DB_PASSWORD', { 
    required: isProduction, 
    sensitive: true, 
    defaultValue: isProduction ? undefined : 'postgres' 
  }),
  DB_NAME: getEnvVar('DB_NAME', { defaultValue: 'blogs_db' }),
  
  // Redis Configuration
  REDIS_HOST: getEnvVar('REDIS_HOST', { defaultValue: 'redis' }),
  REDIS_PORT: parseInt(String(getEnvVar('REDIS_PORT', { defaultValue: 6379 })), 10),
  REDIS_PASSWORD: getEnvVar('REDIS_PASSWORD', { 
    required: isProduction, 
    sensitive: true, 
    defaultValue: isProduction ? undefined : '' 
  }),
};
