import React from 'react';
import { OrderResponse } from '@/types';
import OrderCard from './OrderCard';
import { Spinner } from '@nextui-org/react';

export interface OrderGridProps {
  /**
   * Array of orders to display
   */
  orders: OrderResponse[];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Error message
   */
  error?: string;
  
  /**
   * Empty state message
   */
  emptyMessage?: string;
  
  /**
   * Callback when view button is clicked
   */
  onViewOrder?: (orderId: number | string) => void;
  
  /**
   * Callback when edit button is clicked
   */
  onEditOrder?: (orderId: number | string) => void;
  
  /**
   * Callback when more options button is clicked
   */
  onMoreOptions?: (orderId: number | string) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * OrderGrid component for displaying orders in a responsive grid layout
 * 
 * @example
 * <OrderGrid 
 *   orders={orderData} 
 *   loading={isLoading}
 *   error={errorMessage}
 *   onViewOrder={(id) => router.push(`/orders/${id}`)} 
 * />
 */
export const OrderGrid: React.FC<OrderGridProps> = ({
  orders,
  loading = false,
  error,
  emptyMessage = "Geen orders gevonden",
  onViewOrder,
  onEditOrder,
  onMoreOptions,
  className = "",
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center p-8 text-danger">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!orders || orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-foreground-600">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onView={onViewOrder}
          onEdit={onEditOrder}
          onMoreOptions={onMoreOptions}
        />
      ))}
    </div>
  );
};

export default OrderGrid; 