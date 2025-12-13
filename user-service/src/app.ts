import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ApiResponse, ApiError } from './types';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import uploadRoutes from './routes/upload';
import adminRoutes from './routes/admin';
import winston from 'winston';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import passport from './config/passport';

// Create Express app
const app = express();

// Create logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [new winston.transports.Console()]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Passport
app.use(passport.initialize());

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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/admin', adminRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'User Management Service',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        logout: 'POST /auth/logout',
        verify: 'GET /auth/verify'
      },
      users: {
        profile: 'GET /users/profile',
        updateProfile: 'PUT /users/profile',
        deleteProfile: 'DELETE /users/profile',
        checkEmail: 'GET /users/check-email',
        checkUsername: 'GET /users/check-username',
        getAllUsers: 'GET /users',
        getUserById: 'GET /users/:id'
      },
      addresses: {
        getAll: 'GET /users/addresses',
        getById: 'GET /users/addresses/:id',
        create: 'POST /users/addresses',
        update: 'PUT /users/addresses/:id',
        delete: 'DELETE /users/addresses/:id'
      },
      upload: {
        uploadImage: 'POST /upload/image',
        deleteImage: 'DELETE /upload/image/:filename'
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
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    response = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: err.message
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
