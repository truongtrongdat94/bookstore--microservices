/**
 * Admin Dashboard Type Definitions
 * Based on design document specifications
 */

// Dashboard Statistics
export interface DashboardStats {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  orders: {
    newCount: number;      // Last 24 hours
    pendingCount: number;
    totalToday: number;
  };
  users: {
    newRegistrations: number;  // Last 7 days
    activeCount: number;
  };
  topBooks: TopSellingBook[];
}

export interface TopSellingBook {
  id: number;
  title: string;
  author: string;
  salesCount: number;
  revenue: number;
  coverImage: string;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orderCount: number;
}

// Book Management
export interface AdminBook {
  id: number;
  title: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  price: number;
  description: string;      // HTML content from rich text editor
  coverImage: string;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface BookCreateInput {
  title: string;
  authorId: number;
  categoryId: number;
  price: number;
  description: string;
  coverImage: File | string;
  stock: number;
}

// Category Tree
export interface CategoryNode {
  id: number;
  name: string;
  parentId: number | null;
  children: CategoryNode[];
  order: number;
}

export interface CategoryMoveInput {
  categoryId: number;
  newParentId: number | null;
  newOrder: number;
}

// Author Management
export interface AdminAuthor {
  id: number;
  name: string;
  nationality?: string;
  birthYear?: number;
  deathYear?: number;
  biography?: string;
  quote?: string;
  profileImage?: string;
  website?: string;
  bookCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthorCreateInput {
  name: string;
  nationality?: string;
  birthYear?: number;
  deathYear?: number;
  biography?: string;
  quote?: string;
  profileImage?: string;
  website?: string;
}

export interface AuthorUpdateInput extends Partial<AuthorCreateInput> {}

// Bulk Operations
export interface BulkImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

// Order Management
export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
  statusHistory: StatusChange[];
}

export interface OrderItem {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface StatusChange {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  changedBy: number;
  changedAt: string;
  reason?: string;
}

export interface OrderFilter {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  paymentMethod?: string;
  search?: string;  // Order ID or customer name
}

export interface Address {
  addressLine: string;
  ward?: string;
  district?: string;
  city: string;
  phone: string;
  recipientName: string;
}

// Valid status transitions
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: []
};

// User Management
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  status: 'active' | 'blocked';
  registeredAt: string;
  lastLoginAt: string;
  orderCount: number;
  totalSpent: number;
}

export interface UserBlockAction {
  userId: number;
  reason: string;
  blockedBy: number;
  blockedAt: string;
}

export interface PasswordResetRequest {
  userId: number;
  initiatedBy: number;
  token: string;
  expiresAt: string;
  emailSent: boolean;
}

export interface UserActivity {
  id: number;
  userId: number;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

// API Error Response
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Error codes
export const ERROR_CODES = {
  // Authentication/Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // Business Logic
  AUTHOR_HAS_BOOKS: 'AUTHOR_HAS_BOOKS',
  CANNOT_BLOCK_ADMIN: 'CANNOT_BLOCK_ADMIN',
  ORDER_NOT_CANCELLABLE: 'ORDER_NOT_CANCELLABLE',
  
  // Import/Export
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  IMPORT_VALIDATION_FAILED: 'IMPORT_VALIDATION_FAILED',
  
  // Not Found
  BOOK_NOT_FOUND: 'BOOK_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  AUTHOR_NOT_FOUND: 'AUTHOR_NOT_FOUND'
} as const;
