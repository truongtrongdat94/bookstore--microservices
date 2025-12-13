import { Request } from 'express';

// User related types
export interface User {
  user_id: number;
  username: string;
  email: string;
  password_hash?: string;
  full_name: string;
  is_email_verified?: boolean;
  auth_provider?: string;
  provider_id?: string;
  avatar_url?: string;
  created_at: Date;
  updated_at?: Date;
}

// Address types (for user_addresses table)
export interface Address {
  address_id: number;
  user_id: number;
  name: string;
  phone: string;
  company?: string;
  address: string;
  country: string;
  province: string;
  district: string;
  ward: string;
  zip_code?: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAddressDto {
  name: string;
  phone: string;
  company?: string;
  address: string;
  country: string;
  province: string;
  district: string;
  ward: string;
  zip_code?: string;
  is_default: boolean;
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {}

// OTP related types
export interface OTP {
  otp_id: number;
  email: string;
  otp_code_hash: string;
  purpose: 'register' | 'login' | 'reset_password';
  expires_at: Date;
  is_used: boolean;
  created_at: Date;
  registration_data?: any; // JSON data for temporary registration storage
}

export interface CreateOTPDto {
  email: string;
  otp_code: string;
  purpose: 'register' | 'login' | 'reset_password';
  registration_data?: {
    username: string;
    password_hash: string;
    full_name: string;
  };
}

// Auth related types
export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  otp_code: string;
}

export interface ResendOTPDto {
  email: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface JwtPayload {
  user_id: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    full_name: string;
    role?: string;
  };
  expires_in: string;
}

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, ApiError);
  }
}
