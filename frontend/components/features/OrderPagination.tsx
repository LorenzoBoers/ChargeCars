import React from 'react';
import { Pagination, Select, SelectItem } from "@nextui-org/react";
import { PaginationInfo } from '@/types';

export interface OrderPaginationProps {
  /**
   * Pagination information
   */
  pagination: PaginationInfo;
  
  /**
   * Current page
   */
  currentPage: number;
  
  /**
   * Page change handler
   */
  onPageChange: (page: number) => void;
  
  /**
   * Items per page
   */
  perPage?: number;
  
  /**
   * Items per page change handler
   */
  onPerPageChange?: (perPage: number) => void;
  
  /**
   * Available items per page options
   */
  perPageOptions?: number[];
  
  /**
   * Show total items count
   */
  showTotalItems?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * OrderPagination component for handling pagination for orders
 * 
 * @example
 * <OrderPagination 
 *   pagination={pagination}
 *   currentPage={currentPage}
 *   onPageChange={setCurrentPage}
 *   perPage={perPage}
 *   onPerPageChange={setPerPage}
 * />
 */
export const OrderPagination: React.FC<OrderPaginationProps> = ({
  pagination,
  currentPage,
  onPageChange,
  perPage,
  onPerPageChange,
  perPageOptions = [10, 25, 50, 100],
  showTotalItems = true,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${className}`}>
      {showTotalItems && (
        <p className="text-xs text-foreground-500">
          {pagination.total_items} resultaten gevonden
        </p>
      )}
      
      <div className="flex items-center gap-4">
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-500">Toon:</span>
            <Select
              size="sm"
              className="w-20"
              selectedKeys={[perPage?.toString() || "10"]}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                onPerPageChange(parseInt(selected, 10));
              }}
            >
              {perPageOptions.map((option) => (
                <SelectItem key={option.toString()} value={option}>
                  {option}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}
        
        <Pagination
          total={pagination.total_pages}
          page={currentPage}
          onChange={onPageChange}
          size="sm"
          showControls
          className="gap-2"
        />
      </div>
    </div>
  );
};

export default OrderPagination; 