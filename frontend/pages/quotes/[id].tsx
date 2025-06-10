import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Card,
  Button,
  Chip,
  Divider,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input
} from "@nextui-org/react";
import {
  ArrowLeftIcon,
  PrinterIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyEuroIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxIcon,
  BoltIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon
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
  article_id?: string;
  article_code?: string;
}

interface QuoteContact {
  id: string;
  name: string;
  role: 'account' | 'end_customer' | 'intermediary';
  email: string;
  phone: string;
  avatar?: string;
}

interface Article {
  id: string;
  code: string;
  name: string;
  description: string;
  unit_price: number;
  category: string;
  brand?: string;
  supplier?: string;
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

// Mock articles database
const mockArticles: Article[] = [
  { id: '1', code: 'ZAP-HOME-7.4', name: 'Zaptec Go 7.4kW', description: 'Zaptec Go laadpaal 7.4kW enkelfase', unit_price: 599.00, category: 'laadpaal', brand: 'Zaptec' },
  { id: '2', code: 'ZAP-HOME-22', name: 'Zaptec Go 22kW', description: 'Zaptec Go laadpaal 22kW driefase', unit_price: 799.00, category: 'laadpaal', brand: 'Zaptec' },
  { id: '3', code: 'INST-BASIC', name: 'Basis Installatie', description: 'Standaard installatie laadpaal', unit_price: 450.00, category: 'service', brand: 'ChargeCars' },
  { id: '4', code: 'INST-ADVANCED', name: 'Uitgebreide Installatie', description: 'Installatie met meterkast aanpassingen', unit_price: 650.00, category: 'service', brand: 'ChargeCars' },
  { id: '5', code: 'CABLE-TYPE2-5M', name: 'Type 2 Kabel 5m', description: 'Type 2 laadkabel 5 meter', unit_price: 89.00, category: 'accessoire', brand: 'Generic' },
  { id: '6', code: 'CABLE-TYPE2-7M', name: 'Type 2 Kabel 7m', description: 'Type 2 laadkabel 7 meter', unit_price: 109.00, category: 'accessoire', brand: 'Generic' },
  { id: '7', code: 'MOUNT-WALL', name: 'Wandmontage', description: 'Wandmontage voor laadpaal', unit_price: 45.00, category: 'accessoire', brand: 'ChargeCars' },
  { id: '8', code: 'SMART-MODULE', name: 'Smart Module', description: 'Smart charging module voor dynamisch laden', unit_price: 199.00, category: 'upgrade', brand: 'Zaptec' }
];

// Mock data
const mockQuote: QuoteDetail = {
  id: 'QUO-2024-002',
  quote_number: 'CHC-QUO-2024-002',
  order_id: 'ORD-2024-001',
  order_number: 'CHC-2024-001',
  status: 'draft',
  total_amount: 2850.00,
  customer_amount: 2400.00,
  partner_amount: 450.00,
  valid_until: '2024-02-15',
  business_entity: 'ChargeCars',
  created_at: '2024-01-15',
  updated_at: '2024-01-16',
  customer_name: 'Henk van der Berg',
  partner_name: 'EnergieDirect B.V.',
  delivery_time: '2-3 weken',
  warranty_period: '2 jaar',
  terms_conditions: 'Standaard algemene voorwaarden van toepassing.',
  statuses: [
    { id: '1', name: 'Concept', date: '2024-01-15', color: 'secondary', completed: true, current: false },
    { id: '2', name: 'Review', date: '2024-01-16', color: 'warning', completed: false, current: true },
    { id: '3', name: 'Verzonden', date: '', color: 'primary', completed: false, current: false },
    { id: '4', name: 'Goedgekeurd', date: '', color: 'success', completed: false, current: false }
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
      name: 'Jan Petersma',
      role: 'account',
      email: 'j.petersma@energiedirect.nl',
      phone: '+31 20 1234567'
    }
  ],
  line_items: [
    {
      id: 'LI-001',
      description: 'Zaptec Go 22kW laadpaal',
      quantity: 1,
      unit_price: 799.00,
      total_price: 799.00,
      category: 'product',
      visit_id: 'V-001',
      visit_name: 'Locatie inspectie',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true,
      article_id: '2',
      article_code: 'ZAP-HOME-22'
    },
    {
      id: 'LI-002',
      description: 'Standaard installatie werkzaamheden',
      quantity: 1,
      unit_price: 450.00,
      total_price: 450.00,
      category: 'service',
      visit_id: 'V-002',
      visit_name: 'Installatie',
      contact_id: 'CONT-002',
      contact_name: 'Jan Petersma',
      contact_role: 'account',
      is_customer_responsible: false,
      article_id: '3',
      article_code: 'INST-BASIC'
    },
    {
      id: 'LI-003',
      description: 'Type 2 laadkabel 7 meter',
      quantity: 1,
      unit_price: 109.00,
      total_price: 109.00,
      category: 'product',
      visit_id: 'V-002',
      visit_name: 'Installatie',
      contact_id: 'CONT-001',
      contact_name: 'Henk van der Berg',
      contact_role: 'end_customer',
      is_customer_responsible: true,
      article_id: '6',
      article_code: 'CABLE-TYPE2-7M'
    }
  ]
};

const QuoteDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  
  // State
  const [quote, setQuote] = useState<QuoteDetail>(mockQuote);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemVisitId, setNewItemVisitId] = useState<string | null>(null);
  const [newItemContactId, setNewItemContactId] = useState<string | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newItem, setNewItem] = useState<Partial<QuoteLineItem>>({
    description: '',
    quantity: 1,
    unit_price: 0,
    total_price: 0
  });

  const inputRef = useRef<HTMLInputElement>(null);

  // Group items by visit and contact
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, { visit_name: string; contacts: Record<string, { contact_name: string; contact_role: string; items: QuoteLineItem[] }> }> = {};
    
    quote.line_items.forEach(item => {
      if (!groups[item.visit_id]) {
        groups[item.visit_id] = { visit_name: item.visit_name, contacts: {} };
      }
      if (!groups[item.visit_id].contacts[item.contact_id]) {
        groups[item.visit_id].contacts[item.contact_id] = {
          contact_name: item.contact_name,
          contact_role: item.contact_role,
          items: []
        };
      }
      groups[item.visit_id].contacts[item.contact_id].items.push(item);
    });
    
    return groups;
  }, [quote.line_items]);

  // Filter articles based on search
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = mockArticles.filter(article =>
        article.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles([]);
    }
  }, [searchQuery]);

  // Update line item
  const updateLineItem = (itemId: string, updates: Partial<QuoteLineItem>) => {
    setQuote(prev => ({
      ...prev,
      line_items: prev.line_items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, ...updates };
          // Recalculate total price
          updated.total_price = updated.quantity * updated.unit_price;
          return updated;
        }
        return item;
      })
    }));
  };

  // Add new line item
  const addLineItem = (visitId: string, contactId: string) => {
    setNewItemVisitId(visitId);
    setNewItemContactId(contactId);
    setIsAddingItem(true);
    setNewItem({
      description: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0
    });
    setSearchQuery('');
    setSelectedArticle(null);
    
    // Focus on input after render
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Save new line item
  const saveNewLineItem = () => {
    if (!newItemVisitId || !newItemContactId || !newItem.description) return;
    
    const visit = Object.entries(groupedItems).find(([vId]) => vId === newItemVisitId);
    const contact = quote.contacts.find(c => c.id === newItemContactId);
    
    if (!visit || !contact) return;

    const lineItem: QuoteLineItem = {
      id: `LI-${Date.now()}`,
      description: newItem.description,
      quantity: newItem.quantity || 1,
      unit_price: newItem.unit_price || 0,
      total_price: (newItem.quantity || 1) * (newItem.unit_price || 0),
      category: selectedArticle?.category as any || 'product',
      visit_id: newItemVisitId,
      visit_name: visit[1].visit_name,
      contact_id: newItemContactId,
      contact_name: contact.name,
      contact_role: contact.role,
      is_customer_responsible: contact.role === 'end_customer',
      article_id: selectedArticle?.id,
      article_code: selectedArticle?.code
    };

    setQuote(prev => ({
      ...prev,
      line_items: [...prev.line_items, lineItem]
    }));

    // Reset form
    setIsAddingItem(false);
    setNewItemVisitId(null);
    setNewItemContactId(null);
    setNewItem({});
    setSearchQuery('');
    setSelectedArticle(null);
  };

  // Cancel new line item
  const cancelNewLineItem = () => {
    setIsAddingItem(false);
    setNewItemVisitId(null);
    setNewItemContactId(null);
    setNewItem({});
    setSearchQuery('');
    setSelectedArticle(null);
  };

  // Remove line item
  const removeLineItem = (itemId: string) => {
    setQuote(prev => ({
      ...prev,
      line_items: prev.line_items.filter(item => item.id !== itemId)
    }));
  };

  // Select article from autocomplete
  const selectArticle = (article: Article) => {
    setSelectedArticle(article);
    setNewItem({
      description: article.description,
      quantity: 1,
      unit_price: article.unit_price,
      total_price: article.unit_price
    });
    setSearchQuery(article.description);
    setFilteredArticles([]);
  };

  // Keyboard navigation for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isAddingItem) return;

    if (e.key === 'Enter') {
      if (filteredArticles.length > 0) {
        selectArticle(filteredArticles[0]);
      } else {
        saveNewLineItem();
      }
    } else if (e.key === 'Escape') {
      cancelNewLineItem();
    }
  };

  const getContactColor = (role: string) => {
    switch (role) {
      case 'account': return 'primary';
      case 'end_customer': return 'success';
      case 'intermediary': return 'warning';
      default: return 'secondary';
    }
  };

  const getContactLabel = (role: string) => {
    switch (role) {
      case 'account': return 'Account';
      case 'end_customer': return 'Klant';
      case 'intermediary': return 'Intermediair';
      default: return role;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'product': return <ArchiveBoxIcon className="h-4 w-4" />;
      case 'service': return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'installation': return <BoltIcon className="h-4 w-4" />;
      default: return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const getContactTotal = (contactId: string) => {
    return quote.line_items
      .filter(item => item.contact_id === contactId)
      .reduce((sum, item) => sum + item.total_price, 0);
  };

  // Mock loading state
  if (!id) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'danger';
      case 'expired': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <AppLayout>
      <Head>
        <title>Offerte {quote.quote_number} - ChargeCars</title>
      </Head>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => router.back()}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Offerte {quote.quote_number}</h1>
              <p className="text-sm text-foreground-500">Order: {quote.order_number}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Chip color={getStatusColor(quote.status)} variant="flat" size="sm">
              {quote.status === 'draft' ? 'Concept' : 
               quote.status === 'sent' ? 'Verzonden' :
               quote.status === 'accepted' ? 'Geaccepteerd' :
               quote.status === 'rejected' ? 'Afgewezen' : 'Verlopen'}
            </Chip>
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="flat" size="sm">
                  <EllipsisVerticalIcon className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="print" startContent={<PrinterIcon className="h-4 w-4" />}>
                  Print Offerte
                </DropdownItem>
                <DropdownItem key="pdf" startContent={<DocumentArrowDownIcon className="h-4 w-4" />}>
                  Download PDF
                </DropdownItem>
                <DropdownItem key="duplicate" startContent={<DocumentDuplicateIcon className="h-4 w-4" />}>
                  Dupliceer
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        {/* Status Timeline */}
        <Card className="p-4">
          <div className="flex items-center gap-4 overflow-x-auto">
            {quote.statuses.map((status, index) => (
              <React.Fragment key={status.id}>
                <div className="flex flex-col items-center gap-1 min-w-fit">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    status.completed ? 'bg-success text-white' :
                    status.current ? 'bg-primary text-white' :
                    'bg-default-200 text-default-500'
                  }`}>
                    {status.completed ? <CheckCircleIcon className="h-4 w-4" /> :
                     status.current ? <ClockIcon className="h-4 w-4" /> :
                     index + 1}
                  </div>
                  <div className="text-xs font-medium text-center">{status.name}</div>
                  {status.date && (
                    <div className="text-xs text-foreground-500 text-center">{status.date}</div>
                  )}
                </div>
                {index < quote.statuses.length - 1 && (
                  <div className={`h-0.5 w-12 ${
                    status.completed ? 'bg-success' : 'bg-default-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>

        {/* Quote Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="text-base font-semibold mb-2">Quote Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-500">Geldig tot:</span>
                <span>{quote.valid_until}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">Levertijd:</span>
                <span>{quote.delivery_time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">Garantie:</span>
                <span>{quote.warranty_period}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-base font-semibold mb-2">Klant</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-500">Naam:</span>
                <span>{quote.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">Bedrag:</span>
                <span className="font-medium">€{quote.customer_amount.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-base font-semibold mb-2">Partner</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground-500">Naam:</span>
                <span>{quote.partner_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-500">Bedrag:</span>
                <span className="font-medium">€{quote.partner_amount.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Line Items Table */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold">Regelitems</h3>
            <Button
              size="sm"
              color="primary"
              startContent={<PlusIcon className="h-4 w-4" />}
              onPress={() => addLineItem('V-001', 'CONT-001')}
            >
              Regel Toevoegen
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-divider">
                  <th className="text-left text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[100px]">Bezoek</th>
                  <th className="text-left text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[60px]">#</th>
                  <th className="text-left text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[300px]">Omschrijving</th>
                  <th className="text-right text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[80px]">Aantal</th>
                  <th className="text-right text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[100px]">Prijs</th>
                  <th className="text-right text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[100px]">Totaal</th>
                  <th className="text-center text-xs font-semibold text-foreground-500 py-2 px-2 min-w-[60px]">Acties</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedItems).map(([visitId, visit], visitIndex) => {
                  let itemNumber = 1;
                  const visitRows: JSX.Element[] = [];
                  let isFirstVisitRow = true;
                  
                  Object.entries(visit.contacts).forEach(([contactId, contact]) => {
                    // Contact header
                    visitRows.push(
                      <tr key={`contact-${contactId}`} className="bg-content2/30">
                        {isFirstVisitRow && (
                          <td rowSpan={Object.values(visit.contacts).reduce((sum, c) => sum + c.items.length + 1, Object.keys(visit.contacts).length)} 
                              className="border-r border-divider bg-gradient-to-b from-primary/10 to-primary/5">
                            <div className="p-2 text-center">
                              <div className="transform -rotate-90 whitespace-nowrap text-xs font-semibold text-primary">
                                {visit.visit_name}
                              </div>
                            </div>
                          </td>
                        )}
                        <td colSpan={5} className="py-2 px-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Chip size="sm" color={getContactColor(contact.contact_role)} variant="flat">
                                {getContactLabel(contact.contact_role)}
                              </Chip>
                              <span className="text-sm font-medium">{contact.contact_name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="flat"
                              startContent={<PlusIcon className="h-3 w-3" />}
                              onPress={() => addLineItem(visitId, contactId)}
                            >
                              Toevoegen
                            </Button>
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    );
                    isFirstVisitRow = false;
                    
                    // Contact items
                    contact.items.forEach((item, itemIndex) => {
                      visitRows.push(
                        <tr key={item.id} className="border-b border-divider hover:bg-content2/20">
                          <td className="py-2 px-2 text-center text-xs text-foreground-500">
                            {itemNumber}
                          </td>
                          <td className="py-2 px-2">
                            <div className="flex items-start gap-2">
                              <div className="flex-shrink-0">{getCategoryIcon(item.category)}</div>
                              <div className="min-w-0">
                                {editingItem === item.id ? (
                                  <Input
                                    size="sm"
                                    value={item.description}
                                    onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                                    onBlur={() => setEditingItem(null)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') setEditingItem(null);
                                      if (e.key === 'Escape') setEditingItem(null);
                                    }}
                                    autoFocus
                                  />
                                ) : (
                                  <div 
                                    className="text-sm cursor-pointer hover:bg-content2 rounded p-1 -m-1"
                                    onClick={() => setEditingItem(item.id)}
                                  >
                                    {item.description}
                                    {item.article_code && (
                                      <div className="text-xs text-foreground-500">{item.article_code}</div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <Input
                              size="sm"
                              type="number"
                              value={item.quantity.toString()}
                              onChange={(e) => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                              className="w-16 text-right"
                              min="1"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex items-center justify-end">
                              <CurrencyEuroIcon className="h-3 w-3 text-foreground-500 mr-1" />
                              <Input
                                size="sm"
                                type="number"
                                value={item.unit_price.toFixed(2)}
                                onChange={(e) => updateLineItem(item.id, { unit_price: parseFloat(e.target.value) || 0 })}
                                className="w-20 text-right"
                                step="0.01"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex items-center justify-end text-sm font-medium">
                              <CurrencyEuroIcon className="h-3 w-3 text-foreground-500 mr-1" />
                              {item.total_price.toFixed(2)}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => removeLineItem(item.id)}
                            >
                              <TrashIcon className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      );
                      itemNumber++;
                    });
                    
                    // Add new item row if this is the target contact
                    if (isAddingItem && newItemVisitId === visitId && newItemContactId === contactId) {
                      visitRows.push(
                        <tr key="new-item" className="border-b border-divider bg-warning/10">
                          <td className="py-2 px-2 text-center text-xs text-foreground-500">
                            {itemNumber}
                          </td>
                          <td className="py-2 px-2 relative">
                            <div className="space-y-2">
                              <Input
                                ref={inputRef}
                                size="sm"
                                placeholder="Begin met typen voor suggesties..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                              />
                              {filteredArticles.length > 0 && (
                                <div className="absolute z-10 w-full bg-content1 border border-divider rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                  {filteredArticles.map((article) => (
                                    <div
                                      key={article.id}
                                      className="p-2 hover:bg-content2 cursor-pointer border-b border-divider last:border-0"
                                      onClick={() => selectArticle(article)}
                                    >
                                      <div className="text-sm font-medium">{article.name}</div>
                                      <div className="text-xs text-foreground-500">{article.code} - €{article.unit_price.toFixed(2)}</div>
                                      <div className="text-xs text-foreground-400">{article.description}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <Input
                              size="sm"
                              type="number"
                              value={newItem.quantity?.toString() || '1'}
                              onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                              className="w-16 text-right"
                              min="1"
                            />
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex items-center justify-end">
                              <CurrencyEuroIcon className="h-3 w-3 text-foreground-500 mr-1" />
                              <Input
                                size="sm"
                                type="number"
                                value={newItem.unit_price?.toFixed(2) || '0.00'}
                                onChange={(e) => setNewItem({...newItem, unit_price: parseFloat(e.target.value) || 0})}
                                className="w-20 text-right"
                                step="0.01"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right">
                            <div className="flex items-center justify-end text-sm font-medium">
                              <CurrencyEuroIcon className="h-3 w-3 text-foreground-500 mr-1" />
                              {((newItem.quantity || 1) * (newItem.unit_price || 0)).toFixed(2)}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <div className="flex gap-1">
                              <Button
                                isIconOnly
                                size="sm"
                                color="success"
                                variant="flat"
                                onPress={saveNewLineItem}
                              >
                                <CheckIcon className="h-3 w-3" />
                              </Button>
                              <Button
                                isIconOnly
                                size="sm"
                                variant="flat"
                                onPress={cancelNewLineItem}
                              >
                                <XMarkIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                    
                    // Contact subtotal
                    const contactTotal = getContactTotal(contactId);
                    visitRows.push(
                      <tr key={`subtotal-${contactId}`} className="bg-content2/50">
                        <td colSpan={4} className="py-1 px-2 text-right text-xs font-medium text-foreground-600">
                          Subtotaal {contact.contact_name}:
                        </td>
                        <td className="py-1 px-2 text-right text-sm font-semibold">
                          <div className="flex items-center justify-end">
                            <CurrencyEuroIcon className="h-3 w-3 text-foreground-500 mr-1" />
                            {contactTotal.toFixed(2)}
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    );
                  });
                  
                  return visitRows;
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="text-base font-semibold mb-3">Totaaloverzicht</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotaal:</span>
                <span>€{(quote.customer_amount + quote.partner_amount - (quote.customer_amount + quote.partner_amount) * 0.21).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>BTW (21%):</span>
                <span>€{((quote.customer_amount + quote.partner_amount) * 0.21).toFixed(2)}</span>
              </div>
              <Divider />
              <div className="flex justify-between font-semibold">
                <span>Totaal:</span>
                <span>€{(quote.customer_amount + quote.partner_amount).toFixed(2)}</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-base font-semibold mb-3">Verdeling</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Klant:</span>
                <span className="font-medium">€{quote.customer_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Partner:</span>
                <span className="font-medium">€{quote.partner_amount.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Terms & Conditions */}
        {quote.terms_conditions && (
          <Card className="p-4">
            <h3 className="text-base font-semibold mb-2">Voorwaarden</h3>
            <p className="text-sm text-foreground-600">{quote.terms_conditions}</p>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default QuoteDetailPage; 