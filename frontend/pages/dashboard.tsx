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
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            <BoltIcon className="h-4 w-4 text-white animate-pulse" />
          </div>
          <p className="text-foreground-500 text-sm">Loading...</p>
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
        <div className="p-4 space-y-4">
          {/* Welcome Section */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-foreground mb-2">
              Welkom terug, {userName}!
            </h1>
            <p className="text-foreground-600 text-sm">
              Hier is een overzicht van je ChargeCars portal
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-divider">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground-600 font-medium">Orders Vandaag</p>
                    <p className="text-lg font-bold text-foreground mt-1">12</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-3 w-3 text-success mr-1" />
                      <span className="text-success text-xs font-medium">+8%</span>
                    </div>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground-600 font-medium">Actieve Orders</p>
                    <p className="text-lg font-bold text-foreground mt-1">24</p>
                    <div className="flex items-center mt-1">
                      <span className="text-foreground-500 text-xs">In behandeling</span>
                    </div>
                  </div>
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <ClipboardDocumentListIcon className="h-4 w-4 text-warning" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground-600 font-medium">Omzet Deze Maand</p>
                    <p className="text-lg font-bold text-foreground mt-1">€45.2K</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-3 w-3 text-success mr-1" />
                      <span className="text-success text-xs font-medium">+12%</span>
                    </div>
                  </div>
                  <div className="p-2 bg-success/10 rounded-lg">
                    <CurrencyEuroIcon className="h-4 w-4 text-success" />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-foreground-600 font-medium">Voltooide Orders</p>
                    <p className="text-lg font-bold text-foreground mt-1">156</p>
                    <div className="flex items-center mt-1">
                      <CheckCircleIcon className="h-3 w-3 text-success mr-1" />
                      <span className="text-foreground-500 text-xs">Deze maand</span>
                    </div>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <ChartBarIcon className="h-4 w-4 text-secondary" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border border-divider">
              <CardHeader className="pb-2">
                <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
              </CardHeader>
              <CardBody className="space-y-2 pt-0">
                <Button 
                  className="w-full justify-start h-10 text-sm" 
                  color="primary" 
                  variant="flat"
                  startContent={<ClipboardDocumentListIcon className="h-4 w-4" />}
                >
                  Nieuwe Order Aanmaken
                </Button>
                <Button 
                  className="w-full justify-start h-10 text-sm" 
                  color="secondary" 
                  variant="flat"
                  startContent={<UserIcon className="h-4 w-4" />}
                >
                  Klant Toevoegen
                </Button>
                <Button 
                  className="w-full justify-start h-10 text-sm" 
                  color="success" 
                  variant="flat"
                  startContent={<CalendarIcon className="h-4 w-4" />}
                >
                  Installatie Plannen
                </Button>
                <Button 
                  className="w-full justify-start h-10 text-sm" 
                  variant="bordered"
                  startContent={<ChartBarIcon className="h-4 w-4" />}
                >
                  Rapportages Bekijken
                </Button>
              </CardBody>
            </Card>

            <Card className="border border-divider">
              <CardHeader className="pb-2">
                <h3 className="text-base font-semibold text-foreground">Systeem Status</h3>
              </CardHeader>
              <CardBody className="space-y-3 pt-0">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-foreground">API Beschikbaarheid</span>
                    <Chip size="sm" color="success" variant="flat" className="text-xs h-4">99.8%</Chip>
                  </div>
                  <Progress value={99.8} color="success" className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-foreground">Database Performance</span>
                    <Chip size="sm" color="primary" variant="flat" className="text-xs h-4">95.2%</Chip>
                  </div>
                  <Progress value={95.2} color="primary" className="h-1" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-foreground">Systeem Gezondheid</span>
                    <Chip size="sm" color="success" variant="flat" className="text-xs h-4">Excellent</Chip>
                  </div>
                  <Progress value={98} color="success" className="h-1" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border border-divider">
            <CardHeader className="pb-2">
              <h3 className="text-base font-semibold text-foreground">Recente Activiteit</h3>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-content2/30">
                  <div className="p-1.5 bg-success/10 rounded-lg">
                    <CheckCircleIcon className="h-3 w-3 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Order CHC-2024-001 voltooid</p>
                    <p className="text-xs text-foreground-500">5 minuten geleden</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg bg-content2/30">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <ClipboardDocumentListIcon className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Nieuwe order CHC-2024-024 ontvangen</p>
                    <p className="text-xs text-foreground-500">12 minuten geleden</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg bg-content2/30">
                  <div className="p-1.5 bg-warning/10 rounded-lg">
                    <UserIcon className="h-3 w-3 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium">Klant feedback ontvangen</p>
                    <p className="text-xs text-foreground-500">1 uur geleden</p>
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