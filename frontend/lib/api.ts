/**
 * @fileoverview ChargeCars API Client
 * 
 * This module provides a comprehensive API client for the ChargeCars application,
 * handling authentication, token management, and all API communications with the Xano backend.
 * 
 * Key Features:
 * - Automatic token initialization from localStorage/cookies
 * - Token validation and automatic cleanup
 * - Comprehensive error handling
 * - Detailed logging for debugging
 * - Support for both V2 API and auth endpoints
 * 
 * @author ChargeCars Development Team
 * @version 2.0.0
 */

// API Configuration and Client
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chargecars.nl';
const API_GROUP = process.env.NEXT_PUBLIC_API_GROUP || 'V2';

export const API_ENDPOINTS = {
  // V2 API endpoints
  orders: '/order',
  orderById: (id: string) => `/order/${id}`,
  orderStatus: (id: string) => `/order/${id}/status`,
  orderTimeline: (id: string) => `/order/${id}/timeline`,
  contacts: '/contact',
  contactById: (id: string) => `/contact/${id}`,
  customers: '/customer',
  customerById: (id: string) => `/customer/${id}`,
  customerMetrics: '/customer/metrics',
  quotes: '/quote',
  businessEntities: '/business_entities',

  
  // Auth endpoints (different API group)
  auth: {
    login: '/login',
    register: '/register',
    refresh: '/refresh',
    me: '/me',
    logout: '/logout',
  }
} as const;

// Types based on the API specifications
export interface OrderResponse {
  id: number;
  created_at: number;
  updated_at: number;
  business_entity_id: number;
  order_number: string;
  order_type: string;
  status: string;
  priority: string;
  amount?: number;
  
  // Status information from API
  status_name?: string;
  status_label?: string;
  status_since?: number; // timestamp
  status_color?: string;
  
  // Customer information from API
  customer_name?: string;
  customer_first_name?: string;
  customer_last_name?: string;
  
  // Account/Business Entity information
  business_entity?: string;
  account?: string;
  installation_date?: string;
  partner_name?: string;
  reference?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface OrderFilters {
  search?: string;
  business_entity?: string;
  order_type?: string;
  status?: string;
  priority?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
}

// Xano API response format
export interface XanoListResponse<T> {
  page: number;
  per_page: number;
  offset: number;
  has_more_items: boolean;
  found_count: number;
  items: T[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    current_page: number;
    total_pages: number;
    per_page: number;
    total_items: number;
    has_more_items: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface DashboardStats {
  total_revenue: number;
  active_orders: number;
  completed_orders: number;
  pending_orders: number;
  revenue_change: number;
  orders_change: number;
}

export interface LoginResponse {
  auth_token: string;
  refresh_token?: string;
  auth_token_exp?: number;
  refresh_token_exp?: number;
  user: any; // Will be defined based on actual API response
}

export interface MeResponse {
  id: string;
  email: string;
  role_id?: string;
  first_name?: string;
  last_name?: string;
  organization_id?: string;
  organization_name?: string;
  // Add other user fields based on actual API response
}

// Customer interfaces from customers.tsx
export interface CustomerResponse {
  id: string;
  contact_type: 'person' | 'organization';
  contact_subtype: 'customer' | 'partner';
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  display_name?: string;
  parent_organization_id?: string;
  parent_organization_name?: string;
  is_primary?: boolean;
  is_billing_contact?: boolean;
  is_technical_contact?: boolean;
  job_title?: string;
  department?: string;
  whatsapp?: string;
  preferred_communication?: 'email' | 'phone' | 'whatsapp' | 'portal';
  is_active?: boolean;
  created_at?: number;
  updated_at?: number;
  
  // Organization specific fields
  vat_number?: string;
  kvk_number?: string;
  iban?: string;
  
  // Aggregated metrics
  total_orders?: number;
  total_revenue?: number;
  last_order_date?: number;
  status?: 'active' | 'inactive' | 'prospect';
}

export interface CustomerFilters {
  search?: string;
  contact_type?: 'person' | 'organization';
  contact_subtype?: 'customer' | 'partner';
  status?: string;
  communication_preference?: string;
  parent_organization?: string;
  page?: number;
  per_page?: number;
}

export interface CustomerMetrics {
  total_customers: number;
  total_organizations: number;
  total_partners: number;
  active_customers: number;
  new_this_month: number;
  revenue_this_month: number;
  customers_change: number;
  revenue_change: number;
}

/**
 * ChargeCars API Client
 * 
 * Handles all HTTP communication with the Xano backend API.
 * Automatically manages authentication tokens and provides methods for
 * orders, authentication, and other business operations.
 * 
 * @example
 * ```typescript
 * import { apiClient } from './lib/api';
 * 
 * // Login
 * const response = await apiClient.login('user@example.com', 'password');
 * 
 * // Fetch orders with filters
 * const orders = await apiClient.getOrders({ status: 'active' });
 * ```
 */
class ApiClient {
  private baseUrl: string;
  private authBaseUrl: string;
  private token: string | null = null;

  /**
   * Initialize the API client
   * Sets up base URLs and automatically loads stored authentication token
   */
  constructor() {
    this.baseUrl = `${API_BASE_URL}/api:${API_GROUP}`;
    this.authBaseUrl = `${API_BASE_URL}/api:auth`;
    
    // Initialize token from storage on app startup
    this.initializeToken();
  }

  /**
   * Initialize authentication token from storage
   * 
   * Attempts to load a stored authentication token and validates it.
   * If the token is expired, it will be automatically cleared.
   * This ensures the API client is ready for authenticated requests immediately.
   * 
   * @private
   */
  private initializeToken(): void {
    try {
      // Check if we're in browser environment
      if (typeof window !== 'undefined') {
        const { tokenManager } = require('./auth');
        const storedToken = tokenManager.getAuthToken();
        if (storedToken && tokenManager.isTokenValid()) {
          this.token = storedToken;
          console.log('🔑 API: Token initialized from storage');
        } else if (storedToken) {
          console.log('⚠️ API: Stored token is expired, clearing...');
          tokenManager.clearAuth();
        }
      }
    } catch (error) {
      console.warn('⚠️ API: Could not initialize token from storage:', error);
    }
  }

  /**
   * Set the authentication token for API requests
   * 
   * @param token - The JWT token or null to clear
   * @example
   * ```typescript
   * apiClient.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   * apiClient.setToken(null); // Clear token
   * ```
   */
  setToken(token: string | null) {
    this.token = token;
    console.log('🔑 API: Token updated:', !!token);
  }

  /**
   * Get the current authentication token
   * 
   * @returns The current JWT token or null if not authenticated
   */
  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuthEndpoint: boolean = false
  ): Promise<ApiResponse<T>> {
    const baseUrl = useAuthEndpoint ? this.authBaseUrl : this.baseUrl;
    const url = `${baseUrl}${endpoint}`;
    
    console.log('📡 API REQUEST:', {
      url,
      method: options.method || 'GET',
      useAuthEndpoint,
      hasToken: !!this.token,
      tokenPreview: this.token ? `${this.token.substring(0, 10)}...` : 'none'
    });
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('📡 API RESPONSE:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();
      console.log('📡 API DATA:', data);

      if (!response.ok) {
        return {
          success: false,
          data: null as any,
          error: {
            code: response.status.toString(),
            message: data.message || 'API request failed',
            details: data
          }
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        }
      };
    }
  }

  /**
   * ===== ORDER API METHODS =====
   * Methods for managing orders, quotes, and related business operations
   */

  /**
   * Fetch orders with optional filtering and pagination
   * 
   * @param filters - Optional filters for search, status, business entity, etc.
   * @returns Promise resolving to API response with orders data
   * 
   * @example
   * ```typescript
   * // Get all orders
   * const allOrders = await apiClient.getOrders();
   * 
   * // Get orders with filters
   * const filteredOrders = await apiClient.getOrders({
   *   status: 'active',
   *   search: 'Tesla',
   *   page: 1,
   *   per_page: 20
   * });
   * ```
   */
  async getOrders(filters: OrderFilters = {}): Promise<ApiResponse<OrderResponse[]>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.orders}?${queryString}` : API_ENDPOINTS.orders;
    
    const response = await this.request<XanoListResponse<OrderResponse>>(endpoint);
    
    if (response.success) {
      // Transform Xano response to our standard format
      const xanoData = response.data;
      return {
        success: true,
        data: xanoData.items,
        pagination: {
          current_page: xanoData.page,
          total_pages: Math.ceil(xanoData.found_count / xanoData.per_page),
          per_page: xanoData.per_page,
          total_items: xanoData.found_count,
          has_more_items: xanoData.has_more_items,
        }
      };
    }
    
    return {
      success: false,
      data: [],
      error: response.error
    };
  }

  async getOrderById(id: string): Promise<ApiResponse<OrderResponse>> {
    return this.request<OrderResponse>(API_ENDPOINTS.orderById(id));
  }

  async createOrder(orderData: Partial<OrderResponse>): Promise<ApiResponse<OrderResponse>> {
    return this.request<OrderResponse>(API_ENDPOINTS.orders, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async updateOrder(id: string, orderData: Partial<OrderResponse>): Promise<ApiResponse<OrderResponse>> {
    return this.request<OrderResponse>(API_ENDPOINTS.orderById(id), {
      method: 'PATCH',
      body: JSON.stringify(orderData),
    });
  }

  async deleteOrder(id: string): Promise<ApiResponse<{ order_id: string }>> {
    return this.request<{ order_id: string }>(API_ENDPOINTS.orderById(id), {
      method: 'DELETE',
    });
  }

  // ======================
  // CUSTOMER METHODS
  // ======================

  /**
   * Get customers with optional filters
   * 
   * @param filters - Optional filters for customers
   * @returns Promise resolving to API response with customer array
   */
  async getCustomers(filters: CustomerFilters = {}): Promise<ApiResponse<CustomerResponse[]>> {
    console.log('📋 API: Fetching customers with filters:', filters);
    
    const params = new URLSearchParams();
    
    // Add filters to query params
    if (filters.search) params.append('search', filters.search);
    if (filters.contact_type) params.append('contact_type', filters.contact_type);
    if (filters.contact_subtype) params.append('contact_subtype', filters.contact_subtype);
    if (filters.status) params.append('status', filters.status);
    if (filters.communication_preference) params.append('communication_preference', filters.communication_preference);
    if (filters.parent_organization) params.append('parent_organization', filters.parent_organization);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    
    const queryString = params.toString();
    const endpoint = queryString ? `${API_ENDPOINTS.customers}?${queryString}` : API_ENDPOINTS.customers;
    
    const response = await this.request<XanoListResponse<CustomerResponse>>(endpoint);
    
    if (response.success && response.data) {
      console.log('📋 API: Customers loaded successfully, count:', response.data.items?.length || 0);
      
      // Transform Xano response to our format
      const items = response.data.items || [];
      
      return {
        ...response,
        data: items,
        pagination: {
          current_page: response.data.page || 1,
          total_pages: Math.ceil((response.data.found_count || 0) / (response.data.per_page || 50)),
          per_page: response.data.per_page || 50,
          total_items: response.data.found_count || 0,
          has_more_items: response.data.has_more_items || false
        }
      };
    }
    
    return {
      success: false,
      data: [],
      error: response.error
    };
  }

  /**
   * Get customer by ID
   * 
   * @param id - Customer ID
   * @returns Promise resolving to API response with customer data
   */
  async getCustomerById(id: string): Promise<ApiResponse<CustomerResponse>> {
    console.log('📋 API: Fetching customer by ID:', id);
    
    const response = await this.request<CustomerResponse>(API_ENDPOINTS.customerById(id));
    
    if (response.success) {
      console.log('📋 API: Customer loaded successfully');
    }
    
    return response;
  }

  /**
   * Create a new customer
   * 
   * @param customerData - Customer data to create
   * @returns Promise resolving to API response with created customer
   */
  async createCustomer(customerData: Partial<CustomerResponse>): Promise<ApiResponse<CustomerResponse>> {
    console.log('📋 API: Creating customer:', customerData);
    
    const response = await this.request<CustomerResponse>(
      API_ENDPOINTS.customers,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      }
    );
    
    return response;
  }

  /**
   * Update customer by ID
   * 
   * @param id - Customer ID
   * @param customerData - Updated customer data
   * @returns Promise resolving to API response with updated customer
   */
  async updateCustomer(id: string, customerData: Partial<CustomerResponse>): Promise<ApiResponse<CustomerResponse>> {
    console.log('📋 API: Updating customer:', id, customerData);
    
    const response = await this.request<CustomerResponse>(
      API_ENDPOINTS.customerById(id),
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      }
    );
    
    return response;
  }

  /**
   * Delete customer by ID
   * 
   * @param id - Customer ID to delete
   * @returns Promise resolving to API response with customer_id
   */
  async deleteCustomer(id: string): Promise<ApiResponse<{ customer_id: string }>> {
    console.log('🗑️ API: Deleting customer:', id);
    
    const response = await this.request<{ customer_id: string }>(
      API_ENDPOINTS.customerById(id),
      { method: 'DELETE' }
    );
    
    return response;
  }

  /**
   * Get customer metrics/dashboard stats
   * 
   * @returns Promise resolving to customer metrics
   */
  async getCustomerMetrics(): Promise<ApiResponse<CustomerMetrics>> {
    console.log('📊 API: Fetching customer metrics...');
    
    const response = await this.request<CustomerMetrics>(API_ENDPOINTS.customerMetrics);
    
    if (response.success) {
      console.log('📊 API: Customer metrics loaded successfully');
    }
    
    return response;
  }

  /**
   * Calculate dashboard statistics from orders data
   * Since there's no dedicated dashboard endpoint, we calculate stats from the orders
   * 
   * @returns Promise resolving to calculated dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Fetch all orders to calculate stats
      const response = await this.getOrders({ per_page: 1000 }); // Get more orders for accurate stats
      
      if (!response.success) {
        return {
          success: false,
          data: null as any,
          error: response.error
        };
      }

      const orders = response.data;
      
      // Calculate stats from orders data
      const stats: DashboardStats = {
        total_revenue: orders.reduce((sum, order) => sum + (order.amount || 0), 0),
        active_orders: orders.filter(order => order.status === 'active' || order.status === 'in_progress').length,
        completed_orders: orders.filter(order => order.status === 'completed').length,
        pending_orders: orders.filter(order => order.status === 'pending' || order.status === 'draft').length,
        revenue_change: 0, // TODO: Calculate based on time period comparison
        orders_change: 0, // TODO: Calculate based on time period comparison
      };

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        error: {
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate dashboard statistics',
        }
      };
    }
  }

  /**
   * ===== AUTHENTICATION METHODS =====
   * Methods for user authentication and token management
   */

  /**
   * Authenticate user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to API response with auth tokens and user data
   * 
   * @example
   * ```typescript
   * const response = await apiClient.login('user@chargecars.nl', 'password123');
   * if (response.success) {
   *   console.log('Login successful:', response.data.user);
   *   // Token is automatically set in the client
   * }
   * ```
   */
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    console.log('🚀 API: Login request started for:', email);
    console.log('🚀 API: Using auth endpoint:', `${this.authBaseUrl}${API_ENDPOINTS.auth.login}`);
    
    const response = await this.request<LoginResponse>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true);
    
    console.log('🚀 API: Login response:', response);
    return response;
  }

  async getMe(): Promise<ApiResponse<MeResponse>> {
    return this.request<MeResponse>(API_ENDPOINTS.auth.me, {
      method: 'GET'
    }, true);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(API_ENDPOINTS.auth.refresh, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }, true);
  }
}

// Create and export API client instance
export const apiClient = new ApiClient();

// Hook for API calls with authentication
export const useApiClient = () => {
  // You can integrate with your auth context here
  // For now, we'll use the global client
  return apiClient;
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error?.error?.message) {
    return error.error.message;
  }
  if (error?.status === 401) {
    return 'Session expired. Please login again.';
  }
  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error?.status === 404) {
    return 'The requested resource was not found.';
  }
  return 'An unexpected error occurred. Please try again.';
}; 