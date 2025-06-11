/**
 * @fileoverview Orders Hook for ChargeCars
 * 
 * React hook for managing orders data with filtering, pagination, and CRUD operations.
 * Provides a comprehensive interface for order management throughout the application.
 * 
 * Features:
 * - Real-time filtering with debounced search
 * - Paginated data fetching
 * - CRUD operations (create, read, update, delete)
 * - Dashboard statistics
 * - Automatic error handling and loading states
 * - Client-side filtering fallback
 * 
 * @author ChargeCars Development Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, OrderResponse, OrderFilters, DashboardStats, handleApiError } from '../lib/api';

/**
 * Return type for the useOrders hook
 * 
 * Provides comprehensive order management functionality including
 * data, loading states, filters, pagination, and CRUD operations.
 * 
 * @example
 * ```typescript
 * const {
 *   orders,
 *   loading,
 *   searchValue,
 *   setSearchValue,
 *   createOrder,
 *   refreshOrders
 * } = useOrders({ status: 'active' });
 * ```
 */
export interface UseOrdersReturn {
  /** Raw orders data from API */
  orders: OrderResponse[];
  /** Filtered orders (client-side filtering if needed) */
  filteredOrders: OrderResponse[];
  /** Dashboard statistics data */
  dashboardStats: DashboardStats | null;
  /** Loading state for data fetching */
  loading: boolean;
  /** Error message if any operation fails */
  error: string | null;
  /** Pagination information */
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  
  // Filter methods
  /** Current search query value */
  searchValue: string;
  /** Update search query (debounced) */
  setSearchValue: (value: string) => void;
  /** Currently selected business entity filter */
  selectedBusinessEntity: string;
  /** Update business entity filter */
  setSelectedBusinessEntity: (value: string) => void;
  /** Currently selected order type filter */
  selectedOrderType: string;
  /** Update order type filter */
  setSelectedOrderType: (value: string) => void;
  /** Currently selected status filter */
  selectedStatus: string;
  /** Update status filter */
  setSelectedStatus: (value: string) => void;
  /** Currently selected priority filter */
  selectedPriority: string;
  /** Update priority filter */
  setSelectedPriority: (value: string) => void;
  
  // Actions
  /** Manually refresh orders data */
  refreshOrders: () => Promise<void>;
  /** Create a new order */
  createOrder: (orderData: Partial<OrderResponse>) => Promise<boolean>;
  /** Update an existing order */
  updateOrder: (id: string, orderData: Partial<OrderResponse>) => Promise<boolean>;
  /** Delete an order */
  deleteOrder: (id: string) => Promise<boolean>;
  
  // Page navigation
  /** Current page number */
  currentPage: number;
  /** Navigate to a specific page */
  setCurrentPage: (page: number) => void;
  /** Items per page setting */
  itemsPerPage: number;
  /** Update items per page */
  setItemsPerPage: (items: number) => void;
}

/**
 * Orders management hook
 * 
 * Comprehensive hook for managing orders data throughout the ChargeCars application.
 * Handles fetching, filtering, pagination, and CRUD operations with automatic
 * error handling and loading states.
 * 
 * @param initialFilters - Optional initial filter values
 * @returns Complete orders management interface
 * 
 * @example
 * ```typescript
 * // Basic usage
 * const { orders, loading, error } = useOrders();
 * 
 * // With initial filters
 * const { orders, filteredOrders } = useOrders({
 *   status: 'active',
 *   search: 'Tesla',
 *   page: 1,
 *   per_page: 20
 * });
 * 
 * // With actions
 * const { createOrder, updateOrder, deleteOrder } = useOrders();
 * await createOrder({ customer_name: 'New Customer' });
 * ```
 */
export const useOrders = (initialFilters?: OrderFilters): UseOrdersReturn => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchValue, setSearchValue] = useState(initialFilters?.search || '');
  const [selectedBusinessEntity, setSelectedBusinessEntity] = useState(initialFilters?.business_entity || 'Alle');
  const [selectedOrderType, setSelectedOrderType] = useState(initialFilters?.order_type || 'Alle');
  const [selectedStatus, setSelectedStatus] = useState(initialFilters?.status || 'Alle');
  const [selectedPriority, setSelectedPriority] = useState(initialFilters?.priority || 'Alle');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(initialFilters?.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState(initialFilters?.per_page || 10);
  const [totalItems, setTotalItems] = useState(0);



  // Single unified effect for all data fetching to prevent multiple calls
  useEffect(() => {
    let isActive = true; // Prevent race conditions
    
    const fetchData = async () => {
      if (!isActive) return;
      
      setLoading(true);
      setError(null);
      console.log('📋 ORDERS: Unified fetch triggered');

      try {
        // Fetch orders data
        const ordersResponse = await apiClient.getOrders({
          search: searchValue || undefined,
          business_entity: selectedBusinessEntity !== 'Alle' ? selectedBusinessEntity : undefined,
          order_type: selectedOrderType !== 'Alle' ? selectedOrderType : undefined,
          status: selectedStatus !== 'Alle' ? selectedStatus : undefined,
          priority: selectedPriority !== 'Alle' ? selectedPriority : undefined,
          page: currentPage,
          per_page: itemsPerPage,
        });

        if (!isActive) return; // Component unmounted during request
        
        // Handle orders response
        if (ordersResponse.success) {
          setOrders(ordersResponse.data);
          if (ordersResponse.pagination) {
            setTotalItems(ordersResponse.pagination.total_items);
          }
        } else {
          console.error('📋 ORDERS: Failed to fetch orders:', ordersResponse.error);
          setError('Failed to fetch orders');
          setOrders([]);
        }

      } catch (err) {
        if (!isActive) return;
        console.error('📋 ORDERS: Fetch error:', err);
        setError(handleApiError(err));
        setOrders([]);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    // Debounce search input
    const timer = setTimeout(() => {
      fetchData();
    }, searchValue ? 300 : 0); // Only debounce if there's a search value

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [searchValue, selectedBusinessEntity, selectedOrderType, selectedStatus, selectedPriority, currentPage, itemsPerPage]);

  // Separate effect for page reset when filters change (to prevent double fetch)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchValue, selectedBusinessEntity, selectedOrderType, selectedStatus, selectedPriority]);

  // Fetch dashboard stats only once on initial load
  useEffect(() => {
    let isActive = true;

    const fetchDashboardStats = async () => {
      try {
        console.log('📊 DASHBOARD: Fetching stats (one-time)');
        const response = await apiClient.getDashboardStats();
        if (isActive && response.success) {
          setDashboardStats(response.data);
        } else if (isActive) {
          console.warn('📊 DASHBOARD: Stats not available');
          setDashboardStats(null);
        }
      } catch (err) {
        if (isActive) {
          console.warn('📊 DASHBOARD: Failed to fetch stats:', err);
          setDashboardStats(null);
        }
      }
    };

    fetchDashboardStats();

    return () => {
      isActive = false;
    };
  }, []); // Empty dependency array = run only once

  // Client-side filtering for immediate feedback (fallback if API doesn't support full filtering)
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchValue && !filtered.some(order => 
      order.order_number.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchValue.toLowerCase())
    )) {
      // If API doesn't return filtered results, do client-side filtering
      filtered = orders.filter(order =>
        order.order_number.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.partner_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return filtered;
  }, [orders, searchValue]);

  // Calculate pagination
  const pagination = useMemo(() => ({
    currentPage,
    totalPages: Math.ceil(totalItems / itemsPerPage),
    totalItems,
    itemsPerPage,
  }), [currentPage, totalItems, itemsPerPage]);

  // Manual refresh function for CRUD operations
  const refreshOrders = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getOrders({
        search: searchValue || undefined,
        business_entity: selectedBusinessEntity !== 'Alle' ? selectedBusinessEntity : undefined,
        order_type: selectedOrderType !== 'Alle' ? selectedOrderType : undefined,
        status: selectedStatus !== 'Alle' ? selectedStatus : undefined,
        priority: selectedPriority !== 'Alle' ? selectedPriority : undefined,
        page: currentPage,
        per_page: itemsPerPage,
      });

      if (response.success) {
        setOrders(response.data);
        if (response.pagination) {
          setTotalItems(response.pagination.total_items);
        }
      } else {
        setError(handleApiError(response));
        setOrders([]);
      }
    } catch (err) {
      setError(handleApiError(err));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [searchValue, selectedBusinessEntity, selectedOrderType, selectedStatus, selectedPriority, currentPage, itemsPerPage]);

  // CRUD operations
  const createOrder = useCallback(async (orderData: Partial<OrderResponse>): Promise<boolean> => {
    try {
      const response = await apiClient.createOrder(orderData);
      if (response.success) {
        await refreshOrders(); // Refresh list
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [refreshOrders]);

  const updateOrder = useCallback(async (id: string, orderData: Partial<OrderResponse>): Promise<boolean> => {
    try {
      const response = await apiClient.updateOrder(id, orderData);
      if (response.success) {
        await refreshOrders(); // Refresh list
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [refreshOrders]);

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.deleteOrder(id);
      if (response.success) {
        await refreshOrders(); // Refresh list
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [refreshOrders]);



  return {
    orders,
    filteredOrders,
    dashboardStats,
    loading,
    error,
    pagination,
    searchValue,
    setSearchValue,
    selectedBusinessEntity,
    setSelectedBusinessEntity,
    selectedOrderType,
    setSelectedOrderType,
    selectedStatus,
    setSelectedStatus,
    selectedPriority,
    setSelectedPriority,
    refreshOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
  };
}; 