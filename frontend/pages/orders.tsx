import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import {
  Card,
  CardBody
} from "@nextui-org/react";
import { AppLayout } from '../components/layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useOrders } from '../hooks/useOrders';
import StatusBadge from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/dateUtils';
import {
  OrdersTable,
  OrderGrid,
  OrderFilters,
  OrderViewToggle,
  OrderActions,
  OrderPagination,
  DashboardStats,
  ViewMode,
  CreateOrderModal
} from '@/components/features';
import { DashboardStats as DashboardStatsType, PaginationInfo } from '@/types';

const businessEntities = ['Alle', 'ChargeCars', 'LaderThuis', 'MeterKastThuis', 'Zaptec Shop', 'Ratio Shop'];
const orderTypes = ['Alle', 'Installatie', 'Onderhoud', 'Offerte', 'Reparatie'];
const statuses = ['Alle', 'Nieuw', 'In behandeling', 'Wachten op klant', 'Gepland', 'In uitvoering', 'Voltooid', 'Geannuleerd'];

// Default dashboard stats to avoid null values
const defaultDashboardStats: DashboardStatsType = {
  total_revenue: 0,
  active_orders: 0,
  completed_orders: 0,
  pending_orders: 0,
  revenue_change: 0,
  orders_change: 0
};

// Convert pagination format from API to component format
const convertPagination = (apiPagination: any): PaginationInfo => {
  return {
    current_page: apiPagination.currentPage || 1,
    total_pages: apiPagination.totalPages || 1,
    per_page: apiPagination.itemsPerPage || 10,
    total_items: apiPagination.totalItems || 0,
    has_more_items: apiPagination.currentPage < apiPagination.totalPages
  };
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Use the dynamic orders hook
  const {
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
  } = useOrders();

  // Preset filters
  const presetFilters = [
    {
      label: 'Mijn Orders',
      action: () => {
        // Filter by current user - placeholder logic
        setSelectedStatus('Alle');
        setSelectedBusinessEntity('Alle');
        setSelectedOrderType('Alle');
        setSearchValue('');
      }
    },
    {
      label: 'Urgent',
      action: () => {
        setSelectedStatus('In behandeling');
        setSelectedBusinessEntity('Alle');
        setSelectedOrderType('Alle');
        setSearchValue('');
      }
    },
    {
      label: 'Deze Week',
      action: () => {
        setSelectedStatus('Alle');
        setSelectedBusinessEntity('Alle');
        setSelectedOrderType('Installatie');
        setSearchValue('');
      }
    },
    {
      label: 'Reset Filters',
      action: () => {
        setSearchValue('');
        setSelectedBusinessEntity('Alle');
        setSelectedOrderType('Alle');
        setSelectedStatus('Alle');
      }
    }
  ];

  const handleViewOrder = (orderId: number | string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: number | string) => {
    // Navigate to edit page
    router.push(`/orders/edit/${orderId}`);
  };

  const handleCreateOrder = () => {
    setShowCreateModal(true);
  };

  const handleOrderCreated = (order: any) => {
    console.log('Order created:', order);
    // Additional handling can be added here
  };

  const handleDuplicateOrder = (orderId: number | string) => {
    // Duplicate order logic
    console.log('Duplicate order:', orderId);
  };

  const handleDeleteOrder = (orderId: number | string) => {
    // Delete order logic
    console.log('Delete order:', orderId);
  };

  const handleExportOrders = () => {
    // Export orders logic
    console.log('Export orders');
  };

  // Convert pagination to the format expected by the OrderPagination component
  const paginationInfo: PaginationInfo = useMemo(() => {
    return convertPagination(pagination);
  }, [pagination]);

  return (
    <>
      <Head>
        <title>Orders - ChargeCars Portal</title>
        <meta name="description" content="Beheer en bekijk alle laadpaal orders" />
      </Head>

      <AppLayout>
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Order Management</h1>
              <p className="text-sm text-foreground-600">Beheer en volg alle laadpaal orders</p>
              {error && (
                <p className="text-sm text-danger-500 mt-1">
                  {error}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <OrderViewToggle 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
              
              <OrderActions 
                onCreateOrder={handleCreateOrder}
                onRefresh={refreshOrders}
                onExport={handleExportOrders}
                loading={loading}
              />
            </div>
          </div>

          {/* Dashboard Stats */}
          <DashboardStats stats={dashboardStats || defaultDashboardStats} loading={loading} />

          {/* Filters */}
          <OrderFilters
            searchValue={searchValue || ''}
            onSearchChange={setSearchValue}
            selectedBusinessEntity={selectedBusinessEntity || ''}
            onBusinessEntityChange={setSelectedBusinessEntity}
            businessEntities={businessEntities}
            selectedOrderType={selectedOrderType || ''}
            onOrderTypeChange={setSelectedOrderType}
            orderTypes={orderTypes}
            selectedStatus={selectedStatus || ''}
            onStatusChange={setSelectedStatus}
            statuses={statuses}
            onResetFilters={presetFilters[3].action}
            onRefresh={refreshOrders}
            presetFilters={presetFilters}
            loading={loading}
          />

          {/* Orders View (Table or Grid) */}
          <Card>
            <CardBody className="p-0">
              {viewMode === 'table' ? (
                <OrdersTable
                  orders={filteredOrders}
                  loading={loading}
                  error={error || undefined}
                  onViewOrder={handleViewOrder}
                  onEditOrder={handleEditOrder}
                  onDuplicateOrder={handleDuplicateOrder}
                  onDeleteOrder={handleDeleteOrder}
                />
              ) : (
                <OrderGrid
                  orders={filteredOrders}
                  loading={loading}
                  error={error || undefined}
                  onViewOrder={handleViewOrder}
                  onEditOrder={handleEditOrder}
                  onMoreOptions={handleDuplicateOrder}
                  className="p-4"
                />
              )}
            </CardBody>
          </Card>

          {/* Pagination */}
          <OrderPagination
            pagination={paginationInfo}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Create Order Modal */}
        <CreateOrderModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onOrderCreated={handleOrderCreated}
          onRefreshOrders={refreshOrders}
        />
      </AppLayout>
    </>
  );
} 