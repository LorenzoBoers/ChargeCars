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
  Tab
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
  PhotoIcon,
  TableCellsIcon,
  PresentationChartBarIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../components/layouts/AppLayout';

// Mock data interfaces
interface OrderStatus {
  id: string;
  name: string;
  date: string;
  color: 'success' | 'primary' | 'secondary' | 'warning' | 'danger';
  completed: boolean;
  current: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Address {
  type: 'installation' | 'billing';
  street: string;
  city: string;
  zipCode: string;
  country: string;
}

interface RelatedItem {
  id: string;
  type: 'quote' | 'visit' | 'intake' | 'invoice';
  title: string;
  status: string;
  date: string;
  amount?: number;
}

interface TimelineItem {
  id: string;
  type: 'comment' | 'audit' | 'internal';
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
  isInternal?: boolean;
  files?: { name: string; size: string; type: string }[];
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  partnerName: string;
  businessEntity: string;
  orderType: string;
  totalAmount: number;
  createdAt: string;
  expectedDelivery: string;
  statuses: OrderStatus[];
  customer: Contact;
  partner: Contact;
  additionalContacts: Contact[];
  addresses: Address[];
  relatedItems: RelatedItem[];
  timeline: TimelineItem[];
}

// Mock data
const mockOrder: OrderDetail = {
  id: 'ORD-2024-001',
  orderNumber: 'CHC-2024-001',
  customerName: 'Henk van der Berg',
  partnerName: 'EnergieDirect B.V.',
  businessEntity: 'ChargeCars',
  orderType: 'Laadpaal Installatie',
  totalAmount: 2850.00,
  createdAt: '2024-01-15',
  expectedDelivery: '2024-02-15',
  statuses: [
    { id: '1', name: 'Ontvangen', date: '2024-01-15', color: 'success', completed: true, current: false },
    { id: '2', name: 'In Behandeling', date: '2024-01-16', color: 'warning', completed: true, current: false },
    { id: '3', name: 'Technische Check', date: '2024-01-18', color: 'secondary', completed: true, current: false },
    { id: '4', name: 'Gepland', date: '2024-01-20', color: 'primary', completed: false, current: true },
    { id: '5', name: 'In Uitvoering', date: '', color: 'danger', completed: false, current: false },
    { id: '6', name: 'Voltooid', date: '', color: 'success', completed: false, current: false }
  ],
  customer: {
    id: 'CUST-001',
    name: 'Henk van der Berg',
    role: 'Eigenaar',
    email: 'h.vandenberg@email.nl',
    phone: '+31 6 12345678'
  },
  partner: {
    id: 'PART-001',
    name: 'Jan Petersma',
    role: 'Account Manager',
    email: 'j.petersma@energiedirect.nl',
    phone: '+31 20 1234567'
  },
  additionalContacts: [
    {
      id: 'CONT-001',
      name: 'Maria Jansen',
      role: 'Technisch Adviseur',
      email: 'm.jansen@techniek.nl',
      phone: '+31 30 9876543'
    }
  ],
  addresses: [
    {
      type: 'installation',
      street: 'Hoofdstraat 123',
      city: 'Amsterdam',
      zipCode: '1012 AB',
      country: 'Nederland'
    },
    {
      type: 'billing',
      street: 'Postbus 456',
      city: 'Amsterdam',
      zipCode: '1012 CD',
      country: 'Nederland'
    }
  ],
  relatedItems: [
    { id: 'QUO-001', type: 'quote', title: 'Offerte Laadpaal Installatie', status: 'Verzonden', date: '2024-01-16', amount: 2850.00 },
    { id: 'QUO-002', type: 'quote', title: 'Herziene Offerte', status: 'Concept', date: '2024-01-18', amount: 2750.00 },
    { id: 'VIS-001', type: 'visit', title: 'Locatie Inspectie', status: 'Gepland', date: '2024-01-22' },
    { id: 'VIS-002', type: 'visit', title: 'Technische Meting', status: 'In Afwachting', date: '2024-01-25' },
    { id: 'INT-001', type: 'intake', title: 'Intake Formulier', status: 'In Afwachting', date: '2024-01-17' },
    { id: 'INV-001', type: 'invoice', title: 'Factuur #2024-001', status: 'Concept', date: '2024-01-20', amount: 2850.00 }
  ],
  timeline: [
    {
      id: 'TL-001',
      type: 'audit',
      author: 'System',
      content: 'Order CHC-2024-001 aangemaakt',
      timestamp: '2024-01-15T09:15:00',
      avatar: 'SY'
    },
    {
      id: 'TL-002',
      type: 'comment',
      author: 'Jan Petersma',
      content: 'Klant heeft aangegeven dat de installatie bij voorkeur in de ochtend plaatsvindt.',
      timestamp: '2024-01-18T14:30:00',
      avatar: 'JP'
    },
    {
      id: 'TL-003',
      type: 'internal',
      author: 'Maria Jansen',
      content: 'Let op: klant heeft beperkte parkeergelegenheid. Mogelijk extra transport nodig.',
      timestamp: '2024-01-18T15:45:00',
      avatar: 'MJ',
      isInternal: true
    },
    {
      id: 'TL-004',
      type: 'audit',
      author: 'Maria Jansen',
      content: 'Status gewijzigd naar: Technische Check',
      timestamp: '2024-01-18T16:45:00',
      avatar: 'MJ'
    },
    {
      id: 'TL-005',
      type: 'comment',
      author: 'Maria Jansen',
      content: 'Technische check voltooid. Speciale kabel nodig voor aansluiting.',
      timestamp: '2024-01-18T16:45:00',
      avatar: 'MJ',
      files: [
        { name: 'technische_specificaties.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'locatie_foto.jpg', size: '1.1 MB', type: 'image' }
      ]
    },
    {
      id: 'TL-006',
      type: 'audit',
      author: 'Jan Petersma',
      content: 'Offerte QUO-001 gegenereerd',
      timestamp: '2024-01-16T10:30:00',
      avatar: 'JP'
    }
  ]
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Mock loading state
  if (!id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary rounded animate-pulse mx-auto mb-4" />
            <p className="text-foreground-500">Loading order...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const order = mockOrder; // In real app, fetch based on id

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setNewComment('');
      setSelectedFiles([]);
      setIsInternal(false);
      setIsLoading(false);
    }, 1000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getRelatedItemIcon = (type: string) => {
    switch (type) {
      case 'quote': return <DocumentTextIcon className="h-4 w-4" />;
      case 'visit': return <CalendarDaysIcon className="h-4 w-4" />;
      case 'intake': return <ClipboardDocumentListIcon className="h-4 w-4" />;
      case 'invoice': return <CurrencyEuroIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getRelatedItemColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verzonden':
      case 'voltooid': return 'success';
      case 'gepland': return 'primary';
      case 'in afwachting':
      case 'concept': return 'warning';
      default: return 'default';
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <PhotoIcon className="h-4 w-4 text-primary" />;
    if (type.includes('pdf')) return <DocumentTextIcon className="h-4 w-4 text-danger" />;
    if (type.includes('word')) return <DocumentTextIcon className="h-4 w-4 text-primary" />;
    if (type.includes('excel')) return <TableCellsIcon className="h-4 w-4 text-success" />;
    return <PaperClipIcon className="h-4 w-4 text-default-500" />;
  };

  // Group related items by type
  const groupedRelatedItems = order.relatedItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, RelatedItem[]>);

  const getGroupTitle = (type: string) => {
    switch (type) {
      case 'quote': return 'Offertes';
      case 'visit': return 'Bezoeken';
      case 'intake': return 'Intake Formulieren';
      case 'invoice': return 'Facturen';
      default: return type;
    }
  };

  // Sort timeline by timestamp (oldest first for chat-like display)
  const sortedTimeline = [...order.timeline]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .filter(item => !item.isInternal || showInternalNotes);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}u geleden`;
    } else if (diffDays < 7) {
      return `${diffDays}d geleden`;
    } else {
      return date.toLocaleDateString('nl-NL');
    }
  };

  return (
    <>
      <Head>
        <title>Order {order.orderNumber} - ChargeCars Portal</title>
      </Head>

      <AppLayout>
        <div className="p-4 space-y-4">
          {/* Header with Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                size="sm"
                onPress={() => router.back()}
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Order {order.orderNumber}</h1>
                <p className="text-sm text-foreground-600">{order.customerName} • {order.partnerName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button color="primary" size="sm" startContent={<PencilIcon className="h-4 w-4" />}>
                Bewerken
              </Button>
              <Button variant="bordered" size="sm" startContent={<PrinterIcon className="h-4 w-4" />}>
                Print
              </Button>
              <Button variant="bordered" size="sm" startContent={<ShareIcon className="h-4 w-4" />}>
                Delen
              </Button>
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly variant="bordered">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem key="duplicate">Dupliceren</DropdownItem>
                  <DropdownItem key="archive">Archiveren</DropdownItem>
                  <DropdownItem key="delete" className="text-danger" color="danger">
                    Verwijderen
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Status Timeline */}
          <Card>
            <CardHeader className="pb-2">
              <h2 className="text-base font-semibold">Order Status</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-center justify-between w-full overflow-x-auto pb-2">
                {order.statuses.map((status, index) => (
                  <React.Fragment key={status.id}>
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 transition-all duration-200
                        ${status.completed 
                          ? 'bg-success border-success text-white shadow-md' 
                          : status.current 
                            ? 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20' 
                            : 'border-default-300 bg-default-100 text-default-400'
                        }
                      `}>
                        {status.completed ? (
                          <CheckCircleIcon className="h-4 w-4" />
                        ) : status.current ? (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current opacity-50" />
                        )}
                      </div>
                      <Chip
                        size="sm"
                        color={status.completed ? 'success' : status.current ? 'primary' : 'default'}
                        variant={status.current ? 'solid' : status.completed ? 'flat' : 'light'}
                        className="mb-1 text-xs"
                      >
                        {status.name}
                      </Chip>
                      {status.date && (
                        <span className="text-xs text-foreground-500">{status.date}</span>
                      )}
                    </div>
                    {index < order.statuses.length - 1 && (
                      <div className="flex items-center justify-center flex-1 mx-1">
                        <div className={`
                          h-0.5 flex-1 rounded-full transition-colors duration-300
                          ${status.completed ? 'bg-success' : 'bg-default-200'}
                        `} />
                        <ChevronRightIcon className={`
                          h-4 w-4 mx-1 transition-colors duration-300
                          ${status.completed ? 'text-success' : 'text-default-300'}
                        `} />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Order Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* Order Overview */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Order Overzicht</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground-600">Order Type</p>
                      <p className="font-medium">{order.orderType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Business Entity</p>
                      <Chip size="sm" color="secondary" variant="flat">{order.businessEntity}</Chip>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Totaal Bedrag</p>
                      <p className="font-semibold text-lg">€{order.totalAmount.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Verwachte Levering</p>
                      <p className="font-medium">{order.expectedDelivery}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Customer & Partner Details - 3 Cards Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Customer Details */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Eindklant
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div 
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-content2 transition-colors cursor-pointer"
                      onClick={() => router.push(`/contacts/${order.customer.id}`)}
                    >
                      <Avatar name={order.customer.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-primary hover:text-primary-600 transition-colors truncate">{order.customer.name}</h4>
                        <p className="text-foreground-600 text-xs mb-2">{order.customer.role}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <EnvelopeIcon className="h-3 w-3 text-foreground-500 flex-shrink-0" />
                            <span className="text-xs truncate">{order.customer.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3 text-foreground-500 flex-shrink-0" />
                            <span className="text-xs">{order.customer.phone}</span>
                          </div>
                        </div>
                      </div>
                      <div className="self-center flex-shrink-0">
                        <ChevronRightIcon className="h-4 w-4 text-foreground-400" />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Partner Details */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-base font-semibold flex items-center gap-2">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      Opdrachtgever
                    </h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="flex items-start gap-3 p-2">
                      <Avatar name={order.partner.name} size="md" color="secondary" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{order.partnerName}</h4>
                        <p className="text-foreground-600 text-xs mb-2 truncate">{order.partner.name} • {order.partner.role}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <EnvelopeIcon className="h-3 w-3 text-foreground-500 flex-shrink-0" />
                            <span className="text-xs truncate">{order.partner.email}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3 text-foreground-500 flex-shrink-0" />
                            <span className="text-xs">{order.partner.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Additional Contacts */}
                <Card>
                  <CardHeader className="pb-2">
                    <h3 className="text-base font-semibold">Overige Contacten</h3>
                  </CardHeader>
                  <CardBody className="pt-0">
                    <div className="space-y-2">
                      {order.additionalContacts.length > 0 ? (
                        order.additionalContacts.map((contact) => (
                          <div key={contact.id} className="flex items-center gap-2 p-2 bg-content2/50 rounded-lg">
                            <Avatar name={contact.name} size="sm" className="w-6 h-6 text-xs" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-xs truncate">{contact.name}</p>
                              <p className="text-xs text-foreground-600 truncate">{contact.role}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-foreground-500 italic">Geen extra contacten</p>
                      )}
                      <Button 
                        size="sm" 
                        variant="light" 
                        color="primary" 
                        className="w-full text-xs h-6"
                        startContent={<UserIcon className="h-3 w-3" />}
                      >
                        Contact Toevoegen
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>

              {/* Addresses with Google Maps */}
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <MapPinIcon className="h-4 w-4" />
                    Adressen
                  </h3>
                </CardHeader>
                <CardBody className="pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Address List */}
                    <div className="space-y-3">
                      {order.addresses.map((address, index) => (
                        <div key={index} className="p-3 border border-divider rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Chip 
                              size="sm" 
                              color={address.type === 'installation' ? 'primary' : 'secondary'} 
                              variant="flat"
                              className="text-xs"
                            >
                              {address.type === 'installation' ? 'Installatie' : 'Factuur'}
                            </Chip>
                            <Button
                              size="sm"
                              variant="light"
                              isIconOnly
                              className="h-6 w-6"
                            >
                              <PencilIcon className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-sm">{address.street}</p>
                            <p className="text-sm text-foreground-600">{address.zipCode} {address.city}</p>
                            <p className="text-xs text-foreground-500">{address.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Google Maps Embed */}
                    <div className="relative">
                      <div className="w-full h-48 bg-content2 rounded-lg overflow-hidden">
                        <iframe
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBDaeWicvigtP9xPv919E-RNoxfvC-Hqik&q=${encodeURIComponent(order.addresses[0]?.street + ', ' + order.addresses[0]?.city + ', ' + order.addresses[0]?.country)}`}
                        />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          className="text-xs h-6"
                          startContent={<MapPinIcon className="h-3 w-3" />}
                        >
                          Route
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Grouped Related Items */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Gerelateerde Items</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-6">
                    {Object.entries(groupedRelatedItems).map(([type, items]) => (
                      <div key={type}>
                        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                          {getRelatedItemIcon(type)}
                          {getGroupTitle(type)}
                          <Chip size="sm" color="primary" variant="flat">{items.length}</Chip>
                        </h4>
                        <div className="space-y-2">
                          {type === 'quote' && (
                            <div className="space-y-2">
                              {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-content2 rounded-lg hover:bg-content3 transition-colors cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      {getRelatedItemIcon(item.type)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{item.title}</p>
                                      <p className="text-sm text-foreground-600">{item.date}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {item.amount && (
                                      <span className="font-semibold">€{item.amount.toLocaleString('nl-NL')}</span>
                                    )}
                                    <Chip size="sm" color={getRelatedItemColor(item.status)} variant="flat">
                                      {item.status}
                                    </Chip>
                                    <div className="flex gap-1">
                                      <Button 
                                        size="sm" 
                                        variant="light"
                                        onPress={() => router.push(`/quotes/${item.id}`)}
                                      >
                                        Bekijken
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="flat"
                                        onPress={() => router.push(`/quotes/${item.id}/build`)}
                                      >
                                        Bewerken
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {type !== 'quote' && (
                            <div className="space-y-2">
                              {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-content2 rounded-lg hover:bg-content3 transition-colors cursor-pointer">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      {getRelatedItemIcon(item.type)}
                                    </div>
                                    <div>
                                      <p className="font-medium">{item.title}</p>
                                      <p className="text-sm text-foreground-600">{item.date}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {item.amount && (
                                      <span className="font-semibold">€{item.amount.toLocaleString('nl-NL')}</span>
                                    )}
                                    <Chip size="sm" color={getRelatedItemColor(item.status)} variant="flat">
                                      {item.status}
                                    </Chip>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Timeline */}
            <div className="space-y-6">
              {/* Timeline Section */}
              <Card className="h-[800px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between w-full">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Activiteiten
                    </h3>
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        isSelected={showInternalNotes}
                        onValueChange={setShowInternalNotes}
                        startContent={<EyeSlashIcon className="h-3 w-3" />}
                        endContent={<EyeIcon className="h-3 w-3" />}
                      />
                      <span className="text-sm text-foreground-600">Intern</span>
                    </div>
                  </div>
                </CardHeader>

                {/* Timeline Messages */}
                <CardBody className="flex-1 overflow-y-auto p-0">
                  <div className="p-6 space-y-4">
                    {sortedTimeline.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        {item.type !== 'audit' && (
                          <Avatar 
                            name={item.avatar || item.author} 
                            size="sm" 
                          />
                        )}
                        {item.type === 'audit' && (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <div className="w-2 h-2 bg-default-400 rounded-full" />
                          </div>
                        )}
                        <div className="flex-1">
                          {item.type === 'audit' ? (
                            // System events - simple text without background
                            <div className="pt-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-foreground-500">{formatTimestamp(item.timestamp)}</span>
                                <Chip size="sm" color="default" variant="flat" className="text-xs">
                                  Systeem
                                </Chip>
                              </div>
                              <p className="text-sm text-foreground-600 italic">{item.content}</p>
                            </div>
                          ) : (
                            // Regular comments and internal notes
                            <div className={`
                              p-3 rounded-lg
                              ${item.type === 'internal' 
                                ? 'bg-warning/10 border border-warning/20' 
                                : 'bg-content2'
                              }
                            `}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{item.author}</span>
                                <span className="text-xs text-foreground-500">{formatTimestamp(item.timestamp)}</span>
                                {item.isInternal && (
                                  <Chip size="sm" color="warning" variant="flat" className="text-xs">
                                    Intern
                                  </Chip>
                                )}
                              </div>
                              <p className="text-sm">{item.content}</p>
                              
                              {/* Files */}
                              {item.files && item.files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {item.files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-content1 rounded border border-divider">
                                      <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                                      <span className="text-sm flex-1">{file.name}</span>
                                      <span className="text-xs text-foreground-500">{file.size}</span>
                                      <Button size="sm" variant="light" className="text-xs">
                                        Download
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
                
                {/* Add Comment Section - Moved to bottom */}
                <div className="px-6 py-4 flex-shrink-0 border-t border-divider">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        isSelected={isInternal}
                        onValueChange={setIsInternal}
                      />
                      <span className="text-sm text-foreground-600">
                        {isInternal ? 'Interne notitie' : 'Publieke opmerking'}
                      </span>
                    </div>
                    
                    <Textarea
                      placeholder={isInternal ? "Voeg een interne notitie toe..." : "Voeg een opmerking toe..."}
                      value={newComment}
                      onValueChange={setNewComment}
                      minRows={2}
                      maxRows={4}
                      classNames={{
                        input: isInternal ? "bg-warning/5 border-warning/20" : ""
                      }}
                    />
                    
                    {/* File Upload */}
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<PaperClipIcon className="h-4 w-4" />}
                        onPress={() => document.getElementById('file-upload')?.click()}
                      >
                        Bestanden
                      </Button>
                      
                      <Button
                        color="primary"
                        size="sm"
                        onPress={handleAddComment}
                        isLoading={isLoading}
                        isDisabled={!newComment.trim()}
                        className="ml-auto"
                      >
                        {isInternal ? 'Notitie Toevoegen' : 'Toevoegen'}
                      </Button>
                    </div>
                    
                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-content2 rounded-lg">
                            <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                            <span className="text-sm flex-1 truncate">{file.name}</span>
                            <span className="text-xs text-foreground-500">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                            <Button
                              size="sm"
                              isIconOnly
                              variant="light"
                              onPress={() => removeFile(index)}
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default OrderDetailPage; 