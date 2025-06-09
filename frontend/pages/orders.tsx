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
  Avatar,
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
  TrashIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../components/layouts/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';

// Mock data - will be replaced with API calls
interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  business_entity: string;
  order_type: string;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
  priority: 'low' | 'medium' | 'high';
  installation_date?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    order_number: 'ORD-2024-001',
    customer_name: 'Jan de Vries',
    business_entity: 'ChargeCars',
    order_type: 'Installatie',
    status: 'In behandeling',
    amount: 1250.00,
    created_at: '2024-01-15',
    updated_at: '2024-01-16',
    priority: 'high',
    installation_date: '2024-01-25'
  },
  {
    id: '2',
    order_number: 'ORD-2024-002',
    customer_name: 'Maria Janssen',
    business_entity: 'LaderThuis',
    order_type: 'Onderhoud',
    status: 'Voltooid',
    amount: 450.00,
    created_at: '2024-01-14',
    updated_at: '2024-01-15',
    priority: 'medium'
  },
  {
    id: '3',
    order_number: 'ORD-2024-003',
    customer_name: 'Peter van der Berg',
    business_entity: 'MeterKastThuis',
    order_type: 'Offerte',
    status: 'Wachten op klant',
    amount: 2100.00,
    created_at: '2024-01-13',
    updated_at: '2024-01-14',
    priority: 'low'
  }
];

const businessEntities = ['Alle', 'ChargeCars', 'LaderThuis', 'MeterKastThuis', 'Zaptec Shop', 'Ratio Shop'];
const orderTypes = ['Alle', 'Installatie', 'Onderhoud', 'Offerte', 'Reparatie'];
const statuses = ['Alle', 'Nieuw', 'In behandeling', 'Wachten op klant', 'Gepland', 'In uitvoering', 'Voltooid', 'Geannuleerd'];

const statusColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  'Nieuw': 'primary',
  'In behandeling': 'warning',
  'Wachten op klant': 'secondary',
  'Gepland': 'primary',
  'In uitvoering': 'warning',
  'Voltooid': 'success',
  'Geannuleerd': 'danger'
};

const priorityColorMap: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  'low': 'default',
  'medium': 'warning',
  'high': 'danger'
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState('');
  const [selectedBusinessEntity, setSelectedBusinessEntity] = useState('Alle');
  const [selectedOrderType, setSelectedOrderType] = useState('Alle');
  const [selectedStatus, setSelectedStatus] = useState('Alle');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const rowsPerPage = 10;
  const router = useRouter();

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

  // Filter orders based on current filters
  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order => {
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchValue.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchValue.toLowerCase());
      
      const matchesBusinessEntity = selectedBusinessEntity === 'Alle' || order.business_entity === selectedBusinessEntity;
      const matchesOrderType = selectedOrderType === 'Alle' || order.order_type === selectedOrderType;
      const matchesStatus = selectedStatus === 'Alle' || order.status === selectedStatus;

      return matchesSearch && matchesBusinessEntity && matchesOrderType && matchesStatus;
    });
  }, [searchValue, selectedBusinessEntity, selectedOrderType, selectedStatus]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, page]);

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId: string) => {
    // Navigate to edit page
    console.log('Edit order:', orderId);
  };

  const handleDuplicateOrder = (orderId: string) => {
    // Duplicate order logic
    console.log('Duplicate order:', orderId);
  };

  const handleDeleteOrder = (orderId: string) => {
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
            </div>
            <div className="flex gap-2">
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
                  <p className="text-xl font-bold text-foreground">€127.450</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-success">+12.5%</span>
                    <span className="text-xs text-foreground-500">vs vorige maand</span>
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
                  <p className="text-xl font-bold text-foreground">24</p>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-warning">+3</span>
                    <span className="text-xs text-foreground-500">sinds gisteren</span>
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
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <h3 className="text-base font-semibold">Pipeline Overzicht</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <p className="text-lg font-bold text-primary">€45.2K</p>
                    <p className="text-xs text-foreground-600">Offertes Open</p>
                    <p className="text-xs text-foreground-500">12 orders</p>
                  </div>
                  <div className="text-center p-3 bg-warning/10 rounded-lg">
                    <p className="text-lg font-bold text-warning">€32.8K</p>
                    <p className="text-xs text-foreground-600">In Behandeling</p>
                    <p className="text-xs text-foreground-500">8 orders</p>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <p className="text-lg font-bold text-success">€89.4K</p>
                    <p className="text-xs text-foreground-600">Deze Maand</p>
                    <p className="text-xs text-foreground-500">31 orders</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-base font-semibold">Business Entities</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">ChargeCars</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€67.2K</p>
                      <p className="text-xs text-foreground-500">42%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">LaderThuis</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€38.1K</p>
                      <p className="text-xs text-foreground-500">24%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">MeterKastThuis</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">€22.1K</p>
                      <p className="text-xs text-foreground-500">14%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
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
              {isLoading ? (
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
                    <TableColumn>KLANT</TableColumn>
                    <TableColumn>BUSINESS ENTITY</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>PRIORITEIT</TableColumn>
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
                          <div className="flex items-center gap-2">
                            <Avatar name={order.customer_name} size="sm" className="w-6 h-6 text-xs" />
                            <span className="font-medium text-xs">{order.customer_name}</span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color="primary"
                            className="text-xs h-5"
                          >
                            {order.business_entity}
                          </Chip>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-xs">{order.order_type}</span>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            size="sm" 
                            color={statusColorMap[order.status]} 
                            variant="flat"
                            className="text-xs h-5"
                          >
                            {order.status}
                          </Chip>
                        </TableCell>
                        
                        <TableCell>
                          <Chip 
                            size="sm" 
                            color={priorityColorMap[order.priority]} 
                            variant="dot"
                            className="text-xs h-5"
                          >
                            {order.priority === 'high' ? 'Hoog' : order.priority === 'medium' ? 'Normaal' : 'Laag'}
                          </Chip>
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
              {filteredOrders.length} resultaten gevonden
            </p>
            <Pagination
              total={totalPages}
              page={page}
              onChange={setPage}
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