import React from 'react';
import { Button, ButtonGroup } from "@nextui-org/react";
import { TableCellsIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

export type ViewMode = 'table' | 'grid';

export interface OrderViewToggleProps {
  /**
   * Current view mode
   */
  viewMode: ViewMode;
  
  /**
   * View mode change handler
   */
  onViewModeChange: (mode: ViewMode) => void;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * OrderViewToggle component for switching between table and grid views
 * 
 * @example
 * <OrderViewToggle 
 *   viewMode={viewMode}
 *   onViewModeChange={setViewMode}
 * />
 */
export const OrderViewToggle: React.FC<OrderViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  className = "",
}) => {
  return (
    <ButtonGroup className={className} variant="flat" size="sm">
      <Button
        isIconOnly
        onPress={() => onViewModeChange('table')}
        color={viewMode === 'table' ? 'primary' : 'default'}
      >
        <TableCellsIcon className="h-4 w-4" />
      </Button>
      <Button
        isIconOnly
        onPress={() => onViewModeChange('grid')}
        color={viewMode === 'grid' ? 'primary' : 'default'}
      >
        <Squares2X2Icon className="h-4 w-4" />
      </Button>
    </ButtonGroup>
  );
};

export default OrderViewToggle; 