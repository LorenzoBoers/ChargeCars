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
  Input,
  Select,
  SelectItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tooltip
} from "@nextui-org/react";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  ArrowLeftIcon,
  PencilIcon,
  PrinterIcon,
  ShareIcon,
  EllipsisVerticalIcon,
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
  WrenchScrewdriverIcon,
  ArchiveBoxIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../../components/layouts/AppLayout';

// Interfaces
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
  id: 'QUO-002',
  quote_number: 'QUO-2024-002',
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
  delivery_time: '2-3 weken',
  warranty_period: '5 jaar garantie',
  terms_conditions: 'Standaard ChargeCars voorwaarden van toepassing.',

  visits: [
    {
      id: 'VIS-001',
      visit_number: 'V001',
      planned_date: '2024-02-05',
      visit_type: 'Locatie Inspectie',
      status: 'planned',
      technician: 'Jan Installateur'
    },
    {
      id: 'VIS-002',
      visit_number: 'V002',
      planned_date: '2024-02-12',
      visit_type: 'Installatie',
      status: 'planned',
      technician: 'Jan Installateur'
    },
    {
      id: 'VIS-003',
      visit_number: 'V003',
      planned_date: '2024-02-15',
      visit_type: 'Afronding',
      status: 'planned',
      technician: 'Jan Installateur'
    }
  ],

  contacts: [
    {
      id: 'CONT-001',
      name: 'Henk van der Berg',
      role: 'end_customer',
      email: 'h.vandenberg@email.nl',
      phone: '+31 6 12345678',
      is_billing_contact: true
    },
    {
      id: 'CONT-002',
      name: 'EnergieDirect B.V.',
      role: 'account',
      email: 'orders@energiedirect.nl',
      phone: '+31 20 1234567',
      is_billing_contact: false
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
  const [isDirty, setIsDirty] = useState(false);
  const [selectedVisitForNewItem, setSelectedVisitForNewItem] = useState<string>('');
  const [selectedContactForNewItem, setSelectedContactForNewItem] = useState<string>('');
  
  const { isOpen: isAddItemOpen, onOpen: onAddItemOpen, onClose: onAddItemClose } = useDisclosure();

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

  const updateLineItem = (itemId: string, updates: Partial<QuoteLineItem>) => {
    setQuote(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              ...updates, 
              total_price: updates.quantity !== undefined || updates.unit_price !== undefined 
                ? (updates.quantity || item.quantity) * (updates.unit_price || item.unit_price)
                : item.total_price
            }
          : item
      )
    }));
    setIsDirty(true);
  };

  const addLineItem = (visitId: string, contactId: string, newItem: Partial<QuoteLineItem>) => {
    const contact = quote.contacts.find(c => c.id === contactId);
    if (!contact) return;

    const lineItem: QuoteLineItem = {
      id: `LI-${Date.now()}`,
      description: newItem.description || '',
      quantity: newItem.quantity || 1,
      unit_price: newItem.unit_price || 0,
      total_price: (newItem.quantity || 1) * (newItem.unit_price || 0),
      category: newItem.category || 'service',
      visit_id: visitId,
      contact_id: contactId,
      contact_role: contact.role,
      is_customer_responsible: newItem.is_customer_responsible || false,
      ...newItem
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
      planned_date: new Date().toISOString().split('T')[0],
      visit_type: 'Nieuw Bezoek',
      status: 'planned'
    };

    setQuote(prev => ({
      ...prev,
      visits: [...prev.visits, newVisit]
    }));
    setIsDirty(true);
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
      case 'product': return <ArchiveBoxIcon className="h-4 w-4 text-primary" />;
      case 'service': return <WrenchScrewdriverIcon className="h-4 w-4 text-success" />;
      case 'installation': return <BoltIcon className="h-4 w-4 text-warning" />;
      case 'other': return <DocumentTextIcon className="h-4 w-4 text-default-500" />;
      default: return <DocumentTextIcon className="h-4 w-4 text-default-500" />;
    }
  };

  const getTotalByResponsibility = () => {
    const customerTotal = quote.line_items
      .filter(item => item.is_customer_responsible)
      .reduce((sum, item) => sum + item.total_price, 0);
    
    const partnerTotal = quote.line_items
      .filter(item => !item.is_customer_responsible)
      .reduce((sum, item) => sum + item.total_price, 0);

    return {
      customer: customerTotal,
      partner: partnerTotal,
      total: customerTotal + partnerTotal
    };
  };

  const saveQuote = () => {
    // Mock save logic
    console.log('Saving quote...', quote);
    setIsDirty(false);
  };

  // Group line items by visit and then by contact
  const groupedItems = quote.visits.map(visit => {
    const visitItems = quote.line_items.filter(item => item.visit_id === visit.id);
    const contactGroups = quote.contacts.map(contact => {
      const contactItems = visitItems.filter(item => item.contact_id === contact.id);
      return {
        contact,
        items: contactItems
      };
    }).filter(group => group.items.length > 0);

    return {
      visit,
      contactGroups
    };
  }).filter(group => group.contactGroups.length > 0);

  const { customer: customerTotal, partner: partnerTotal, total } = getTotalByResponsibility();

  // Handle drag end - restrict to within contact groups only
  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Check if drag is within the same contact group (droppableId format: "visit-{visitId}-contact-{contactId}")
    const sourceContactId = source.droppableId.split('-contact-')[1];
    const destContactId = destination.droppableId.split('-contact-')[1];
    
    if (sourceContactId !== destContactId) {
      // Don't allow moving between different contacts
      return;
    }

    const visitId = source.droppableId.split('-')[1];
    const contactId = sourceContactId;

    setQuote(prev => {
      const newLineItems = [...prev.line_items];
      const visitItems = newLineItems.filter(item => item.visit_id === visitId && item.contact_id === contactId);
      const otherItems = newLineItems.filter(item => !(item.visit_id === visitId && item.contact_id === contactId));

      // Reorder within the contact group
      const [reorderedItem] = visitItems.splice(source.index, 1);
      visitItems.splice(destination.index, 0, reorderedItem);

      return {
        ...prev,
        line_items: [...otherItems, ...visitItems]
      };
    });

    setIsDirty(true);
  };

  return (
    <>
      <Head>
        <title>Quote Builder - {quote.quote_number} - ChargeCars Portal</title>
      </Head>

      <AppLayout>
        <div className="p-4 space-y-4">
          {/* Header */}
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
                <h1 className="text-xl font-bold text-foreground">Quote Builder - {quote.quote_number}</h1>
                <p className="text-sm text-foreground-600">Order {quote.order_number} • {quote.business_entity}</p>
              </div>
              {isDirty && (
                <Chip size="sm" color="warning" variant="flat">
                  Niet opgeslagen
                </Chip>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                color="success" 
                size="sm"
                startContent={<BookmarkIcon className="h-4 w-4" />}
                onPress={saveQuote}
                isDisabled={!isDirty}
              >
                Opslaan
              </Button>
              <Button 
                variant="bordered" 
                size="sm"
                startContent={<EyeIcon className="h-4 w-4" />}
                onPress={() => router.push(`/quotes/${quote.id}`)}
              >
                Voorbeeld
              </Button>
              <Button 
                variant="bordered" 
                size="sm"
                startContent={<PlusIcon className="h-4 w-4" />}
                onPress={addVisit}
              >
                Bezoek
              </Button>
            </div>
          </div>

          {/* Quote Items */}
          <Card>
            <CardHeader className="flex justify-between items-center p-4">
              <h3 className="text-base font-semibold">Line Items - Drag & Drop binnen Contact</h3>
              <Button 
                size="sm" 
                color="primary" 
                startContent={<PlusIcon className="h-3 w-3" />}
                onPress={onAddItemOpen}
              >
                Item Toevoegen
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-content2 border-b border-divider">
                    <tr>
                      <th className="text-left py-2 px-3 font-semibold text-sm text-foreground min-w-[50px]"></th>
                      <th className="text-left py-2 px-3 font-semibold text-sm text-foreground min-w-[350px]">Beschrijving</th>
                      <th className="text-left py-2 px-3 font-semibold text-sm text-foreground min-w-[80px]">Aantal</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm text-foreground min-w-[100px]">Prijs</th>
                      <th className="text-right py-2 px-3 font-semibold text-sm text-foreground min-w-[100px]">Totaal</th>
                      <th className="text-center py-2 px-3 font-semibold text-sm text-foreground min-w-[100px]">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    <DragDropContext onDragEnd={onDragEnd}>
                      {groupedItems.map(({ visit, contactGroups }) => (
                        <React.Fragment key={visit.id}>
                          {/* Visit header row */}
                          <tr className="bg-primary/10 border-b border-divider">
                            <td className="py-2 px-3 font-semibold text-sm text-primary" colSpan={6}>
                              <div className="flex items-center gap-2">
                                <CalendarDaysIcon className="h-4 w-4" />
                                {visit.visit_type}
                                <span className="text-xs text-foreground-600">({visit.planned_date})</span>
                                <div className="flex items-center gap-2 ml-auto">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                    className="text-xs h-6"
                                    onPress={() => {
                                      setSelectedVisitForNewItem(visit.id);
                                      onAddItemOpen();
                                    }}
                                  >
                                    <PlusIcon className="h-3 w-3 mr-1" />
                                    Item
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                          
                          {contactGroups.map(({ contact, items }) => {
                            const contactTotal = items.reduce((sum, item) => sum + item.total_price, 0);
                            
                            return (
                              <React.Fragment key={contact.id}>
                                {/* Contact header row */}
                                <tr className="bg-content2/40 border-b border-divider border-l-4 border-l-primary/30">
                                  <td className="py-1.5 px-3" colSpan={6}>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{contact.name}</span>
                                        <Chip 
                                          size="sm" 
                                          color={getContactColor(contact.role)} 
                                          variant="flat" 
                                          className="text-xs"
                                        >
                                          {getContactLabel(contact.role)}
                                        </Chip>
                                      </div>
                                      <span className="text-xs text-foreground-600 font-medium">€{contactTotal.toLocaleString('nl-NL')}</span>
                                    </div>
                                  </td>
                                </tr>
                                
                                {/* Line items for this contact */}
                                <Droppable droppableId={`visit-${visit.id}-contact-${contact.id}`}>
                                  {(provided, snapshot) => (
                                    <tbody
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className={snapshot.isDraggingOver ? 'bg-primary/5' : ''}
                                    >
                                      {items.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                          {(provided, snapshot) => (
                                            <tr
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              className={`border-b border-divider/30 hover:bg-content2/10 transition-colors ${
                                                snapshot.isDragging ? 'shadow-lg bg-primary/5' : ''
                                              }`}
                                            >
                                              {/* Drag handle */}
                                              <td className="py-1.5 px-3 text-center">
                                                <div
                                                  {...provided.dragHandleProps}
                                                  className="cursor-grab hover:cursor-grabbing text-foreground-400"
                                                >
                                                  <Bars3Icon className="h-4 w-4" />
                                                </div>
                                              </td>
                                              
                                              {/* Description */}
                                              <td className="py-1.5 px-3">
                                                <div className="pl-4">
                                                  {editingItem === item.id ? (
                                                    <Input
                                                      size="sm"
                                                      value={item.description}
                                                      onValueChange={(value) => updateLineItem(item.id, { description: value })}
                                                      className="text-xs"
                                                    />
                                                  ) : (
                                                    <p className="text-sm font-medium text-foreground">{item.description}</p>
                                                  )}
                                                </div>
                                              </td>
                                              
                                              {/* Quantity */}
                                              <td className="py-1.5 px-3 text-left">
                                                {editingItem === item.id ? (
                                                  <Input
                                                    size="sm"
                                                    type="number"
                                                    value={item.quantity.toString()}
                                                    onValueChange={(value) => updateLineItem(item.id, { quantity: Number(value) })}
                                                    className="text-xs w-20"
                                                  />
                                                ) : (
                                                  <span className="text-sm font-medium">{item.quantity}x</span>
                                                )}
                                              </td>
                                              
                                              {/* Unit price */}
                                              <td className="py-1.5 px-3 text-right">
                                                {editingItem === item.id ? (
                                                  <Input
                                                    size="sm"
                                                    type="number"
                                                    step="0.01"
                                                    value={item.unit_price.toString()}
                                                    onValueChange={(value) => updateLineItem(item.id, { unit_price: Number(value) })}
                                                    startContent="€"
                                                    className="text-xs w-24"
                                                  />
                                                ) : (
                                                  <span className="text-sm font-medium">€{item.unit_price.toLocaleString('nl-NL')}</span>
                                                )}
                                              </td>
                                              
                                              {/* Total price */}
                                              <td className="py-1.5 px-3 text-right">
                                                <span className="text-sm font-semibold">€{item.total_price.toLocaleString('nl-NL')}</span>
                                              </td>
                                              
                                              {/* Actions */}
                                              <td className="py-1.5 px-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                  {editingItem === item.id ? (
                                                    <>
                                                      <Button
                                                        size="sm"
                                                        isIconOnly
                                                        color="success"
                                                        variant="light"
                                                        onPress={() => setEditingItem(null)}
                                                        className="h-6 w-6 min-w-6"
                                                      >
                                                        <CheckCircleIcon className="h-3 w-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        isIconOnly
                                                        color="danger"
                                                        variant="light"
                                                        onPress={() => setEditingItem(null)}
                                                        className="h-6 w-6 min-w-6"
                                                      >
                                                        <XMarkIcon className="h-3 w-3" />
                                                      </Button>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Button
                                                        size="sm"
                                                        isIconOnly
                                                        variant="light"
                                                        onPress={() => setEditingItem(item.id)}
                                                        className="h-6 w-6 min-w-6"
                                                      >
                                                        <PencilIcon className="h-3 w-3" />
                                                      </Button>
                                                      <Button
                                                        size="sm"
                                                        isIconOnly
                                                        color="danger"
                                                        variant="light"
                                                        onPress={() => removeLineItem(item.id)}
                                                        className="h-6 w-6 min-w-6"
                                                      >
                                                        <TrashIcon className="h-3 w-3" />
                                                      </Button>
                                                    </>
                                                  )}
                                                </div>
                                              </td>
                                            </tr>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </tbody>
                                  )}
                                </Droppable>
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </DragDropContext>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>

          {/* Totals Card */}
          <Card>
            <CardHeader className="pb-2">
              <h3 className="text-base font-semibold">Totaal Overzicht</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-success/10 rounded-lg">
                  <p className="text-lg font-bold text-success">€{customerTotal.toLocaleString('nl-NL')}</p>
                  <p className="text-xs text-foreground-600">Klant Verantwoordelijk</p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <p className="text-lg font-bold text-primary">€{partnerTotal.toLocaleString('nl-NL')}</p>
                  <p className="text-xs text-foreground-600">Partner Verantwoordelijk</p>
                </div>
                <div className="text-center p-3 bg-foreground/10 rounded-lg">
                  <p className="text-lg font-bold text-foreground">€{total.toLocaleString('nl-NL')}</p>
                  <p className="text-xs text-foreground-600">Totaal Offerte</p>
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
                <ModalHeader className="text-base">Nieuw Line Item Toevoegen</ModalHeader>
                <ModalBody>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select
                        label="Bezoek"
                        placeholder="Selecteer een bezoek"
                        size="sm"
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
                        size="sm"
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
                      size="sm"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input
                        label="Aantal"
                        type="number"
                        placeholder="1"
                        defaultValue="1"
                        size="sm"
                      />
                      <Input
                        label="Prijs per eenheid"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        startContent="€"
                        size="sm"
                      />
                      <Select
                        label="Categorie"
                        placeholder="Selecteer categorie"
                        defaultSelectedKeys={["service"]}
                        size="sm"
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
                  <Button variant="light" onPress={onClose} size="sm">
                    Annuleren
                  </Button>
                  <Button 
                    color="primary" 
                    size="sm"
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