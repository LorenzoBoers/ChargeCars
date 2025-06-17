import React from 'react';
import { Card, CardHeader, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";
import { formatCurrency, formatNumber } from '@/lib/utils/dateUtils';

export interface Partner {
  name: string;
  totalRevenue: number;
  orderCount: number;
  growthPercentage?: number;
  orderGrowthPercentage?: number;
  avgOrderValue?: number;
}

export interface TopPartnersProps {
  /**
   * Partners sorted by revenue
   */
  partnersByRevenue: Partner[];
  
  /**
   * Partners sorted by order count
   */
  partnersByOrderCount?: Partner[];
  
  /**
   * Maximum number of partners to display
   * @default 5
   */
  limit?: number;
  
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * TopPartners component for displaying top partners by revenue and order count
 * 
 * @example
 * <TopPartners 
 *   partnersByRevenue={topPartnersByRevenue}
 *   partnersByOrderCount={topPartnersByOrderCount}
 *   limit={4}
 * />
 */
export const TopPartners: React.FC<TopPartnersProps> = ({
  partnersByRevenue,
  partnersByOrderCount,
  limit = 5,
  className = "",
}) => {
  // If partnersByOrderCount is not provided, use partnersByRevenue sorted by orderCount
  const orderCountPartners = partnersByOrderCount || 
    [...partnersByRevenue]
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, limit);
  
  // Limit the number of partners to display
  const revenuePartners = partnersByRevenue.slice(0, limit);
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Top Partners by Revenue */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
          <p className="text-sm font-medium text-foreground-600">Top Partners op Omzet</p>
        </CardHeader>
        <CardBody className="overflow-hidden">
          <Table 
            removeWrapper 
            hideHeader 
            aria-label="Top partners by revenue"
            className="min-w-full"
          >
            <TableHeader>
              <TableColumn>Partner</TableColumn>
            </TableHeader>
            <TableBody>
              {revenuePartners.map((partner, index) => (
                <TableRow key={index} className="h-10">
                  <TableCell className="py-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{partner.name}</span>
                      <span className="text-xs font-medium">
                        {formatCurrency(partner.totalRevenue)}
                      </span>
                    </div>
                    <div className="w-full bg-content3 rounded-full h-1 mt-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
                        style={{ width: `${Math.min(100, (partner.totalRevenue / revenuePartners[0].totalRevenue) * 100)}%` }}
                      ></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Top Partners by Order Count */}
      <Card>
        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
          <p className="text-sm font-medium text-foreground-600">Top Partners op Aantal Orders</p>
        </CardHeader>
        <CardBody className="overflow-hidden">
          <Table 
            removeWrapper 
            hideHeader 
            aria-label="Top partners by order count"
            className="min-w-full"
          >
            <TableHeader>
              <TableColumn>Partner</TableColumn>
            </TableHeader>
            <TableBody>
              {orderCountPartners.map((partner, index) => (
                <TableRow key={index} className="h-10">
                  <TableCell className="py-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{partner.name}</span>
                      <span className="text-xs font-medium">
                        {formatNumber(partner.orderCount)} orders
                      </span>
                    </div>
                    <div className="w-full bg-content3 rounded-full h-1 mt-1">
                      <div 
                        className="bg-primary h-1 rounded-full" 
                        style={{ width: `${Math.min(100, (partner.orderCount / orderCountPartners[0].orderCount) * 100)}%` }}
                      ></div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default TopPartners; 