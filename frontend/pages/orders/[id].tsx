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
  Badge
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
  PaperClipIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../components/layouts/AppLayout';

// Mock data interfaces
interface OrderStatus {
  id: string;
  name: string;
  date: string;
  color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
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

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar?: string;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
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
  comments: Comment[];
  auditLogs: AuditLog[];
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
    { id: '2', name: 'In Behandeling', date: '2024-01-16', color: 'primary', completed: true, current: false },
    { id: '3', name: 'Technische Check', date: '2024-01-18', color: 'warning', completed: true, current: true },
    { id: '4', name: 'Gepland', date: '', color: 'default', completed: false, current: false },
    { id: '5', name: 'In Uitvoering', date: '', color: 'default', completed: false, current: false },
    { id: '6', name: 'Voltooid', date: '', color: 'default', completed: false, current: false }
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
    { id: 'VIS-001', type: 'visit', title: 'Locatie Inspectie', status: 'Gepland', date: '2024-01-22' },
    { id: 'INT-001', type: 'intake', title: 'Intake Formulier', status: 'In Afwachting', date: '2024-01-17' },
    { id: 'INV-001', type: 'invoice', title: 'Factuur #2024-001', status: 'Concept', date: '2024-01-20', amount: 2850.00 }
  ],
  comments: [
    { id: 'COM-001', author: 'Jan Petersma', content: 'Klant heeft aangegeven dat de installatie bij voorkeur in de ochtend plaatsvindt.', timestamp: '2024-01-18 14:30', avatar: 'JP' },
    { id: 'COM-002', author: 'Maria Jansen', content: 'Technische check voltooid. Speciale kabel nodig voor aansluiting.', timestamp: '2024-01-18 16:45', avatar: 'MJ' }
  ],
  auditLogs: [
    { id: 'LOG-001', action: 'Status Update', user: 'System', timestamp: '2024-01-18 16:45', details: 'Status gewijzigd naar: Technische Check' },
    { id: 'LOG-002', action: 'Comment Added', user: 'Maria Jansen', timestamp: '2024-01-18 16:45', details: 'Technische check voltooid' },
    { id: 'LOG-003', action: 'Quote Generated', user: 'Jan Petersma', timestamp: '2024-01-16 10:30', details: 'Offerte QUO-001 gegenereerd' },
    { id: 'LOG-004', action: 'Order Created', user: 'System', timestamp: '2024-01-15 09:15', details: 'Order CHC-2024-001 aangemaakt' }
  ]
};

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(false);
    }, 1000);
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

  return (
    <>
      <Head>
        <title>Order {order.orderNumber} - ChargeCars Portal</title>
      </Head>

      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Header with Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                isIconOnly
                variant="light"
                onPress={() => router.back()}
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Order {order.orderNumber}</h1>
                <p className="text-foreground-600">{order.customerName} • {order.partnerName}</p>
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
            <CardHeader className="pb-3">
              <h2 className="text-lg font-semibold">Order Status</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-center justify-between w-full overflow-x-auto pb-4">
                {order.statuses.map((status, index) => (
                  <React.Fragment key={status.id}>
                    <div className="flex flex-col items-center min-w-[120px]">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center border-3 mb-3 transition-all duration-200
                        ${status.completed 
                          ? 'bg-success border-success text-white shadow-lg' 
                          : status.current 
                            ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20 shadow-md' 
                            : 'border-default-300 bg-default-100 text-default-400'
                        }
                      `}>
                        {status.completed ? (
                          <CheckCircleIcon className="h-6 w-6" />
                        ) : status.current ? (
                          <ClockIcon className="h-6 w-6" />
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-current opacity-50" />
                        )}
                      </div>
                      <Chip
                        size="sm"
                        color={status.completed ? 'success' : status.current ? 'primary' : 'default'}
                        variant={status.current ? 'solid' : status.completed ? 'flat' : 'light'}
                        className="mb-2 font-medium"
                      >
                        {status.name}
                      </Chip>
                      {status.date && (
                        <span className="text-xs text-foreground-500 font-medium">{status.date}</span>
                      )}
                    </div>
                    {index < order.statuses.length - 1 && (
                      <div className="flex items-center justify-center flex-1 mx-2">
                        <div className={`
                          h-1 flex-1 rounded-full transition-colors duration-300
                          ${status.completed ? 'bg-success' : 'bg-default-200'}
                        `} />
                        <ChevronRightIcon className={`
                          h-5 w-5 mx-1 transition-colors duration-300
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

              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Klant Details
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <Avatar name={order.customer.name} size="lg" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{order.customer.name}</h4>
                      <p className="text-foreground-600 mb-2">{order.customer.role}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-foreground-500" />
                          <span className="text-sm">{order.customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-foreground-500" />
                          <span className="text-sm">{order.customer.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Partner Details */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5" />
                    Partner Details
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="flex items-start gap-4">
                    <Avatar name={order.partner.name} size="lg" color="secondary" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{order.partnerName}</h4>
                      <p className="text-foreground-600 mb-2">{order.partner.name} • {order.partner.role}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <EnvelopeIcon className="h-4 w-4 text-foreground-500" />
                          <span className="text-sm">{order.partner.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-foreground-500" />
                          <span className="text-sm">{order.partner.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Additional Contacts */}
              {order.additionalContacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Extra Contacten</h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-4">
                      {order.additionalContacts.map((contact) => (
                        <div key={contact.id} className="flex items-center gap-3 p-3 bg-content2 rounded-lg">
                          <Avatar name={contact.name} size="sm" />
                          <div className="flex-1">
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-foreground-600">{contact.role}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p>{contact.email}</p>
                            <p className="text-foreground-500">{contact.phone}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Addresses */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5" />
                    Adressen
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.addresses.map((address, index) => (
                      <div key={index} className="p-4 border border-divider rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPinIcon className="h-4 w-4 text-foreground-500" />
                          <Chip size="sm" variant="flat" color={address.type === 'installation' ? 'primary' : 'secondary'}>
                            {address.type === 'installation' ? 'Installatie' : 'Factuur'}
                          </Chip>
                        </div>
                        <div className="text-sm space-y-1">
                          <p>{address.street}</p>
                          <p>{address.zipCode} {address.city}</p>
                          <p className="text-foreground-500">{address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Related Items */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Gerelateerde Items</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    {order.relatedItems.map((item) => (
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
                </CardBody>
              </Card>
            </div>

            {/* Right Column - Comments & Audit Log */}
            <div className="space-y-6">
              {/* Comments Section */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    Opmerkingen
                  </h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  {/* Add Comment */}
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Voeg een opmerking toe..."
                      value={newComment}
                      onValueChange={setNewComment}
                      minRows={3}
                      maxRows={6}
                    />
                    <div className="flex justify-end">
                      <Button
                        color="primary"
                        size="sm"
                        onPress={handleAddComment}
                        isLoading={isLoading}
                        isDisabled={!newComment.trim()}
                      >
                        Toevoegen
                      </Button>
                    </div>
                  </div>

                  <Divider />

                  {/* Comments List */}
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {order.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar name={comment.avatar || comment.author} size="sm" />
                        <div className="flex-1">
                          <div className="bg-content2 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{comment.author}</span>
                              <span className="text-xs text-foreground-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Audit Log */}
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                    Audit Log
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {order.auditLogs.map((log, index) => (
                      <div key={log.id} className="flex gap-3 relative">
                        {index < order.auditLogs.length - 1 && (
                          <div className="absolute left-2 top-8 w-0.5 h-full bg-divider" />
                        )}
                        <div className="w-4 h-4 bg-primary rounded-full mt-1 relative z-10" />
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{log.action}</span>
                            <Chip size="sm" variant="flat" color="primary" className="text-xs">
                              {log.user}
                            </Chip>
                          </div>
                          <p className="text-sm text-foreground-600 mb-1">{log.details}</p>
                          <span className="text-xs text-foreground-500">{log.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
};

export default OrderDetailPage; 