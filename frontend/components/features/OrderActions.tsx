import React from 'react';
import { Button } from "@nextui-org/react";
import { 
  PlusIcon, 
  ArrowPathIcon, 
  DocumentArrowDownIcon 
} from "@heroicons/react/24/outline";

export interface OrderActionsProps {
  /**
   * Callback when create button is clicked
   */
  onCreateOrder?: () => void;
  
  /**
   * Callback when refresh button is clicked
   */
  onRefresh?: () => void;
  
  /**
   * Callback when export button is clicked
   */
  onExport?: () => void;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Show create button
   */
  showCreate?: boolean;
  
  /**
   * Show refresh button
   */
  showRefresh?: boolean;
  
  /**
   * Show export button
   */
  showExport?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * OrderActions component for providing action buttons for orders
 * 
 * @example
 * <OrderActions 
 *   onCreateOrder={() => router.push('/orders/create')}
 *   onRefresh={refreshOrders}
 *   onExport={exportOrders}
 *   loading={loading}
 * />
 */
export const OrderActions: React.FC<OrderActionsProps> = ({
  onCreateOrder,
  onRefresh,
  onExport,
  loading = false,
  showCreate = true,
  showRefresh = true,
  showExport = true,
  className = "",
}) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {showRefresh && onRefresh && (
        <Button
          color="default"
          variant="bordered"
          size="sm"
          startContent={<ArrowPathIcon className="h-4 w-4" />}
          onPress={onRefresh}
          isLoading={loading}
        >
          Vernieuwen
        </Button>
      )}
      
      {showExport && onExport && (
        <Button
          color="default"
          variant="bordered"
          size="sm"
          startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
          onPress={onExport}
        >
          Export
        </Button>
      )}
      
      {showCreate && onCreateOrder && (
        <Button
          color="primary"
          size="sm"
          startContent={<PlusIcon className="h-4 w-4" />}
          onPress={onCreateOrder}
        >
          Nieuwe Order
        </Button>
      )}
    </div>
  );
};

export default OrderActions; 