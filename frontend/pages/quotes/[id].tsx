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
  PlusIcon,
  TrashIcon,
  Bars3Icon,
  DocumentDuplicateIcon,
  BookmarkIcon,
  XMarkIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../components/layouts/AppLayout';

// Interfaces
interface QuoteStatus {
  id: string;
  name: string;
  date: string;
  color: 'success' | 'primary' | 'secondary' | 'warning' | 'danger';
  completed: boolean;
  current: boolean;
}

interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'product' | 'service' | 'installation' | 'other';
  visit_id: string;
  visit_name: string;
  contact_id: string;
  contact_name: string;
  contact_role: 'account' | 'end_customer' | 'intermediary';
  is_customer_responsible: boolean;
}

interface QuoteContact {
  id: string;
  name: string;
  role: 'account' | 'end_customer' | 'intermediary';
  email: string;
  phone: string;
  avatar?: string;
}

interface QuoteDetail {
  id: string;
  quote_number: string;
  order_id: string;
  order_number: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  total_amount: number;
  customer_amount: number;
  partner_amount: number;
  valid_until: string;
  business_entity: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  partner_name: string;
  line_items: QuoteLineItem[];
  statuses: QuoteStatus[];
  contacts: QuoteContact[];
  terms_conditions?: string;
  delivery_time?: string;
  warranty_period?: string;
}

// Mock data
const mockQuote: QuoteDetail = {
  id: 'QUO-002',
  quote_number: 'QUO-2024-002',
  order_id: 'ORD-001',
  order_number: 'CHC-2024-001',
  status: 'sent',
  total_amount: 3250.00,
  customer_amount: 2850.00,
  partner_amount: 400.00,
  valid_until: '2024-02-15',
  business_entity: 'ChargeCars',
  created_at: '2024-01-20',
  updated_at: '2024-01-22',
  customer_name: 'Henk van der Berg',
  partner_name: 'EnergieDirect B.V.',
  delivery_time: '2-3 weken',
  warranty_period: '5 jaar garantie',
  terms_conditions: 'Standaard ChargeCars voorwaarden van toepassing. Betaling binnen 30 dagen na levering.',
  
  statuses: [
    { id: '1', name: 'Concept', date: '2024-01-20', color: 'success', completed: true, current: false },
    { id: '2', name: 'Ter Review', date: '2024-01-21', color: 'success', completed: true, current: false },
    { id: '3', name: 'Verzonden', date: '2024-01-22', color: 'primary', completed: false, current: true },
    { id: '4', name: 'Geaccepteerd', date: '', color: 'success', completed: false, current: false },
    { id: '5', name: 'Naar Order', date: '', color: 'secondary', completed: false, current: false }
  ],

  contacts: [
    {
      id: 'CONT-001',
      name: 'Henk van der Berg',
      role: 'end_customer',
      email: 'h.vandenberg@email.nl',
      phone: '+31 6 12345678'
    },
    {
      id: 'CONT-002',
      name: 'EnergieDirect B.V.',
      role: 'account',
      email: 'orders@energiedirect.nl', 
      phone: '+31 20 1234567'
    },
    {
      id: 'CONT-003',
      name: 'Maria Adviseur',
      role: 'intermediary',
      email: 'm.adviseur@intermediair.nl',
      phone: '+31 30 9876543'
    }
  ],
  
  line_items: [
    // Visit 1 items
    {
      id: 'LI-001',
      description: 'Locatie inspectie en technische meting',
      quantity: 1,
      unit_price: 125.00,
      total_price: 125.00,
      category: 'service',
      visit_id: 'VIS-001',
      visit_name: 'Locatie Inspectie',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true
    },
    {
      id: 'LI-002',
      description: 'Rapportage technische haalbaarheid',
      quantity: 1,
      unit_price: 75.00,
      total_price: 75.00,
      category: 'service',
      visit_id: 'VIS-001',
      visit_name: 'Locatie Inspectie',
      contact_id: 'CONT-002',
      contact_name: 'EnergieDirect B.V.',
      contact_role: 'account',
      is_customer_responsible: false
    },
    
    // Visit 2 items
    {
      id: 'LI-003',
      description: 'ChargeCars Pro 22kW Laadpaal',
      quantity: 1,
      unit_price: 1850.00,
      total_price: 1850.00,
      category: 'product',
      visit_id: 'VIS-002',
      visit_name: 'Installatie',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true
    },
    {
      id: 'LI-004',
      description: 'Installatie materiaal (kabels, beugels)',
      quantity: 1,
      unit_price: 275.00,
      total_price: 275.00,
      category: 'product',
      visit_id: 'VIS-002',
      visit_name: 'Installatie',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true
    },
    {
      id: 'LI-005',
      description: 'Installatie werkzaamheden (8 uur)',
      quantity: 8,
      unit_price: 85.00,
      total_price: 680.00,
      category: 'installation',
      visit_id: 'VIS-002',
      visit_name: 'Installatie',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true
    },
    {
      id: 'LI-006',
      description: 'Partner commissie installatie',
      quantity: 1,
      unit_price: 200.00,
      total_price: 200.00,
      category: 'service',
      visit_id: 'VIS-002',
      visit_name: 'Installatie',
      contact_id: 'CONT-002',
      contact_name: 'EnergieDirect B.V.',
      contact_role: 'account',
      is_customer_responsible: false
    },
    
    // Visit 3 items
    {
      id: 'LI-007',
      description: 'Eindcontrole en test laadpaal',
      quantity: 1,
      unit_price: 120.00,
      total_price: 120.00,
      category: 'service',
      visit_id: 'VIS-003',
      visit_name: 'Afronding',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true
    },
    {
      id: 'LI-008',
      description: 'Oplevering documentatie',
      quantity: 1,
      unit_price: 50.00,
      total_price: 50.00,
      category: 'service',
      visit_id: 'VIS-003',
      visit_name: 'Afronding',
      contact_id: 'CONT-003',
      contact_name: 'Maria Adviseur',
      contact_role: 'intermediary',
      is_customer_responsible: false
    }
  ]
};

const QuoteDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  // Mock loading state
  if (!id) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 bg-primary rounded animate-pulse mx-auto mb-4" />
            <p className="text-foreground-500">Loading quote...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const quote = mockQuote; // In real app, fetch based on id

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'warning';
      case 'sent': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'expired': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Concept';
      case 'sent': return 'Verzonden';
      case 'accepted': return 'Geaccepteerd';
      case 'rejected': return 'Afgewezen';
      case 'expired': return 'Verlopen';
      default: return status;
    }
  };

  const getContactColor = (role: string) => {
    switch (role) {
      case 'end_customer': return 'success';
      case 'account': return 'primary';
      case 'intermediary': return 'warning';
      default: return 'default';
    }
  };

  const getContactLabel = (role: string) => {
    switch (role) {
      case 'end_customer': return 'Eindklant';
      case 'account': return 'Account';
      case 'intermediary': return 'Tussenpersoon';
      default: return role;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product': return '📦';
      case 'service': return '🛠️';
      case 'installation': return '⚡';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  // Group line items by visit and then by contact
  const groupedItems = quote.line_items.reduce((acc, item) => {
    if (!acc[item.visit_id]) {
      acc[item.visit_id] = {
        visit_name: item.visit_name,
        contacts: {}
      };
    }
    if (!acc[item.visit_id].contacts[item.contact_id]) {
      acc[item.visit_id].contacts[item.contact_id] = {
        contact_name: item.contact_name,
        contact_role: item.contact_role,
        items: []
      };
    }
    acc[item.visit_id].contacts[item.contact_id].items.push(item);
    return acc;
  }, {} as Record<string, { visit_name: string; contacts: Record<string, { contact_name: string; contact_role: string; items: QuoteLineItem[] }> }>);

  return (
    <>
      <Head>
        <title>Quote {quote.quote_number} - ChargeCars Portal</title>
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">Quote {quote.quote_number}</h1>
                <p className="text-foreground-600">Order {quote.order_number} • {quote.business_entity}</p>
              </div>
              <Chip size="lg" color={getStatusColor(quote.status)} variant="flat">
                {getStatusLabel(quote.status)}
              </Chip>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                color="primary" 
                startContent={<WrenchScrewdriverIcon className="h-4 w-4" />}
                onPress={() => router.push(`/quotes/${quote.id}/build`)}
              >
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
                  <DropdownItem key="duplicate">Quote Dupliceren</DropdownItem>
                  <DropdownItem key="pdf">Export PDF</DropdownItem>
                  <DropdownItem key="email">Email Verzenden</DropdownItem>
                  <DropdownItem key="convert">Naar Order</DropdownItem>
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
              <h2 className="text-lg font-semibold">Quote Status</h2>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="flex items-center justify-between w-full overflow-x-auto pb-4">
                {quote.statuses.map((status, index) => (
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
                          <div className="w-4 h-4 rounded-full bg-primary" />
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
                    {index < quote.statuses.length - 1 && (
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

          {/* Quote Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-foreground-600">Quote Gegevens</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Geldig tot:</span>
                    <span className="text-sm font-medium">{quote.valid_until}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Levertijd:</span>
                    <span className="text-sm font-medium">{quote.delivery_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Garantie:</span>
                    <span className="text-sm font-medium">{quote.warranty_period}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-foreground-600">Klant Gegevens</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-2">
                  {quote.contacts.filter(c => c.role === 'end_customer').map(contact => (
                    <div key={contact.id} className="flex items-center gap-2">
                      <Avatar name={contact.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <p className="text-xs text-foreground-500 truncate">{contact.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-foreground-600">Account Gegevens</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-2">
                  {quote.contacts.filter(c => c.role === 'account').map(contact => (
                    <div key={contact.id} className="flex items-center gap-2">
                      <Avatar name={contact.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{contact.name}</p>
                        <p className="text-xs text-foreground-500 truncate">{contact.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-foreground-600">Totaal Overzicht</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-600">Klant:</span>
                    <span className="text-sm font-semibold text-success">€{quote.customer_amount.toLocaleString('nl-NL')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-foreground-600">Partner:</span>
                    <span className="text-sm font-semibold text-primary">€{quote.partner_amount.toLocaleString('nl-NL')}</span>
                  </div>
                  <Divider />
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Totaal:</span>
                    <span className="text-lg font-bold text-foreground">€{quote.total_amount.toLocaleString('nl-NL')}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Line Items Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Line Items Gegevens per Klus</h3>
                <Button 
                  size="sm" 
                  color="primary" 
                  variant="flat"
                  startContent={<PencilIcon className="h-4 w-4" />}
                  onPress={() => router.push(`/quotes/${quote.id}/build`)}
                >
                  Bewerken
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-divider">
                      <th className="text-left py-3 px-4 font-semibold text-sm text-foreground-600 min-w-[100px]">Visit</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-foreground-600 min-w-[40px]">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-foreground-600 min-w-[300px]">Line Item Gegevens Kolommen</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-foreground-600 min-w-[80px]">Aantal</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-foreground-600 min-w-[100px]">Prijs p/s</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-foreground-600 min-w-[100px]">Totaal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedItems).map(([visitId, visitData], visitIndex) => {
                      const visitItems = Object.values(visitData.contacts).flatMap(contact => contact.items);
                      const visitTotal = visitItems.reduce((sum, item) => sum + item.total_price, 0);
                      
                      return (
                        <React.Fragment key={visitId}>
                          {Object.entries(visitData.contacts).map(([contactId, contactData], contactIndex) => {
                            const contactItems = contactData.items;
                            const contactTotal = contactItems.reduce((sum, item) => sum + item.total_price, 0);
                            
                            return (
                              <React.Fragment key={contactId}>
                                {contactItems.map((item, itemIndex) => (
                                  <tr key={item.id} className="border-b border-divider/50 hover:bg-content2/50 transition-colors">
                                    {/* Visit column - only show on first item of first contact */}
                                    {visitIndex === 0 && contactIndex === 0 && itemIndex === 0 && (
                                      <td 
                                        rowSpan={visitItems.length}
                                        className="py-3 px-4 border-r border-divider bg-primary/5 align-top"
                                      >
                                        <div className="flex items-center gap-2">
                                          <CalendarDaysIcon className="h-4 w-4 text-primary" />
                                          <span className="font-semibold text-sm">{visitData.visit_name}</span>
                                        </div>
                                      </td>
                                    )}
                                    {/* Show visit for subsequent visits */}
                                    {visitIndex > 0 && contactIndex === 0 && itemIndex === 0 && (
                                      <td 
                                        rowSpan={visitItems.length}
                                        className="py-3 px-4 border-r border-divider bg-primary/5 align-top"
                                      >
                                        <div className="flex items-center gap-2">
                                          <CalendarDaysIcon className="h-4 w-4 text-primary" />
                                          <span className="font-semibold text-sm">{visitData.visit_name}</span>
                                        </div>
                                      </td>
                                    )}
                                    
                                    {/* Contact section - show contact info on first item of each contact */}
                                    {itemIndex === 0 && (
                                      <td 
                                        rowSpan={contactItems.length}
                                        className="py-3 px-4 border-r border-divider/50 bg-content2/30 align-top"
                                      >
                                        <div className="space-y-1">
                                          <p className="font-medium text-sm">{contactData.contact_name}</p>
                                          <Chip size="sm" color={getContactColor(contactData.contact_role)} variant="flat">
                                            {getContactLabel(contactData.contact_role)}
                                          </Chip>
                                        </div>
                                      </td>
                                    )}
                                    
                                    {/* Line item description */}
                                    <td className="py-2 px-4">
                                      <div className="flex items-center gap-3">
                                        <span className="text-lg">{getCategoryIcon(item.category)}</span>
                                        <div className="flex-1">
                                          <p className="font-medium text-sm">{item.description}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <Chip size="sm" variant="flat" color="default" className="text-xs">
                                              {item.category}
                                            </Chip>
                                            {item.is_customer_responsible && (
                                              <Chip size="sm" variant="flat" color="success" className="text-xs">
                                                Klant
                                              </Chip>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    
                                    {/* Quantity */}
                                    <td className="py-2 px-4 text-right">
                                      <span className="font-medium text-sm">{item.quantity}</span>
                                    </td>
                                    
                                    {/* Unit price */}
                                    <td className="py-2 px-4 text-right">
                                      <span className="font-medium text-sm">€{item.unit_price.toLocaleString('nl-NL')}</span>
                                    </td>
                                    
                                    {/* Total price */}
                                    <td className="py-2 px-4 text-right">
                                      <span className="font-semibold text-sm">€{item.total_price.toLocaleString('nl-NL')}</span>
                                    </td>
                                  </tr>
                                ))}
                                
                                {/* Contact subtotal row */}
                                {contactIndex === Object.keys(visitData.contacts).length - 1 && (
                                  <tr className="bg-content2/50 border-b-2 border-divider">
                                    <td className="py-2 px-4 text-right font-semibold text-sm" colSpan={3}>
                                      Subtotaal {contactData.contact_name}:
                                    </td>
                                    <td className="py-2 px-4 text-right font-bold">
                                      €{contactTotal.toLocaleString('nl-NL')}
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                          
                          {/* Visit total row */}
                          <tr className="bg-primary/10 border-b-2 border-primary/20">
                            <td className="py-3 px-4 text-right font-bold text-primary" colSpan={5}>
                              Totaal {visitData.visit_name}:
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-lg text-primary">
                              €{visitTotal.toLocaleString('nl-NL')}
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                    
                    {/* Grand total row */}
                    <tr className="bg-foreground/5 border-t-2 border-foreground/20">
                      <td className="py-4 px-4 text-right font-bold text-lg" colSpan={5}>
                        TOTAAL OFFERTE:
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-xl">
                        €{quote.total_amount.toLocaleString('nl-NL')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Terms and Conditions */}
          {quote.terms_conditions && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Voorwaarden</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-foreground-600">{quote.terms_conditions}</p>
              </CardBody>
            </Card>
          )}
        </div>
      </AppLayout>
    </>
  );
};

export default QuoteDetailPage; 