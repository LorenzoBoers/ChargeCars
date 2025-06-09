# API Configuration & RTK Query Setup

**Last Updated**: 2025-01-18
**Status**: Production Ready
**Target**: TaskMaster Frontend Generator

## 🔧 **Complete API Configuration**

### **Environment Variables**

```env
# .env.local
NEXT_PUBLIC_XANO_BASE_URL=https://[WORKSPACE_ID].us-east-1.xano.io
NEXT_PUBLIC_XANO_API_GROUP=mvp-admin
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_ENVIRONMENT=development

# Production values (replace with actual Xano workspace)
# NEXT_PUBLIC_XANO_BASE_URL=https://x8b3-your-workspace.us-east-1.xano.io
```

### **API Base Configuration**

```typescript
// lib/api/config.ts
export const API_CONFIG = {
  baseURL: `${process.env.NEXT_PUBLIC_XANO_BASE_URL}/api:${process.env.NEXT_PUBLIC_XANO_API_GROUP}`,
  timeout: 30000, // 30 seconds
  retries: 3,
  
  endpoints: {
    // Order endpoints
    orders: '/db/order',
    orderById: (id: string) => `/db/order/${id}`,
    orderStatus: (id: string) => `/db/order/${id}/status`,
    orderTimeline: (id: string) => `/db/order/${id}/timeline`,
    orderContacts: (id: string) => `/db/order/${id}/contacts`,
    orderQuotes: (id: string) => `/db/order/${id}/quotes`,
    orderSearch: '/db/order/search',
    orderDashboard: '/db/order/dashboard',
    
    // Contact endpoints
    contacts: '/db/contact',
    contactById: (id: string) => `/db/contact/${id}`,
    
    // Quote endpoints
    quotes: '/db/quote',
    quoteById: (id: string) => `/db/quote/${id}`,
    
    // Status management
    statusWorkflows: '/db/status_workflows',
    statusWorkflowSteps: '/db/status_workflow_steps',
    entityCurrentStatus: '/db/entity_current_status',
    
    // Business entities
    businessEntities: '/db/business_entities',
    
    // Authentication
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      me: '/auth/me',
      logout: '/auth/logout',
    }
  }
} as const;

// Request/Response transformers
export const transformApiRequest = (data: any) => {
  // Transform frontend data to Xano format
  if (data.status_in && Array.isArray(data.status_in)) {
    data.status_in = data.status_in.join(',');
  }
  if (data.order_type_in && Array.isArray(data.order_type_in)) {
    data.order_type_in = data.order_type_in.join(',');
  }
  if (data.priority_in && Array.isArray(data.priority_in)) {
    data.priority_in = data.priority_in.join(',');
  }
  return data;
};

export const transformApiResponse = (data: any) => {
  // Transform Xano response to frontend format
  if (data.curPage !== undefined) {
    // Transform Xano pagination to our format
    return {
      ...data,
      pagination: {
        current_page: data.curPage,
        total_pages: data.pageTotal,
        per_page: data.perPage,
        total_items: data.itemsTotal
      }
    };
  }
  return data;
};
```

### **RTK Query Base API**

```typescript
// lib/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { 
  XanoListResponse, 
  XanoErrorResponse, 
  ApiResponse 
} from './types';
import { API_CONFIG, transformApiRequest, transformApiResponse } from './config';

// Base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = (getState() as RootState).auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'application/json');
    
    return headers;
  },
  
  // Transform requests
  prepareRequest: (url, { body, ...options }) => {
    if (body && typeof body === 'object') {
      body = transformApiRequest(body);
    }
    return { url, body, ...options };
  },
});

// Base query with error handling and token refresh
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // Handle 401 errors (token expired)
  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: API_CONFIG.endpoints.auth.refresh,
        method: 'POST',
        body: {
          refreshToken: (api.getState() as RootState).auth.refreshToken
        }
      },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      // Store new token
      api.dispatch(authSlice.actions.tokenRefreshed(refreshResult.data));
      
      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed, logout user
      api.dispatch(authSlice.actions.logout());
    }
  }
  
  // Transform successful responses
  if (result.data) {
    result.data = transformApiResponse(result.data);
  }
  
  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Order',
    'OrderStatus', 
    'OrderTimeline',
    'OrderContacts',
    'OrderQuotes',
    'Contact',
    'Quote',
    'BusinessEntity',
    'Dashboard',
    'User'
  ],
  endpoints: () => ({}),
});

export default baseApi;
```

### **Order API Slice**

```typescript
// lib/api/orderApi.ts
import { baseApi } from './baseApi';
import type {
  OrderResponse,
  OrderFilters,
  CreateOrderForm,
  UpdateOrderForm,
  StatusChangeRequest,
  StatusTimelineEntry,
  StatusTransitionsResponse,
  DashboardStats,
  XanoListResponse,
  ApiResponse
} from './types';

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    // Get orders with advanced filtering
    getOrders: builder.query<ApiResponse<OrderResponse[]>, OrderFilters>({
      query: (filters = {}) => ({
        url: '/db/order',
        params: filters,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Order' as const, id })),
              { type: 'Order', id: 'LIST' },
            ]
          : [{ type: 'Order', id: 'LIST' }],
    }),
    
    // Get single order by ID
    getOrderById: builder.query<ApiResponse<OrderResponse>, string>({
      query: (id) => `/db/order/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    // Create new order
    createOrder: builder.mutation<ApiResponse<OrderResponse>, CreateOrderForm>({
      query: (orderData) => ({
        url: '/db/order',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, { type: 'Dashboard' }],
    }),
    
    // Update order
    updateOrder: builder.mutation<
      ApiResponse<OrderResponse>, 
      { id: string; data: UpdateOrderForm }
    >({
      query: ({ id, data }) => ({
        url: `/db/order/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),
    
    // Delete order (soft delete)
    deleteOrder: builder.mutation<ApiResponse<{ order_id: string }>, string>({
      query: (id) => ({
        url: `/db/order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Dashboard' },
      ],
    }),
    
    // Change order status
    changeOrderStatus: builder.mutation<
      ApiResponse<StatusTimelineEntry>,
      { id: string; data: StatusChangeRequest }
    >({
      query: ({ id, data }) => ({
        url: `/db/order/${id}/status`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'OrderStatus', id },
        { type: 'OrderTimeline', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Dashboard' },
      ],
    }),
    
    // Dashboard statistics
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, { range?: string }>({
      query: (params = {}) => ({
        url: '/db/order/dashboard',
        params,
      }),
      providesTags: [{ type: 'Dashboard' }],
    }),
    
  }),
});

// Export hooks for use in components
export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useChangeOrderStatusMutation,
  useGetDashboardStatsQuery,
} = orderApi;
```

### **Custom Hook for Order Management**

```typescript
// hooks/useOrderManagement.ts
import { useState, useCallback } from 'react';
import { 
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useChangeOrderStatusMutation 
} from '@/lib/api/orderApi';
import type { OrderFilters, CreateOrderForm, StatusChangeRequest } from '@/lib/api/types';

export const useOrderManagement = () => {
  const [filters, setFilters] = useState<OrderFilters>({});
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  
  // API hooks
  const { data: ordersData, isLoading, error, refetch } = useGetOrdersQuery(filters);
  const [createOrder] = useCreateOrderMutation();
  const [updateOrder] = useUpdateOrderMutation();
  const [changeStatus] = useChangeOrderStatusMutation();
  
  // Filter management
  const updateFilters = useCallback((newFilters: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);
  
  // Order operations
  const createNewOrder = useCallback(async (orderData: CreateOrderForm) => {
    try {
      const result = await createOrder(orderData).unwrap();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error };
    }
  }, [createOrder]);
  
  const changeOrderStatus = useCallback(async (
    orderId: string, 
    statusData: StatusChangeRequest
  ) => {
    try {
      const result = await changeStatus({ id: orderId, data: statusData }).unwrap();
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, error };
    }
  }, [changeStatus]);
  
  return {
    // Data
    orders: ordersData?.data || [],
    pagination: ordersData?.pagination,
    filters,
    selectedOrders,
    
    // Loading states
    isLoading,
    error,
    
    // Actions
    updateFilters,
    clearFilters,
    setSelectedOrders,
    createNewOrder,
    changeOrderStatus,
    refetch,
  };
};
```

This provides TaskMaster with complete API integration for Xano backend. 