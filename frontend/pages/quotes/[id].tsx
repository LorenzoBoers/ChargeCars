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

// Interfaces (simplified version of build page)
interface QuoteLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'product' | 'service' | 'installation' | 'other';
  visit_name: string;
  contact_name: string;
  is_customer_responsible: boolean;
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
  
  line_items: [
    {
      id: 'LI-001',
      description: 'Locatie inspectie en technische meting',
      quantity: 1,
      unit_price: 125.00,
      total_price: 125.00,
      category: 'service',
      visit_name: 'Locatie Inspectie',
      contact_name: 'Henk van der Berg',
      is_customer_responsible: true
    },
    {
      id: 'LI-002',
      description: 'Rapportage technische haalbaarheid',
      quantity: 1,
      unit_price: 75.00,
      total_price: 75.00,
      category: 'service',
      visit_name: 'Locatie Inspectie',
      contact_name: 'EnergieDirect B.V.',
      is_customer_responsible: false
    },
    {
      id: 'LI-003',
      description: 'ChargeCars Pro 22kW Laadpaal',
      quantity: 1,
      unit_price: 1850.00,
      total_price: 1850.00,
      category: 'product',
      visit_name: 'Installatie',
      contact_name: 'Henk van der Berg',
      is_customer_responsible: true
    },
    {
      id: 'LI-004',
      description: 'Installatie materiaal (kabels, beugels)',
      quantity: 1,
      unit_price: 275.00,
      total_price: 275.00,
      category: 'product',
      visit_name: 'Installatie',
      contact_name: 'Henk van der Berg',
      is_customer_responsible: true
    },
    {
      id: 'LI-005',
      description: 'Installatie werkzaamheden (8 uur)',
      quantity: 8,
      unit_price: 85.00,
      total_price: 680.00,
      category: 'installation',
      visit_name: 'Installatie',
      contact_name: 'Henk van der Berg',
      is_customer_responsible: true
    },
    {
      id: 'LI-006',
      description: 'Partner commissie installatie',
      quantity: 1,
      unit_price: 200.00,
      total_price: 200.00,
      category: 'service',
      visit_name: 'Installatie',
      contact_name: 'EnergieDirect B.V.',
      is_customer_responsible: false
    },
    {
      id: 'LI-007',
      description: 'Eindcontrole en test laadpaal',
      quantity: 1,
      unit_price: 120.00,
      total_price: 120.00,
      category: 'service',
      visit_name: 'Afronding',
      contact_name: 'Henk van der Berg',
      is_customer_responsible: true
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product': return '📦';
      case 'service': return '🛠️';
      case 'installation': return '⚡';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  // Group line items by visit
  const itemsByVisit = quote.line_items.reduce((groups, item) => {
    if (!groups[item.visit_name]) {
      groups[item.visit_name] = [];
    }
    groups[item.visit_name].push(item);
    return groups;
  }, {} as Record<string, QuoteLineItem[]>);

  const customerItems = quote.line_items.filter(item => item.is_customer_responsible);
  const partnerItems = quote.line_items.filter(item => !item.is_customer_responsible);

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

          {/* Quote Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quote Details</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-foreground-600">Klant</p>
                      <p className="font-medium">{quote.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Partner</p>
                      <p className="font-medium">{quote.partner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Geldig tot</p>
                      <p className="font-medium">{quote.valid_until}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Levertijd</p>
                      <p className="font-medium">{quote.delivery_time}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Garantie</p>
                      <p className="font-medium">{quote.warranty_period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-foreground-600">Aangemaakt</p>
                      <p className="font-medium">{quote.created_at}</p>
                    </div>
                  </div>
                  
                  {quote.terms_conditions && (
                    <div>
                      <p className="text-sm text-foreground-600 mb-2">Voorwaarden</p>
                      <p className="text-sm bg-content2 p-3 rounded-lg">{quote.terms_conditions}</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Totals Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Totaal Overzicht</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground-600">Klant Verantwoordelijk:</span>
                      <span className="font-semibold text-success">€{quote.customer_amount.toLocaleString('nl-NL')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-foreground-600">Partner Verantwoordelijk:</span>
                      <span className="font-semibold text-primary">€{quote.partner_amount.toLocaleString('nl-NL')}</span>
                    </div>
                    <Divider />
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Totaal:</span>
                      <span className="text-2xl font-bold text-foreground">€{quote.total_amount.toLocaleString('nl-NL')}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Quick Stats</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-content2 rounded-lg">
                      <p className="text-xl font-bold text-primary">{quote.line_items.length}</p>
                      <p className="text-xs text-foreground-600">Line Items</p>
                    </div>
                    <div className="text-center p-3 bg-content2 rounded-lg">
                      <p className="text-xl font-bold text-success">{Object.keys(itemsByVisit).length}</p>
                      <p className="text-xs text-foreground-600">Bezoeken</p>
                    </div>
                    <div className="text-center p-3 bg-content2 rounded-lg">
                      <p className="text-xl font-bold text-warning">{customerItems.length}</p>
                      <p className="text-xs text-foreground-600">Klant Items</p>
                    </div>
                    <div className="text-center p-3 bg-content2 rounded-lg">
                      <p className="text-xl font-bold text-secondary">{partnerItems.length}</p>
                      <p className="text-xs text-foreground-600">Partner Items</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Line Items by Visit */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Line Items per Bezoek</h3>
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
            <CardBody>
              <div className="space-y-6">
                {Object.entries(itemsByVisit).map(([visitName, items]) => (
                  <div key={visitName} className="border border-divider rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold">{visitName}</h4>
                      </div>
                      <span className="font-medium">
                        €{items.reduce((sum, item) => sum + item.total_price, 0).toLocaleString('nl-NL')}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-content2 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{getCategoryIcon(item.category)}</span>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-foreground-500">{item.contact_name}</span>
                                <Chip size="sm" variant="flat" color="default">
                                  {item.category}
                                </Chip>
                                {item.is_customer_responsible && (
                                  <Chip size="sm" variant="flat" color="success">
                                    Klant
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">€{item.total_price.toLocaleString('nl-NL')}</p>
                            <p className="text-xs text-foreground-500">
                              {item.quantity}x €{item.unit_price.toLocaleString('nl-NL')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    </>
  );
};

export default QuoteDetailPage; 