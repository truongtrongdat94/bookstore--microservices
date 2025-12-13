/**
 * Custom Data Provider Methods for Admin Dashboard
 * Extends the base data provider with admin-specific operations
 */
import { fetchUtils } from 'react-admin';
import { getApiBaseUrl } from '../../api/client';
import { 
  DashboardStats, 
  RevenueChartData, 
  BulkImportResult,
  OrderStatus 
} from '../types';

const apiUrl = `${getApiBaseUrl()}/admin`;

/**
 * Custom HTTP client with authentication headers
 */
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Don't set Content-Type for FormData (file uploads)
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  return fetchUtils.fetchJson(url, { ...options, headers });
};

/**
 * Dashboard API Methods
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStats: async (): Promise<DashboardStats> => {
    const response = await httpClient(`${apiUrl}/dashboard/stats`);
    return response.json.data;
  },

  /**
   * Get revenue chart data
   */
  getRevenueChart: async (period: 'week' | 'month' | 'year'): Promise<RevenueChartData[]> => {
    const response = await httpClient(`${apiUrl}/dashboard/revenue-chart?period=${period}`);
    return response.json.data;
  },
};

/**
 * Book Bulk Operations API Methods
 */
export const bulkOperationsApi = {
  /**
   * Import books from CSV/Excel file
   */
  importBooks: async (file: File): Promise<BulkImportResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await httpClient(`${apiUrl}/books/bulk-import`, {
      method: 'POST',
      body: formData,
    });
    return response.json.data;
  },

  /**
   * Export books to CSV/Excel
   */
  exportBooks: async (format: 'csv' | 'xlsx', ids?: number[]): Promise<Blob> => {
    const query = ids ? `?ids=${ids.join(',')}&format=${format}` : `?format=${format}`;
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${apiUrl}/books/export${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

/**
 * Order Management API Methods
 */
export const orderApi = {
  /**
   * Update order status
   */
  updateStatus: async (orderId: number, status: OrderStatus, reason?: string): Promise<void> => {
    await httpClient(`${apiUrl}/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },

  /**
   * Confirm payment for an order
   */
  confirmPayment: async (orderId: number): Promise<void> => {
    await httpClient(`${apiUrl}/orders/${orderId}/confirm-payment`, {
      method: 'POST',
    });
  },

  /**
   * Generate invoice PDF
   */
  getInvoice: async (orderId: number): Promise<Blob> => {
    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(`${apiUrl}/orders/${orderId}/invoice`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate invoice');
    }

    return response.blob();
  },
};

/**
 * User Management API Methods
 */
export const userApi = {
  /**
   * Block a user
   */
  blockUser: async (userId: number, reason: string): Promise<void> => {
    await httpClient(`${apiUrl}/users/${userId}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Unblock a user
   */
  unblockUser: async (userId: number): Promise<void> => {
    await httpClient(`${apiUrl}/users/${userId}/unblock`, {
      method: 'POST',
    });
  },

  /**
   * Reset user password
   */
  resetPassword: async (userId: number): Promise<void> => {
    await httpClient(`${apiUrl}/users/${userId}/reset-password`, {
      method: 'POST',
    });
  },

  /**
   * Get user orders
   */
  getUserOrders: async (userId: number, page = 1, limit = 10) => {
    const response = await httpClient(
      `${apiUrl}/users/${userId}/orders?page=${page}&limit=${limit}`
    );
    return response.json.data;
  },

  /**
   * Get user activity
   */
  getUserActivity: async (userId: number, page = 1, limit = 20) => {
    const response = await httpClient(
      `${apiUrl}/users/${userId}/activity?page=${page}&limit=${limit}`
    );
    return response.json.data;
  },
};

/**
 * Category Management API Methods
 */
export const categoryApi = {
  /**
   * Get category tree
   */
  getTree: async () => {
    const response = await httpClient(`${apiUrl}/categories/tree`);
    return response.json.data;
  },

  /**
   * Move category (drag-drop)
   */
  moveCategory: async (categoryId: number, newParentId: number | null, newOrder: number): Promise<void> => {
    await httpClient(`${apiUrl}/categories/${categoryId}/move`, {
      method: 'PUT',
      body: JSON.stringify({ newParentId, newOrder }),
    });
  },
};

/**
 * Author Management API Methods
 */
export const authorApi = {
  /**
   * Get books by author
   */
  getAuthorBooks: async (authorId: number, page = 1, limit = 10) => {
    const response = await httpClient(
      `${apiUrl}/authors/${authorId}/books?page=${page}&limit=${limit}`
    );
    return response.json.data;
  },
};
