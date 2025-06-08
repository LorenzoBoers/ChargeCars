import React from 'react';
import { withAuth, useAuth } from '../hooks/useAuth';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Avatar,
  Divider
} from "@nextui-org/react";
import {
  BoltIcon,
  UserIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon
} from "@heroicons/react/24/outline";
import OrderManagement from '../components/OrderManagement';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-content1 border-b border-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <BoltIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">ChargeCars V2</h1>
              <p className="text-xs text-gray-400">Order Management System</p>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <Card className="bg-content2 border-gray-700">
              <CardBody className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar
                    size="sm"
                    name={(user?.first_name || user?.email || 'User').charAt(0).toUpperCase()}
                    className="bg-primary text-white"
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-white">
                      {user?.first_name && user?.last_name 
                        ? `${user.first_name} ${user.last_name}`
                        : user?.email || 'User'
                      }
                    </p>
                    <p className="text-xs text-gray-400">{user?.email || 'No email available'}</p>
                  </div>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={user?.is_active ? "success" : "danger"}
                  >
                    {user?.is_active ? "Active" : "Inactive"}
                  </Chip>
                </div>
              </CardBody>
            </Card>

            <Button
              variant="ghost"
              size="sm"
              startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
              onPress={logout}
              className="text-gray-400 hover:text-red-400"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'User'}!
          </h2>
          <p className="text-gray-400">
            Manage your orders and track installations from your dashboard.
          </p>
        </div>

        {/* User Info Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-content1 border-gray-800">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                User Profile
              </h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-white">
                  {user?.first_name && user?.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : user?.email || 'Not available'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{user?.email || 'Not available'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">User ID:</span>
                <span className="text-white font-mono text-xs">{user?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contact ID:</span>
                <span className="text-white font-mono text-xs">{user?.contact_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Noloco ID:</span>
                <span className="text-white">{user?.noloco_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contact Type:</span>
                <span className="text-white capitalize">{user?.contact_type || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Access Level:</span>
                <span className="text-white capitalize">{user?.access_level || 'N/A'}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content1 border-gray-800">
            <CardHeader>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <BuildingOfficeIcon className="h-5 w-5" />
                Account Status
              </h3>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Account Status:</span>
                <Chip 
                  color={user?.is_active ? "success" : "danger"}
                  variant="flat"
                  size="sm"
                >
                  {user?.is_active ? "Active" : "Inactive"}
                </Chip>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Email Verified:</span>
                <Chip 
                  color={user?.email_verified ? "success" : "warning"}
                  variant="flat"
                  size="sm"
                >
                  {user?.email_verified ? "Verified" : "Pending"}
                </Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Login:</span>
                <span className="text-white text-sm">
                  {user?.last_login 
                    ? new Date(user.last_login).toLocaleDateString() + ' ' + new Date(user.last_login).toLocaleTimeString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Login Attempts:</span>
                <span className="text-white">{user?.login_attempts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">2FA Enabled:</span>
                <Chip 
                  color={user?.two_factor_enabled ? "success" : "warning"}
                  variant="flat"
                  size="sm"
                >
                  {user?.two_factor_enabled ? "Yes" : "No"}
                </Chip>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Role ID:</span>
                <span className="text-white font-mono text-xs">{user?.role_id}</span>
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
    </div>
  );
};

export default withAuth(Dashboard); 