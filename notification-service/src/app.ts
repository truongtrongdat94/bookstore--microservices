import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ApiResponse, ApiError } from './types';
import notificationRoutes from './routes/notifications';
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
  defaultMeta: { service: 'notification-service' },
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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'notification-service',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/notifications', notificationRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Notification Service',
    version: '1.0.0',
    endpoints: {
      notifications: {
        list: 'GET /notifications',
        unreadOnly: 'GET /notifications?unread=true',
        details: 'GET /notifications/:id',
        markRead: 'POST /notifications/mark-read',
        markAllRead: 'POST /notifications/mark-all-read',
        delete: 'DELETE /notifications/:id',
        statistics: 'GET /notifications/statistics'
      },
      admin: {
        create: 'POST /notifications/create',
        sendEmail: 'POST /notifications/send-email',
        listAll: 'GET /notifications/admin/all'
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
