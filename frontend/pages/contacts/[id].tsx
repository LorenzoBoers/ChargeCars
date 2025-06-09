import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider,
  Progress,
  Textarea,
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  Badge,
  Switch,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  ShareIcon,
  EllipsisVerticalIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  CurrencyEuroIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentListIcon,
  PaperClipIcon,
  EyeIcon,
  EyeSlashIcon,
  CloudArrowUpIcon,
  TruckIcon,
  BoltIcon,
  CreditCardIcon,
  TicketIcon,
  InboxIcon,
  HomeIcon,
  XCircleIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../components/layouts/AppLayout';

// Interfaces
interface ContactDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  role: string;
  company?: string;
  avatar?: string;
  createdAt: string;
  lastActivity: string;
  status: 'active' | 'inactive' | 'prospect';
  tags: string[];
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'billing' | 'installation';
  street: string;
  city: string;
  zipCode: string;
  country: string;
  isPrimary: boolean;
}

interface Order {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  amount: number;
  date: string;
  businessEntity: string;
}

interface Ticket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  category: string;
}

interface Communication {
  id: string;
  type: 'phone' | 'email';
  direction: 'inbound' | 'outbound';
  subject?: string;
  summary: string;
  duration?: string;
  date: string;
  agent: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  date: string;
  dueDate: string;
}

interface ChargingStation {
  id: string;
  model: string;
  serialNumber: string;
  status: 'active' | 'inactive' | 'maintenance';
  installationDate: string;
  address: string;
  power: string;
}

interface Subscription {
  id: string;
  type: string;
  status: 'active' | 'inactive' | 'cancelled';
  startDate: string;
  endDate?: string;
  monthlyFee: number;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'bev' | 'phev' | 'hev';
  batteryCapacity?: string;
}

// Mock data
const mockContact: ContactDetail = {
  id: 'CONT-001',
  name: 'Henk van der Berg',
  email: 'h.vandenberg@email.nl',
  phone: '+31 20 1234567',
  mobile: '+31 6 12345678',
  role: 'Eigenaar',
  company: 'VDB Consultancy B.V.',
  createdAt: '2023-06-15',
  lastActivity: '2024-01-20T14:30:00',
  status: 'active',
  tags: ['VIP Klant', 'Early Adopter', 'Referral Partner']
};

const mockAddresses: Address[] = [
  {
    id: 'ADDR-001',
    type: 'home',
    street: 'Hoofdstraat 123',
    city: 'Amsterdam',
    zipCode: '1012 AB',
    country: 'Nederland',
    isPrimary: true
  },
  {
    id: 'ADDR-002',
    type: 'work',
    street: 'Kantoorpark 45',
    city: 'Amsterdam',
    zipCode: '1014 BC',
    country: 'Nederland',
    isPrimary: false
  },
  {
    id: 'ADDR-003',
    type: 'billing',
    street: 'Postbus 789',
    city: 'Amsterdam',
    zipCode: '1000 AA',
    country: 'Nederland',
    isPrimary: false
  }
];

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    orderNumber: 'CHC-2024-001',
    type: 'Laadpaal Installatie',
    status: 'Gepland',
    amount: 2850.00,
    date: '2024-01-15',
    businessEntity: 'ChargeCars'
  },
  {
    id: 'ORD-002',
    orderNumber: 'CHC-2023-156',
    type: 'Onderhoudscontract',
    status: 'Voltooid',
    amount: 450.00,
    date: '2023-11-20',
    businessEntity: 'ChargeCars'
  }
];

const mockTickets: Ticket[] = [
  {
    id: 'TIC-001',
    title: 'Laadpaal werkt niet meer na stroomstoring',
    status: 'in-progress',
    priority: 'high',
    date: '2024-01-18',
    category: 'Technisch'
  },
  {
    id: 'TIC-002',
    title: 'Vraag over factuur CHC-2024-001',
    status: 'resolved',
    priority: 'medium',
    date: '2024-01-10',
    category: 'Administratief'
  }
];

const mockCommunications: Communication[] = [
  {
    id: 'COM-001',
    type: 'phone',
    direction: 'inbound',
    summary: 'Klant belts over problemen met laadpaal na stroomstoring',
    duration: '12:30',
    date: '2024-01-18T09:15:00',
    agent: 'Maria Jansen'
  },
  {
    id: 'COM-002',
    type: 'email',
    direction: 'outbound',
    subject: 'Bevestiging afspraak technische check',
    summary: 'Afspraak ingepland voor technische controle laadpaal',
    date: '2024-01-18T14:20:00',
    agent: 'Jan Petersma'
  },
  {
    id: 'COM-003',
    type: 'phone',
    direction: 'outbound',
    summary: 'Follow-up na installatie, vraag naar tevredenheid',
    duration: '8:45',
    date: '2024-01-16T16:30:00',
    agent: 'Lisa de Vries'
  }
];

const mockInvoices: Invoice[] = [
  {
    id: 'INV-001',
    invoiceNumber: 'CHC-2024-001',
    amount: 2850.00,
    status: 'sent',
    date: '2024-01-20',
    dueDate: '2024-02-19'
  },
  {
    id: 'INV-002',
    invoiceNumber: 'CHC-2023-156',
    amount: 450.00,
    status: 'paid',
    date: '2023-11-25',
    dueDate: '2023-12-25'
  }
];

const mockChargingStations: ChargingStation[] = [
  {
    id: 'CS-001',
    model: 'ChargeCars Pro 22kW',
    serialNumber: 'CC-PRO-2023-4567',
    status: 'active',
    installationDate: '2023-12-10',
    address: 'Hoofdstraat 123, Amsterdam',
    power: '22 kW'
  }
];

const mockSubscriptions: Subscription[] = [
  {
    id: 'SUB-001',
    type: 'ChargeCars Premium',
    status: 'active',
    startDate: '2023-12-10',
    monthlyFee: 29.99
  },
  {
    id: 'SUB-002',
    type: 'Onderhoudscontract',
    status: 'active',
    startDate: '2023-12-10',
    monthlyFee: 15.00
  }
];

const mockVehicles: Vehicle[] = [
  {
    id: 'VEH-001',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    licensePlate: '1-ABC-23',
    type: 'bev',
    batteryCapacity: '75 kWh'
  },
  {
    id: 'VEH-002',
    brand: 'BMW',
    model: 'iX3',
    year: 2022,
    licensePlate: '2-DEF-45',
    type: 'bev',
    batteryCapacity: '80 kWh'
  }
];

const ContactDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock loading state
  if (!id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary rounded animate-pulse mx-auto mb-4" />
            <p className="text-foreground-500">Loading contact...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const contact = mockContact; // In real app, fetch based on id

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'voltooid':
      case 'paid':
      case 'resolved': return 'success';
      case 'in-progress':
      case 'gepland':
      case 'sent': return 'primary';
      case 'open':
      case 'draft': return 'warning';
      case 'urgent':
      case 'high':
      case 'overdue': return 'danger';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getPropertyTypeIcon = (propertyType: string) => {
    switch (propertyType) {
      case 'home': return <HomeIcon className="h-5 w-5 text-success" />;
      default: return <BuildingOfficeIcon className="h-5 w-5 text-primary" />;
    }
  };

  const getVehicleTypeIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'bev': return <BoltIcon className="h-5 w-5 text-success" />;
      case 'phev': return <BoltIcon className="h-5 w-5 text-warning" />;
      default: return <TruckIcon className="h-5 w-5 text-primary" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('nl-NL');
  };

  return (
    <>
      <Head>
        <title>{contact.name} - Contact Details - ChargeCars Portal</title>
      </Head>

      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                onPress={() => router.back()}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                <Avatar name={contact.name} size="lg" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{contact.name}</h1>
                  <div className="flex items-center gap-2">
                    <p className="text-foreground-600">{contact.role}</p>
                    {contact.company && (
                      <>
                        <span className="text-foreground-400">•</span>
                        <p className="text-foreground-600">{contact.company}</p>
                      </>
                    )}
                    <Chip size="sm" color={getStatusColor(contact.status)} variant="flat">
                      {contact.status === 'active' ? 'Actief' : contact.status === 'inactive' ? 'Inactief' : 'Prospect'}
                    </Chip>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button color="primary" startContent={<PencilIcon className="h-4 w-4" />}>
                Bewerken
              </Button>
              <Button variant="bordered" startContent={<PrinterIcon className="h-4 w-4" />}>
                Printen
              </Button>
              <Button variant="bordered" startContent={<ShareIcon className="h-4 w-4" />}>
                Delen
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="bordered">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="duplicate">Contact Dupliceren</DropdownItem>
                  <DropdownItem key="merge">Contacten Samenvoegen</DropdownItem>
                  <DropdownItem key="archive">Archiveren</DropdownItem>
                  <DropdownItem key="delete" className="text-danger" color="danger">
                    Verwijderen
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="w-full">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key as string)}
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                cursor: "w-full bg-primary",
                tab: "max-w-fit px-4 h-12",
                tabContent: "group-data-[selected=true]:text-primary"
              }}
            >
              <Tab key="overview" title="Overzicht" />
              <Tab key="orders" title="Orders" />
              <Tab key="tickets" title="Tickets" />
              <Tab key="communications" title="Communicatie" />
              <Tab key="invoices" title="Facturen" />
              <Tab key="charging" title="Laadstations" />
              <Tab key="subscriptions" title="Abonnementen" />
              <Tab key="vehicles" title="Voertuigen" />
            </Tabs>
          </div>

          {/* Tab Content */}
          {selectedTab === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Contact Information */}
              <div className="xl:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Contact Informatie</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-foreground-600">Email</p>
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-foreground-500" />
                          <p className="font-medium">{contact.email}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-600">Telefoon</p>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-foreground-500" />
                          <p className="font-medium">{contact.phone}</p>
                        </div>
                      </div>
                      {contact.mobile && (
                        <div>
                          <p className="text-sm text-foreground-600">Mobiel</p>
                          <div className="flex items-center gap-2">
                            <PhoneIcon className="h-4 w-4 text-foreground-500" />
                            <p className="font-medium">{contact.mobile}</p>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-foreground-600">Aangemaakt</p>
                        <p className="font-medium">{contact.createdAt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-foreground-600">Laatste Activiteit</p>
                        <p className="font-medium">{formatTimestamp(contact.lastActivity)}</p>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {contact.tags.length > 0 && (
                      <div>
                        <p className="text-sm text-foreground-600 mb-2">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {contact.tags.map((tag, index) => (
                            <Chip key={index} size="sm" color="secondary" variant="flat">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                {/* Addresses */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      Adressen
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {mockAddresses.map((address) => (
                        <div key={address.id} className="p-4 border border-divider rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-shrink-0">{getPropertyTypeIcon(address.type)}</div>
                            <Chip 
                              size="sm" 
                              variant="flat" 
                              color={address.type === 'billing' ? 'warning' : 'default'}
                            >
                              {address.type}
                            </Chip>
                          </div>
                          <div className="text-sm space-y-1">
                            <p className="font-medium">{address.street}</p>
                            <p>{address.zipCode} {address.city}</p>
                            <p className="text-foreground-500">{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Quick Stats & Recent Activity */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Overzicht</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-content2 rounded-lg">
                        <p className="text-2xl font-bold text-primary">{mockOrders.length}</p>
                        <p className="text-sm text-foreground-600">Orders</p>
                      </div>
                      <div className="text-center p-3 bg-content2 rounded-lg">
                        <p className="text-2xl font-bold text-warning">{mockTickets.filter(t => t.status !== 'closed').length}</p>
                        <p className="text-sm text-foreground-600">Open Tickets</p>
                      </div>
                      <div className="text-center p-3 bg-content2 rounded-lg">
                        <p className="text-2xl font-bold text-success">{mockChargingStations.filter(cs => cs.status === 'active').length}</p>
                        <p className="text-sm text-foreground-600">Actieve Laadpalen</p>
                      </div>
                      <div className="text-center p-3 bg-content2 rounded-lg">
                        <p className="text-2xl font-bold text-secondary">{mockVehicles.length}</p>
                        <p className="text-sm text-foreground-600">Voertuigen</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Recente Activiteit</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {mockCommunications.slice(0, 3).map((comm) => (
                        <div key={comm.id} className="flex gap-3 p-3 bg-content2 rounded-lg">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            {comm.type === 'phone' ? 
                              <PhoneIcon className="h-4 w-4 text-primary" /> : 
                              <EnvelopeIcon className="h-4 w-4 text-primary" />
                            }
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{comm.summary}</p>
                            <p className="text-xs text-foreground-500">
                              {formatTimestamp(comm.date)} • {comm.agent}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {selectedTab === 'orders' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Orders</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Orders table">
                  <TableHeader>
                    <TableColumn>ORDER NUMMER</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>BEDRAG</TableColumn>
                    <TableColumn>DATUM</TableColumn>
                    <TableColumn>BUSINESS ENTITY</TableColumn>
                    <TableColumn>ACTIES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Button 
                            variant="light" 
                            size="sm"
                            onPress={() => router.push(`/orders/${order.id}`)}
                            className="p-0 h-auto min-w-0 text-primary"
                          >
                            {order.orderNumber}
                          </Button>
                        </TableCell>
                        <TableCell>{order.type}</TableCell>
                        <TableCell>
                          <Chip size="sm" color={getStatusColor(order.status)} variant="flat">
                            {order.status}
                          </Chip>
                        </TableCell>
                        <TableCell>€{order.amount.toLocaleString('nl-NL')}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <Chip size="sm" color="secondary" variant="flat">
                            {order.businessEntity}
                          </Chip>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="light">
                            Bekijken
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {selectedTab === 'tickets' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Support Tickets</h3>
                  <Button color="primary" size="sm">
                    Nieuw Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {mockTickets.map((ticket) => (
                    <div key={ticket.id} className="p-4 border border-divider rounded-lg hover:bg-content2 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{ticket.title}</h4>
                        <div className="flex items-center gap-2">
                          <Chip size="sm" color={getPriorityColor(ticket.priority)} variant="flat">
                            {ticket.priority === 'low' ? 'Laag' : 
                             ticket.priority === 'medium' ? 'Gemiddeld' : 
                             ticket.priority === 'high' ? 'Hoog' : 'Urgent'}
                          </Chip>
                          <Chip size="sm" color={getStatusColor(ticket.status)} variant="flat">
                            {ticket.status === 'open' ? 'Open' : 
                             ticket.status === 'in-progress' ? 'In Behandeling' : 
                             ticket.status === 'resolved' ? 'Opgelost' : 'Gesloten'}
                          </Chip>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-foreground-600">
                        <span>{ticket.category}</span>
                        <span>{ticket.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {selectedTab === 'communications' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Communicatie Geschiedenis</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {mockCommunications.map((comm) => (
                    <div key={comm.id} className="flex gap-4 p-4 border border-divider rounded-lg">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${comm.type === 'phone' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                      `}>
                        {comm.type === 'phone' ? 
                          <PhoneIcon className="h-5 w-5" /> : 
                          <EnvelopeIcon className="h-5 w-5" />
                        }
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comm.type === 'phone' ? 'Telefoongesprek' : 'Email'}
                          </span>
                          <Chip size="sm" variant="flat" color={comm.direction === 'inbound' ? 'primary' : 'secondary'}>
                            {comm.direction === 'inbound' ? 'Inkomend' : 'Uitgaand'}
                          </Chip>
                          {comm.duration && (
                            <span className="text-xs text-foreground-500">• {comm.duration}</span>
                          )}
                        </div>
                        {comm.subject && (
                          <p className="font-medium text-sm mb-1">{comm.subject}</p>
                        )}
                        <p className="text-sm text-foreground-600 mb-2">{comm.summary}</p>
                        <div className="flex items-center justify-between text-xs text-foreground-500">
                          <span>{formatTimestamp(comm.date)}</span>
                          <span>{comm.agent}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {selectedTab === 'invoices' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Facturen</h3>
              </CardHeader>
              <CardBody>
                <Table aria-label="Invoices table">
                  <TableHeader>
                    <TableColumn>FACTUUR NUMMER</TableColumn>
                    <TableColumn>BEDRAG</TableColumn>
                    <TableColumn>STATUS</TableColumn>
                    <TableColumn>DATUM</TableColumn>
                    <TableColumn>VERVALDATUM</TableColumn>
                    <TableColumn>ACTIES</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {mockInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.invoiceNumber}</TableCell>
                        <TableCell>€{invoice.amount.toLocaleString('nl-NL')}</TableCell>
                        <TableCell>
                          <Chip size="sm" color={getStatusColor(invoice.status)} variant="flat">
                            {invoice.status === 'draft' ? 'Concept' : 
                             invoice.status === 'sent' ? 'Verzonden' : 
                             invoice.status === 'paid' ? 'Betaald' : 'Vervallen'}
                          </Chip>
                        </TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="light">
                              Bekijken
                            </Button>
                            <Button size="sm" variant="light">
                              Download
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          )}

          {selectedTab === 'charging' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BoltIcon className="h-5 w-5" />
                  Geïnstalleerde Laadstations
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {mockChargingStations.map((station) => (
                    <div key={station.id} className="p-4 border border-divider rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{station.model}</h4>
                          <p className="text-sm text-foreground-600">S/N: {station.serialNumber}</p>
                        </div>
                        <Chip size="sm" color={getStatusColor(station.status)} variant="flat">
                          {station.status === 'active' ? 'Actief' : 
                           station.status === 'inactive' ? 'Inactief' : 'Onderhoud'}
                        </Chip>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-foreground-600">Installatie Datum</p>
                          <p className="font-medium">{station.installationDate}</p>
                        </div>
                        <div>
                          <p className="text-foreground-600">Vermogen</p>
                          <p className="font-medium">{station.power}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-foreground-600">Adres</p>
                          <p className="font-medium">{station.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {selectedTab === 'subscriptions' && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CreditCardIcon className="h-5 w-5" />
                  Abonnementen
                </h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {mockSubscriptions.map((sub) => (
                    <div key={sub.id} className="p-4 border border-divider rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{sub.type}</h4>
                          <p className="text-sm text-foreground-600">€{sub.monthlyFee}/maand</p>
                        </div>
                        <Chip size="sm" color={getStatusColor(sub.status)} variant="flat">
                          {sub.status === 'active' ? 'Actief' : 
                           sub.status === 'inactive' ? 'Inactief' : 'Geannuleerd'}
                        </Chip>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-foreground-600">Start Datum</p>
                          <p className="font-medium">{sub.startDate}</p>
                        </div>
                        {sub.endDate && (
                          <div>
                            <p className="text-foreground-600">Eind Datum</p>
                            <p className="font-medium">{sub.endDate}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {selectedTab === 'vehicles' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TruckIcon className="h-5 w-5" />
                    Voertuigen
                  </h3>
                  <Button color="primary" size="sm">
                    Voertuig Toevoegen
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-4 border border-divider rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1">
                          {getVehicleTypeIcon(vehicle.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{vehicle.brand} {vehicle.model}</h4>
                          <p className="text-sm text-foreground-600 mb-2">{vehicle.year} • {vehicle.licensePlate}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-foreground-600">Type:</span>
                              <Chip size="sm" variant="flat" color="primary">
                                {vehicle.type.toUpperCase()}
                              </Chip>
                            </div>
                            {vehicle.batteryCapacity && (
                              <div className="flex items-center gap-2">
                                <span className="text-foreground-600">Batterij:</span>
                                <span className="font-medium">{vehicle.batteryCapacity}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default ContactDetailPage; 