import { Pool } from 'pg';
import config from './index';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'book-service' },
  transports: [new winston.transports.Console()]
});

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  user: config.database.user,
  password: config.database.password,
  max: config.database.poolSize,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Set UTF-8 encoding for all connections
pool.on('connect', async (client) => {
  try {
    await client.query("SET client_encoding = 'UTF8'");
    logger.info('Database connected with UTF-8 encoding');
  } catch (err) {
    logger.error('Failed to set UTF-8 encoding:', err);
  }
});

pool.on('error', (err) => {
  logger.error('Unexpected database error:', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('Database query error', { text, error });
    throw error;
  }
};

export default pool;
