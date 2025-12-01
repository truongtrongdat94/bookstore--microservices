export interface User {
  user_id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ShippingAddress {
  address_id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  ward?: string;
  district?: string;
  city: string;
  is_default: boolean;
  created_at: string;
}

// Address types for profile management
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
  created_at: string;
  updated_at: string;
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

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}
