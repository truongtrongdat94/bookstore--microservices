import { Request } from 'express';

// Notification related types
export interface Notification {
  notification_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: Date;
  read_at?: Date;
}

export enum NotificationType {
  ORDER_CREATED = 'order_created',
  ORDER_UPDATED = 'order_updated',
  PAYMENT_PROCESSED = 'payment_processed',
  SYSTEM = 'system',
  PROMOTION = 'promotion'
}

// Email related types
export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Event types from RabbitMQ
export interface OrderCreatedEvent {
  order_id: number;
  user_id: number;
  total_amount: number;
  items: any[];
  created_at: Date;
  timestamp?: string;
  service?: string;
}

export interface OrderUpdatedEvent {
  order_id: number;
  old_status: string;
  new_status: string;
  updated_at: Date;
  timestamp?: string;
  service?: string;
}

export interface PaymentProcessedEvent {
  order_id: number;
  payment_status: string;
  amount: number;
  processed_at: Date;
  timestamp?: string;
  service?: string;
}

// DTOs
export interface CreateNotificationDto {
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export interface MarkAsReadDto {
  notification_ids: number[];
}

export interface SendEmailDto {
  to: string[];
  subject: string;
  message: string;
  template?: string;
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
    unread_count?: number;
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

// Notification preferences
export interface NotificationPreferences {
  user_id: number;
  email_enabled: boolean;
  push_enabled: boolean;
  order_updates: boolean;
  promotions: boolean;
  system_alerts: boolean;
  created_at: Date;
  updated_at?: Date;
}

// Message queue message format
export interface QueueMessage {
  content: Buffer;
  fields: {
    deliveryTag: number;
    redelivered: boolean;
    exchange: string;
    routingKey: string;
  };
  properties: {
    messageId?: string;
    timestamp?: number;
    headers?: any;
  };
}
