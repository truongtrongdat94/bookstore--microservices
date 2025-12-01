import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { OAuthController } from '../controllers/oauthController';
import { validate, schemas } from '../middleware/validation';
import passport from '../config/passport';

const router = Router();

// Traditional auth routes
router.post('/register', validate(schemas.register), AuthController.register);
router.post('/verify-email', validate(schemas.verifyEmail), AuthController.verifyEmail);
router.post('/resend-otp', validate(schemas.resendOTP), AuthController.resendOTP);
router.post('/login', validate(schemas.login), AuthController.login);
router.post('/logout', AuthController.logout);
router.get('/verify', AuthController.verifyToken);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=Authentication%20failed`
  }),
  OAuthController.googleCallback
);

// Facebook OAuth routes
router.get(
  '/facebook',
  passport.authenticate('facebook', { 
    scope: ['email', 'public_profile'],
    session: false 
  })
);

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?error=Authentication%20failed`
  }),
  OAuthController.facebookCallback
);

// Get user's linked providers (protected route)
router.get('/providers', OAuthController.getUserProviders);

export default router;
