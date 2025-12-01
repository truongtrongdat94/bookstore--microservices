import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { OAuthService, OAuthUserData } from '../services/oauthService';
import { JwtPayload, AuthResponse, ApiError } from '../types';
import config from '../config';
import logger from '../utils/logger';

export class OAuthController {
  /**
   * Initiate Google OAuth flow
   * This is handled by Passport middleware, so this is just a placeholder
   */
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    // Passport middleware will handle the redirect to Google
    // This function won't be called directly
  }

  /**
   * Handle Google OAuth callback
   * After successful authentication with Google, create/link user and generate JWT
   */
  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      // User data is attached by Passport after successful authentication
      const googleUser = req.user as any as OAuthUserData;

      if (!googleUser || !googleUser.email) {
        throw new ApiError(400, 'Failed to get user information from Google', 'OAUTH_FAILED');
      }

      logger.info('Google OAuth callback received', { email: googleUser.email });

      // Find or create user and link provider
      const user = await OAuthService.findOrCreateUser(googleUser);

      logger.info('User authenticated via Google OAuth', { 
        userId: user.user_id, 
        email: user.email,
        isNewUser: !user.updated_at 
      });

      // Generate JWT token
      const payload: JwtPayload = {
        user_id: user.user_id,
        email: user.email,
        role: 'user'
      };

      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      } as jwt.SignOptions);

      // Get frontend URL from environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Redirect to frontend with token as query parameter
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
      
      logger.info('Redirecting to frontend with token', { redirectUrl: frontendUrl });

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Google OAuth callback error', { error });
      
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = error instanceof ApiError ? error.message : 'Authentication failed';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  /**
   * Initiate Facebook OAuth flow
   * This is handled by Passport middleware, so this is just a placeholder
   */
  static async facebookLogin(req: Request, res: Response, next: NextFunction) {
    // Passport middleware will handle the redirect to Facebook
    // This function won't be called directly
  }

  /**
   * Handle Facebook OAuth callback
   * After successful authentication with Facebook, create/link user and generate JWT
   */
  static async facebookCallback(req: Request, res: Response, next: NextFunction) {
    try {
      // User data is attached by Passport after successful authentication
      const facebookUser = req.user as any as OAuthUserData;

      if (!facebookUser || !facebookUser.email) {
        throw new ApiError(400, 'Failed to get user information from Facebook', 'OAUTH_FAILED');
      }

      logger.info('Facebook OAuth callback received', { email: facebookUser.email });

      // Find or create user and link provider
      const user = await OAuthService.findOrCreateUser(facebookUser);

      logger.info('User authenticated via Facebook OAuth', { 
        userId: user.user_id, 
        email: user.email,
        isNewUser: !user.updated_at 
      });

      // Generate JWT token
      const payload: JwtPayload = {
        user_id: user.user_id,
        email: user.email,
        role: 'user'
      };

      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      } as jwt.SignOptions);

      // Get frontend URL from environment
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      // Redirect to frontend with token as query parameter
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}`;
      
      logger.info('Redirecting to frontend with token', { redirectUrl: frontendUrl });

      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Facebook OAuth callback error', { error });
      
      // Redirect to frontend with error
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errorMessage = error instanceof ApiError ? error.message : 'Authentication failed';
      res.redirect(`${frontendUrl}/auth/callback?error=${encodeURIComponent(errorMessage)}`);
    }
  }

  /**
   * Get user's linked auth providers
   */
  static async getUserProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.user_id;

      if (!userId) {
        throw new ApiError(401, 'Unauthorized', 'UNAUTHORIZED');
      }

      const providers = await OAuthService.getUserProviders(userId);

      res.json({
        success: true,
        data: {
          providers: providers.map(p => ({
            provider: p.provider_name,
            email: p.provider_email,
            isPrimary: p.is_primary,
            linkedAt: p.created_at
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }
}
