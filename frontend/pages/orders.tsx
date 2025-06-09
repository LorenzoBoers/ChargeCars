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
    console.log('Edit order:', orderId);
    // Will navigate to order edit page
  };

  return (
    <>
      <Head>
        <title>Order Beheer - ChargeCars Portal</title>
        <meta name="description" content="Beheer al je laadpaal orders op één centrale plek" />
      </Head>

      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Order Beheer</h1>
              <p className="text-foreground-600 mt-1">
                Beheer al je laadpaal orders op één centrale plek
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="bordered"
                startContent={<DocumentArrowDownIcon className="h-4 w-4" />}
              >
                Export
              </Button>
              <Button
                color="primary"
                startContent={<PlusIcon className="h-4 w-4" />}
              >
                Nieuwe Order
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-600">Vandaag</p>
                    <p className="text-2xl font-bold text-foreground">12</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <AdjustmentsHorizontalIcon className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-600">In Behandeling</p>
                    <p className="text-2xl font-bold text-foreground">8</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <UserIcon className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-600">Voltooid</p>
                    <p className="text-2xl font-bold text-foreground">156</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <BuildingOfficeIcon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-foreground-600">Deze Maand</p>
                    <p className="text-2xl font-bold text-foreground">89</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 w-full">
                {/* Demo Link */}
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    color="secondary"
                    variant="flat"
                    onPress={() => router.push('/orders/CHC-2024-001')}
                  >
                    🚀 Bekijk Demo Order Detail
                  </Button>
                </div>

                {/* Preset Filter Buttons */}
                <div className="flex flex-wrap gap-2">
                  {presetFilters.map((filter, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="flat"
                      onPress={filter.action}
                      className={index === presetFilters.length - 1 ? 'text-warning' : ''}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                  <Input
                    className="md:w-80"
                    placeholder="Zoek op ordernummer of klant..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                    startContent={<MagnifyingGlassIcon className="h-4 w-4 text-foreground-400" />}
                    isClearable
                  />
                  
                  <div className="flex gap-3">
                    <Select
                      className="w-48"
                      label="Business Entity"
                      selectedKeys={[selectedBusinessEntity]}
                      onSelectionChange={(keys) => setSelectedBusinessEntity(Array.from(keys)[0] as string)}
                    >
                      {businessEntities.map((entity) => (
                        <SelectItem key={entity} value={entity}>
                          {entity}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-40"
                      label="Order Type"
                      selectedKeys={[selectedOrderType]}
                      onSelectionChange={(keys) => setSelectedOrderType(Array.from(keys)[0] as string)}
                    >
                      {orderTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      className="w-48"
                      label="Status"
                      selectedKeys={[selectedStatus]}
                      onSelectionChange={(keys) => setSelectedStatus(Array.from(keys)[0] as string)}
                    >
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardBody className="pt-0">
              {/* Orders Table */}
              <Table
                aria-label="Orders table"
                classNames={{
                  wrapper: "min-h-[222px]",
                  th: "bg-default-50 text-default-900 h-10 text-xs font-medium px-3",
                  td: "py-2 px-3 text-sm",
                }}
                bottomContent={
                  totalPages > 1 ? (
                    <div className="flex w-full justify-center">
                      <Pagination
                        isCompact
                        showControls
                        showShadow
                        color="primary"
                        page={page}
                        total={totalPages}
                        onChange={setPage}
                      />
                    </div>
                  ) : null
                }
              >
                <TableHeader>
                  <TableColumn className="w-32">ORDER</TableColumn>
                  <TableColumn className="w-40">KLANT</TableColumn>
                  <TableColumn className="w-32">ENTITY</TableColumn>
                  <TableColumn className="w-28">TYPE</TableColumn>
                  <TableColumn className="w-28">STATUS</TableColumn>
                  <TableColumn className="w-24 text-right">BEDRAG</TableColumn>
                  <TableColumn className="w-28">DATUM</TableColumn>
                  <TableColumn className="w-20">ACTIES</TableColumn>
                </TableHeader>
                <TableBody
                  isLoading={isLoading}
                  loadingContent={<Spinner />}
                  emptyContent="Geen orders gevonden"
                >
                  {paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-default-50">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-foreground text-sm">{order.order_number}</span>
                          {order.priority !== 'low' && (
                            <Chip
                              size="sm"
                              color={priorityColorMap[order.priority]}
                              variant="flat"
                              className="w-fit text-xs"
                            >
                              {order.priority === 'high' ? 'Urgent' : 'Medium'}
                            </Chip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar name={order.customer_name} size="sm" className="w-6 h-6 text-xs" />
                          <span className="font-medium text-sm truncate">{order.customer_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                          {order.business_entity}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-sm">{order.order_type}</TableCell>
                      <TableCell>
                        <Chip
                          color={statusColorMap[order.status] || 'default'}
                          variant="flat"
                          size="sm"
                          className="text-xs"
                        >
                          {order.status}
                        </Chip>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-semibold text-sm">{formatCurrency(order.amount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-foreground">{formatDate(order.created_at)}</span>
                          {order.installation_date && (
                            <span className="text-xs text-foreground-500">
                              Install: {formatDate(order.installation_date)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="Bekijken">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleViewOrder(order.id)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Bewerken">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleEditOrder(order.id)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Dropdown>
                            <DropdownTrigger>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                              >
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Order acties">
                              <DropdownItem
                                key="duplicate"
                                startContent={<DocumentDuplicateIcon className="h-4 w-4" />}
                              >
                                Dupliceren
                              </DropdownItem>
                              <DropdownItem
                                key="invoice"
                                startContent={<DocumentTextIcon className="h-4 w-4" />}
                              >
                                Factuur
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={<TrashIcon className="h-4 w-4" />}
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

              {/* Results summary */}
              <div className="flex justify-between items-center mt-4 text-sm text-foreground-600">
                <span>
                  {filteredOrders.length} van {mockOrders.length} orders
                </span>
                <span>
                  Pagina {page} van {totalPages}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    </>
  );
} 