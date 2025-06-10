import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Button,
  Tabs,
  Tab,
  Chip,
  Avatar,
  Divider,
  Switch,
  Select,
  SelectItem
} from '@nextui-org/react';
import {
  CalendarIcon,
  MapIcon,
  UsersIcon,
  ClockIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { AppLayout } from '../components/layouts/AppLayout';

// Types for planning data
interface Team {
  id: string;
  name: string;
  members: string[];
  status: 'available' | 'busy' | 'break';
  currentLocation?: string;
  skills: string[];
}

interface Task {
  id: string;
  title: string;
  customer: string;
  address: string;
  estimatedDuration: number; // in minutes
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: 'installation' | 'maintenance' | 'repair' | 'consultation';
  requirements: string[];
}

interface RouteItem {
  id: string;
  teamId: string;
  taskId: string;
  scheduledTime: string;
  estimatedArrival: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
}

export default function PlanningPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('route-planner');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'teams' | 'visits'>('teams');
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Mock data
  const teams: Team[] = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      members: ['Jan Petersma', 'Piet de Vries'],
      status: 'available',
      currentLocation: 'Amsterdam Noord',
      skills: ['Laadpaal installatie', 'Meterkast', 'Elektriek']
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      members: ['Marie Jansen', 'Erik van Dam'],
      status: 'busy',
      currentLocation: 'Haarlem',
      skills: ['Laadpaal onderhoud', 'Diagnose', 'Reparatie']
    },
    {
      id: 'team-3',
      name: 'Team Gamma',
      members: ['Lisa Wong'],
      status: 'break',
      currentLocation: 'Utrecht',
      skills: ['Advies', 'Inspectie', 'Metingen']
    }
  ];

  const availableTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Laadpaal installatie',
      customer: 'Henk van der Berg',
      address: 'Hoofdstraat 123, Amsterdam',
      estimatedDuration: 180,
      priority: 'high',
      type: 'installation',
      requirements: ['Laadpaal installatie', 'Meterkast']
    },
    {
      id: 'task-2',
      title: 'Onderhoud laadpunt',
      customer: 'Marie Jansen',
      address: 'Kerkstraat 45, Haarlem',
      estimatedDuration: 90,
      priority: 'medium',
      type: 'maintenance',
      requirements: ['Laadpaal onderhoud']
    },
    {
      id: 'task-3',
      title: 'Storing oplossen',
      customer: 'Peter de Vries',
      address: 'Nieuwstraat 67, Utrecht',
      estimatedDuration: 120,
      priority: 'urgent',
      type: 'repair',
      requirements: ['Diagnose', 'Reparatie']
    }
  ];

  const routeItems: RouteItem[] = [
    {
      id: 'route-1',
      teamId: 'team-1',
      taskId: 'task-1',
      scheduledTime: '09:00',
      estimatedArrival: '09:15',
      status: 'scheduled'
    },
    {
      id: 'route-2',
      teamId: 'team-2',
      taskId: 'task-2',
      scheduledTime: '10:30',
      estimatedArrival: '10:45',
      status: 'in_progress'
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'success';
      case 'busy': return 'warning';
      case 'break': return 'default';
      default: return 'default';
    }
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-content1 border-b border-divider p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Planning & Route Beheer</h1>
              <p className="text-foreground-600 mt-1">
                Beheer teams, routes en planning
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Tabs 
            selectedKey={activeTab} 
            onSelectionChange={(key) => setActiveTab(key as string)}
            color="primary"
            variant="underlined"
            className="mb-6"
          >
            <Tab
              key="agenda"
              title={
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Agenda
                </div>
              }
            >
              <Card>
                <CardBody className="p-8 text-center">
                  <CalendarIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground-500">Agenda View</h3>
                  <p className="text-foreground-400">Agenda functionaliteit komt binnenkort beschikbaar</p>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="route-planner"
              title={
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  Route Planner
                </div>
              }
            >
              {/* Route Planner Content */}
              <div className="space-y-6">
                {/* Date Navigation */}
                <Card>
                  <CardBody className="p-4">
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={<ChevronLeftIcon className="h-4 w-4" />}
                        onPress={() => changeDate('prev')}
                      >
                        Vorige dag
                      </Button>
                      
                      <div className="text-center">
                        <h2 className="text-lg font-semibold">{formatDate(selectedDate)}</h2>
                        <p className="text-sm text-foreground-600">
                          {selectedDate.toLocaleDateString() === new Date().toLocaleDateString() ? 'Vandaag' : ''}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        variant="flat"
                        endContent={<ChevronRightIcon className="h-4 w-4" />}
                        onPress={() => changeDate('next')}
                      >
                        Volgende dag
                      </Button>
                    </div>
                  </CardBody>
                </Card>

                <div className="grid grid-cols-12 gap-6">
                  {/* Map and Teams Section */}
                  <div className="col-span-9 space-y-6">
                    {/* Map Placeholder */}
                    <Card>
                      <CardBody className="p-0">
                        <div className="h-80 bg-content2 rounded-lg flex items-center justify-center">
                          <div className="text-center">
                            <MapIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-foreground-500">Kaart Weergave</h3>
                            <p className="text-foreground-400">Google Maps integratie wordt binnenkort toegevoegd</p>
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Team Swimlanes */}
                    <Card>
                      <CardBody className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Team Routes</h3>
                        <div className="space-y-4">
                          {teams.map(team => (
                            <div key={team.id} className="border border-divider rounded-lg p-4">
                              <div className="flex items-start gap-4">
                                {/* Team Info - Left Side */}
                                <div className="flex items-center gap-3 min-w-0 w-64 flex-shrink-0">
                                  <div className="flex -space-x-2">
                                    {team.members.map((member, index) => (
                                      <Avatar
                                        key={index}
                                        name={member}
                                        size="sm"
                                        className="border-2 border-background"
                                      />
                                    ))}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-semibold text-sm">{team.name}</h4>
                                    <p className="text-xs text-foreground-500 truncate">{team.currentLocation}</p>
                                  </div>
                                  <Chip
                                    size="sm"
                                    color={getStatusColor(team.status)}
                                    variant="flat"
                                  >
                                    {team.status === 'available' ? 'Beschikbaar' :
                                     team.status === 'busy' ? 'Bezet' : 'Pauze'}
                                  </Chip>
                                </div>
                                
                                {/* Route Items - Right Side */}
                                <div className="flex-1 flex gap-3 overflow-x-auto pb-2">
                                  {routeItems
                                    .filter(route => route.teamId === team.id)
                                    .map(route => {
                                      const task = availableTasks.find(t => t.id === route.taskId);
                                      if (!task) return null;
                                      
                                      const isHovered = hoveredTask === route.id;
                                      const isSelected = selectedTask === route.id;
                                      
                                      return (
                                        <div 
                                          key={route.id} 
                                          className={`bg-content1 border border-divider rounded-lg p-3 min-w-44 max-w-44 flex-shrink-0 cursor-pointer transition-all duration-200 ${
                                            isHovered || isSelected ? 'border-primary shadow-lg scale-105' : 'hover:border-primary/50'
                                          }`}
                                          style={{ height: '120px' }}
                                          onMouseEnter={() => setHoveredTask(route.id)}
                                          onMouseLeave={() => setHoveredTask(null)}
                                          onClick={() => setSelectedTask(selectedTask === route.id ? null : route.id)}
                                        >
                                          <div className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-2">
                                              <span className="text-sm font-medium">{route.scheduledTime}</span>
                                              <Chip size="sm" color={getPriorityColor(task.priority)} variant="dot">
                                                {task.priority === 'urgent' ? '!' : 
                                                 task.priority === 'high' ? 'H' :
                                                 task.priority === 'medium' ? 'M' : 'L'}
                                              </Chip>
                                            </div>
                                            
                                            <div className="flex-1 space-y-1">
                                              <h5 className="font-semibold text-sm leading-tight">{task.title}</h5>
                                              <p className="text-xs text-foreground-600 leading-tight">{task.customer}</p>
                                              
                                              {(isHovered || isSelected) && (
                                                <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                                                  <p className="text-xs text-foreground-500 leading-tight">{task.address}</p>
                                                  <div className="flex items-center gap-1">
                                                    <ClockIcon className="h-3 w-3 text-foreground-400 flex-shrink-0" />
                                                    <span className="text-xs text-foreground-500">
                                                      {Math.floor(task.estimatedDuration / 60)}h {task.estimatedDuration % 60}m
                                                    </span>
                                                  </div>
                                                  <div className="flex flex-wrap gap-1">
                                                    {task.requirements.slice(0, 2).map((req, index) => (
                                                      <Chip key={index} size="sm" variant="flat" color="secondary" className="text-xs">
                                                        {req}
                                                      </Chip>
                                                    ))}
                                                  </div>
                                                </div>
                                              )}
                                              
                                              {!isHovered && !isSelected && (
                                                <div className="flex items-center gap-1 pt-1">
                                                  <ClockIcon className="h-3 w-3 text-foreground-400 flex-shrink-0" />
                                                  <span className="text-xs text-foreground-500">
                                                    {Math.floor(task.estimatedDuration / 60)}h {task.estimatedDuration % 60}m
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  
                                  {/* Add Task Button */}
                                  <Button
                                    variant="bordered"
                                    className="min-w-36 max-w-36 flex-shrink-0"
                                    style={{ height: '120px' }}
                                    size="sm"
                                  >
                                    <div className="flex flex-col items-center gap-2">
                                      <span className="text-2xl">+</span>
                                      <span className="text-xs">Taak</span>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Right Sidebar - Teams and Planned Visits */}
                  <div className="col-span-3 space-y-6">
                    {/* View Toggle */}
                    <Card>
                      <CardBody className="p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">Weergave:</span>
                          <Switch
                            size="sm"
                            isSelected={viewMode === 'visits'}
                            onValueChange={(checked) => setViewMode(checked ? 'visits' : 'teams')}
                          >
                            {viewMode === 'teams' ? 'Teams' : 'Bezoeken'}
                          </Switch>
                        </div>
                      </CardBody>
                    </Card>

                    {viewMode === 'teams' ? (
                      <Card>
                        <CardBody className="p-4">
                          <h3 className="text-base font-semibold mb-3">Teams</h3>
                          <div className="space-y-2">
                            {teams.map(team => (
                              <div key={team.id} className="border border-divider rounded-lg p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-medium text-sm">{team.name}</h4>
                                  <Chip
                                    size="sm"
                                    color={getStatusColor(team.status)}
                                    variant="flat"
                                  >
                                    {team.status === 'available' ? 'Beschikbaar' :
                                     team.status === 'busy' ? 'Bezet' : 'Pauze'}
                                  </Chip>
                                </div>
                                <div className="text-xs text-foreground-600 mb-1">
                                  {team.members.join(', ')}
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {team.skills.slice(0, 2).map(skill => (
                                    <Chip key={skill} size="sm" variant="flat" color="secondary" className="text-xs">
                                      {skill}
                                    </Chip>
                                  ))}
                                  {team.skills.length > 2 && (
                                    <Chip size="sm" variant="flat" color="default" className="text-xs">
                                      +{team.skills.length - 2}
                                    </Chip>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <Card>
                        <CardBody className="p-4">
                          <h3 className="text-base font-semibold mb-3">Geplande Bezoeken</h3>
                          <div className="space-y-2">
                            {/* Today's scheduled visits */}
                            {routeItems.map(route => {
                              const task = availableTasks.find(t => t.id === route.taskId);
                              const team = teams.find(t => t.id === route.teamId);
                              if (!task || !team) return null;
                              
                              return (
                                <div key={route.id} className="border border-divider rounded-lg p-2">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium">{route.scheduledTime}</span>
                                    <Chip
                                      size="sm"
                                      color={getPriorityColor(task.priority)}
                                      variant="dot"
                                    >
                                      {task.priority}
                                    </Chip>
                                  </div>
                                  <h4 className="font-medium text-xs mb-1">{task.title}</h4>
                                  <p className="text-xs text-foreground-600 mb-1">{task.customer}</p>
                                  <p className="text-xs text-foreground-500 mb-1 truncate">{task.address}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <ClockIcon className="h-3 w-3 text-foreground-400" />
                                      <span className="text-xs text-foreground-500">
                                        {Math.floor(task.estimatedDuration / 60)}h {task.estimatedDuration % 60}m
                                      </span>
                                    </div>
                                    <Chip size="sm" variant="flat" color="primary" className="text-xs">
                                      {team.name}
                                    </Chip>
                                  </div>
                                </div>
                              );
                            })}
                            
                            {routeItems.length === 0 && (
                              <div className="text-center py-4">
                                <p className="text-sm text-foreground-500">Geen bezoeken gepland</p>
                              </div>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </Tab>

            <Tab
              key="capacity"
              title={
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Capaciteit
                </div>
              }
            >
              <Card>
                <CardBody className="p-8 text-center">
                  <ClockIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground-500">Capaciteit Beheer</h3>
                  <p className="text-foreground-400">Capaciteit planning komt binnenkort beschikbaar</p>
                </CardBody>
              </Card>
            </Tab>

            <Tab
              key="teams"
              title={
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Teams
                </div>
              }
            >
              <Card>
                <CardBody className="p-8 text-center">
                  <UsersIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground-500">Team Beheer</h3>
                  <p className="text-foreground-400">Team beheer functionaliteit komt binnenkort beschikbaar</p>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
} 