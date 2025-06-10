import React, { useState, useEffect } from 'react';
import {
  Button,
  Badge,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Chip,
  Tooltip,
  Avatar
} from '@nextui-org/react';
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  WifiIcon,
  ServerIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [fsnEnabled, setFsnEnabled] = useState(true);
  const [userStatus, setUserStatus] = useState<'available' | 'busy' | 'away'>('available');

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock field service notifications
  const fieldServiceNotifications = [
    { id: 1, message: "Team 3 loopt uit", type: 'warning', time: '5 min' },
    { id: 2, message: "Team 1 heeft hulp nodig", type: 'danger', time: '12 min' }
  ];

  const getUserStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'busy':
        return 'danger';
      case 'away':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getUserStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Beschikbaar';
      case 'busy':
        return 'Bezet';
      case 'away':
        return 'Afwezig';
      default:
        return 'Status';
    }
  };

  const mockNotifications = [
    { id: 1, title: 'Nieuwe order ontvangen', time: '2 min geleden', type: 'info' },
    { id: 2, title: 'Installatie voltooid', time: '1 uur geleden', type: 'success' },
    { id: 3, title: 'Factuur gegenereerd', time: '3 uur geleden', type: 'warning' }
  ];

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="w-full">
        {/* Field Service Notifications Bar */}
        {fieldServiceNotifications.length > 0 && (
          <div className="bg-warning/10 border-b border-warning/20 px-6 py-2">
            <div className="flex items-center gap-4 overflow-x-auto">
              {fieldServiceNotifications.map((notification) => (
                <div key={notification.id} className="flex items-center gap-2 text-sm whitespace-nowrap">
                  {notification.type === 'warning' ? (
                    <ClockIcon className="h-4 w-4 text-warning" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 text-danger" />
                  )}
                  <span className="text-foreground-700">{notification.message}</span>
                  <Chip size="sm" variant="flat" color={notification.type as any} className="text-xs">
                    {notification.time}
                  </Chip>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Top Bar */}
        <div className={`h-12 bg-content1 border-b border-divider flex items-center justify-end px-6 gap-4 w-full ${className}`}>
          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            {/* FSN Toggle */}
            <Tooltip content={fsnEnabled ? "Field Service Notifications aan" : "Field Service Notifications uit"}>
              <div className="flex items-center gap-2">
                <WifiIcon className="h-4 w-4 text-foreground-600" />
                <Chip
                  size="sm"
                  color={fsnEnabled ? 'success' : 'default'}
                  variant="dot"
                  className="text-xs"
                >
                  FSN
                </Chip>
              </div>
            </Tooltip>

            {/* User Status */}
            <Tooltip content={getUserStatusText(userStatus)}>
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-foreground-600" />
                <Chip
                  size="sm"
                  color={getUserStatusColor(userStatus)}
                  variant="dot"
                  className="text-xs"
                >
                  {getUserStatusText(userStatus)}
                </Chip>
              </div>
            </Tooltip>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-divider" />

          {/* Placeholder for theme toggle */}
          <div className="w-8 h-6" />

          {/* Notifications */}
          <div className="w-8 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Field Service Notifications Bar */}
      {fieldServiceNotifications.length > 0 && (
        <div className="bg-warning/10 border-b border-warning/20 px-6 py-2">
          <div className="flex items-center gap-4 overflow-x-auto">
            {fieldServiceNotifications.map((notification) => (
              <div key={notification.id} className="flex items-center gap-2 text-sm whitespace-nowrap">
                {notification.type === 'warning' ? (
                  <ClockIcon className="h-4 w-4 text-warning" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4 text-danger" />
                )}
                <span className="text-foreground-700">{notification.message}</span>
                <Chip size="sm" variant="flat" color={notification.type as any} className="text-xs">
                  {notification.time}
                </Chip>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Top Bar */}
      <div className={`h-12 bg-content1 border-b border-divider flex items-center justify-end px-6 gap-4 w-full ${className}`}>
        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* FSN Toggle */}
          <Tooltip content={fsnEnabled ? "Field Service Notifications aan" : "Field Service Notifications uit"}>
            <Button
              size="sm"
              variant="light"
              onPress={() => setFsnEnabled(!fsnEnabled)}
              className="flex items-center gap-2 px-2"
            >
              <WifiIcon className="h-4 w-4 text-foreground-600" />
              <Chip
                size="sm"
                color={fsnEnabled ? 'success' : 'default'}
                variant="dot"
                className="text-xs"
              >
                FSN
              </Chip>
            </Button>
          </Tooltip>

          {/* User Status */}
          <Dropdown>
            <DropdownTrigger>
              <Button
                size="sm"
                variant="light"
                className="flex items-center gap-2 px-2"
              >
                <UserIcon className="h-4 w-4 text-foreground-600" />
                <Chip
                  size="sm"
                  color={getUserStatusColor(userStatus)}
                  variant="dot"
                  className="text-xs"
                >
                  {getUserStatusText(userStatus)}
                </Chip>
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Status wijzigen"
              onAction={(key) => setUserStatus(key as any)}
            >
              <DropdownItem key="available" className="text-success">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  Beschikbaar
                </div>
              </DropdownItem>
              <DropdownItem key="busy" className="text-danger">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-danger rounded-full" />
                  Bezet
                </div>
              </DropdownItem>
              <DropdownItem key="away" className="text-warning">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-warning rounded-full" />
                  Afwezig
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-divider" />

        {/* Dark/Light Mode Toggle Button (Converted from Sync) */}
        <Tooltip content={theme === 'dark' ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            isDisabled={!mounted}
          >
            {!mounted ? (
              <div className="w-4 h-4 bg-foreground/20 rounded animate-pulse" />
            ) : theme === 'dark' ? (
              <SunIcon className="h-4 w-4 text-foreground-600" />
            ) : (
              <MoonIcon className="h-4 w-4 text-foreground-600" />
            )}
          </Button>
        </Tooltip>

        {/* Notifications */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="relative"
            >
              <Badge
                content={notificationCount > 0 ? notificationCount : ''}
                color="danger"
                size="sm"
                isInvisible={notificationCount === 0}
                placement="top-right"
              >
                <BellIcon className="h-5 w-5 text-foreground-600" />
              </Badge>
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Notificaties"
            className="w-80"
            variant="flat"
          >
            <DropdownItem 
              key="header" 
              className="h-14 gap-2"
              textValue="Notificaties header"
            >
              <div className="flex justify-between items-center w-full">
                <p className="font-semibold text-foreground">Notificaties</p>
                {notificationCount > 0 && (
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    onPress={() => setNotificationCount(0)}
                    className="text-xs"
                  >
                    Alles markeren als gelezen
                  </Button>
                )}
              </div>
            </DropdownItem>
            
            <DropdownItem
              key="notification-1"
              className="h-auto py-3"
              textValue="Nieuwe order ontvangen"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Nieuwe order ontvangen
                </p>
                <p className="text-xs text-foreground-500">
                  2 min geleden
                </p>
              </div>
            </DropdownItem>
            
            <DropdownItem
              key="notification-2"
              className="h-auto py-3"
              textValue="Installatie voltooid"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Installatie voltooid
                </p>
                <p className="text-xs text-foreground-500">
                  1 uur geleden
                </p>
              </div>
            </DropdownItem>
            
            <DropdownItem
              key="notification-3"
              className="h-auto py-3"
              textValue="Factuur gegenereerd"
            >
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  Factuur gegenereerd
                </p>
                <p className="text-xs text-foreground-500">
                  3 uur geleden
                </p>
              </div>
            </DropdownItem>
            
            <DropdownItem 
              key="view-all" 
              className="text-center"
              textValue="Alle notificaties bekijken"
            >
              <Button
                variant="light"
                color="primary"
                size="sm"
                className="w-full"
              >
                Alle notificaties bekijken
              </Button>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </div>
  );
}; 