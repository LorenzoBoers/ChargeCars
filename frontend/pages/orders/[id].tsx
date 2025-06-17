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
  Spinner,
  Breadcrumbs,
  BreadcrumbItem
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
  PresentationChartBarIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from "@heroicons/react/24/outline";
import { AppLayout } from '../../components/layouts/AppLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils/dateUtils';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate loading
  React.useEffect(() => {
    if (id) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [id]);

  const handleBack = () => {
    router.push('/orders');
  };
  
  const handleEdit = () => {
    router.push(`/orders/edit/${id}`);
  };
  
  const handleDelete = () => {
    // Show confirmation dialog and delete
    console.log('Delete order:', id);
  };
  
  const handleDuplicate = () => {
    // Duplicate order logic
    console.log('Duplicate order:', id);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Spinner size="lg" />
          </div>
      </AppLayout>
    );
  }
  
  if (error) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Card>
            <CardBody>
              <p className="text-danger">{error}</p>
              <Button
                color="primary"
                variant="light"
                startContent={<ArrowLeftIcon className="h-4 w-4" />}
                onPress={handleBack}
                className="mt-4"
              >
                Terug naar Orders
              </Button>
            </CardBody>
          </Card>
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
        <title>{order.orderNumber} - ChargeCars Portal</title>
        <meta name="description" content={`Order details voor ${order.orderNumber}`} />
      </Head>

      <AppLayout>
        <div className="p-4 space-y-4">
          {/* Breadcrumbs */}
          <Breadcrumbs size="sm">
            <BreadcrumbItem href="/orders">Orders</BreadcrumbItem>
            <BreadcrumbItem>{order.orderNumber}</BreadcrumbItem>
          </Breadcrumbs>
          
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                isIconOnly
                variant="light"
                onPress={handleBack}
                className="h-8 w-8"
              >
                <ArrowLeftIcon className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  {order.orderNumber}
                </h1>
                <div className="flex items-center gap-2">
                  <StatusBadge 
                    statusColor={order.statuses[order.statuses.length - 1].color} 
                    label={order.statuses[order.statuses.length - 1].name}
                  />
                  <span className="text-xs text-foreground-500">
                    Aangemaakt op {formatDate(order.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                color="default"
                variant="bordered"
                size="sm"
                startContent={<DocumentDuplicateIcon className="h-4 w-4" />}
                onPress={handleDuplicate}
              >
                Dupliceren
              </Button>
              <Button
                color="default"
                variant="bordered"
                size="sm"
                startContent={<PencilIcon className="h-4 w-4" />}
                onPress={handleEdit}
              >
                Bewerken
              </Button>
              <Button
                color="danger"
                variant="bordered"
                size="sm"
                startContent={<TrashIcon className="h-4 w-4" />}
                onPress={handleDelete}
              >
                Verwijderen
              </Button>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Info */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Order Informatie</h2>
            </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-foreground-500">Order Type</p>
                      <p className="font-medium">{order.orderType}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground-500">Bedrag</p>
                      <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground-500">Business Entity</p>
                      <p className="font-medium">{order.businessEntity}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground-500">Partner</p>
                      <p className="font-medium">{order.partnerName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-foreground-500">Verwachte Levering</p>
                      <p className="font-medium">{order.expectedDelivery}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground-500">Aangemaakt op</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-foreground-500">Laatst bijgewerkt</p>
                      <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

            {/* Customer Info */}
                <Card>
              <CardHeader className="pb-0">
                <h2 className="text-lg font-semibold">Klant Informatie</h2>
                  </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <UserIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-500">Naam</p>
                      <p className="font-medium">{order.customerName}</p>
                            </div>
                          </div>
                          
                  <Divider />
                  
                                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BuildingOfficeIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                      <p className="text-xs text-foreground-500">Bedrijf</p>
                      <p className="font-medium">{order.businessEntity}</p>
                                    </div>
                                  </div>
                  
                  <Divider />
                  
                                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <EnvelopeIcon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                      <p className="text-xs text-foreground-500">Email</p>
                      <p className="font-medium">{order.customer.email}</p>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <PhoneIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-foreground-500">Telefoon</p>
                      <p className="font-medium">{order.customer.phone}</p>
                    </div>
                  </div>
                </div>
              </CardBody>
              </Card>
          </div>
          
          {/* Timeline and Notes (placeholder) */}
          <Card>
            <CardHeader className="pb-0">
              <h2 className="text-lg font-semibold">Tijdlijn & Notities</h2>
            </CardHeader>
            <CardBody>
              <p className="text-foreground-500 text-sm">
                Hier komt de tijdlijn en notities voor deze order.
              </p>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    </>
  );
};

export default OrderDetailPage; 