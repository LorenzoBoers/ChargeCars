import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Input, 
  Select, 
  SelectItem, 
  Button, 
  Divider 
} from "@nextui-org/react";
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowPathIcon 
} from "@heroicons/react/24/outline";

export interface FilterPreset {
  label: string;
  action: () => void;
}

export interface OrderFiltersProps {
  /**
   * Current search value
   */
  searchValue: string;
  
  /**
   * Search value change handler
   */
  onSearchChange: (value: string) => void;
  
  /**
   * Current selected business entity
   */
  selectedBusinessEntity: string;
  
  /**
   * Business entity change handler
   */
  onBusinessEntityChange: (value: string) => void;
  
  /**
   * List of available business entities
   */
  businessEntities: string[];
  
  /**
   * Current selected order type
   */
  selectedOrderType: string;
  
  /**
   * Order type change handler
   */
  onOrderTypeChange: (value: string) => void;
  
  /**
   * List of available order types
   */
  orderTypes: string[];
  
  /**
   * Current selected status
   */
  selectedStatus: string;
  
  /**
   * Status change handler
   */
  onStatusChange: (value: string) => void;
  
  /**
   * List of available statuses
   */
  statuses: string[];
  
  /**
   * Reset filters handler
   */
  onResetFilters: () => void;
  
  /**
   * Refresh handler
   */
  onRefresh?: () => void;
  
  /**
   * List of filter presets
   */
  presetFilters?: FilterPreset[];
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * OrderFilters component for filtering orders
 * 
 * @example
 * <OrderFilters 
 *   searchValue={searchValue}
 *   onSearchChange={setSearchValue}
 *   selectedBusinessEntity={selectedBusinessEntity}
 *   onBusinessEntityChange={setSelectedBusinessEntity}
 *   businessEntities={businessEntities}
 *   selectedOrderType={selectedOrderType}
 *   onOrderTypeChange={setSelectedOrderType}
 *   orderTypes={orderTypes}
 *   selectedStatus={selectedStatus}
 *   onStatusChange={setSelectedStatus}
 *   statuses={statuses}
 *   onResetFilters={handleResetFilters}
 *   onRefresh={refreshOrders}
 *   loading={loading}
 * />
 */
export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchValue,
  onSearchChange,
  selectedBusinessEntity,
  onBusinessEntityChange,
  businessEntities,
  selectedOrderType,
  onOrderTypeChange,
  orderTypes,
  selectedStatus,
  onStatusChange,
  statuses,
  onResetFilters,
  onRefresh,
  presetFilters,
  loading = false,
  className = "",
}) => {
  return (
    <div className={className}>
      {/* Quick Filter Presets */}
      {presetFilters && presetFilters.length > 0 && (
        <Card className="mb-4">
          <CardBody className="p-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-foreground-600">Quick Filters:</span>
              {presetFilters.map((filter, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="flat"
                  className="h-6 text-xs"
                  onPress={filter.action}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Main Filters */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-foreground-600" />
            <h3 className="text-base font-semibold">Filters</h3>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <Input
              placeholder="Zoek orders..."
              value={searchValue}
              onValueChange={onSearchChange}
              startContent={<MagnifyingGlassIcon className="h-4 w-4 text-foreground-500" />}
              size="sm"
              className="lg:col-span-2"
            />
            
            <Select
              placeholder="Business Entity"
              selectedKeys={[selectedBusinessEntity]}
              onSelectionChange={(keys) => onBusinessEntityChange(Array.from(keys)[0] as string)}
              size="sm"
            >
              {businessEntities.map((entity) => (
                <SelectItem key={entity} value={entity}>
                  {entity}
                </SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Order Type"
              selectedKeys={[selectedOrderType]}
              onSelectionChange={(keys) => onOrderTypeChange(Array.from(keys)[0] as string)}
              size="sm"
            >
              {orderTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </Select>

            <Select
              placeholder="Status"
              selectedKeys={[selectedStatus]}
              onSelectionChange={(keys) => onStatusChange(Array.from(keys)[0] as string)}
              size="sm"
            >
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </Select>
          </div>
          
          <Divider className="my-3" />
          
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="bordered"
              onPress={onResetFilters}
            >
              Reset Filters
            </Button>
            
            {onRefresh && (
              <Button
                size="sm"
                variant="bordered"
                startContent={<ArrowPathIcon className="h-4 w-4" />}
                onPress={onRefresh}
                isLoading={loading}
              >
                Vernieuwen
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OrderFilters; 