/**
 * Admin Authentication Provider for React Admin
 * Handles admin-specific authentication and authorization
 */
import { AuthProvider } from 'react-admin';
import { apiClient } from '../../api/client';

export const AdminAuthProvider: AuthProvider = {
  /**
   * Login - Authenticate admin user
   */
  login: async ({ username, password }) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email: username,
        password,
      });

      const { token, user } = response.data.data;

      // Check if user has admin role
      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));

      return Promise.resolve();
    } catch (error: any) {
      const message = error.response?.data?.error?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  },

  /**
   * Logout - Clear admin session
   */
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
    return Promise.resolve();
  },

  /**
   * Check authentication status
   */
  checkAuth: () => {
    const token = localStorage.getItem('auth_token');
    const adminUser = localStorage.getItem('admin_user');

    if (!token || !adminUser) {
      return Promise.reject();
    }

    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'admin') {
        return Promise.reject();
      }
      return Promise.resolve();
    } catch {
      return Promise.reject();
    }
  },

  /**
   * Check if user has required permissions
   */
  checkError: (error) => {
    const status = error.status || error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_user');
      return Promise.reject();
    }
    return Promise.resolve();
  },

  /**
   * Get user identity for display
   */
  getIdentity: () => {
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (!adminUser) {
        return Promise.reject();
      }

      const user = JSON.parse(adminUser);
      return Promise.resolve({
        id: user.user_id,
        fullName: user.full_name || user.username,
        avatar: user.avatar_url,
      });
    } catch {
      return Promise.reject();
    }
  },

  /**
   * Get user permissions
   */
  getPermissions: () => {
    try {
      const adminUser = localStorage.getItem('admin_user');
      if (!adminUser) {
        return Promise.resolve([]);
      }

      const user = JSON.parse(adminUser);
      // Return role-based permissions
      if (user.role === 'admin') {
        return Promise.resolve(['admin', 'manage_books', 'manage_orders', 'manage_users']);
      }
      return Promise.resolve([]);
    } catch {
      return Promise.resolve([]);
    }
  },
};
