import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
  Spinner,

  Tooltip,
  Select,
  SelectItem
} from "@nextui-org/react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  AdjustmentsHorizontalIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  DocumentDuplicateIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../components/layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useOrders } from '../hooks/useOrders';
import { OrderResponse, handleApiError } from '../lib/api';

const businessEntities = ['Alle', 'ChargeCars', 'LaderThuis', 'MeterKastThuis', 'Zaptec Shop', 'Ratio Shop'];
const orderTypes = ['Alle', 'Installatie', 'Onderhoud', 'Offerte', 'Reparatie'];
const statuses = ['Alle', 'Nieuw', 'In behandeling', 'Wachten op klant', 'Gepland', 'In uitvoering', 'Voltooid', 'Geannuleerd'];

// Comprehensive status color mapping based on semantic categories
// NextUI Color Variants: default, primary, secondary, success, warning, danger
const statusColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  // 🔵 Blauw (primary) - Actieve processen
  'in_progress': 'primary',
  'open': 'primary', 
  'active': 'primary',
  'in_uitvoering': 'primary',
  'bezig': 'primary',
  'actief': 'primary',
  'In uitvoering': 'primary',
  'Actief': 'primary',
  'Open': 'primary',
  
  // 🟡 Geel/Oranje (warning) - Voorbereidende fases en wacht statussen  
  'draft': 'warning',
  'ready': 'warning',
  'pending': 'warning',
  'waiting': 'warning',
  'on_hold': 'warning',
  'paused': 'warning',
  'concept': 'warning',
  'klaar': 'warning',
  'wachtend': 'warning',
  'in_behandeling': 'warning',
  'Nieuw': 'warning',
  'In behandeling': 'warning',
  'Concept': 'warning',
  'Draft': 'warning',
  'Pending': 'warning',
  'quote_draft': 'warning',
  'offerte_concept': 'warning',
  
  // 🟣 Paars/Secondary - Verzonden items en wachtende goedkeuringen
  'quote_sent': 'secondary',
  'sent': 'secondary',
  'verstuurd': 'secondary',
  'Offerte Concept': 'secondary',
  'partner_akkoord': 'secondary',
  'Partner Akkoord': 'secondary',
  'waiting_customer': 'secondary',
  'Wachten op klant': 'secondary',
  'awaiting_approval': 'secondary',
  'submitted': 'secondary',
  'Ingepland': 'secondary',
  'Gepland': 'secondary',
  
  // 🟢 Groen (success) - Goedkeuringen en voltooide items
  'completed': 'success',
  'approved': 'success', 
  'delivered': 'success',
  'installed': 'success',
  'finished': 'success',
  'done': 'success',
  'voltooid': 'success',
  'goedgekeurd': 'success',
  'geleverd': 'success',
  'geïnstalleerd': 'success',
  'klant_akkoord': 'success',
  'customer_approved': 'success',
  'Voltooid': 'success',
  'Klant Akkoord': 'success',
  'Goedgekeurd': 'success',
  'Geleverd': 'success',
  'Completed': 'success',
  'Approved': 'success',
  
  // 🔴 Rood (danger) - Geannuleerde of problematische statussen
  'cancelled': 'danger',
  'rejected': 'danger',
  'failed': 'danger',
  'expired': 'danger',
  'error': 'danger',
  'geannuleerd': 'danger',
  'afgewezen': 'danger',
  'gefaald': 'danger',
  'verlopen': 'danger',
  'Geannuleerd': 'danger',
  'Afgewezen': 'danger',
  'Cancelled': 'danger',
  'Rejected': 'danger',
  'Failed': 'danger',
  
  // Default fallback
  'unknown': 'default',
  'onbekend': 'default',
  'Onbekend': 'default'
};



export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  
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

  // Orders are now filtered and paginated by the useOrders hook
  const paginatedOrders = filteredOrders;

  // Get status color from API or fallback to mapping
  const getStatusColor = (order: OrderResponse): "default" | "primary" | "secondary" | "success" | "warning" | "danger" => {
    // Priority 1: Check if we have a direct status mapping (most reliable)
    const statusKey = order.status_label || order.status_name || order.status;
    if (statusKey && statusColorMap[statusKey]) {
      const mappedColor = statusColorMap[statusKey];
      console.log(`🎨 STATUS MAPPED for ${order.order_number}: ${statusKey} → ${mappedColor}`);
      return mappedColor;
    }
    
    // Priority 2: If API provides status_color (hex code), map to NextUI colors
    if (order.status_color) {
      const color = order.status_color.toLowerCase();
      
      // Semantic color mapping from hex to NextUI variants
      const hexColorMapping = (() => {
        // Green variants → success
        if (color.includes('#22c55e') || color.includes('#10b981') || color.includes('#16a34a') || 
            color.includes('#059669') || color.includes('green')) return 'success';
        
        // Red variants → danger  
        if (color.includes('#ef4444') || color.includes('#dc2626') || color.includes('#f87171') ||
            color.includes('#b91c1c') || color.includes('red')) return 'danger';
        
        // Yellow/Orange variants → warning
        if (color.includes('#f59e0b') || color.includes('#eab308') || color.includes('#fbbf24') ||
            color.includes('#d97706') || color.includes('yellow') || color.includes('orange')) return 'warning';
        
        // Blue variants → primary
        if (color.includes('#3b82f6') || color.includes('#2563eb') || color.includes('#097bff') ||
            color.includes('#1d4ed8') || color.includes('#006fee') || color.includes('blue')) return 'primary';
        
        // Gray/Purple variants → secondary
        if (color.includes('#6b7280') || color.includes('#9ca3af') || color.includes('#8b5cf6') ||
            color.includes('gray') || color.includes('grey') || color.includes('purple')) return 'secondary';
        
        // Any other hex color defaults to primary
        if (color.startsWith('#')) return 'primary';
        
        return null;
      })();
      
      if (hexColorMapping) {
        console.log(`🎨 STATUS HEX for ${order.order_number}: ${order.status_color} → ${hexColorMapping}`);
        return hexColorMapping;
      }
    }
    
    // Priority 3: Fallback to default
    console.log(`🎨 STATUS DEFAULT for ${order.order_number}: ${statusKey} → default (no mapping found)`);
    return 'default';
  };

  // Debug status values
  React.useEffect(() => {
    if (orders.length > 0) {
      console.log('🎨 STATUS DEBUG:', orders.slice(0, 3).map(order => ({
        id: order.id,
        status: order.status,
        status_label: order.status_label,
        status_name: order.status_name,
        status_color: order.status_color,
        resolved_color: getStatusColor(order)
      })));
    }
  }, [orders]);

  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0,00';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  // Format timestamp (Xano returns timestamps in seconds or milliseconds)
  const formatDate = (timestamp: number | string) => {
    // Handle invalid/null timestamps
    if (!timestamp || timestamp === 0) return '-';
    
    // Handle both timestamp numbers and string dates
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('nl-NL');
    }
    
    // Xano timestamps are typically in seconds, convert to milliseconds if needed
    const date = timestamp > 1e10 ? new Date(timestamp) : new Date(timestamp * 1000);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('nl-NL');
  };

  // Format relative time for status since
  const formatRelativeTime = (timestamp: number | string) => {
    // Handle invalid/null timestamps
    if (!timestamp || timestamp === 0) return '';
    
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : timestamp > 1e10 
        ? new Date(timestamp) 
        : new Date(timestamp * 1000);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Gisteren';
    if (diffDays < 7) return `${diffDays} dagen geleden`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weken geleden`;
    
    return formatDate(timestamp);
  };

  const handleViewOrder = (orderId: number | string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: number | string) => {
    // Navigate to edit page
    console.log('Edit order:', orderId);
  };

  const handleDuplicateOrder = (orderId: number | string) => {
    // Duplicate order logic
    console.log('Duplicate order:', orderId);
  };

  const handleDeleteOrder = (orderId: number | string) => {
    // Delete order logic
    console.log('Delete order:', orderId);
  };

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
            <div className="flex gap-2">
              <Button
                color="default"
                variant="bordered"
                size="sm"
                startContent={<ArrowPathIcon className="h-4 w-4" />}
                onPress={refreshOrders}
                isLoading={loading}
              >
                Vernieuwen
              </Button>
              <Button
                color="default"
                variant="bordered"
                size="sm"
                startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                color="primary"
                size="sm"
                startContent={<PlusIcon className="h-4 w-4" />}
              >
                Nieuwe Order
              </Button>
            </div>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-600">Totale Omzet</h3>
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">
                    {dashboardStats ? formatCurrency(dashboardStats.total_revenue) : '€0'}
                  </p>
                  <div className="flex items-center gap-1">
                    {dashboardStats?.revenue_change && (
                      <>
                        <span className={`text-xs ${dashboardStats.revenue_change >= 0 ? 'text-success' : 'text-danger'}`}>
                          {dashboardStats.revenue_change >= 0 ? '+' : ''}{dashboardStats.revenue_change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-foreground-500">vs vorige maand</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-600">Actieve Orders</h3>
                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">
                    {dashboardStats ? dashboardStats.active_orders : '0'}
                  </p>
                  <div className="flex items-center gap-1">
                    {dashboardStats?.orders_change && (
                      <>
                        <span className={`text-xs ${dashboardStats.orders_change >= 0 ? 'text-success' : 'text-danger'}`}>
                          {dashboardStats.orders_change >= 0 ? '+' : ''}{dashboardStats.orders_change}
                        </span>
                        <span className="text-xs text-foreground-500">sinds gisteren</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-600">Conversie Rate</h3>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">78.2%</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-success">+2.1%</span>
                    <span className="text-xs text-foreground-500">deze week</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-600">Gem. Deal Waarde</h3>
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground">€2.847</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-secondary">-5.2%</span>
                    <span className="text-xs text-foreground-500">vs Q3</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Performance Indicators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-3">
              <CardHeader className="pb-2">
                <h3 className="text-base font-semibold">Business Entities</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex items-center justify-between p-3 border border-divider rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">ChargeCars</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€67.2K</p>
                      <p className="text-xs text-foreground-500">42%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-divider rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">LaderThuis</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€38.1K</p>
                      <p className="text-xs text-foreground-500">24%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-divider rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">MeterKastThuis</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€22.1K</p>
                      <p className="text-xs text-foreground-500">14%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-divider rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span className="text-sm">Overig</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€32.0K</p>
                      <p className="text-xs text-foreground-500">20%</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Filter Presets */}
          <Card>
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

          {/* Filters */}
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
                  onValueChange={setSearchValue}
                  startContent={<MagnifyingGlassIcon className="h-4 w-4 text-foreground-500" />}
                  size="sm"
                  className="lg:col-span-2"
                />
                
                <Select
                  placeholder="Business Entity"
                  selectedKeys={[selectedBusinessEntity]}
                  onSelectionChange={(keys) => setSelectedBusinessEntity(Array.from(keys)[0] as string)}
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
                  onSelectionChange={(keys) => setSelectedOrderType(Array.from(keys)[0] as string)}
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
                  onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                  size="sm"
                >
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardBody className="p-0">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <Spinner size="lg" />
                </div>
              ) : (
                <Table 
                  aria-label="Orders table"
                  classNames={{
                    wrapper: "shadow-none rounded-none",
                    th: "bg-content2/50 text-xs font-semibold",
                    td: "text-xs"
                  }}
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
                    {paginatedOrders.map((order) => (
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
                                 : 'Unknown Customer')}
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
                            <Chip 
                              size="sm" 
                              color={getStatusColor(order)} 
                              variant="flat"
                              className="text-xs h-5"
                            >
                              {order.status_label || order.status}
                            </Chip>
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
                                onPress={() => handleViewOrder(order.id)}
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
                                onPress={() => handleEditOrder(order.id)}
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
                                  onPress={() => handleDuplicateOrder(order.id)}
                                  startContent={<DocumentDuplicateIcon className="h-3 w-3" />}
                                  className="text-xs"
                                >
                                  Dupliceren
                                </DropdownItem>
                                <DropdownItem
                                  key="delete"
                                  color="danger"
                                  onPress={() => handleDeleteOrder(order.id)}
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
              )}
            </CardBody>
          </Card>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-foreground-500">
              {pagination.totalItems} resultaten gevonden
            </p>
            <Pagination
              total={pagination.totalPages}
              page={pagination.currentPage}
              onChange={setCurrentPage}
              size="sm"
              showControls
              className="gap-2"
            />
          </div>
      </div>
      </AppLayout>
    </>
  );
} 