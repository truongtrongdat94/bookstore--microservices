import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import rateLimit from 'express-rate-limit';
import config from './config';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { createCorsMiddleware } from './middleware/cors';

const app = express();

// Security and logging middleware
app.use(helmet());
// Custom CORS middleware with origin whitelist support
// Configure ALLOWED_ORIGINS as comma-separated list (e.g., "https://app.com,https://www.app.com")
// Set to "*" or leave empty to allow all origins (development mode)
app.use(createCorsMiddleware(config.ALLOWED_ORIGINS));
app.use(morgan('combined'));
// Note: express.json() NOT used globally - proxy middleware needs raw body
// Each non-proxy route that needs JSON parsing should add it locally

// Rate limiting - Development settings
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (shorter window for development)
  max: 1000, // Higher limit for development (100 in production)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Swagger UI - Only enabled in development mode for security
// In production, API documentation should be hosted separately or disabled
if (config.NODE_ENV !== 'production') {
  try {
    const candidates = [
      path.resolve(__dirname, '../docs/openapi/openapi.yaml'),
      path.resolve(__dirname, '../../docs/openapi/openapi.yaml')
    ];
    const openapiPath = candidates.find(p => fs.existsSync(p)) || candidates[0];
    const openapiDocument = YAML.load(openapiPath);
    
    // Serve YAML spec
    app.get('/api-docs.yaml', (req, res) => {
      res.sendFile(openapiPath);
    });
    
    // Serve JSON spec (required by some Swagger clients)
    app.get('/api-docs.json', (req, res) => {
      res.json(openapiDocument);
    });
    
    // Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));
    console.log('📚 Swagger UI enabled at /api-docs (development mode)');
  } catch (e) {
    console.error('Failed to load OpenAPI spec:', e);
    // Fallback route for missing spec
    app.get('/api-docs.json', (req, res) => {
      res.status(404).json({ error: 'OpenAPI specification not found' });
    });
  }
} else {
  // In production, return 404 for API docs endpoints
  app.use('/api-docs', (req, res) => {
    res.status(404).json({ error: 'API documentation is not available in production' });
  });
  console.log('📚 Swagger UI disabled (production mode)');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// Service proxy routes
const services = {
  user: config.USER_SERVICE_URL,
  book: config.BOOK_SERVICE_URL, 
  order: config.ORDER_SERVICE_URL,
  notification: config.NOTIFICATION_SERVICE_URL,
  blog: config.BLOG_SERVICE_URL
};

// Proxy to User Service
// Special handling for OAuth routes - preserve redirects
app.use('/api/auth', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/auth' },
  // Preserve redirects for OAuth flow
  followRedirects: false,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} -> ${services.user}${proxyReq.path}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Proxy response from ${req.url}: ${proxyRes.statusCode}`);
    
    // For OAuth redirects (302), preserve the Location header
    if (proxyRes.statusCode === 302 && proxyRes.headers.location) {
      console.log(`OAuth redirect to: ${proxyRes.headers.location}`);
    }
  },
  onError: (err, req, res) => {
    console.error('Proxy error on /api/auth:', err.message);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad Gateway', message: err.message });
    }
  }
}));

app.use('/api/users', createProxyMiddleware({
  target: services.user,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/users' }
}));

// Proxy to Book Service
app.use('/api/books', createProxyMiddleware({
  target: services.book,
  changeOrigin: true,
  pathRewrite: { '^/api/books': '/books' }
}));

app.use('/api/categories', createProxyMiddleware({
  target: services.book,
  changeOrigin: true,
  pathRewrite: { '^/api/categories': '/categories' }
}));

app.use('/api/authors', createProxyMiddleware({
  target: services.book,
  changeOrigin: true,
  pathRewrite: { '^/api/authors': '/authors' }
}));

// Helper function to extract user from JWT token and add to proxy headers
const addUserHeadersToProxy = (proxyReq: any, req: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, config.JWT_SECRET) as {
        user_id: number;
        email: string;
        role: string;
      };
      // Add user info to headers for downstream services
      proxyReq.setHeader('x-user-id', decoded.user_id.toString());
      proxyReq.setHeader('x-user-email', decoded.email);
      proxyReq.setHeader('x-user-role', decoded.role || 'user');
      console.log(`Auth headers added for user ${decoded.user_id}`);
    } catch (error) {
      console.log('Invalid or expired token, not adding user headers');
    }
  }
};

// Proxy to Order Service - with authentication headers
app.use('/api/cart', createProxyMiddleware({
  target: services.order,
  changeOrigin: true,
  pathRewrite: { '^/api/cart': '/cart' },
  onProxyReq: (proxyReq, req, res) => {
    addUserHeadersToProxy(proxyReq, req);
    console.log(`Proxying ${req.method} ${req.url} -> ${services.order}${proxyReq.path}`);
  }
}));

app.use('/api/orders', createProxyMiddleware({
  target: services.order,
  changeOrigin: true,  
  pathRewrite: { '^/api/orders': '/orders' },
  onProxyReq: (proxyReq, req, res) => {
    addUserHeadersToProxy(proxyReq, req);
    console.log(`Proxying ${req.method} ${req.url} -> ${services.order}${proxyReq.path}`);
  }
}));

// Proxy to Notification Service
app.use('/api/notifications', createProxyMiddleware({
  target: services.notification,
  changeOrigin: true,
  pathRewrite: { '^/api/notifications': '/notifications' }
}));

// Proxy to Blog Service
app.use('/api/blogs', createProxyMiddleware({
  target: services.blog,
  changeOrigin: true,
  pathRewrite: { '^/api/blogs': '/blogs' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} -> ${services.blog}${proxyReq.path}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error on /api/blogs:', err.message);
    if (!res.headersSent) {
      res.status(503).json({ 
        error: 'Service Unavailable', 
        message: 'Blog service is currently unavailable. Please try again later.' 
      });
    }
  }
}));

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Bookstore API Gateway',
    version: '1.0.0',
    services: {
      user: '/api/auth, /api/users',
      book: '/api/books, /api/categories, /api/authors',
      order: '/api/cart, /api/orders',
      notification: '/api/notifications',
      blog: '/api/blogs'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
