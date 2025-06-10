import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Chip,
  Button,
  Input,
  Avatar,
  Divider,
  Tabs,
  Tab,
  ScrollShadow,
  Switch
} from '@nextui-org/react';
import {
  MagnifyingGlassIcon,
  InboxIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  TicketIcon,
  ChevronRightIcon,
  PaperClipIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AppLayout } from '../components/layouts/AppLayout';

// Mock data types
interface BusinessEntity {
  id: string;
  name: string;
  shortName: string;
  channelCounts: {
    email: number;
    whatsapp: number;
    phone: number;
    livechat: number;
    support_tickets: number;
    sales_tickets: number;
  };
}

interface Conversation {
  id: string;
  subject: string;
  customer: {
    name: string;
    email: string;
    avatar?: string;
  };
  channel: 'email' | 'whatsapp' | 'phone' | 'livechat' | 'support_ticket' | 'sales_ticket';
  status: 'new' | 'open' | 'pending' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  assignedTo?: string;
  slaDeadline?: string;
  businessEntityId: string;
  orderId?: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isInternal: boolean;
  attachments?: string[];
  messageType: 'text' | 'image' | 'document' | 'system';
}

interface ContactInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  avatar?: string;
  tags: string[];
  orders: Array<{
    id: string;
    status: string;
    value: number;
    lastActivity: string;
    type: string;
  }>;
  lastActivity: string;
}

export default function InboxPage() {
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  // Mock data
  const businessEntities: BusinessEntity[] = [
    {
      id: 'chargecars',
      name: 'ChargeCars B.V.',
      shortName: 'ChargeCars',
      channelCounts: {
        email: 23,
        whatsapp: 8,
        phone: 5,
        livechat: 12,
        support_tickets: 15,
        sales_tickets: 7
      }
    },
    {
      id: 'laderthuis',
      name: 'LaderThuis B.V.',
      shortName: 'LaderThuis',
      channelCounts: {
        email: 18,
        whatsapp: 12,
        phone: 3,
        livechat: 9,
        support_tickets: 11,
        sales_tickets: 4
      }
    },
    {
      id: 'meterkastthuis',
      name: 'MeterKastThuis B.V.',
      shortName: 'MeterKast',
      channelCounts: {
        email: 14,
        whatsapp: 6,
        phone: 2,
        livechat: 7,
        support_tickets: 8,
        sales_tickets: 3
      }
    },
    {
      id: 'zaptecshop',
      name: 'ZaptecShop B.V.',
      shortName: 'ZaptecShop',
      channelCounts: {
        email: 9,
        whatsapp: 4,
        phone: 1,
        livechat: 5,
        support_tickets: 6,
        sales_tickets: 2
      }
    },
    {
      id: 'ratioshop',
      name: 'RatioShop B.V.',
      shortName: 'RatioShop',
      channelCounts: {
        email: 11,
        whatsapp: 3,
        phone: 2,
        livechat: 4,
        support_tickets: 7,
        sales_tickets: 1
      }
    }
  ];

  const conversations: Conversation[] = [
    {
      id: '1',
      subject: 'Installatie planning vraag',
      customer: { name: 'Henk van der Berg', email: 'h.vandenberg@email.nl' },
      channel: 'email',
      status: 'new',
      priority: 'high',
      lastMessage: 'Kunnen we de installatie een dag eerder plannen?',
      lastMessageTime: '10:34',
      unreadCount: 2,
      assignedTo: 'Jan Petersma',
      slaDeadline: '14:00',
      businessEntityId: 'chargecars',
      orderId: 'CHC-2024-001'
    },
    {
      id: '2',
      subject: 'WhatsApp - Offerte vraag',
      customer: { name: 'Marie Jansen', email: 'marie.jansen@bedrijf.nl' },
      channel: 'whatsapp',
      status: 'open',
      priority: 'medium',
      lastMessage: 'Hoi, ik heb een vraag over de offerte...',
      lastMessageTime: '09:15',
      unreadCount: 1,
      businessEntityId: 'laderthuis',
      orderId: 'LT-2024-078'
    },
    {
      id: '3',
      subject: 'Support Ticket - Storing laadpaal',
      customer: { name: 'Peter de Vries', email: 'p.devries@home.nl' },
      channel: 'support_ticket',
      status: 'pending',
      priority: 'urgent',
      lastMessage: 'De laadpaal geeft een foutmelding en laadt niet meer',
      lastMessageTime: 'gisteren',
      unreadCount: 0,
      assignedTo: 'Technical Support',
      slaDeadline: 'Vandaag 16:00',
      businessEntityId: 'chargecars',
      orderId: 'CHC-2023-445'
    }
  ];

  const currentMessages: Message[] = [
    {
      id: '1',
      sender: 'Henk van der Berg',
      content: 'Goedemiddag, ik heb een vraag over de geplande installatie voor volgende week dinsdag.',
      timestamp: '10:30',
      isInternal: false,
      messageType: 'text'
    },
    {
      id: '2',
      sender: 'Henk van der Berg',
      content: 'Kunnen we de installatie een dag eerder plannen? Ik ben woensdag niet beschikbaar.',
      timestamp: '10:34',
      isInternal: false,
      messageType: 'text'
    },
    {
      id: '3',
      sender: 'Jan Petersma',
      content: '(Interne notitie: Klant vraagt om planning wijziging. Check beschikbaarheid team voor maandag)',
      timestamp: '10:35',
      isInternal: true,
      messageType: 'text'
    }
  ];

  const contactInfo: ContactInfo = {
    id: '1',
    name: 'Henk van der Berg',
    email: 'h.vandenberg@email.nl',
    phone: '+31 6 12345678',
    company: 'Berg Installaties B.V.',
    tags: ['VIP Klant', 'Zakelijk'],
    orders: [
      {
        id: 'CHC-2024-001',
        status: 'Gepland',
        value: 2450.00,
        lastActivity: '2 dagen geleden',
        type: 'installation'
      },
      {
        id: 'CHC-2024-067',
        status: 'Offerte',
        value: 1850.00,
        lastActivity: '1 week geleden',
        type: 'quote'
      },
      {
        id: 'LT-2024-012',
        status: 'Voltooid',
        value: 3200.00,
        lastActivity: '3 weken geleden',
        type: 'service'
      }
    ],
    lastActivity: '2 dagen geleden'
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <EnvelopeIcon className="h-4 w-4" />;
      case 'whatsapp': return <ChatBubbleLeftIcon className="h-4 w-4" />;
      case 'phone': return <PhoneIcon className="h-4 w-4" />;
      case 'livechat': return <ChatBubbleLeftIcon className="h-4 w-4" />;
      case 'support_ticket': 
      case 'sales_ticket': return <TicketIcon className="h-4 w-4" />;
      default: return <InboxIcon className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'email': return 'primary';
      case 'whatsapp': return 'success';
      case 'phone': return 'warning';
      case 'livechat': return 'secondary';
      case 'support_ticket': return 'danger';
      case 'sales_ticket': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'primary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTotalCount = (entity: BusinessEntity) => {
    return Object.values(entity.channelCounts).reduce((sum, count) => sum + count, 0);
  };

  const closeConversation = (conversationId: string) => {
    // In real app, this would call an API to close the conversation
    console.log('Closing conversation:', conversationId);
    // For now, we'll just show it was closed (in real app, update the status to 'resolved')
  };

  // Filter conversations based on selected entity, channel, and search
  const filteredConversations = conversations.filter(conversation => {
    const entityMatch = selectedEntity === 'all' || conversation.businessEntityId === selectedEntity;
    const channelMatch = selectedChannel === 'all' || conversation.channel === selectedChannel;
    const searchMatch = searchQuery === '' || 
      conversation.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Add status filter: if showOnlyOpen is true, only show 'new', 'open', 'pending'
    const statusMatch = showOnlyOpen ? 
      ['new', 'open', 'pending'].includes(conversation.status) : 
      true;
    
    return entityMatch && channelMatch && searchMatch && statusMatch;
  });

  return (
    <AppLayout>
      <div className="h-full flex bg-background">
        {/* Left Sidebar - Folder Structure */}
        <div className="w-80 border-r border-divider bg-content1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-divider">
            <h1 className="text-xl font-bold mb-3">Multichannel Inbox</h1>
            <Input
              placeholder="Zoek gesprekken..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startContent={<MagnifyingGlassIcon className="h-4 w-4 text-foreground-500" />}
              size="sm"
            />
          </div>

          {/* Folder Structure */}
          <ScrollShadow className="flex-1">
            <div className="p-4 space-y-2">
              {/* All Messages */}
              <Button
                variant={selectedEntity === 'all' && selectedChannel === 'all' ? 'flat' : 'light'}
                className="w-full justify-start"
                startContent={<InboxIcon className="h-4 w-4" />}
                onPress={() => {
                  setSelectedEntity('all');
                  setSelectedChannel('all');
                }}
              >
                <div className="flex-1 flex justify-between items-center">
                  <span>Alle Berichten</span>
                  <Chip size="sm" color="primary" variant="flat">
                    {conversations.length}
                  </Chip>
                </div>
              </Button>

              <Divider className="my-3" />

              {/* Business Entities */}
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-foreground-500 uppercase mb-2">
                  Business Entiteiten
                </h3>
                {businessEntities.map(entity => (
                  <div key={entity.id} className="space-y-1">
                    <Button
                      variant={selectedEntity === entity.id && selectedChannel === 'all' ? 'flat' : 'light'}
                      className="w-full justify-start"
                      onPress={() => {
                        setSelectedEntity(entity.id);
                        setSelectedChannel('all');
                      }}
                    >
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-medium">{entity.shortName}</span>
                        <Chip size="sm" color="primary" variant="flat">
                          {getTotalCount(entity)}
                        </Chip>
                      </div>
                    </Button>
                    
                    {/* Channel breakdown for selected entity */}
                    {selectedEntity === entity.id && (
                      <div className="ml-4 space-y-1">
                        {Object.entries(entity.channelCounts).map(([channel, count]) => (
                          <Button
                            key={channel}
                            size="sm"
                            variant={selectedChannel === channel ? 'flat' : 'light'}
                            className="w-full justify-start"
                            startContent={getChannelIcon(channel)}
                            onPress={() => setSelectedChannel(channel)}
                          >
                            <div className="flex-1 flex justify-between items-center">
                              <span className="capitalize text-xs">
                                {channel.replace('_', ' ')}
                              </span>
                              {count > 0 && (
                                <Chip size="sm" color={getChannelColor(channel)} variant="flat">
                                  {count}
                                </Chip>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Divider className="my-3" />

              {/* Channel Types */}
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-foreground-500 uppercase mb-2">
                  Kanaal Types
                </h3>
                {[
                  { key: 'email', label: 'Email', icon: 'email' },
                  { key: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
                  { key: 'phone', label: 'Telefoon', icon: 'phone' },
                  { key: 'livechat', label: 'Live Chat', icon: 'livechat' },
                  { key: 'support_ticket', label: 'Support Tickets', icon: 'support_ticket' },
                  { key: 'sales_ticket', label: 'Sales Tickets', icon: 'sales_ticket' }
                ].map(channel => (
                  <Button
                    key={channel.key}
                    variant={selectedChannel === channel.key ? 'flat' : 'light'}
                    className="w-full justify-start"
                    startContent={getChannelIcon(channel.icon)}
                    onPress={() => {
                      setSelectedEntity('all');
                      setSelectedChannel(channel.key);
                    }}
                  >
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-sm">{channel.label}</span>
                      <Chip 
                        size="sm" 
                        color={getChannelColor(channel.icon)} 
                        variant="flat"
                      >
                        {conversations.filter(c => c.channel === channel.key).length}
                      </Chip>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </ScrollShadow>
        </div>

        {/* Middle Left - Conversation List */}
        <div className="w-96 border-r border-divider bg-content1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-divider">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">
                Gesprekken ({filteredConversations.length})
              </h2>
              <Button size="sm" variant="flat">
                Filters
              </Button>
            </div>
            
            {/* Open/Closed Switch */}
            <div className="flex items-center gap-3">
              <Switch 
                size="sm"
                isSelected={showOnlyOpen}
                onValueChange={setShowOnlyOpen}
                color="primary"
              >
                <span className="text-sm text-foreground-600">
                  {showOnlyOpen ? 'Alleen open gesprekken' : 'Alle gesprekken'}
                </span>
              </Switch>
            </div>
          </div>

          {/* Conversation List */}
          <ScrollShadow className="flex-1">
            <div className="divide-y divide-divider">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`p-4 cursor-pointer hover:bg-content2 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-content2' : ''
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Chip
                        size="sm"
                        color={getChannelColor(conversation.channel)}
                        variant="flat"
                        startContent={getChannelIcon(conversation.channel)}
                      />
                      <Chip
                        size="sm"
                        color={getPriorityColor(conversation.priority)}
                        variant="dot"
                      >
                        {conversation.priority}
                      </Chip>
                    </div>
                    <div className="flex items-center gap-1">
                      {conversation.unreadCount > 0 && (
                        <Chip size="sm" color="danger" variant="flat">
                          {conversation.unreadCount}
                        </Chip>
                      )}
                      <span className="text-xs text-foreground-500">{conversation.lastMessageTime}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm truncate">{conversation.subject}</h3>
                    </div>
                    <p className="text-xs text-foreground-600 font-medium">{conversation.customer.name}</p>
                    <p className="text-xs text-foreground-500 truncate">{conversation.lastMessage}</p>
                    
                    {conversation.assignedTo && (
                      <div className="flex items-center gap-1 mt-2">
                        <Avatar name={conversation.assignedTo} size="sm" className="w-4 h-4" />
                        <span className="text-xs text-foreground-500">{conversation.assignedTo}</span>
                      </div>
                    )}
                    
                    {conversation.slaDeadline && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-warning">SLA: {conversation.slaDeadline}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollShadow>
        </div>

        {/* Middle Right - Chat View */}
        <div className="flex-1 bg-content1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-divider">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={contactInfo.name} size="sm" />
                    <div>
                      <h3 className="font-semibold">{contactInfo.name}</h3>
                      <p className="text-xs text-foreground-500">{contactInfo.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="primary" variant="flat">
                      {conversations.find(c => c.id === selectedConversation)?.businessEntityId}
                    </Chip>
                    <Button size="sm" variant="flat">
                      Acties
                    </Button>
                    <Button 
                      size="sm" 
                      variant="flat"
                      color="success"
                      startContent={<CheckIcon className="h-4 w-4" />}
                      onPress={() => closeConversation(selectedConversation)}
                    >
                      Sluiten
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollShadow className="flex-1 p-4">
                <div className="space-y-4">
                  {currentMessages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.isInternal ? 'justify-center' : 'justify-start'}`}
                    >
                      {message.isInternal ? (
                        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 max-w-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-warning">Interne Notitie</span>
                            <span className="text-xs text-foreground-500">{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      ) : (
                        <div className="bg-content2 rounded-lg p-3 max-w-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium">{message.sender}</span>
                            <span className="text-xs text-foreground-500">{message.timestamp}</span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="flex items-center gap-1 mt-2">
                              <PaperClipIcon className="h-3 w-3 text-foreground-500" />
                              <span className="text-xs text-foreground-500">
                                {message.attachments.length} bijlage(n)
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollShadow>

              {/* Message Input */}
              <div className="p-4 border-t border-divider">
                <div className="flex gap-2">
                  <Input
                    placeholder="Typ je bericht..."
                    className="flex-1"
                    endContent={
                      <div className="flex gap-1">
                        <Button isIconOnly size="sm" variant="light">
                          <PaperClipIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    }
                  />
                  <Button color="primary">
                    Verstuur
                  </Button>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Button size="sm" variant="flat">
                    Template
                  </Button>
                  <Button size="sm" variant="flat">
                    Interne notitie
                  </Button>
                  <Button size="sm" variant="flat" color="success">
                    Oplossen
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <InboxIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground-500">Selecteer een gesprek</h3>
                <p className="text-foreground-400">Kies een gesprek uit de lijst om de berichten te bekijken</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Contact/Order Info */}
        <div className="w-80 border-l border-divider bg-content1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Contact Info Header */}
              <div className="p-4 border-b border-divider">
                <h2 className="font-semibold mb-3">Contact Informatie</h2>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={contactInfo.name} size="md" />
                  <div>
                    <h3 className="font-semibold">{contactInfo.name}</h3>
                    <p className="text-xs text-foreground-500">{contactInfo.email}</p>
                    <p className="text-xs text-foreground-500">{contactInfo.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {contactInfo.tags.map(tag => (
                    <Chip key={tag} size="sm" variant="flat" color="secondary">
                      {tag}
                    </Chip>
                  ))}
                </div>
              </div>

              {/* Primary Order Information */}
              {contactInfo.orders.length > 0 && (
                <div className="p-4 border-b border-divider">
                  <h3 className="font-semibold mb-3">Hoofdorder</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-500">Order ID:</span>
                      <span className="text-xs font-medium">{contactInfo.orders[0].id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-500">Status:</span>
                      <Chip size="sm" color="primary" variant="flat">
                        {contactInfo.orders[0].status}
                      </Chip>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-500">Waarde:</span>
                      <span className="text-xs font-medium">€{contactInfo.orders[0].value?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-foreground-500">Laatste activiteit:</span>
                      <span className="text-xs text-foreground-500">{contactInfo.orders[0].lastActivity}</span>
                    </div>
                  </div>
                  <Button size="sm" color="primary" variant="flat" className="w-full mt-3">
                    Bekijk Order Details
                  </Button>
                </div>
              )}

              {/* Additional Orders Section */}
              {contactInfo.orders.length > 1 && (
                <div className="p-4 border-b border-divider">
                  <h3 className="font-semibold mb-3">Overige Orders ({contactInfo.orders.length - 1})</h3>
                  <div className="space-y-2">
                    {contactInfo.orders.slice(1).map(order => (
                      <div key={order.id} className="bg-content2 p-2 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium">{order.id}</span>
                          <Chip size="sm" color="secondary" variant="flat">
                            {order.status}
                          </Chip>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-foreground-500">€{order.value.toFixed(2)}</span>
                          <span className="text-xs text-foreground-400">{order.lastActivity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="p-4">
                <h3 className="font-semibold mb-3">Snelle Acties</h3>
                <div className="space-y-2">
                  <Button size="sm" variant="flat" className="w-full justify-start">
                    📞 Bel Contact
                  </Button>
                  <Button size="sm" variant="flat" className="w-full justify-start">
                    📧 Nieuw Email
                  </Button>
                  <Button size="sm" variant="flat" className="w-full justify-start">
                    📋 Maak Taak
                  </Button>
                  <Button size="sm" variant="flat" className="w-full justify-start">
                    🎫 Escaleer Ticket
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-center">
                <h3 className="text-sm font-semibold text-foreground-500">Contact Details</h3>
                <p className="text-xs text-foreground-400 mt-1">
                  Selecteer een gesprek om contact informatie te bekijken
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 