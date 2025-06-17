import React from 'react';
import { Card } from "@nextui-org/react";
import { DashboardStats as DashboardStatsType } from '@/types';
import { formatCurrency, formatNumber } from '@/lib/utils/dateUtils';

export interface DashboardStatsProps {
  /**
   * Dashboard statistics data
   */
  stats: DashboardStatsType;
  
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
 * DashboardStats component for displaying key metrics in a responsive grid
 * 
 * @example
 * <DashboardStats 
 *   stats={dashboardStats}
 *   loading={loading}
 * />
 */
export const DashboardStats: React.FC<DashboardStatsProps> = ({
  stats,
  loading = false,
  className = "",
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 ${className}`}>
      {/* Total Revenue */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground-600">Totale Omzet</h3>
            <div className="w-2 h-2 rounded-full bg-success"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">
              {formatCurrency(stats.total_revenue)}
            </p>
            <div className="flex items-center gap-1">
              {stats?.revenue_change !== undefined && (
                <>
                  <span className={`text-xs ${stats.revenue_change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stats.revenue_change >= 0 ? '+' : ''}{stats.revenue_change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-foreground-500">vs vorige maand</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Orders */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground-600">Actieve Orders</h3>
            <div className="w-2 h-2 rounded-full bg-warning"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">
              {formatNumber(stats.active_orders)}
            </p>
            <div className="flex items-center gap-1">
              {stats?.orders_change !== undefined && (
                <>
                  <span className={`text-xs ${stats.orders_change >= 0 ? 'text-success' : 'text-danger'}`}>
                    {stats.orders_change >= 0 ? '+' : ''}{stats.orders_change}
                  </span>
                  <span className="text-xs text-foreground-500">sinds gisteren</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Completed Orders */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground-600">Voltooide Orders</h3>
            <div className="w-2 h-2 rounded-full bg-success"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">
              {formatNumber(stats.completed_orders)}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-foreground-500">deze maand</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Pending Orders */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground-600">Wachtende Orders</h3>
            <div className="w-2 h-2 rounded-full bg-warning"></div>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-foreground">
              {formatNumber(stats.pending_orders)}
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-foreground-500">wachten op actie</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardStats; 