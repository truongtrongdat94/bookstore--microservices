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
  { name: 'JWT_SECRET', required: true, sensitive: true, defaultValue: 'dev-jwt-secret-key' },
  { name: 'REDIS_PASSWORD', required: isProduction, sensitive: true, defaultValue: '' },
  { name: 'GOOGLE_CLIENT_SECRET', required: false, sensitive: true },
  { name: 'FACEBOOK_APP_SECRET', required: false, sensitive: true },
];

// Validate config on module load
validateAndThrow(configDefinitions, NODE_ENV);

export default {
  // Server config
  port: getEnvVar('PORT', { defaultValue: 3001 }),
  nodeEnv: NODE_ENV,
  
  // Database config
  database: {
    host: getEnvString('DB_HOST', { defaultValue: 'user-db' }),
    port: parseInt(String(getEnvVar('DB_PORT', { defaultValue: 5432 }))),
    name: getEnvString('DB_NAME', { defaultValue: 'users_db' }),
    user: getEnvString('DB_USER', { defaultValue: 'postgres' }),
    password: getEnvString('DB_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : 'dev_password' 
    }),
    poolSize: parseInt(String(getEnvVar('DB_POOL_SIZE', { defaultValue: 10 }))),
  },
  
  // JWT config
  jwt: {
    secret: getEnvString('JWT_SECRET', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : 'dev-jwt-secret-key' 
    }),
    expiresIn: getEnvString('JWT_EXPIRES_IN', { defaultValue: '24h' }),
  },

  // Redis config
  redis: {
    host: getEnvString('REDIS_HOST', { defaultValue: 'redis' }),
    port: parseInt(String(getEnvVar('REDIS_PORT', { defaultValue: 6379 }))),
    password: getEnvString('REDIS_PASSWORD', { 
      required: isProduction, 
      sensitive: true, 
      defaultValue: isProduction ? '' : '' 
    }),
  },
  
  // Bcrypt config
  bcrypt: {
    saltRounds: 10,
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
};
