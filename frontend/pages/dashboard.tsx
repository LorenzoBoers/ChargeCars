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
  Divider
} from "@nextui-org/react";
import {
  BoltIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyEuroIcon,
  CalendarIcon
} from "@heroicons/react/24/outline";
import OrderManagement from '../components/OrderManagement';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { isReady } = useProtectedRoute();

  // Show loading state while checking auth
  if (!isReady) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            <BoltIcon className="h-7 w-7 text-white animate-pulse" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - ChargeCars Portal</title>
        <meta name="description" content="ChargeCars order management dashboard" />
      </Head>

      <AppLayout>
        <div className="p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Welcome back, {user?.contact?.first_name || user?.email?.split('@')[0] || 'User'}!
            </h2>
            <p className="text-default-500">
              Manage your orders and track installations from your dashboard.
            </p>
          </div>

          {/* User Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="bg-content1 border-divider">
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  User Profile
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-default-500">Name:</span>
                  <span className="text-foreground">
                    {user?.contact?.first_name && user?.contact?.last_name 
                      ? `${user.contact.first_name} ${user.contact.last_name}`
                      : user?.email || 'Not available'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Email:</span>
                  <span className="text-foreground">{user?.email || 'Not available'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">User ID:</span>
                  <span className="text-foreground font-mono text-xs">{user?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Contact ID:</span>
                  <span className="text-foreground font-mono text-xs">{user?.contact?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Role ID:</span>
                  <span className="text-foreground font-mono text-xs">{user?.role_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Organization:</span>
                  <span className="text-foreground">{user?.organization?.name || 'N/A'}</span>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1 border-divider">
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  Account Status
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-default-500">Account Status:</span>
                  <Chip 
                    color="success"
                    variant="flat"
                    size="sm"
                  >
                    Active
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-default-500">Organization Type:</span>
                  <span className="text-foreground capitalize">{user?.organization?.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-default-500">Login Session:</span>
                  <span className="text-foreground text-sm">Active</span>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-content1 border-gray-800">
              <CardHeader>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5" />
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <Button className="w-full" color="primary" variant="flat">
                  View Orders
                </Button>
                <Button className="w-full" color="secondary" variant="flat">
                  Create Quote
                </Button>
                <Button className="w-full" color="success" variant="flat">
                  Schedule Installation
                </Button>
                <Button className="w-full" variant="bordered">
                  View Reports
                </Button>
              </CardBody>
            </Card>
          </div>

          <Divider className="my-8 bg-gray-700" />

          {/* Order Management Component */}
          <OrderManagement />
        </div>
      </AppLayout>
    </>
  );
};

export default Dashboard; 