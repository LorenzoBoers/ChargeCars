import React from 'react';
import Head from 'next/head';
import { useAuth } from '../contexts/AuthContext';
import { useProtectedRoute } from '../hooks/useProtectedRoute';
import { AppLayout } from '../components/layouts/AppLayout';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Progress
} from "@nextui-org/react";
import {
  BoltIcon,
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isReady } = useProtectedRoute();

  // Show loading state while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            <BoltIcon className="h-7 w-7 text-white animate-pulse" />
          </div>
          <p className="text-foreground-500">Loading...</p>
        </div>
      </div>
    );
  }

  const userName = user?.contact ? `${user.contact.first_name} ${user.contact.last_name}` : 'Gebruiker';

  return (
    <>
      <Head>
        <title>Dashboard - ChargeCars Portal</title>
        <meta name="description" content="ChargeCars order management dashboard" />
      </Head>

      <AppLayout>
        <div className="p-6 space-y-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welkom terug, {userName}! 👋
            </h1>
            <p className="text-foreground-600 text-lg">
              Hier is een overzicht van je ChargeCars portal
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-divider">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-600 font-medium">Orders Vandaag</p>
                    <p className="text-3xl font-bold text-foreground mt-1">12</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                      <span className="text-success text-sm font-medium">+8%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <CalendarIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-600 font-medium">Actieve Orders</p>
                    <p className="text-3xl font-bold text-foreground mt-1">24</p>
                    <div className="flex items-center mt-2">
                      <span className="text-foreground-500 text-sm">In behandeling</span>
                    </div>
                  </div>
                  <div className="p-3 bg-warning/10 rounded-xl">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-warning" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-600 font-medium">Omzet Deze Maand</p>
                    <p className="text-3xl font-bold text-foreground mt-1">€45.2K</p>
                    <div className="flex items-center mt-2">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                      <span className="text-success text-sm font-medium">+12%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-success/10 rounded-xl">
                    <CurrencyEuroIcon className="h-8 w-8 text-success" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground-600 font-medium">Voltooide Orders</p>
                    <p className="text-3xl font-bold text-foreground mt-1">156</p>
                    <div className="flex items-center mt-2">
                      <CheckCircleIcon className="h-4 w-4 text-success mr-1" />
                      <span className="text-foreground-500 text-sm">Deze maand</span>
                    </div>
                  </div>
                  <div className="p-3 bg-secondary/10 rounded-xl">
                    <ChartBarIcon className="h-8 w-8 text-secondary" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border border-divider">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold text-foreground">Quick Actions</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button 
                  className="w-full justify-start h-12" 
                  color="primary" 
                  variant="flat"
                  startContent={<ClipboardDocumentListIcon className="h-5 w-5" />}
                >
                  Nieuwe Order Aanmaken
                </Button>
                <Button 
                  className="w-full justify-start h-12" 
                  color="secondary" 
                  variant="flat"
                  startContent={<UserIcon className="h-5 w-5" />}
                >
                  Klant Toevoegen
                </Button>
                <Button 
                  className="w-full justify-start h-12" 
                  color="success" 
                  variant="flat"
                  startContent={<CalendarIcon className="h-5 w-5" />}
                >
                  Installatie Plannen
                </Button>
                <Button 
                  className="w-full justify-start h-12" 
                  variant="bordered"
                  startContent={<ChartBarIcon className="h-5 w-5" />}
                >
                  Rapportages Bekijken
                </Button>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold text-foreground">Systeem Status</h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">API Beschikbaarheid</span>
                    <Chip size="sm" color="success" variant="flat">99.8%</Chip>
                  </div>
                  <Progress value={99.8} color="success" className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Database Performance</span>
                    <Chip size="sm" color="primary" variant="flat">95.2%</Chip>
                  </div>
                  <Progress value={95.2} color="primary" className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground">Sync Status</span>
                    <Chip size="sm" color="warning" variant="flat">89.1%</Chip>
                  </div>
                  <Progress value={89.1} color="warning" className="h-2" />
                </div>

                <div className="pt-2 border-t border-divider">
                  <p className="text-xs text-foreground-500">
                    Laatste update: {new Date().toLocaleTimeString('nl-NL')}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Account Info */}
          <Card className="border border-divider">
            <CardHeader className="pb-3">
              <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="h-6 w-6" />
                Account Informatie
              </h3>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground-500 font-medium">Naam</p>
                    <p className="text-foreground">{userName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500 font-medium">Email</p>
                    <p className="text-foreground">{user?.email || 'Niet beschikbaar'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground-500 font-medium">Organisatie</p>
                    <p className="text-foreground">{user?.organization?.name || 'Niet beschikbaar'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500 font-medium">Account Status</p>
                    <Chip color="success" variant="flat" size="sm">Actief</Chip>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-foreground-500 font-medium">Laatste Login</p>
                    <p className="text-foreground">Vandaag, {new Date().toLocaleTimeString('nl-NL')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-foreground-500 font-medium">Sessie</p>
                    <Chip color="primary" variant="flat" size="sm">Actief</Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    </>
  );
};

export default Dashboard; 