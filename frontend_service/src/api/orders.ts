import apiClient from './client';
import { ApiResponse, Order, PaginatedResponse } from '../types';
import { Cart, CheckoutResponse, QRResponse } from '../types/order';

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const ordersApi = {
  // Get user's orders
  getMyOrders: async (page = 1, limit = 10): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get<ApiResponse<OrdersResponse>>(
      `/orders/my-orders?page=${page}&limit=${limit}`
    );
    
    const data = response.data.data!;
    return {
      items: data.orders,
      total: data.pagination.total,
      page: data.pagination.page,
      limit: data.pagination.limit,
      totalPages: data.pagination.totalPages,
    };
  },

  // Get user's cart
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<ApiResponse<any>>('/cart');
    const backendCart = response.data.data!;
    
    // Map backend response to frontend format
    return {
      user_id: backendCart.user_id,
      items: backendCart.items.map((item: any) => ({
        book_id: item.book_id,
        book_title: item.title,
        book_author: item.author,
        book_price: item.price,
        book_image: item.image,
        quantity: item.quantity,
      })),
      total_price: backendCart.total_amount,
      updated_at: backendCart.updated_at,
    };
  },

  // Add item to cart
  addToCart: async (bookId: number, quantity: number): Promise<Cart> => {
    const response = await apiClient.post<ApiResponse<any>>(
      '/cart/items',
      { book_id: bookId, quantity }
    );
    const backendCart = response.data.data!;
    
    // Map backend response to frontend format
    return {
      user_id: backendCart.user_id,
      items: backendCart.items.map((item: any) => ({
        book_id: item.book_id,
        book_title: item.title,
        book_author: item.author,
        book_price: item.price,
        book_image: item.image,
        quantity: item.quantity,
      })),
      total_price: backendCart.total_amount,
      updated_at: backendCart.updated_at,
    };
  },

  // Update cart item quantity
  updateCartItem: async (bookId: number, quantity: number): Promise<Cart> => {
    const response = await apiClient.put<ApiResponse<any>>(
      `/cart/items/${bookId}`,
      { quantity }
    );
    const backendCart = response.data.data!;
    
    // Map backend response to frontend format
    return {
      user_id: backendCart.user_id,
      items: backendCart.items.map((item: any) => ({
        book_id: item.book_id,
        book_title: item.title,
        book_author: item.author,
        book_price: item.price,
        book_image: item.image,
        quantity: item.quantity,
      })),
      total_price: backendCart.total_amount,
      updated_at: backendCart.updated_at,
    };
  },

  // Remove item from cart
  removeFromCart: async (bookId: number): Promise<Cart> => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/cart/items/${bookId}`
    );
    const backendCart = response.data.data!;
    
    // Map backend response to frontend format
    return {
      user_id: backendCart.user_id,
      items: backendCart.items.map((item: any) => ({
        book_id: item.book_id,
        book_title: item.title,
        book_author: item.author,
        book_price: item.price,
        book_image: item.image,
        quantity: item.quantity,
      })),
      total_price: backendCart.total_amount,
      updated_at: backendCart.updated_at,
    };
  },

  // Clear entire cart
  clearCart: async (): Promise<void> => {
    await apiClient.delete('/cart');
  },

  // Checkout with VietQR payment
  // Requirements: 3.3
  checkout: async (shippingAddress: string): Promise<CheckoutResponse> => {
    const response = await apiClient.post<ApiResponse<CheckoutResponse>>(
      '/orders/checkout',
      {
        shipping_address: shippingAddress,
        payment_method: 'bank_transfer'
      }
    );
    return response.data.data!;
  },

  // Get QR for existing order
  // Requirements: 3.3
  getOrderQR: async (orderId: number): Promise<QRResponse> => {
    const response = await apiClient.get<ApiResponse<QRResponse>>(
      `/orders/${orderId}/qr`
    );
    return response.data.data!;
  },
};
