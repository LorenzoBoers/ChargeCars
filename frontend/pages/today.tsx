import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Avatar,
  Button,
  Progress,
  Divider,
  Badge,
  Tooltip
} from '@nextui-org/react';
import {
  MapIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  CogIcon,
  CalendarIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { AppLayout } from '../components/layouts/AppLayout';

// Types for today's data
interface TechnicianLocation {
  id: string;
  name: string;
  status: 'active' | 'break' | 'transit' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  currentTask?: string;
  taskProgress?: number;
  team: string;
  avatar?: string;
  estimatedCompletion?: string;
}

interface Visit {
  id: string;
  orderNumber: string;
  customer: string;
  address: string;
  city: string;
  time: string;
  type: 'installation' | 'maintenance' | 'repair' | 'inspection';
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled';
  technicianId: string;
  duration: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

interface TimelineEvent {
  id: string;
  time: string;
  type: 'visit_completed' | 'visit_started' | 'technician_arrived' | 'issue_reported' | 'delay_reported';
  title: string;
  description: string;
  technicianName?: string;
  orderNumber?: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

export default function TodayPage() {
  const [selectedTechnician, setSelectedTechnician] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Mock data for today
  const technicians: TechnicianLocation[] = [
    {
      id: 'tech-1',
      name: 'Jan Petersma',
      status: 'active',
      currentLocation: {
        lat: 52.3676,
        lng: 4.9041,
        address: 'Hoofdstraat 123, Amsterdam'
      },
      currentTask: 'Laadpaal installatie',
      taskProgress: 65,
      team: 'Team Alpha',
      estimatedCompletion: '14:30'
    },
    {
      id: 'tech-2',
      name: 'Marie Jansen',
      status: 'transit',
      currentLocation: {
        lat: 52.3792,
        lng: 4.8994,
        address: 'Onderweg naar Kerkstraat 45'
      },
      team: 'Team Beta',
      estimatedCompletion: '15:15'
    },
    {
      id: 'tech-3',
      name: 'Erik van Dam',
      status: 'break',
      currentLocation: {
        lat: 52.3555,
        lng: 4.9355,
        address: 'Pause - Nieuwstraat 67, Haarlem'
      },
      team: 'Team Beta',
      estimatedCompletion: '13:45'
    },
    {
      id: 'tech-4',
      name: 'Lisa Wong',
      status: 'offline',
      currentLocation: {
        lat: 52.0907,
        lng: 5.1214,
        address: 'Kantoor Utrecht'
      },
      team: 'Team Gamma'
    }
  ];

  const visits: Visit[] = [
    {
      id: 'visit-1',
      orderNumber: 'CHC-2024-001',
      customer: 'Henk van der Berg',
      address: 'Hoofdstraat 123',
      city: 'Amsterdam',
      time: '09:00',
      type: 'installation',
      status: 'in_progress',
      technicianId: 'tech-1',
      duration: 180,
      priority: 'high'
    },
    {
      id: 'visit-2',
      orderNumber: 'CHC-2024-002',
      customer: 'Marie Jansen',
      address: 'Kerkstraat 45',
      city: 'Haarlem',
      time: '10:30',
      type: 'maintenance',
      status: 'pending',
      technicianId: 'tech-2',
      duration: 90,
      priority: 'medium'
    },
    {
      id: 'visit-3',
      orderNumber: 'CHC-2024-003',
      customer: 'Peter de Vries',
      address: 'Nieuwstraat 67',
      city: 'Utrecht',
      time: '08:00',
      type: 'installation',
      status: 'completed',
      technicianId: 'tech-3',
      duration: 120,
      priority: 'high'
    },
    {
      id: 'visit-4',
      orderNumber: 'CHC-2024-004',
      customer: 'Anna Bakker',
      address: 'Dorpsstraat 12',
      city: 'Amersfoort',
      time: '14:00',
      type: 'repair',
      status: 'pending',
      technicianId: 'tech-4',
      duration: 60,
      priority: 'urgent'
    }
  ];

  const timelineEvents: TimelineEvent[] = [
    {
      id: 'event-1',
      time: '13:25',
      type: 'visit_completed',
      title: 'Bezoek voltooid',
      description: 'Laadpaal installatie succesvol afgerond bij Peter de Vries',
      technicianName: 'Erik van Dam',
      orderNumber: 'CHC-2024-003',
      severity: 'success'
    },
    {
      id: 'event-2',
      time: '12:45',
      type: 'technician_arrived',
      title: 'Monteur gearriveerd',
      description: 'Jan Petersma is gearriveerd bij Henk van der Berg',
      technicianName: 'Jan Petersma',
      orderNumber: 'CHC-2024-001',
      severity: 'info'
    },
    {
      id: 'event-3',
      time: '11:30',
      type: 'delay_reported',
      title: 'Vertraging gemeld',
      description: 'Team Beta meldt 30 minuten vertraging door verkeer',
      technicianName: 'Marie Jansen',
      severity: 'warning'
    },
    {
      id: 'event-4',
      time: '10:15',
      type: 'visit_started',
      title: 'Bezoek gestart',
      description: 'Onderhoud gestart bij lokatie Kerkstraat 45',
      technicianName: 'Marie Jansen',
      orderNumber: 'CHC-2024-002',
      severity: 'info'
    },
    {
      id: 'event-5',
      time: '09:45',
      type: 'issue_reported',
      title: 'Probleem gemeld',
      description: 'Oude meterkast vereist extra werkzaamheden',
      technicianName: 'Jan Petersma',
      orderNumber: 'CHC-2024-001',
      severity: 'warning'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'break': return 'warning';
      case 'transit': return 'primary';
      case 'offline': return 'default';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actief';
      case 'break': return 'Pauze';
      case 'transit': return 'Onderweg';
      case 'offline': return 'Offline';
      default: return 'Onbekend';
    }
  };

  const getVisitStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'pending': return 'default';
      case 'cancelled': return 'danger';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'installation': return <WrenchScrewdriverIcon className="h-4 w-4" />;
      case 'maintenance': return <CogIcon className="h-4 w-4" />;
      case 'repair': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'inspection': return <CheckCircleIcon className="h-4 w-4" />;
      default: return <WrenchScrewdriverIcon className="h-4 w-4" />;
    }
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'visit_completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'visit_started': return <ClockIcon className="h-4 w-4" />;
      case 'technician_arrived': return <MapPinIcon className="h-4 w-4" />;
      case 'issue_reported': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'delay_reported': return <ClockIcon className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'danger';
      case 'info': return 'primary';
      default: return 'default';
    }
  };

  const completedVisits = visits.filter(v => v.status === 'completed');
  const pendingVisits = visits.filter(v => v.status === 'pending' || v.status === 'in_progress');
  const completionRate = (completedVisits.length / visits.length) * 100;

  return (
    <>
      <Head>
        <title>Today - ChargeCars Portal</title>
        <meta name="description" content="Real-time overzicht van monteurs en bezoeken vandaag" />
      </Head>

      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Today Dashboard</h1>
              <p className="text-foreground-600">
                Live overzicht van monteurs en activiteiten - {currentTime.toLocaleDateString('nl-NL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground-500">Laatste update</p>
              <p className="text-lg font-semibold">{currentTime.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-500">Actieve Monteurs</p>
                  <p className="text-2xl font-bold text-success">{technicians.filter(t => t.status === 'active').length}</p>
                </div>
                <UserIcon className="h-8 w-8 text-success" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-500">Voltooid Vandaag</p>
                  <p className="text-2xl font-bold text-primary">{completedVisits.length}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-primary" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-500">Nog Te Doen</p>
                  <p className="text-2xl font-bold text-warning">{pendingVisits.length}</p>
                </div>
                <ClockIcon className="h-8 w-8 text-warning" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-500">Voortgang</p>
                  <p className="text-2xl font-bold text-foreground">{Math.round(completionRate)}%</p>
                </div>
                <div className="w-8 h-8 flex items-center justify-center">
                  <Progress 
                    value={completionRate} 
                    color="success" 
                    className="w-8"
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left: Map and Technicians */}
            <div className="xl:col-span-3 space-y-6">
              {/* Map View */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <MapIcon className="h-5 w-5" />
                    Live Monteur Locaties
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="h-[400px] bg-content2 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground-500">Live Kaart</h3>
                      <p className="text-foreground-400">Google Maps integratie met real-time monteur tracking</p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Technician Status */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Monteur Status</h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {technicians.map(tech => (
                      <div 
                        key={tech.id}
                        className={`p-4 border border-divider rounded-lg cursor-pointer transition-all ${
                          selectedTechnician === tech.id ? 'border-primary bg-primary/5' : 'hover:bg-content2/50'
                        }`}
                        onClick={() => setSelectedTechnician(tech.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={tech.name} size="sm" />
                            <div>
                              <p className="font-medium">{tech.name}</p>
                              <p className="text-xs text-foreground-500">{tech.team}</p>
                            </div>
                          </div>
                          <Chip 
                            size="sm" 
                            color={getStatusColor(tech.status)} 
                            variant="flat"
                          >
                            {getStatusLabel(tech.status)}
                          </Chip>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 text-foreground-400" />
                            <span className="text-foreground-600">{tech.currentLocation.address}</span>
                          </div>

                          {tech.currentTask && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <WrenchScrewdriverIcon className="h-4 w-4 text-foreground-400" />
                                <span className="text-foreground-600">{tech.currentTask}</span>
                              </div>
                              {tech.taskProgress && (
                                <div className="flex items-center gap-2">
                                  <Progress 
                                    value={tech.taskProgress} 
                                    color="primary" 
                                    className="flex-1"
                                    size="sm"
                                  />
                                  <span className="text-xs text-foreground-500">{tech.taskProgress}%</span>
                                </div>
                              )}
                              {tech.estimatedCompletion && (
                                <div className="flex items-center gap-2">
                                  <ClockIcon className="h-4 w-4 text-foreground-400" />
                                  <span className="text-foreground-600">Klaar om {tech.estimatedCompletion}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Visits Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Completed Visits */}
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-success flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5" />
                      Voltooid ({completedVisits.length})
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {completedVisits.map(visit => (
                        <div key={visit.id} className="p-3 bg-success/10 border border-success/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{visit.customer}</span>
                            <Chip size="sm" color="success" variant="flat">
                              {visit.time}
                            </Chip>
                          </div>
                          <p className="text-xs text-foreground-600 mb-1">{visit.address}, {visit.city}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {getTypeIcon(visit.type)}
                              <span className="text-xs">{visit.orderNumber}</span>
                            </div>
                            <span className="text-xs text-foreground-500">{visit.duration}min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>

                {/* Pending Visits */}
                <Card>
                  <CardHeader>
                    <h3 className="text-base font-semibold text-warning flex items-center gap-2">
                      <ClockIcon className="h-5 w-5" />
                      Te Doen ({pendingVisits.length})
                    </h3>
                  </CardHeader>
                  <CardBody>
                    <div className="space-y-3">
                      {pendingVisits.map(visit => (
                        <div key={visit.id} className="p-3 bg-content2/50 border border-divider rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{visit.customer}</span>
                            <div className="flex items-center gap-2">
                              <Chip 
                                size="sm" 
                                color={getPriorityColor(visit.priority)} 
                                variant="dot"
                              >
                                {visit.priority}
                              </Chip>
                              <Chip 
                                size="sm" 
                                color={getVisitStatusColor(visit.status)} 
                                variant="flat"
                              >
                                {visit.time}
                              </Chip>
                            </div>
                          </div>
                          <p className="text-xs text-foreground-600 mb-1">{visit.address}, {visit.city}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {getTypeIcon(visit.type)}
                              <span className="text-xs">{visit.orderNumber}</span>
                            </div>
                            <span className="text-xs text-foreground-500">{visit.duration}min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>

            {/* Right: Timeline */}
            <div className="xl:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Tijdlijn Vandaag
                  </h3>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    {timelineEvents.map((event, index) => (
                      <div key={event.id} className="relative">
                        {index < timelineEvents.length - 1 && (
                          <div className="absolute left-4 top-8 bottom-0 w-px bg-divider"></div>
                        )}
                        
                        <div className="flex gap-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-content1 ${
                            event.severity === 'success' ? 'border-success text-success' :
                            event.severity === 'warning' ? 'border-warning text-warning' :
                            event.severity === 'error' ? 'border-danger text-danger' :
                            'border-primary text-primary'
                          }`}>
                            {getTimelineIcon(event.type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-sm">{event.title}</h4>
                              <span className="text-xs text-foreground-500 flex-shrink-0 ml-2">{event.time}</span>
                            </div>
                            
                            <p className="text-xs text-foreground-600 mt-1">{event.description}</p>
                            
                            {(event.technicianName || event.orderNumber) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {event.technicianName && (
                                  <Chip size="sm" variant="flat" color="secondary" className="text-xs">
                                    {event.technicianName}
                                  </Chip>
                                )}
                                {event.orderNumber && (
                                  <Chip size="sm" variant="flat" color="primary" className="text-xs">
                                    {event.orderNumber}
                                  </Chip>
                                )}
                              </div>
                            )}
                          </div>
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
} 