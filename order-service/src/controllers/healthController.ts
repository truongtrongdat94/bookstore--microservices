import { Request, Response } from 'express';
import pool from '../config/database';
import redisClient from '../config/redis';
import eventService from '../services/eventService';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'order-service' },
  transports: [new winston.transports.Console()]
});

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  dependencies: {
    database: DependencyStatus;
    redis: DependencyStatus;
    rabbitmq: DependencyStatus;
  };
}

interface DependencyStatus {
  status: 'up' | 'down';
  responseTime?: number;
  message?: string;
}

export class HealthController {
  // Basic health check
  static async basic(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      status: 'ok',
      service: 'order-service',
      timestamp: new Date().toISOString(),
    });
  }

  // Detailed health check with dependencies
  static async detailed(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    const dependencies = {
      database: await HealthController.checkDatabase(),
      redis: await HealthController.checkRedis(),
      rabbitmq: await HealthController.checkRabbitMQ(),
    };

    // Determine overall status
    const allHealthy = Object.values(dependencies).every(dep => dep.status === 'up');
    const anyDown = Object.values(dependencies).some(dep => dep.status === 'down');
    
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (allHealthy) {
      overallStatus = 'healthy';
    } else if (anyDown) {
      overallStatus = 'unhealthy';
    } else {
      overallStatus = 'degraded';
    }

    const healthCheck: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      service: 'order-service',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      dependencies,
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  }

  // Readiness probe - checks if service is ready to handle requests
  static async readiness(req: Request, res: Response): Promise<void> {
    try {
      // Check critical dependencies
      const dbCheck = await HealthController.checkDatabase();
      const redisCheck = await HealthController.checkRedis();
      
      if (dbCheck.status === 'up' && redisCheck.status === 'up') {
        res.status(200).json({
          status: 'ready',
          timestamp: new Date().toISOString(),
        });
      } else {
        res.status(503).json({
          status: 'not_ready',
          timestamp: new Date().toISOString(),
          reason: 'Critical dependencies unavailable',
        });
      }
    } catch (error) {
      logger.error('Readiness check failed:', error);
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: 'Health check error',
      });
    }
  }

  // Liveness probe - checks if service is alive
  static async liveness(req: Request, res: Response): Promise<void> {
    // Simple check - if we can respond, we're alive
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
    });
  }

  // Check database connection
  private static async checkDatabase(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      await pool.query('SELECT 1');
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } catch (error: any) {
      logger.error('Database health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        message: error.message,
      };
    }
  }

  // Check Redis connection
  private static async checkRedis(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      await redisClient.ping();
      return {
        status: 'up',
        responseTime: Date.now() - start,
      };
    } catch (error: any) {
      logger.error('Redis health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        message: error.message,
      };
    }
  }

  // Check RabbitMQ connection
  private static async checkRabbitMQ(): Promise<DependencyStatus> {
    const start = Date.now();
    try {
      const isHealthy = eventService.isHealthy();
      return {
        status: isHealthy ? 'up' : 'down',
        responseTime: Date.now() - start,
        message: isHealthy ? undefined : 'Not connected',
      };
    } catch (error: any) {
      logger.error('RabbitMQ health check failed:', error);
      return {
        status: 'down',
        responseTime: Date.now() - start,
        message: error.message,
      };
    }
  }
}
