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
  quotes: '/quote',
  businessEntities: '/business_entities',
  dashboardStats: '/order/dashboard',
  
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
  
  // Additional fields based on Xano API
  customer_name?: string;
  business_entity?: string;
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
  refresh_token: string;
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

// API Client class
class ApiClient {
  private baseUrl: string;
  private authBaseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/api:${API_GROUP}`;
    this.authBaseUrl = `${API_BASE_URL}/api:auth`;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuthEndpoint: boolean = false
  ): Promise<ApiResponse<T>> {
    const baseUrl = useAuthEndpoint ? this.authBaseUrl : this.baseUrl;
    const url = `${baseUrl}${endpoint}`;
    
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

      const data = await response.json();

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

  // Order API methods
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

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request<DashboardStats>(API_ENDPOINTS.dashboardStats);
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, true);
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