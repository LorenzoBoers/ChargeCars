import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient, OrderResponse, OrderFilters, DashboardStats, handleApiError } from '../lib/api';

export interface UseOrdersReturn {
  orders: OrderResponse[];
  filteredOrders: OrderResponse[];
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  // Filter methods
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedBusinessEntity: string;
  setSelectedBusinessEntity: (value: string) => void;
  selectedOrderType: string;
  setSelectedOrderType: (value: string) => void;
  selectedStatus: string;
  setSelectedStatus: (value: string) => void;
  selectedPriority: string;
  setSelectedPriority: (value: string) => void;
  // Actions
  refreshOrders: () => Promise<void>;
  createOrder: (orderData: Partial<OrderResponse>) => Promise<boolean>;
  updateOrder: (id: string, orderData: Partial<OrderResponse>) => Promise<boolean>;
  deleteOrder: (id: string) => Promise<boolean>;
  // Page navigation
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
}

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

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Check if API client has a token
    console.log('📋 ORDERS: Fetching orders with token:', !!apiClient.getToken());

    try {
      const filters: OrderFilters = {
        search: searchValue || undefined,
        business_entity: selectedBusinessEntity !== 'Alle' ? selectedBusinessEntity : undefined,
        order_type: selectedOrderType !== 'Alle' ? selectedOrderType : undefined,
        status: selectedStatus !== 'Alle' ? selectedStatus : undefined,
        priority: selectedPriority !== 'Alle' ? selectedPriority : undefined,
        page: currentPage,
        per_page: itemsPerPage,
      };

      const response = await apiClient.getOrders(filters);

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

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await apiClient.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchOrders();
    fetchDashboardStats();
  }, [fetchOrders, fetchDashboardStats]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1); // Reset to first page when searching
      } else {
        fetchOrders();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Fetch when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1); // Reset to first page when filtering
    } else {
      fetchOrders();
    }
  }, [selectedBusinessEntity, selectedOrderType, selectedStatus, selectedPriority]);

  // Fetch when page changes
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  // Client-side filtering for immediate feedback (fallback if API doesn't support full filtering)
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchValue && !filtered.some(order => 
      order.order_number.toLowerCase().includes(searchValue.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchValue.toLowerCase())
    )) {
      // If API doesn't return filtered results, do client-side filtering
      filtered = orders.filter(order =>
        order.order_number.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchValue.toLowerCase()) ||
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

  // CRUD operations
  const createOrder = useCallback(async (orderData: Partial<OrderResponse>): Promise<boolean> => {
    try {
      const response = await apiClient.createOrder(orderData);
      if (response.success) {
        await fetchOrders(); // Refresh list
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [fetchOrders]);

  const updateOrder = useCallback(async (id: string, orderData: Partial<OrderResponse>): Promise<boolean> => {
    try {
      const response = await apiClient.updateOrder(id, orderData);
      if (response.success) {
        await fetchOrders(); // Refresh list
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [fetchOrders]);

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await apiClient.deleteOrder(id);
      if (response.success) {
        await fetchOrders(); // Refresh list
        return true;
      } else {
        setError(handleApiError(response));
        return false;
      }
    } catch (err) {
      setError(handleApiError(err));
      return false;
    }
  }, [fetchOrders]);

  const refreshOrders = useCallback(async () => {
    await fetchOrders();
    await fetchDashboardStats();
  }, [fetchOrders, fetchDashboardStats]);

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