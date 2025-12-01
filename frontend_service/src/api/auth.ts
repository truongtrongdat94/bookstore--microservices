import apiClient from './client';
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User } from '../types';

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    );
    return response.data.data!;
  },

  // Register - now returns success message instead of token
  register: async (data: RegisterRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/register',
      data
    );
    return response.data.data!;
  },

  // Verify OTP after registration
  verifyOTP: async (email: string, otp_code: string): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/verify-email',
      { email, otp_code }
    );
    return response.data.data!;
  },

  // Resend OTP
  resendOTP: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(
      '/auth/resend-otp',
      { email }
    );
    return response.data.data!;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');
    return response.data.data!;
  },

  // Update profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', data);
    return response.data.data!;
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },
};
