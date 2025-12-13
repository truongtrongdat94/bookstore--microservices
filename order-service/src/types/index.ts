import { Request } from 'express';

// Order related types
export interface Order {
  order_id: number;
  user_id: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  created_at: Date;
  updated_at?: Date;
}

export interface OrderItem {
  item_id: number;
  order_id: number;
  book_id: number;
  quantity: number;
  price: number;
  created_at: Date;
}

// Cart related types
export interface CartItem {
  book_id: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
  stock_quantity?: number;
  image?: string;
}

export interface Cart {
  user_id: number;
  items: CartItem[];
  total_items: number;
  total_amount: number;
  updated_at: Date;
}

// Enums
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AWAITING_CONFIRMATION = 'awaiting_confirmation',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

// Payment Session types for VietQR integration
export enum PaymentSessionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface PaymentSession {
  session_id: number;
  order_id: number;
  qr_code: string;
  qr_data_url: string;
  amount: number;
  transfer_content: string;
  expires_at: Date;
  status: PaymentSessionStatus;
  confirmed_by?: number;
  confirmed_at?: Date;
  rejection_reason?: string;
  created_at: Date;
  updated_at?: Date;
}

export interface CreatePaymentSessionDto {
  order_id: number;
  qr_code: string;
  qr_data_url: string;
  amount: number;
  transfer_content: string;
}

// DTOs
export interface AddToCartDto {
  book_id: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CheckoutDto {
  shipping_address: string;
  payment_method: PaymentMethod;
  payment_details?: {
    card_number?: string;
    expiry_date?: string;
    cvv?: string;
    cardholder_name?: string;
  };
}

export interface CreateOrderDto {
  items: {
    book_id: number;
    quantity: number;
    price: number;
  }[];
  shipping_address: string;
  payment_method: PaymentMethod;
}

// Extended Request with user info
export interface AuthRequest extends Request {
  user?: {
    user_id: number;
    email: string;
    role: string;
  };
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

// Event types for RabbitMQ
export interface OrderCreatedEvent {
  order_id: number;
  user_id: number;
  user_email: string;
  total_amount: number;
  items: OrderItem[];
  created_at: Date;
}

export interface OrderUpdatedEvent {
  order_id: number;
  old_status: OrderStatus;
  new_status: OrderStatus;
  updated_at: Date;
}

export interface PaymentProcessedEvent {
  order_id: number;
  user_email: string;
  payment_status: PaymentStatus;
  amount: number;
  processed_at: Date;
}
