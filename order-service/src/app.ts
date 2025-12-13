import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ApiResponse, ApiError } from './types';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import { HealthController } from './controllers/healthController';
import winston from 'winston';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';

// Create Express app
const app = express();

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger UI (/api-docs) and OpenAPI spec (/api-docs.yaml)
try {
  const candidates = [
    path.resolve(__dirname, '../docs/openapi/openapi.yaml'),
    path.resolve(__dirname, '../../docs/openapi/openapi.yaml')
  ];
  const openapiPath = candidates.find(p => fs.existsSync(p)) || candidates[0];
  const openapiDocument = YAML.load(openapiPath);
  app.get('/api-docs.yaml', (req: Request, res: Response) => {
    res.sendFile(openapiPath);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
} catch (e) {
  // ignore if spec not present at runtime
}

// Extract user info from API Gateway headers
app.use((req: any, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  const userEmail = req.headers['x-user-email'];
  const userRole = req.headers['x-user-role'];
  
  if (userId && userEmail) {
    req.user = {
      user_id: parseInt(userId as string),
      email: userEmail as string,
      role: userRole as string || 'user'
    };
  }
  
  next();
});

// Health check endpoints
app.get('/health', HealthController.basic);
app.get('/health/detailed', HealthController.detailed);
app.get('/health/live', HealthController.liveness);
app.get('/health/ready', HealthController.readiness);

// API Routes
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Order Processing Service',
    version: '1.0.0',
    endpoints: {
      cart: {
        getCart: 'GET /cart',
        addToCart: 'POST /cart/items',
        updateItem: 'PUT /cart/items/:bookId',
        removeItem: 'DELETE /cart/items/:bookId',
        clearCart: 'DELETE /cart'
      },
      orders: {
        checkout: 'POST /orders/checkout',
        myOrders: 'GET /orders/my-orders',
        orderDetail: 'GET /orders/:id',
        cancelOrder: 'DELETE /orders/:id/cancel',
        statistics: 'GET /orders/statistics'
      }
    }
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  };
  res.status(404).json(response);
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred:', err);
  
  let statusCode = 500;
  let response: ApiResponse;
  
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    response = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    };
  } else if (err.code === '23505') {
    // PostgreSQL unique constraint violation
    statusCode = 409;
    response = {
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists'
      }
    };
  } else if (err.code === '23503') {
    // PostgreSQL foreign key constraint violation
    statusCode = 400;
    response = {
      success: false,
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'Referenced resource does not exist'
      }
    };
  } else {
    response = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : err.message || 'Internal server error'
      }
    };
  }
  
  res.status(statusCode).json(response);
});

export default app;
