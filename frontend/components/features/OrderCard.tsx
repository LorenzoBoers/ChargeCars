import React from 'react';
import { Card, CardBody, Button, Tooltip } from "@nextui-org/react";
import { EyeIcon, PencilIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import StatusBadge from '@/components/ui/StatusBadge';
import { OrderResponse } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';

export interface OrderCardProps {
  /**
   * Order data to display
   */
  order: OrderResponse;
  
  /**
   * Callback when view button is clicked
   */
  onView?: (orderId: number | string) => void;
  
  /**
   * Callback when edit button is clicked
   */
  onEdit?: (orderId: number | string) => void;
  
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
 * OrderCard component for displaying order information in a card format
 * 
 * @example
 * <OrderCard 
 *   order={orderData} 
 *   onView={(id) => router.push(`/orders/${id}`)} 
 * />
 */
export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onView,
  onEdit,
  onMoreOptions,
  className = "",
}) => {
  const handleView = () => onView?.(order.id);
  const handleEdit = () => onEdit?.(order.id);
  const handleMoreOptions = () => onMoreOptions?.(order.id);
  
  // Format customer name from available fields
  const customerName = order.customer_name || 
    (order.customer_first_name && order.customer_last_name 
      ? `${order.customer_first_name} ${order.customer_last_name}` 
      : 'Onbekende klant');
  
  return (
    <Card className={`w-full ${className}`} shadow="sm">
      <CardBody className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold">{order.order_number}</p>
              <StatusBadge 
                statusColor={order.status || order.status_label || order.status_name || ''} 
                size="sm"
              />
            </div>
            <p className="text-xs text-foreground-600 mb-2">{order.order_type}</p>
          </div>
          <div className="text-sm font-medium">
            {formatCurrency(order.amount)}
          </div>
        </div>
        
        <div className="mb-2">
          <p className="text-xs font-medium">{customerName}</p>
          {(order.account || order.business_entity) && (
            <p className="text-xs text-foreground-500">{order.account || order.business_entity}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-foreground-500">
            {formatDate(order.created_at)}
          </div>
          
          <div className="flex items-center gap-1">
            <Tooltip content="Bekijken">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleView}
                className="h-6 w-6 min-w-6"
              >
                <EyeIcon className="h-3 w-3" />
              </Button>
            </Tooltip>
            
            <Tooltip content="Bewerken">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleEdit}
                className="h-6 w-6 min-w-6"
              >
                <PencilIcon className="h-3 w-3" />
              </Button>
            </Tooltip>
            
            <Tooltip content="Meer opties">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={handleMoreOptions}
                className="h-6 w-6 min-w-6"
              >
                <EllipsisVerticalIcon className="h-3 w-3" />
              </Button>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default OrderCard; 