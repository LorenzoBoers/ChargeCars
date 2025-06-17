import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Button, 
  Tooltip, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Spinner
} from "@nextui-org/react";
import { 
  EyeIcon, 
  PencilIcon, 
  EllipsisVerticalIcon, 
  DocumentDuplicateIcon, 
  TrashIcon 
} from "@heroicons/react/24/outline";
import { OrderResponse } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/dateUtils';

export interface OrdersTableProps {
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
   * Callback when duplicate button is clicked
   */
  onDuplicateOrder?: (orderId: number | string) => void;
  
  /**
   * Callback when delete button is clicked
   */
  onDeleteOrder?: (orderId: number | string) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * OrdersTable component for displaying orders in a table format
 * 
 * @example
 * <OrdersTable 
 *   orders={filteredOrders} 
 *   loading={loading}
 *   error={error}
 *   onViewOrder={(id) => router.push(`/orders/${id}`)}
 *   onEditOrder={handleEditOrder}
 *   onDuplicateOrder={handleDuplicateOrder}
 *   onDeleteOrder={handleDeleteOrder}
 * />
 */
export const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  loading = false,
  error,
  emptyMessage = "Geen orders gevonden",
  onViewOrder,
  onEditOrder,
  onDuplicateOrder,
  onDeleteOrder,
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
        <p className="text-foreground-600 mb-2">{emptyMessage}</p>
        <p className="text-sm text-foreground-500">Pas je filters aan of voeg nieuwe orders toe</p>
      </div>
    );
  }
  
  return (
    <Table 
      aria-label="Orders table"
      classNames={{
        wrapper: "shadow-none rounded-none",
        th: "bg-content2/50 text-xs font-semibold",
        td: "text-xs"
      }}
      className={className}
    >
      <TableHeader>
        <TableColumn>ORDER</TableColumn>
        <TableColumn>KLANT & ACCOUNT</TableColumn>
        <TableColumn>PARTNER</TableColumn>
        <TableColumn>TYPE</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>BEDRAG</TableColumn>
        <TableColumn>DATUM</TableColumn>
        <TableColumn>ACTIES</TableColumn>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>
              <div>
                <p className="font-medium text-xs">{order.order_number}</p>
                {order.installation_date && (
                  <p className="text-xs text-foreground-500">
                    Installatie: {formatDate(order.installation_date)}
                  </p>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-xs">
                  {order.customer_name || 
                   (order.customer_first_name && order.customer_last_name 
                     ? `${order.customer_first_name} ${order.customer_last_name}` 
                     : 'Onbekende klant')}
                </span>
                {(order.account || order.business_entity) && (
                  <span className="text-xs text-foreground-400">
                    {order.account || order.business_entity}
                  </span>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              {order.partner_name ? (
                <span className="text-xs font-medium">{order.partner_name}</span>
              ) : (
                <span className="text-xs text-foreground-400">-</span>
              )}
            </TableCell>
            
            <TableCell>
              <span className="text-xs">{order.order_type}</span>
            </TableCell>
            
            <TableCell>
              <div className="flex flex-col gap-1">
                <StatusBadge 
                  statusColor={order.status || order.status_label || order.status_name || ''} 
                  label={order.status_label || order.status}
                />
                {order.status_since && formatRelativeTime(order.status_since) && (
                  <span className="text-xs text-foreground-400">
                    {formatRelativeTime(order.status_since)}
                  </span>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <span className="font-medium text-xs">{formatCurrency(order.amount)}</span>
            </TableCell>
            
            <TableCell>
              <span className="text-xs">{formatDate(order.created_at)}</span>
            </TableCell>
            
            <TableCell>
              <div className="flex items-center gap-1">
                <Tooltip content="Bekijken">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={() => onViewOrder?.(order.id)}
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
                    onPress={() => onEditOrder?.(order.id)}
                    className="h-6 w-6 min-w-6"
                  >
                    <PencilIcon className="h-3 w-3" />
                  </Button>
                </Tooltip>
                
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="h-6 w-6 min-w-6"
                    >
                      <EllipsisVerticalIcon className="h-3 w-3" />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu>
                    <DropdownItem
                      key="duplicate"
                      onPress={() => onDuplicateOrder?.(order.id)}
                      startContent={<DocumentDuplicateIcon className="h-3 w-3" />}
                      className="text-xs"
                    >
                      Dupliceren
                    </DropdownItem>
                    <DropdownItem
                      key="delete"
                      color="danger"
                      onPress={() => onDeleteOrder?.(order.id)}
                      startContent={<TrashIcon className="h-3 w-3" />}
                      className="text-xs"
                    >
                      Verwijderen
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default OrdersTable; 