/**
 * @fileoverview useCustomers Hook
 * 
 * This hook provides comprehensive customer management functionality for the ChargeCars application.
 * It includes data fetching, caching, state management, and CRUD operations for customers,
 * organizations, and partners.
 * 
 * Key Features:
 * - Automatic data loading with caching
 * - Real-time search and filtering
 * - Tab-based organization (All, Organizations, End Customers, Partners)
 * - Comprehensive error handling
 * - Performance optimizations with debouncing
 * - Metrics and dashboard statistics
 * 
 * @author ChargeCars Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApiClient, CustomerResponse, CustomerFilters, CustomerMetrics, ApiResponse } from '@/lib/api';

/**
 * Interface defining the return type of the useCustomers hook
 * 
 * @interface UseCustomersReturn
 */
export interface UseCustomersReturn {
  // Data state
  customers: CustomerResponse[];
  metrics: CustomerMetrics | null;
  loading: boolean;
  error: string | null;
  
  // Filters and search
  searchValue: string;
  setSearchValue: (value: string) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  filters: CustomerFilters;
  setFilters: (filters: Partial<CustomerFilters>) => void;
  
  // Pagination
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
  
  // Processed data
  filteredCustomers: CustomerResponse[];
  paginatedCustomers: CustomerResponse[];
  
  // Filter options
  statuses: string[];
  communicationPreferences: string[];
  parentOrganizations: string[];
  
  // Actions
  refreshCustomers: () => Promise<void>;
  createCustomer: (customerData: Partial<CustomerResponse>) => Promise<boolean>;
  updateCustomer: (id: string, customerData: Partial<CustomerResponse>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
  resetFilters: () => void;
  
  // Quick actions
  applyQuickFilter: (filterType: 'new_customers' | 'active_partners' | 'this_week') => void;
}

/**
 * Custom hook for comprehensive customer management
 * 
 * Provides a complete interface for managing customers, organizations, and partners
 * with built-in search, filtering, pagination, and CRUD operations.
 * 
 * @param initialFilters - Optional initial filters to apply
 * @returns UseCustomersReturn object with all customer management functionality
 * 
 * @example
 * ```typescript
 * function CustomersPage() {
 *   const {
 *     customers,
 *     loading,
 *     searchValue,
 *     setSearchValue,
 *     createCustomer,
 *     updateCustomer,
 *     deleteCustomer
 *   } = useCustomers();
 * 
 *   return (
 *     <div>
 *       <input 
 *         value={searchValue} 
 *         onChange={(e) => setSearchValue(e.target.value)} 
 *       />
 *       {customers.map(customer => (
 *         <CustomerCard key={customer.id} customer={customer} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCustomers(initialFilters: Partial<CustomerFilters> = {}): UseCustomersReturn {
  const apiClient = useApiClient();
  
  // State management
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [searchValue, setSearchValue] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFiltersState] = useState<CustomerFilters>({
    per_page: 25,
    ...initialFilters
  });
  
  // Debounced search to prevent excessive API calls
  const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchValue]);

  /**
   * Update filters with new values
   * 
   * @param newFilters - Partial filters to merge with existing filters
   */
  const setFilters = useCallback((newFilters: Partial<CustomerFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  /**
   * Derive filter options from current customer data
   */
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(customers.map(customer => customer.status).filter(Boolean))];
    return ['Alle', ...uniqueStatuses];
  }, [customers]);
  
  const communicationPreferences = useMemo(() => {
    const uniquePrefs = [...new Set(customers.map(customer => customer.preferred_communication).filter(Boolean))];
    return ['Alle', ...uniquePrefs];
  }, [customers]);
  
  const parentOrganizations = useMemo(() => {
    const uniqueOrgs = [...new Set(customers.map(customer => customer.parent_organization_name).filter(Boolean))];
    return ['Alle', ...uniqueOrgs];
  }, [customers]);

  /**
   * Filter customers based on active tab and current filters
   */
  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    
    // Filter by active tab
    switch (selectedTab) {
      case 'organizations':
        filtered = filtered.filter(customer => customer.contact_type === 'organization');
        break;
      case 'endcustomers':
        filtered = filtered.filter(customer => 
          customer.contact_type === 'person' && customer.contact_subtype === 'customer'
        );
        break;
      case 'partners':
        filtered = filtered.filter(customer => customer.contact_subtype === 'partner');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    // Apply search filter
    if (debouncedSearchValue) {
      const searchLower = debouncedSearchValue.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.display_name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.first_name?.toLowerCase().includes(searchLower) ||
        customer.last_name?.toLowerCase().includes(searchLower) ||
        customer.parent_organization_name?.toLowerCase().includes(searchLower) ||
        customer.phone?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply other filters
    if (filters.status && filters.status !== 'Alle') {
      filtered = filtered.filter(customer => customer.status === filters.status);
    }
    
    if (filters.communication_preference && filters.communication_preference !== 'Alle') {
      filtered = filtered.filter(customer => customer.preferred_communication === filters.communication_preference);
    }
    
    if (filters.parent_organization && filters.parent_organization !== 'Alle') {
      filtered = filtered.filter(customer => customer.parent_organization_name === filters.parent_organization);
    }
    
    return filtered;
  }, [customers, selectedTab, debouncedSearchValue, filters]);

  /**
   * Calculate pagination based on filtered customers
   */
  const pagination = useMemo(() => {
    const totalItems = filteredCustomers.length;
    const itemsPerPage = filters.per_page || 25;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    return {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage
    };
  }, [filteredCustomers.length, currentPage, filters.per_page]);

  /**
   * Get paginated customers for current page
   */
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pagination.itemsPerPage;
    const endIndex = startIndex + pagination.itemsPerPage;
    return filteredCustomers.slice(startIndex, endIndex);
  }, [filteredCustomers, currentPage, pagination.itemsPerPage]);

  /**
   * Load customers from API
   */
  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 CUSTOMERS: Loading customer data...');
      
      // Build API filters
      const apiFilters: CustomerFilters = {
        ...filters,
        search: debouncedSearchValue || undefined,
        page: 1, // Always load all data for client-side filtering
        per_page: 1000 // Get more data for better filtering
      };
      
      const [customersResponse, metricsResponse] = await Promise.all([
        apiClient.getCustomers(apiFilters),
        apiClient.getCustomerMetrics()
      ]);
      
      if (customersResponse.success) {
        setCustomers(customersResponse.data);
        console.log('📋 CUSTOMERS: Loaded', customersResponse.data.length, 'customers');
      } else {
        throw new Error(customersResponse.error?.message || 'Failed to load customers');
      }
      
      if (metricsResponse.success) {
        setMetrics(metricsResponse.data);
        console.log('📊 CUSTOMERS: Metrics loaded successfully');
      } else {
        console.warn('📊 CUSTOMERS: Failed to load metrics:', metricsResponse.error?.message);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load customers';
      setError(errorMessage);
      console.error('❌ CUSTOMERS: Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiClient, filters, debouncedSearchValue]);

  /**
   * Refresh customers data
   */
  const refreshCustomers = useCallback(async () => {
    await loadCustomers();
  }, [loadCustomers]);

  /**
   * Create a new customer
   * 
   * @param customerData - Customer data to create
   * @returns Promise<boolean> - Success status
   */
  const createCustomer = useCallback(async (customerData: Partial<CustomerResponse>): Promise<boolean> => {
    try {
      console.log('📋 CUSTOMERS: Creating customer...', customerData);
      
      const response = await apiClient.createCustomer(customerData);
      
      if (response.success) {
        console.log('✅ CUSTOMERS: Customer created successfully');
        await refreshCustomers(); // Reload data
        return true;
      } else {
        setError(response.error?.message || 'Failed to create customer');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create customer';
      setError(errorMessage);
      console.error('❌ CUSTOMERS: Create error:', err);
      return false;
    }
  }, [apiClient, refreshCustomers]);

  /**
   * Update an existing customer
   * 
   * @param id - Customer ID
   * @param customerData - Updated customer data
   * @returns Promise<boolean> - Success status
   */
  const updateCustomer = useCallback(async (id: string, customerData: Partial<CustomerResponse>): Promise<boolean> => {
    try {
      console.log('📋 CUSTOMERS: Updating customer:', id, customerData);
      
      const response = await apiClient.updateCustomer(id, customerData);
      
      if (response.success) {
        console.log('✅ CUSTOMERS: Customer updated successfully');
        await refreshCustomers(); // Reload data
        return true;
      } else {
        setError(response.error?.message || 'Failed to update customer');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update customer';
      setError(errorMessage);
      console.error('❌ CUSTOMERS: Update error:', err);
      return false;
    }
  }, [apiClient, refreshCustomers]);

  /**
   * Delete a customer
   * 
   * @param id - Customer ID to delete
   * @returns Promise<boolean> - Success status
   */
  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    try {
      console.log('🗑️ CUSTOMERS: Deleting customer:', id);
      
      const response = await apiClient.deleteCustomer(id);
      
      if (response.success) {
        console.log('✅ CUSTOMERS: Customer deleted successfully');
        await refreshCustomers(); // Reload data
        return true;
      } else {
        setError(response.error?.message || 'Failed to delete customer');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete customer';
      setError(errorMessage);
      console.error('❌ CUSTOMERS: Delete error:', err);
      return false;
    }
  }, [apiClient, refreshCustomers]);

  /**
   * Reset all filters to default values
   */
  const resetFilters = useCallback(() => {
    setSearchValue('');
    setSelectedTab('all');
    setCurrentPage(1);
    setFiltersState({
      per_page: 25,
      ...initialFilters
    });
  }, [initialFilters]);

  /**
   * Apply quick filter presets
   * 
   * @param filterType - Type of quick filter to apply
   */
  const applyQuickFilter = useCallback((filterType: 'new_customers' | 'active_partners' | 'this_week') => {
    switch (filterType) {
      case 'new_customers':
        setSelectedTab('all');
        setFilters({ status: 'prospect' });
        break;
      case 'active_partners':
        setSelectedTab('partners');
        setFilters({ status: 'active' });
        break;
      case 'this_week':
        // Filter customers created this week
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        // This would need to be implemented based on API capabilities
        console.log('Filter: This week - customers since', new Date(oneWeekAgo));
        break;
    }
  }, [setFilters]);

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Return the complete hook interface
  return {
    // Data state
    customers,
    metrics,
    loading,
    error,
    
    // Filters and search
    searchValue,
    setSearchValue,
    selectedTab,
    setSelectedTab,
    filters,
    setFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    pagination,
    
    // Processed data
    filteredCustomers,
    paginatedCustomers,
    
    // Filter options
    statuses,
    communicationPreferences,
    parentOrganizations,
    
    // Actions
    refreshCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    resetFilters,
    
    // Quick actions
    applyQuickFilter
  };
} 