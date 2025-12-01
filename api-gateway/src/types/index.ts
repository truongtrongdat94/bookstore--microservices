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

export interface User {
  userId: number;
  email: string;
  role: string;
  username?: string;
  full_name?: string;
}

export interface ServiceError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}
