import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Spinner,
  Pagination,
  Tabs,
  Tab,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@nextui-org/react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  UserPlusIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { AppLayout } from '../components/layouts/AppLayout';
import { useCustomers } from '../hooks/useCustomers';

// Types for customer data based on database schema
export interface CustomerResponse {
  id: string;
  contact_type: 'person' | 'organization';
  contact_subtype: 'customer' | 'partner';
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  display_name?: string;
  parent_organization_id?: string;
  parent_organization_name?: string;
  is_primary?: boolean;
  is_billing_contact?: boolean;
  is_technical_contact?: boolean;
  job_title?: string;
  department?: string;
  whatsapp?: string;
  preferred_communication?: 'email' | 'phone' | 'whatsapp' | 'portal';
  is_active?: boolean;
  created_at?: number;
  updated_at?: number;
  
  // Organization specific fields
  vat_number?: string;
  kvk_number?: string;
  iban?: string;
  
  // Aggregated metrics
  total_orders?: number;
  total_revenue?: number;
  last_order_date?: number;
  status?: 'active' | 'inactive' | 'prospect';
}

export interface CustomerFilters {
  search?: string;
  contact_type?: 'person' | 'organization';
  contact_subtype?: 'customer' | 'partner';
  status?: string;
  communication_preference?: string;
  parent_organization?: string;
  page?: number;
  per_page?: number;
}

export interface CustomerMetrics {
  total_customers: number;
  total_organizations: number;
  total_partners: number;
  active_customers: number;
  new_this_month: number;
  revenue_this_month: number;
  customers_change: number;
  revenue_change: number;
}

export default function CustomersPage() {
  const router = useRouter();
  
  // State management
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedCommunication, setSelectedCommunication] = useState('');
  const [selectedParentOrg, setSelectedParentOrg] = useState('');
  
  // Derived data for filters
  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(customers.map(customer => customer.status).filter(Boolean)));
    return ['Alle', ...uniqueStatuses];
  }, [customers]);
  
  const communicationPreferences = useMemo(() => {
    const uniquePrefs = Array.from(new Set(customers.map(customer => customer.preferred_communication).filter(Boolean)));
    return ['Alle', ...uniquePrefs];
  }, [customers]);
  
  const parentOrganizations = useMemo(() => {
    const uniqueOrgs = Array.from(new Set(customers.map(customer => customer.parent_organization_name).filter(Boolean)));
    return ['Alle', ...uniqueOrgs];
  }, [customers]);

  // Filter customers based on active tab and filters
  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    
    // Filter by tab
    switch (selectedTab) {
      case 'organizations':
        filtered = filtered.filter(customer => customer.contact_type === 'organization');
        break;
      case 'endcustomers':
        filtered = filtered.filter(customer => 
          customer.contact_type === 'person' && customer.contact_subtype === 'customer'
        );
        break;
      case 'partners':
        filtered = filtered.filter(customer => customer.contact_subtype === 'partner');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }
    
    // Apply search filter
    if (searchValue) {
      filtered = filtered.filter(customer =>
        customer.display_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.first_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchValue.toLowerCase()) ||
        customer.parent_organization_name?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    
    // Apply other filters
    if (selectedStatus && selectedStatus !== 'Alle') {
      filtered = filtered.filter(customer => customer.status === selectedStatus);
    }
    
    if (selectedCommunication && selectedCommunication !== 'Alle') {
      filtered = filtered.filter(customer => customer.preferred_communication === selectedCommunication);
    }
    
    if (selectedParentOrg && selectedParentOrg !== 'Alle') {
      filtered = filtered.filter(customer => customer.parent_organization_name === selectedParentOrg);
    }
    
    return filtered;
  }, [customers, selectedTab, searchValue, selectedStatus, selectedCommunication, selectedParentOrg]);

  // Pagination
  const pagination = useMemo(() => {
    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return {
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
      startIndex,
      endIndex
    };
  }, [filteredCustomers.length, currentPage, itemsPerPage]);

  const paginatedCustomers = useMemo(() => {
    return filteredCustomers.slice(pagination.startIndex, pagination.endIndex);
  }, [filteredCustomers, pagination.startIndex, pagination.endIndex]);

  // Mock data for development (will be replaced with API calls)
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      try {
        console.log('📋 CUSTOMERS: Loading customer data...');
        
        // Mock data for development - will be replaced with actual API call
        const mockCustomers: CustomerResponse[] = [
          {
            id: '1',
            contact_type: 'organization',
            contact_subtype: 'customer',
            display_name: 'Tesla Motors Nederland',
            email: 'info@tesla.nl',
            phone: '+31 20 123 4567',
            vat_number: 'NL123456789B01',
            kvk_number: '12345678',
            is_active: true,
            status: 'active',
            total_orders: 15,
            total_revenue: 45000,
            last_order_date: Date.now() - 7 * 24 * 60 * 60 * 1000,
            created_at: Date.now() - 30 * 24 * 60 * 60 * 1000
          },
          {
            id: '2',
            contact_type: 'person',
            contact_subtype: 'customer',
            first_name: 'Jan',
            last_name: 'de Vries',
            display_name: 'Jan de Vries',
            email: 'jan@devries.nl',
            phone: '+31 6 12345678',
            parent_organization_id: '1',
            parent_organization_name: 'Tesla Motors Nederland',
            job_title: 'Facility Manager',
            department: 'Operations',
            is_primary: true,
            is_technical_contact: true,
            preferred_communication: 'email',
            is_active: true,
            status: 'active',
            created_at: Date.now() - 25 * 24 * 60 * 60 * 1000
          },
          {
            id: '3',
            contact_type: 'organization',
            contact_subtype: 'partner',
            display_name: 'ChargeTech Solutions',
            email: 'contact@chargetech.nl',
            phone: '+31 30 987 6543',
            vat_number: 'NL987654321B01',
            kvk_number: '87654321',
            is_active: true,
            status: 'active',
            total_orders: 8,
            total_revenue: 24000,
            last_order_date: Date.now() - 3 * 24 * 60 * 60 * 1000,
            created_at: Date.now() - 45 * 24 * 60 * 60 * 1000
          },
          {
            id: '4',
            contact_type: 'person',
            contact_subtype: 'customer',
            first_name: 'Maria',
            last_name: 'Janssen',
            display_name: 'Maria Janssen',
            email: 'maria.janssen@example.com',
            phone: '+31 6 98765432',
            preferred_communication: 'whatsapp',
            whatsapp: '+31 6 98765432',
            is_active: true,
            status: 'prospect',
            total_orders: 0,
            total_revenue: 0,
            created_at: Date.now() - 5 * 24 * 60 * 60 * 1000
          }
        ];
        
        const mockMetrics: CustomerMetrics = {
          total_customers: 156,
          total_organizations: 42,
          total_partners: 18,
          active_customers: 134,
          new_this_month: 8,
          revenue_this_month: 89500,
          customers_change: 12.5,
          revenue_change: 8.7
        };
        
        setCustomers(mockCustomers);
        setMetrics(mockMetrics);
        
        console.log('📋 CUSTOMERS: Data loaded successfully');
        
      } catch (error) {
        console.error('❌ CUSTOMERS: Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Utility functions
  const formatCurrency = (amount?: number) => {
    if (!amount) return '€0,00';
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-';
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(timestamp));
  };

  const getContactTypeIcon = (customer: CustomerResponse) => {
    if (customer.contact_type === 'organization') {
      return customer.contact_subtype === 'partner' ? 
        <BuildingOfficeIcon className="h-4 w-4 text-blue-500" /> : 
        <BuildingOfficeIcon className="h-4 w-4" />;
    }
    return <UserGroupIcon className="h-4 w-4" />;
  };

  const getStatusColor = (status?: string): "default" | "success" | "warning" | "danger" => {
    switch (status) {
      case 'active': return 'success';
      case 'prospect': return 'warning';
      case 'inactive': return 'danger';
      default: return 'default';
    }
  };

  // Event handlers
  const handleViewCustomer = (customerId: string) => {
    router.push(`/contacts/${customerId}`);
  };

  const handleEditCustomer = (customerId: string) => {
    router.push(`/contacts/${customerId}/edit`);
  };

  const handleDeleteCustomer = (customerId: string) => {
    console.log('Delete customer:', customerId);
    // Implement delete functionality
  };

  const handleCreateCustomer = () => {
    router.push('/contacts/new');
  };

  // Quick filter presets
  const presetFilters = [
    {
      label: 'Nieuwe Klanten',
      action: () => {
        setSelectedTab('all');
        setSelectedStatus('prospect');
      }
    },
    {
      label: 'Actieve Partners',
      action: () => {
        setSelectedTab('partners');
        setSelectedStatus('active');
      }
    },
    {
      label: 'Deze Week',
      action: () => {
        // Filter customers created this week
        console.log('Filter: Deze Week');
      }
    },
    {
      label: 'Reset Filters',
      action: () => {
        setSearchValue('');
        setSelectedStatus('');
        setSelectedCommunication('');
        setSelectedParentOrg('');
      }
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center min-h-96">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Klanten - ChargeCars</title>
      </Head>
      
      <AppLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Klanten</h1>
              <p className="text-sm text-foreground-600 mt-1">
                Beheer uw klanten, organisaties en partners
              </p>
            </div>
            
            <Button
              color="primary"
              startContent={<UserPlusIcon className="h-4 w-4" />}
              onPress={handleCreateCustomer}
            >
              Nieuwe Klant
            </Button>
          </div>

          {/* Metrics Dashboard */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground-600">Totaal Klanten</p>
                      <p className="text-xl font-bold">{metrics.total_customers}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-success">+{metrics.customers_change}%</p>
                      <p className="text-xs text-foreground-500">vs vorige maand</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground-600">Organisaties</p>
                      <p className="text-xl font-bold">{metrics.total_organizations}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground-500">Actief</p>
                      <p className="text-xs text-foreground-500">{metrics.active_customers}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground-600">Partners</p>
                      <p className="text-xl font-bold">{metrics.total_partners}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-foreground-500">Nieuw</p>
                      <p className="text-xs text-foreground-500">{metrics.new_this_month}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-foreground-600">Omzet Deze Maand</p>
                      <p className="text-xl font-bold">{formatCurrency(metrics.revenue_this_month)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-success">+{metrics.revenue_change}%</p>
                      <p className="text-xs text-foreground-500">vs vorige maand</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}

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
                  placeholder="Zoek klanten..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                  startContent={<MagnifyingGlassIcon className="h-4 w-4 text-foreground-500" />}
                  size="sm"
                  className="lg:col-span-2"
                />
                
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

                <Select
                  placeholder="Communicatie"
                  selectedKeys={[selectedCommunication]}
                  onSelectionChange={(keys) => setSelectedCommunication(Array.from(keys)[0] as string)}
                  size="sm"
                >
                  {communicationPreferences.map((pref) => (
                    <SelectItem key={pref} value={pref}>
                      {pref}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  placeholder="Organisatie"
                  selectedKeys={[selectedParentOrg]}
                  onSelectionChange={(keys) => setSelectedParentOrg(Array.from(keys)[0] as string)}
                  size="sm"
                >
                  {parentOrganizations.map((org) => (
                    <SelectItem key={org} value={org}>
                      {org}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </CardBody>
          </Card>

          {/* Tabs and Table */}
          <Card>
            <CardBody className="p-0">
              <Tabs
                selectedKey={selectedTab}
                onSelectionChange={(key) => setSelectedTab(key as string)}
                className="px-4 pt-4"
                variant="underlined"
              >
                <Tab key="all" title="Alle Klanten" />
                <Tab key="organizations" title="Organisaties" />
                <Tab key="endcustomers" title="Eindklanten" />
                <Tab key="partners" title="Partners" />
              </Tabs>

              <Table 
                aria-label="Customers table"
                classNames={{
                  wrapper: "shadow-none rounded-none",
                  th: "bg-content2/50 text-xs font-semibold",
                  td: "text-xs"
                }}
              >
                <TableHeader>
                  <TableColumn>KLANT</TableColumn>
                  <TableColumn>TYPE</TableColumn>
                  <TableColumn>CONTACT</TableColumn>
                  <TableColumn>ORGANISATIE</TableColumn>
                  <TableColumn>STATUS</TableColumn>
                  <TableColumn>ORDERS</TableColumn>
                  <TableColumn>OMZET</TableColumn>
                  <TableColumn>LAATSTE ORDER</TableColumn>
                  <TableColumn>ACTIES</TableColumn>
                </TableHeader>
                <TableBody>
                  {paginatedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContactTypeIcon(customer)}
                          <div>
                            <p className="font-medium text-xs">
                              {customer.display_name || `${customer.first_name} ${customer.last_name}`}
                            </p>
                            <p className="text-xs text-foreground-500">{customer.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium">
                            {customer.contact_type === 'organization' ? 'Organisatie' : 'Persoon'}
                          </span>
                          <span className="text-xs text-foreground-400">
                            {customer.contact_subtype === 'customer' ? 'Klant' : 'Partner'}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs">{customer.phone}</span>
                          {customer.preferred_communication && (
                            <span className="text-xs text-foreground-400">
                              Voorkeur: {customer.preferred_communication}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        {customer.parent_organization_name ? (
                          <span className="text-xs">{customer.parent_organization_name}</span>
                        ) : (
                          <span className="text-xs text-foreground-400">-</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <Chip 
                          size="sm" 
                          color={getStatusColor(customer.status)} 
                          variant="flat"
                          className="text-xs h-5"
                        >
                          {customer.status || 'Onbekend'}
                        </Chip>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-xs font-medium">{customer.total_orders || 0}</span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-xs font-medium">{formatCurrency(customer.total_revenue)}</span>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-xs">{formatDate(customer.last_order_date)}</span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Tooltip content="Bekijken">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              onPress={() => handleViewCustomer(customer.id)}
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
                              onPress={() => handleEditCustomer(customer.id)}
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
                                key="orders"
                                onPress={() => router.push(`/orders?customer=${customer.id}`)}
                                className="text-xs"
                              >
                                Bekijk Orders
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                color="danger"
                                onPress={() => handleDeleteCustomer(customer.id)}
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