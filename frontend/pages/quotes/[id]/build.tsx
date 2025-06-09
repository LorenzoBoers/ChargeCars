import React, { useState, useCallback } from 'react';
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
  Input,
  Textarea,
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
  TableCell,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
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
  XMarkIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../../components/layouts/AppLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Interfaces based on PRD
interface QuoteLineItem {
  id: string;
  product_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  category: 'product' | 'service' | 'installation' | 'other';
  metadata?: Record<string, any>;
  visit_id: string;
  contact_id: string;
  contact_role: 'account' | 'end_customer' | 'intermediary';
  is_customer_responsible: boolean;
}

interface Visit {
  id: string;
  visit_number: string;
  planned_date: string;
  visit_type: string;
  status: string;
  technician?: string;
  notes?: string;
}

interface QuoteContact {
  id: string;
  name: string;
  role: 'account' | 'end_customer' | 'intermediary';
  email: string;
  phone: string;
  avatar?: string;
  is_billing_contact: boolean;
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
  
  // Related data
  visits: Visit[];
  contacts: QuoteContact[];
  line_items: QuoteLineItem[];
  
  // Quote details
  terms_conditions?: string;
  delivery_time?: string;
  warranty_period?: string;
  
  // Customer & Partner sections
  customer_notes?: string;
  partner_notes?: string;
}

// Mock data
const mockQuote: QuoteDetail = {
  id: 'QUOTE-001',
  quote_number: 'QUO-2024-123',
  order_id: 'ORD-001',
  order_number: 'CHC-2024-001',
  status: 'draft',
  total_amount: 3250.00,
  customer_amount: 2850.00,
  partner_amount: 400.00,
  valid_until: '2024-02-15',
  business_entity: 'ChargeCars',
  created_at: '2024-01-20',
  updated_at: '2024-01-22',
  
  visits: [
    {
      id: 'VIS-001',
      visit_number: 'V001',
      planned_date: '2024-01-25',
      visit_type: 'Locatie Inspectie',
      status: 'Gepland',
      technician: 'Jan Technicus',
      notes: 'Eerste bezoek voor technische meting'
    },
    {
      id: 'VIS-002', 
      visit_number: 'V002',
      planned_date: '2024-02-05',
      visit_type: 'Installatie',
      status: 'Concept',
      notes: 'Hoofdinstallatie met laadpaal'
    },
    {
      id: 'VIS-003',
      visit_number: 'V003', 
      planned_date: '2024-02-10',
      visit_type: 'Afronding',
      status: 'Concept',
      notes: 'Eindcontrole en oplevering'
    }
  ],
  
  contacts: [
    {
      id: 'CONT-001',
      name: 'Henk van der Berg',
      role: 'end_customer',
      email: 'h.vandenberg@email.nl',
      phone: '+31 6 12345678',
      is_billing_contact: false
    },
    {
      id: 'CONT-002',
      name: 'EnergieDirect B.V.',
      role: 'account',
      email: 'orders@energiedirect.nl', 
      phone: '+31 20 1234567',
      is_billing_contact: true
    },
    {
      id: 'CONT-003',
      name: 'Maria Adviseur',
      role: 'intermediary',
      email: 'm.adviseur@intermediair.nl',
      phone: '+31 30 9876543',
      is_billing_contact: false
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
      contact_id: 'CONT-001',
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
      contact_id: 'CONT-002',
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
      contact_id: 'CONT-001',
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
      contact_id: 'CONT-001',
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
      contact_id: 'CONT-001',
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
      contact_id: 'CONT-002',
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
      contact_id: 'CONT-001',
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
      contact_id: 'CONT-003',
      contact_role: 'intermediary',
      is_customer_responsible: false
    }
  ]
};

const QuoteBuildPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quote, setQuote] = useState<QuoteDetail>(mockQuote);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const { isOpen: isAddItemOpen, onOpen: onAddItemOpen, onClose: onAddItemClose } = useDisclosure();
  const [selectedVisitForNewItem, setSelectedVisitForNewItem] = useState<string>('');
  const [selectedContactForNewItem, setSelectedContactForNewItem] = useState<string>('');

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

  const handleDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceVisitId = source.droppableId.replace('visit-', '');
    const destVisitId = destination.droppableId.replace('visit-', '');

    // Get source and destination contact sections
    const sourceContactId = source.droppableId.split('-contact-')[1];
    const destContactId = destination.droppableId.split('-contact-')[1];

    setQuote(prev => {
      const newLineItems = [...prev.line_items];
      const [movedItem] = newLineItems.splice(source.index, 1);
      
      // Update visit and contact IDs if moved to different section
      if (sourceVisitId !== destVisitId) {
        movedItem.visit_id = destVisitId;
      }
      if (sourceContactId !== destContactId) {
        movedItem.contact_id = destContactId;
        const contact = prev.contacts.find(c => c.id === destContactId);
        if (contact) {
          movedItem.contact_role = contact.role;
          movedItem.is_customer_responsible = contact.role === 'end_customer';
        }
      }
      
      newLineItems.splice(destination.index, 0, movedItem);
      
      return {
        ...prev,
        line_items: newLineItems
      };
    });
    
    setIsDirty(true);
  }, []);

  const updateLineItem = (itemId: string, updates: Partial<QuoteLineItem>) => {
    setQuote(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              ...updates,
              total_price: (updates.quantity || item.quantity) * (updates.unit_price || item.unit_price)
            }
          : item
      )
    }));
    setIsDirty(true);
  };

  const addLineItem = (visitId: string, contactId: string, newItem: Partial<QuoteLineItem>) => {
    const contact = quote.contacts.find(c => c.id === contactId);
    const lineItem: QuoteLineItem = {
      id: `LI-${Date.now()}`,
      description: newItem.description || '',
      quantity: newItem.quantity || 1,
      unit_price: newItem.unit_price || 0,
      total_price: (newItem.quantity || 1) * (newItem.unit_price || 0),
      category: newItem.category || 'service',
      visit_id: visitId,
      contact_id: contactId,
      contact_role: contact?.role || 'end_customer',
      is_customer_responsible: contact?.role === 'end_customer'
    };

    setQuote(prev => ({
      ...prev,
      line_items: [...prev.line_items, lineItem]
    }));
    setIsDirty(true);
  };

  const removeLineItem = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      line_items: prev.line_items.filter(item => item.id !== itemId)
    }));
    setIsDirty(true);
  };

  const addVisit = () => {
    const newVisit: Visit = {
      id: `VIS-${Date.now()}`,
      visit_number: `V${String(quote.visits.length + 1).padStart(3, '0')}`,
      planned_date: '',
      visit_type: 'Nieuw Bezoek',
      status: 'Concept',
      notes: ''
    };

    setQuote(prev => ({
      ...prev,
      visits: [...prev.visits, newVisit]
    }));
    setIsDirty(true);
    setIsAddingVisit(false);
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

  const getTotalByResponsibility = () => {
    const customerTotal = quote.line_items
      .filter(item => item.is_customer_responsible)
      .reduce((sum, item) => sum + item.total_price, 0);
    
    const partnerTotal = quote.line_items
      .filter(item => !item.is_customer_responsible)
      .reduce((sum, item) => sum + item.total_price, 0);

    return { customerTotal, partnerTotal, total: customerTotal + partnerTotal };
  };

  const { customerTotal, partnerTotal, total } = getTotalByResponsibility();

  const saveQuote = () => {
    // Mock save
    setIsDirty(false);
    // In real app: API call to save quote
  };

  return (
    <>
      <Head>
        <title>Quote {quote.quote_number} - Offerte Samenstellen - ChargeCars Portal</title>
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
              {isDirty && (
                <Chip size="sm" color="warning" variant="flat">
                  Niet opgeslagen
                </Chip>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                color="success" 
                startContent={<BookmarkIcon className="h-4 w-4" />}
                onPress={saveQuote}
                isDisabled={!isDirty}
              >
                Opslaan
              </Button>
              <Button color="primary" startContent={<PencilIcon className="h-4 w-4" />}>
                Preview
              </Button>
              <Button variant="bordered" startContent={<ShareIcon className="h-4 w-4" />}>
                Verzenden
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
                  <DropdownItem key="delete" className="text-danger" color="danger">
                    Verwijderen
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          </div>

          {/* Quote Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <h3 className="text-sm font-medium text-foreground-600">Offerte Gegevens</h3>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Status:</span>
                    <Chip size="sm" color="warning" variant="flat">
                      {quote.status === 'draft' ? 'Concept' : quote.status}
                    </Chip>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Geldig tot:</span>
                    <span className="text-sm font-medium">{quote.valid_until}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Totaal:</span>
                    <span className="text-sm font-bold">€{total.toLocaleString('nl-NL')}</span>
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
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              color="primary" 
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={() => setIsAddingVisit(true)}
            >
              Nieuw Bezoek
            </Button>
            <Button 
              variant="bordered" 
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={onAddItemOpen}
            >
              Line Item Toevoegen
            </Button>
          </div>

          {/* Main Quote Table */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Line Items per Bezoek en Contact</h3>
            </CardHeader>
            <CardBody>
              <DragDropContext onDragEnd={handleDragEnd}>
                <div className="space-y-6">
                  {quote.visits.map((visit) => {
                    // Get line items for this visit grouped by contact
                    const visitItems = quote.line_items.filter(item => item.visit_id === visit.id);
                    const contactGroups = quote.contacts.reduce((groups, contact) => {
                      groups[contact.id] = visitItems.filter(item => item.contact_id === contact.id);
                      return groups;
                    }, {} as Record<string, QuoteLineItem[]>);

                    return (
                      <div key={visit.id} className="border border-divider rounded-lg p-4">
                        {/* Visit Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <CalendarDaysIcon className="h-5 w-5 text-primary" />
                            <div>
                              <h4 className="font-semibold">{visit.visit_number} - {visit.visit_type}</h4>
                              <p className="text-sm text-foreground-600">
                                {visit.planned_date && `${visit.planned_date} • `}
                                {visit.technician && `${visit.technician} • `}
                                Status: {visit.status}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              €{visitItems.reduce((sum, item) => sum + item.total_price, 0).toLocaleString('nl-NL')}
                            </span>
                            <Button 
                              size="sm" 
                              variant="flat" 
                              startContent={<PlusIcon className="h-3 w-3" />}
                              onPress={() => {
                                setSelectedVisitForNewItem(visit.id);
                                onAddItemOpen();
                              }}
                            >
                              Item
                            </Button>
                          </div>
                        </div>

                        {/* Contact Groups */}
                        <div className="space-y-4">
                          {quote.contacts.map((contact) => {
                            const contactItems = contactGroups[contact.id] || [];
                            if (contactItems.length === 0) return null;

                            return (
                              <div key={contact.id} className="bg-content2 rounded-lg p-3">
                                {/* Contact Header */}
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar name={contact.name} size="sm" />
                                    <div>
                                      <p className="font-medium text-sm">{contact.name}</p>
                                      <Chip size="sm" color={getContactColor(contact.role)} variant="flat">
                                        {getContactLabel(contact.role)}
                                      </Chip>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                      €{contactItems.reduce((sum, item) => sum + item.total_price, 0).toLocaleString('nl-NL')}
                                    </span>
                                    <Button 
                                      size="sm" 
                                      variant="light" 
                                      startContent={<PlusIcon className="h-3 w-3" />}
                                      onPress={() => {
                                        setSelectedVisitForNewItem(visit.id);
                                        setSelectedContactForNewItem(contact.id);
                                        onAddItemOpen();
                                      }}
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>

                                {/* Line Items */}
                                <Droppable droppableId={`visit-${visit.id}-contact-${contact.id}`}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className="space-y-2"
                                    >
                                      {contactItems.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className="bg-content1 border border-divider rounded-lg p-3 hover:bg-content3 transition-colors"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab hover:cursor-grabbing text-foreground-400"
                                                >
                                                  <Bars3Icon className="h-4 w-4" />
                                                </div>
                                                
                                                <div className="text-lg">{getCategoryIcon(item.category)}</div>
                                                
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-3">
                                                  {editingItem === item.id ? (
                                                    <>
                                                      <Input
                                                        size="sm"
                                                        value={item.description}
                                                        onValueChange={(value) => updateLineItem(item.id, { description: value })}
                                                        className="md:col-span-2"
                                                      />
                                                      <Input
                                                        size="sm"
                                                        type="number"
                                                        value={item.quantity.toString()}
                                                        onValueChange={(value) => updateLineItem(item.id, { quantity: Number(value) })}
                                                      />
                                                      <Input
                                                        size="sm"
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unit_price.toString()}
                                                        onValueChange={(value) => updateLineItem(item.id, { unit_price: Number(value) })}
                                                        startContent="€"
                                                      />
                                                      <div className="flex items-center justify-between">
                                                        <span className="font-semibold">€{item.total_price.toLocaleString('nl-NL')}</span>
                                                        <div className="flex gap-1">
                                                          <Button
                                                            size="sm"
                                                            isIconOnly
                                                            color="success"
                                                            variant="light"
                                                            onPress={() => setEditingItem(null)}
                                                          >
                                                            <CheckCircleIcon className="h-4 w-4" />
                                                          </Button>
                                                          <Button
                                                            size="sm"
                                                            isIconOnly
                                                            color="danger"
                                                            variant="light"
                                                            onPress={() => setEditingItem(null)}
                                                          >
                                                            <XMarkIcon className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <div className="md:col-span-2">
                                                        <p className="font-medium text-sm">{item.description}</p>
                                                        <div className="flex items-center gap-2 mt-1">
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
                                                      <div className="text-center">
                                                        <p className="text-sm font-medium">{item.quantity}x</p>
                                                      </div>
                                                      <div className="text-center">
                                                        <p className="text-sm font-medium">€{item.unit_price.toLocaleString('nl-NL')}</p>
                                                      </div>
                                                      <div className="flex items-center justify-between">
                                                        <span className="font-semibold">€{item.total_price.toLocaleString('nl-NL')}</span>
                                                        <div className="flex gap-1">
                                                          <Button
                                                            size="sm"
                                                            isIconOnly
                                                            variant="light"
                                                            onPress={() => setEditingItem(item.id)}
                                                          >
                                                            <PencilIcon className="h-3 w-3" />
                                                          </Button>
                                                          <Button
                                                            size="sm"
                                                            isIconOnly
                                                            color="danger"
                                                            variant="light"
                                                            onPress={() => removeLineItem(item.id)}
                                                          >
                                                            <TrashIcon className="h-3 w-3" />
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            </CardBody>
          </Card>

          {/* Totals Card */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Totaal Overzicht</h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">€{customerTotal.toLocaleString('nl-NL')}</p>
                  <p className="text-sm text-foreground-600">Klant Verantwoordelijk</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">€{partnerTotal.toLocaleString('nl-NL')}</p>
                  <p className="text-sm text-foreground-600">Partner Verantwoordelijk</p>
                </div>
                <div className="text-center p-4 bg-foreground/10 rounded-lg">
                  <p className="text-2xl font-bold text-foreground">€{total.toLocaleString('nl-NL')}</p>
                  <p className="text-sm text-foreground-600">Totaal Offerte</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Add Line Item Modal */}
        <Modal isOpen={isAddItemOpen} onClose={onAddItemClose} size="2xl">
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader>Nieuw Line Item Toevoegen</ModalHeader>
                <ModalBody>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Bezoek"
                        placeholder="Selecteer een bezoek"
                        selectedKeys={selectedVisitForNewItem ? [selectedVisitForNewItem] : []}
                        onSelectionChange={(keys) => setSelectedVisitForNewItem(Array.from(keys)[0] as string)}
                      >
                        {quote.visits.map(visit => (
                          <SelectItem key={visit.id} value={visit.id}>
                            {visit.visit_number} - {visit.visit_type}
                          </SelectItem>
                        ))}
                      </Select>
                      
                      <Select
                        label="Contact"
                        placeholder="Selecteer een contact"
                        selectedKeys={selectedContactForNewItem ? [selectedContactForNewItem] : []}
                        onSelectionChange={(keys) => setSelectedContactForNewItem(Array.from(keys)[0] as string)}
                      >
                        {quote.contacts.map(contact => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.name} ({getContactLabel(contact.role)})
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <Input
                      label="Beschrijving"
                      placeholder="Omschrijving van het item"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Aantal"
                        type="number"
                        placeholder="1"
                        defaultValue="1"
                      />
                      <Input
                        label="Prijs per eenheid"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        startContent="€"
                      />
                      <Select
                        label="Categorie"
                        placeholder="Selecteer categorie"
                        defaultSelectedKeys={["service"]}
                      >
                        <SelectItem key="product" value="product">Product</SelectItem>
                        <SelectItem key="service" value="service">Service</SelectItem>
                        <SelectItem key="installation" value="installation">Installatie</SelectItem>
                        <SelectItem key="other" value="other">Overig</SelectItem>
                      </Select>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>
                    Annuleren
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={() => {
                      // Add logic to create new item
                      onClose();
                    }}
                  >
                    Toevoegen
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </AppLayout>
    </>
  );
};

export default QuoteBuildPage; 