/**
 * Admin Data Provider for React Admin
 * Implements REST data provider with custom API integration
 */
import { DataProvider, fetchUtils } from 'react-admin';
import { getApiBaseUrl } from '../../api/client';

const apiUrl = `${getApiBaseUrl()}/admin`;

/**
 * Custom HTTP client with authentication headers
 */
const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token = localStorage.getItem('auth_token');
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetchUtils.fetchJson(url, { ...options, headers });
};

/**
 * Transform API response to React Admin format
 * Our API returns { success: true, data: [...], meta: { page, limit, total, totalPages } }
 */
const transformResponse = (response: any, resource: string) => {
  const json = response.json;
  const data = json.data;
  const meta = json.meta;
  
  // Handle list responses with pagination
  if (Array.isArray(data)) {
    return {
      data: data.map((item: any) => ({
        ...item,
        id: item.id || item[`${resource.slice(0, -1)}_id`] || item.book_id || item.order_id || item.user_id,
      })),
      total: meta?.total || data.length,
    };
  }
  
  // Handle single item responses
  return {
    data: {
      ...data,
      id: data.id || data[`${resource.slice(0, -1)}_id`] || data.book_id || data.order_id || data.user_id,
    },
  };
};

/**
 * Build query string from React Admin params
 */
const buildQueryString = (params: any): string => {
  const { pagination, sort, filter } = params;
  const query: Record<string, string> = {};

  // Pagination
  if (pagination) {
    query.page = String(pagination.page);
    query.limit = String(pagination.perPage);
  }

  // Sorting
  if (sort) {
    query.sort = sort.field;
    query.order = sort.order.toLowerCase();
  }

  // Filters
  if (filter) {
    Object.keys(filter).forEach((key) => {
      if (filter[key] !== undefined && filter[key] !== '') {
        query[key] = String(filter[key]);
      }
    });
  }

  return new URLSearchParams(query).toString();
};

/**
 * Admin Data Provider Implementation
 */
export const adminDataProvider: DataProvider = {
  /**
   * Get a list of resources
   */
  getList: async (resource, params) => {
    const queryString = buildQueryString(params);
    const url = `${apiUrl}/${resource}?${queryString}`;

    try {
      const response = await httpClient(url);
      return transformResponse(response, resource);
    } catch (error: any) {
      console.error(`Error fetching ${resource} list:`, error);
      throw new Error(error.message || `Failed to fetch ${resource}`);
    }
  },

  /**
   * Get a single resource by ID
   */
  getOne: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;

    try {
      const response = await httpClient(url);
      return transformResponse(response, resource);
    } catch (error: any) {
      console.error(`Error fetching ${resource}/${params.id}:`, error);
      throw new Error(error.message || `Failed to fetch ${resource}`);
    }
  },

  /**
   * Get multiple resources by IDs
   */
  getMany: async (resource, params) => {
    const query = params.ids.map((id) => `id=${id}`).join('&');
    const url = `${apiUrl}/${resource}?${query}`;

    try {
      const response = await httpClient(url);
      return transformResponse(response, resource);
    } catch (error: any) {
      console.error(`Error fetching many ${resource}:`, error);
      throw new Error(error.message || `Failed to fetch ${resource}`);
    }
  },

  /**
   * Get resources referenced by another resource
   */
  getManyReference: async (resource, params) => {
    const { target, id, pagination, sort, filter } = params;
    const queryParams = {
      pagination,
      sort,
      filter: { ...filter, [target]: id },
    };
    const queryString = buildQueryString(queryParams);
    const url = `${apiUrl}/${resource}?${queryString}`;

    try {
      const response = await httpClient(url);
      return transformResponse(response, resource);
    } catch (error: any) {
      console.error(`Error fetching ${resource} reference:`, error);
      throw new Error(error.message || `Failed to fetch ${resource}`);
    }
  },

  /**
   * Create a new resource
   */
  create: async (resource, params) => {
    const url = `${apiUrl}/${resource}`;

    try {
      const response = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
      });
      return transformResponse(response, resource);
    } catch (error: any) {
      console.error(`Error creating ${resource}:`, error);
      throw new Error(error.message || `Failed to create ${resource}`);
    }
  },

  /**
   * Update an existing resource
   */
  update: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;

    try {
      const response = await httpClient(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      });
      return transformResponse(response, resource);
    } catch (error: any) {
      console.error(`Error updating ${resource}/${params.id}:`, error);
      throw new Error(error.message || `Failed to update ${resource}`);
    }
  },

  /**
   * Update multiple resources
   */
  updateMany: async (resource, params) => {
    const responses = await Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: 'PUT',
          body: JSON.stringify(params.data),
        })
      )
    );

    return { data: params.ids };
  },

  /**
   * Delete a resource
   */
  delete: async (resource, params) => {
    const url = `${apiUrl}/${resource}/${params.id}`;

    try {
      const response = await httpClient(url, {
        method: 'DELETE',
      });
      return { data: { id: params.id } };
    } catch (error: any) {
      console.error(`Error deleting ${resource}/${params.id}:`, error);
      throw new Error(error.message || `Failed to delete ${resource}`);
    }
  },

  /**
   * Delete multiple resources
   */
  deleteMany: async (resource, params) => {
    await Promise.all(
      params.ids.map((id) =>
        httpClient(`${apiUrl}/${resource}/${id}`, {
          method: 'DELETE',
        })
      )
    );

    return { data: params.ids };
  },
};

export default adminDataProvider;
