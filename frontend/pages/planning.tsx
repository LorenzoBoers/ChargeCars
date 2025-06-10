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
  SelectItem,
  Tooltip,
  Badge
} from '@nextui-org/react';
import {
  CalendarIcon,
  MapIcon,
  UsersIcon,
  ClockIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { AppLayout } from '../components/layouts/AppLayout';

// Types for planning data
interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  status: 'complete' | 'incomplete';
  currentLocation?: string;
  skills: string[];
}

interface TeamMember {
  id: string;
  name: string;
  isAvailable: boolean;
  currentTask?: string;
}

interface Task {
  id: string;
  title: string;
  customer: string;
  address: string;
  city: string;
  estimatedDuration: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  type: 'installation' | 'maintenance' | 'repair' | 'inspection';
  requirements: string[];
  orderNumber?: number;
}

interface RouteItem {
  id: string;
  teamId: string;
  taskId: string;
  scheduledTime: string;
  estimatedArrival: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  orderNumber: number;
}

export default function PlanningPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('route-planner');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'teams' | 'visits'>('teams');
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Mock data - updated team status logic
  const teams: Team[] = [
    {
      id: 'team-1',
      name: 'Team Alpha',
      members: [
        { id: 'jan', name: 'Jan Petersma', isAvailable: true },
        { id: 'piet', name: 'Piet de Vries', isAvailable: true, currentTask: 'task-1' }
      ],
      status: 'complete', // All members available
      currentLocation: 'Amsterdam Noord',
      skills: ['Laadpaal installatie', 'Meterkast', 'Elektriek']
    },
    {
      id: 'team-2',
      name: 'Team Beta',
      members: [
        { id: 'marie', name: 'Marie Jansen', isAvailable: true, currentTask: 'task-2' },
        { id: 'erik', name: 'Erik van Dam', isAvailable: false }
      ],
      status: 'incomplete', // Not all members available
      currentLocation: 'Haarlem',
      skills: ['Laadpaal onderhoud', 'Diagnose', 'Reparatie']
    },
    {
      id: 'team-3',
      name: 'Team Gamma',
      members: [
        { id: 'lisa', name: 'Lisa Wong', isAvailable: false }
      ],
      status: 'incomplete', // Not all members available
      currentLocation: 'Utrecht',
      skills: ['Advies', 'Inspectie', 'Metingen']
    }
  ];

  const availableTasks: Task[] = [
    {
      id: 'task-1',
      title: 'Laadpaal installatie',
      customer: 'Henk van der Berg',
      address: 'Hoofdstraat 123',
      city: 'Amsterdam',
      estimatedDuration: 180,
      priority: 'high',
      type: 'installation',
      requirements: ['Laadpaal installatie', 'Meterkast'],
      orderNumber: 2024001
    },
    {
      id: 'task-2',
      title: 'Onderhoud laadpunt',
      customer: 'Marie Jansen',
      address: 'Kerkstraat 45',
      city: 'Haarlem',
      estimatedDuration: 90,
      priority: 'medium',
      type: 'maintenance',
      requirements: ['Laadpaal onderhoud'],
      orderNumber: 2024002
    },
    {
      id: 'task-3',
      title: 'Storing oplossen',
      customer: 'Peter de Vries',
      address: 'Nieuwstraat 67',
      city: 'Utrecht',
      estimatedDuration: 120,
      priority: 'urgent',
      type: 'repair',
      requirements: ['Diagnose', 'Reparatie'],
      orderNumber: 2024003
    }
  ];

  const routeItems: RouteItem[] = [
    {
      id: 'route-1',
      teamId: 'team-1',
      taskId: 'task-1',
      scheduledTime: '09:00',
      estimatedArrival: '09:15',
      status: 'scheduled',
      orderNumber: 1
    },
    {
      id: 'route-2',
      teamId: 'team-2',
      taskId: 'task-2',
      scheduledTime: '10:30',
      estimatedArrival: '10:45',
      status: 'in_progress',
      orderNumber: 2
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
      case 'complete': return 'success';
      case 'incomplete': return 'warning';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'installation': return 'Installatie';
      case 'maintenance': return 'Onderhoud';
      case 'repair': return 'Reparatie';
      case 'inspection': return 'Inspectie';
      default: return 'Taak';
    }
  };

  const changeDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getAvailableMembers = (team: Team) => {
    return team.members.filter(member => member.isAvailable);
  };

  const isTeamComplete = (team: Team) => {
    return team.members.every(member => member.isAvailable);
  };

  return (
    <AppLayout>
      <div className="h-full flex flex-col bg-background">
        {/* Top Header with Tabs */}
        <div className="p-4 border-b border-divider bg-content1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Planning Dashboard</h1>
          </div>

          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => setActiveTab(key as string)}
            variant="underlined"
            color="primary"
          >
            <Tab
              key="route-planner"
              title={
                <div className="flex items-center gap-2">
                  <MapIcon className="h-4 w-4" />
                  Route Planner
                </div>
              }
            />
            <Tab
              key="agenda"
              title={
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Agenda
                </div>
              }
            />
            <Tab
              key="capacity"
              title={
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4" />
                  Capaciteit
                </div>
              }
            />
            <Tab
              key="teams"
              title={
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4" />
                  Teams
                </div>
              }
            />
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'route-planner' && (
            <div className="h-full">
              <div className="grid grid-cols-12 gap-6 h-full">
                {/* Map and Teams Section */}
                <div className="col-span-9 space-y-6 h-full flex flex-col">
                  {/* Map Placeholder - 500px */}
                  <Card>
                    <CardBody className="p-0">
                      <div className="h-[500px] bg-content2 rounded-lg flex items-center justify-center">
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
                    <CardBody className="p-4">
                      <h3 className="text-base font-semibold mb-3">Team Routes</h3>
                      <div className="space-y-3">
                        {teams.map(team => {
                          const availableMembers = getAvailableMembers(team);
                          const teamStatus = isTeamComplete(team) ? 'complete' : 'incomplete';
                          
                          return (
                            <div key={team.id} className="border border-divider rounded-lg p-3">
                              <div className="flex items-start gap-3">
                                {/* Team Info - Left Side */}
                                <div className="flex items-start gap-2 min-w-0 w-64 flex-shrink-0">
                                  <div className="flex -space-x-1">
                                    {team.members.map((member, index) => (
                                      <Avatar
                                        key={index}
                                        name={member.name}
                                        size="sm"
                                        className={`border-2 border-background ${
                                          member.isAvailable ? '' : 'opacity-50 grayscale'
                                        }`}
                                      />
                                    ))}
                                    <Button
                                      isIconOnly
                                      size="sm"
                                      variant="bordered"
                                      className="rounded-full w-6 h-6 min-w-0"
                                    >
                                      <UserPlusIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-sm">{team.name}</h4>
                                      <Chip
                                        size="sm"
                                        color={getStatusColor(teamStatus)}
                                        variant="flat"
                                      >
                                        {teamStatus === 'complete' ? 'Compleet' : 'Incompleet'}
                                      </Chip>
                                    </div>
                                    <p className="text-xs text-foreground-500">{team.currentLocation}</p>
                                    
                                    {/* Available Members Today */}
                                    <div className="mt-1">
                                      <p className="text-xs font-medium text-foreground-700">Beschikbaar:</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {team.members.map(member => (
                                          <div key={member.id} className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                              member.isAvailable ? 'bg-success' : 'bg-danger'
                                            }`}></div>
                                            <span className="text-xs text-foreground-600">
                                              {member.name.split(' ')[0]}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Route Items - Right Side */}
                                <div className="flex-1 flex gap-2 overflow-x-auto pb-1">
                                  {routeItems
                                    .filter(route => route.teamId === team.id)
                                    .map(route => {
                                      const task = availableTasks.find(t => t.id === route.taskId);
                                      if (!task) return null;
                                      
                                      return (
                                        <div 
                                          key={route.id} 
                                          className="bg-content1 border border-divider rounded-lg p-2 min-w-28 max-w-28 flex-shrink-0 cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md relative"
                                        >
                                          {/* Order Number Badge */}
                                          <Badge 
                                            content={route.orderNumber} 
                                            color="primary" 
                                            className="absolute -top-1 -right-1"
                                            size="sm"
                                          >
                                            <div></div>
                                          </Badge>
                                          
                                          {/* Only Text - Vertical Layout */}
                                          <div className="text-center space-y-1">
                                            <div className="text-sm font-bold text-primary">
                                              {route.scheduledTime}
                                            </div>
                                            <div className="text-xs text-foreground-700">
                                              {getTypeLabel(task.type)}
                                            </div>
                                            <div className="text-xs text-foreground-900">
                                              {task.city}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  
                                  {/* Add Task Button */}
                                  <Button
                                    variant="bordered"
                                    className="min-w-28 max-w-28 h-14 flex-shrink-0"
                                    size="sm"
                                  >
                                    <div className="flex flex-col items-center gap-1">
                                      <PlusIcon className="h-4 w-4" />
                                      <span className="text-xs">Taak</span>
                                    </div>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardBody>
                  </Card>
                </div>

                {/* Right Sidebar - Planned Visits and Teams */}
                <div className="col-span-3 space-y-6">
                  {/* Date Switcher */}
                  {activeTab === 'route-planner' && (
                    <Card>
                      <CardBody className="p-3">
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            onPress={() => changeDate('prev')}
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </Button>
                          <div className="text-sm font-medium">
                            {formatDate(selectedDate)}
                          </div>
                          <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            onPress={() => changeDate('next')}
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardBody>
                    </Card>
                  )}

                  {/* View Toggle */}
                  <Card>
                    <CardBody className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Weergave:</span>
                        <Switch
                          size="sm"
                          isSelected={viewMode === 'teams'}
                          onValueChange={(checked) => setViewMode(checked ? 'teams' : 'visits')}
                        >
                          {viewMode === 'teams' ? 'Teams' : 'Bezoeken'}
                        </Switch>
                      </div>
                    </CardBody>
                  </Card>

                  {viewMode === 'visits' ? (
                    <Card>
                      <CardBody className="p-3">
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
                                <p className="text-xs text-foreground-500 mb-1 truncate">{task.address}, {task.city}</p>
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
                  ) : (
                    <Card>
                      <CardBody className="p-3">
                        <h3 className="text-base font-semibold mb-3">Teams</h3>
                        <div className="space-y-3">
                          {teams.map(team => {
                            const availableMembers = getAvailableMembers(team);
                            const teamStatus = isTeamComplete(team) ? 'complete' : 'incomplete';
                            
                            return (
                              <div key={team.id} className="border border-divider rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-sm">{team.name}</h4>
                                  <Chip
                                    size="sm"
                                    color={getStatusColor(teamStatus)}
                                    variant="flat"
                                  >
                                    {teamStatus === 'complete' ? 'Compleet' : 'Incompleet'}
                                  </Chip>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="text-xs text-foreground-600">
                                    <span className="font-medium">Locatie:</span> {team.currentLocation}
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs font-medium text-foreground-700 mb-1">Team leden:</p>
                                    <div className="space-y-1">
                                      {team.members.map(member => (
                                        <div key={member.id} className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                            member.isAvailable ? 'bg-success' : 'bg-danger'
                                          }`}></div>
                                          <span className={`text-xs ${
                                            member.isAvailable ? 'text-foreground-600' : 'text-foreground-400'
                                          }`}>{member.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs font-medium text-foreground-700 mb-1">Vaardigheden:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {team.skills.slice(0, 2).map((skill, index) => (
                                        <Chip key={index} size="sm" variant="flat" color="secondary" className="text-xs">
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
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <Card>
              <CardBody className="p-8 text-center">
                <CalendarIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground-500">Agenda Weergave</h3>
                <p className="text-foreground-400">Agenda functionaliteit komt binnenkort beschikbaar</p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'capacity' && (
            <Card>
              <CardBody className="p-8 text-center">
                <ClockIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground-500">Capaciteit Beheer</h3>
                <p className="text-foreground-400">Capaciteit planning komt binnenkort beschikbaar</p>
              </CardBody>
            </Card>
          )}

          {activeTab === 'teams' && (
            <Card>
              <CardBody className="p-8 text-center">
                <UsersIcon className="h-16 w-16 text-foreground-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground-500">Team Beheer</h3>
                <p className="text-foreground-400">Team beheer functionaliteit komt binnenkort beschikbaar</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 