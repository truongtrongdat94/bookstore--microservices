import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { RegisterDto, LoginDto, AuthResponse, ApiResponse, ApiError, JwtPayload, VerifyEmailDto, ResendOTPDto } from '../types';
import config from '../config';
import { OTPService } from '../services/otpService';
import logger from '../utils/logger';
import { query, withTransaction } from '../config/database';
import { OTPModel } from '../models/OTP';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const registerData: RegisterDto = req.body;
      logger.info('Starting registration process', { email: registerData.email, username: registerData.username });
      
      // Step 1: Check if email already exists
      logger.debug('Checking if email exists', { email: registerData.email });
      const emailExists = await UserModel.emailExists(registerData.email);
      if (emailExists) {
        logger.warn('Registration failed: Email already exists', { email: registerData.email });
        throw new ApiError(409, 'Email already registered', 'EMAIL_EXISTS');
      }
      
      // Step 2: Check if username already exists
      logger.debug('Checking if username exists', { username: registerData.username });
      const usernameExists = await UserModel.usernameExists(registerData.username);
      if (usernameExists) {
        logger.warn('Registration failed: Username already taken', { username: registerData.username });
        throw new ApiError(409, 'Username already taken', 'USERNAME_EXISTS');
      }
      
      // Step 3: Generate OTP code
      logger.debug('Generating OTP code', { email: registerData.email });
      const otpCode = OTPService.generateOTPCode();
      logger.info('OTP code generated successfully', { email: registerData.email });
      
      // Step 4: Hash password for storage
      logger.debug('Hashing password', { email: registerData.email });
      const password_hash = await UserModel.hashPassword(registerData.password);
      
      // Step 5: Send OTP email (FAIL FAST if error)
      logger.debug('Sending OTP email', { email: registerData.email });
      try {
        await OTPService.sendOTPEmail(registerData.email, otpCode);
        logger.info('OTP email sent successfully', { email: registerData.email });
      } catch (emailError) {
        logger.error('Failed to send OTP email', { 
          email: registerData.email, 
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined
        });
        throw new ApiError(
          500,
          'Failed to send verification email. Please try again.',
          'EMAIL_SEND_FAILED'
        );
      }
      
      // Step 6: Store OTP with registration data (NO USER CREATED YET)
      logger.debug('Storing OTP with registration data', { email: registerData.email });
      try {
        await OTPModel.create({
          email: registerData.email,
          otp_code: otpCode,
          purpose: 'register',
          registration_data: {
            username: registerData.username,
            password_hash: password_hash,
            full_name: registerData.full_name
          }
        });
        logger.info('OTP and registration data stored successfully', { email: registerData.email });
        
        // Step 7: Return success message (USER NOT CREATED YET)
        logger.info('Registration initiated successfully - awaiting email verification', { 
          email: registerData.email 
        });
        
        const response: ApiResponse = {
          success: true,
          data: {
            message: 'Registration successful. Please check your email for verification code.',
            email: registerData.email
          }
        };
        
        res.status(201).json(response);
      } catch (storageError) {
        logger.error('Failed to store OTP and registration data', { 
          email: registerData.email,
          error: storageError instanceof Error ? storageError.message : 'Unknown error',
          stack: storageError instanceof Error ? storageError.stack : undefined
        });
        throw new ApiError(
          500,
          'Registration failed. Please try again.',
          'STORAGE_FAILED'
        );
      }
    } catch (error) {
      // Log the error before passing to error handler
      if (error instanceof ApiError) {
        logger.error('Registration failed with ApiError', {
          statusCode: error.statusCode,
          message: error.message,
          code: error.code
        });
      } else {
        logger.error('Registration failed with unexpected error', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      }
      next(error);
    }
  }
  
  // Verify email with OTP
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otp_code }: VerifyEmailDto = req.body;
      
      logger.info('Starting email verification', { email });
      
      // Check if user already exists (already verified)
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser && existingUser.is_email_verified) {
        logger.warn('Email verification failed: User already exists and verified', { email });
        throw new ApiError(400, 'Email is already verified. You can log in now.', 'ALREADY_VERIFIED');
      }
      
      // Verify OTP and get registration data
      const otpRecord = await OTPModel.findValidOTP(email, otp_code, 'register');
      
      if (!otpRecord || !otpRecord.registration_data) {
        logger.warn('Email verification failed: Invalid or expired OTP', { email });
        throw new ApiError(400, 'Invalid or expired verification code. Please register again.', 'INVALID_OTP');
      }
      
      // Mark OTP as used
      await OTPModel.markAsUsed(otpRecord.otp_id);
      logger.info('OTP marked as used', { email });
      
      // Create user NOW (after OTP verification)
      logger.debug('Creating user after OTP verification', { email });
      const registrationData = otpRecord.registration_data as any;
      
      const user = await UserModel.createFromOTP({
        email: email,
        username: registrationData.username,
        password_hash: registrationData.password_hash,
        full_name: registrationData.full_name
      });
      
      logger.info('User created successfully after email verification', { 
        userId: user.user_id, 
        email: user.email 
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
      
      // Return user and token
      const authResponse: AuthResponse = {
        token,
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username,
          full_name: user.full_name
        },
        expires_in: config.jwt.expiresIn
      };
      
      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: authResponse
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Email verification error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
  
  // Resend OTP
  static async resendOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email }: ResendOTPDto = req.body;
      
      logger.info('Starting OTP resend', { email });
      
      // Check if user already exists and verified
      const user = await UserModel.findByEmail(email);
      if (user && user.is_email_verified) {
        logger.warn('OTP resend failed: Already verified', { email });
        throw new ApiError(400, 'Email is already verified. You can log in now.', 'ALREADY_VERIFIED');
      }
      
      // Check if there's a pending OTP registration
      const sql = `
        SELECT registration_data 
        FROM otp_codes 
        WHERE email = $1 AND purpose = 'register' 
        ORDER BY created_at DESC 
        LIMIT 1
      `;
      const result = await query(sql, [email]);
      
      if (result.rows.length === 0 || !result.rows[0].registration_data) {
        logger.warn('OTP resend failed: No pending registration found', { email });
        throw new ApiError(404, 'No pending registration found. Please register first.', 'NO_PENDING_REGISTRATION');
      }
      
      // Generate and send new OTP (includes rate limiting)
      try {
        await OTPService.generateAndSend(email, 'register');
        logger.info('OTP resent successfully', { email });
      } catch (error) {
        // Handle rate limiting error specifically
        if (error instanceof ApiError && error.code === 'RATE_LIMIT_EXCEEDED') {
          logger.warn('OTP resend failed: Rate limit exceeded', { email });
          throw error; // Re-throw with original message
        }
        // Handle email send failure
        if (error instanceof ApiError && error.code === 'EMAIL_SEND_FAILED') {
          logger.error('OTP resend failed: Email send error', { email });
          throw error; // Re-throw with original message
        }
        // Unknown error
        logger.error('OTP resend failed: Unknown error', { 
          email, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw new ApiError(500, 'Failed to resend verification code. Please try again.', 'RESEND_FAILED');
      }
      
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Verification code sent successfully. Please check your email.'
        }
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Resend OTP error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
  
  // User login
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const loginData: LoginDto = req.body;
      
      logger.info('Login attempt', { email: loginData.email });
      
      // Find user by email
      const user = await UserModel.findByEmail(loginData.email);
      if (!user) {
        logger.warn('Login failed: Invalid credentials', { email: loginData.email });
        throw new ApiError(401, 'Invalid email or password. Please check your credentials.', 'INVALID_CREDENTIALS');
      }
      
      // Check if email is verified
      if (!user.is_email_verified) {
        logger.warn('Login failed: Email not verified', { email: loginData.email });
        throw new ApiError(403, 'Please verify your email before logging in. Check your inbox for the verification code.', 'EMAIL_NOT_VERIFIED');
      }
      
      // Verify password
      const isPasswordValid = await UserModel.verifyPassword(
        loginData.password,
        user.password_hash!
      );
      
      if (!isPasswordValid) {
        logger.warn('Login failed: Invalid password', { email: loginData.email });
        throw new ApiError(401, 'Invalid email or password. Please check your credentials.', 'INVALID_CREDENTIALS');
      }
      
      // Generate JWT token with actual role from database
      const userRole = (user as any).role || 'user';
      const payload: JwtPayload = {
        user_id: user.user_id,
        email: user.email,
        role: userRole
      };
      
      const token = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      } as jwt.SignOptions);
      
      logger.info('User logged in successfully', { userId: user.user_id, email: user.email, role: userRole });
      
      // Prepare response with role
      const authResponse: AuthResponse = {
        token,
        user: {
          id: user.user_id,
          email: user.email,
          username: user.username,
          full_name: user.full_name,
          role: userRole
        },
        expires_in: config.jwt.expiresIn
      };
      
      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: authResponse
      };
      
      res.json(response);
    } catch (error) {
      logger.error('Login error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      next(error);
    }
  }
  
  // Verify token (for testing)
  static async verifyToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        throw new ApiError(401, 'No token provided', 'NO_TOKEN');
      }
      
      const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
      
      const response: ApiResponse = {
        success: true,
        data: {
          valid: true,
          payload: decoded
        }
      };
      
      res.json(response);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        next(new ApiError(401, 'Invalid token', 'INVALID_TOKEN'));
      } else {
        next(error);
      }
    }
  }
  
  // Logout (client-side token removal, but we can blacklist if needed)
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // In a production app, we might want to blacklist the token in Redis
      // For now, just return success
      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Logged out successfully'
        }
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
