import { Request, Response, NextFunction } from 'express';

/**
 * CORS Configuration interface
 */
export interface CorsConfig {
  allowedOrigins: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
}

/**
 * Parse ALLOWED_ORIGINS environment variable as comma-separated list
 * @param originsString - Comma-separated string of origins or '*' for all
 * @returns Array of allowed origins
 */
export function parseAllowedOrigins(originsString: string | undefined): string[] {
  if (!originsString || originsString.trim() === '' || originsString.trim() === '*') {
    return [];
  }
  
  return originsString
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);
}

/**
 * Check if an origin is allowed based on the whitelist
 * @param origin - The origin to check
 * @param allowedOrigins - Array of allowed origins (empty array means allow all)
 * @returns true if origin is allowed, false otherwise
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  // If no whitelist configured (empty array), allow all origins
  if (allowedOrigins.length === 0) {
    return true;
  }
  
  // If no origin header (same-origin request), allow
  if (!origin) {
    return true;
  }
  
  // Check if origin is in whitelist
  return allowedOrigins.includes(origin);
}

/**
 * Get default CORS configuration
 */
export function getDefaultCorsConfig(): Omit<CorsConfig, 'allowedOrigins'> {
  return {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // 24 hours
  };
}


/**
 * Create CORS middleware with origin whitelist support
 * @param allowedOriginsEnv - ALLOWED_ORIGINS environment variable value
 * @returns Express middleware function
 */
export function createCorsMiddleware(allowedOriginsEnv: string | undefined) {
  const allowedOrigins = parseAllowedOrigins(allowedOriginsEnv);
  const config = getDefaultCorsConfig();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const origin = req.headers.origin;
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      if (!isOriginAllowed(origin, allowedOrigins)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'CORS_ERROR',
            message: 'Origin not allowed by CORS policy'
          }
        });
        return;
      }
      
      // Set CORS headers for preflight
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      } else if (allowedOrigins.length === 0) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
      
      res.setHeader('Access-Control-Allow-Methods', config.methods.join(', '));
      res.setHeader('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
      res.setHeader('Access-Control-Max-Age', config.maxAge.toString());
      
      if (config.credentials && origin) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
      
      res.status(204).end();
      return;
    }
    
    // Handle actual requests
    if (!isOriginAllowed(origin, allowedOrigins)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'CORS_ERROR',
          message: 'Origin not allowed by CORS policy'
        }
      });
      return;
    }
    
    // Set CORS headers for actual request
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      if (config.credentials) {
        res.setHeader('Access-Control-Allow-Credentials', 'true');
      }
    } else if (allowedOrigins.length === 0) {
      // No whitelist and no origin = allow all (but can't use credentials with *)
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    
    if (config.exposedHeaders.length > 0) {
      res.setHeader('Access-Control-Expose-Headers', config.exposedHeaders.join(', '));
    }
    
    next();
  };
}

export default createCorsMiddleware;
