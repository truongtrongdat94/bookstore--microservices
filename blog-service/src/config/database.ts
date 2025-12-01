import { Pool } from 'pg';
import config from './index';

const pool = new Pool({
  host: String(config.DB_HOST),
  port: Number(config.DB_PORT),
  user: String(config.DB_USER),
  password: String(config.DB_PASSWORD),
  database: String(config.DB_NAME),
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
});

// Test connection on startup
pool.on('connect', () => {
  console.log('PostgreSQL client connected');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

export default pool;
