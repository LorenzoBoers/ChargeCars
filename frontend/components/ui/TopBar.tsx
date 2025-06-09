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
  Tooltip
} from '@nextui-org/react';
import {
  BellIcon,
  SunIcon,
  MoonIcon,
  WifiIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock status data
  const apiStatus = 'online'; // online, offline, slow
  const syncStatus = 'syncing'; // synced, syncing, error

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'synced':
        return 'success';
      case 'syncing':
      case 'slow':
        return 'warning';
      case 'offline':
      case 'error':
        return 'danger';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string, type: 'api' | 'sync') => {
    if (type === 'api') {
      switch (status) {
        case 'online':
          return 'API Online';
        case 'slow':
          return 'API Traag';
        case 'offline':
          return 'API Offline';
        default:
          return 'API Status';
      }
    } else {
      switch (status) {
        case 'synced':
          return 'Gesynchroniseerd';
        case 'syncing':
          return 'Synchroniseren...';
        case 'error':
          return 'Sync Fout';
        default:
          return 'Sync Status';
      }
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
      <div className={`h-12 bg-content1 border-b border-divider flex items-center justify-end px-6 gap-4 w-full ${className}`}>
        {/* Status Indicators */}
        <div className="flex items-center gap-3">
          {/* API Status */}
          <Tooltip content={getStatusText(apiStatus, 'api')}>
            <div className="flex items-center gap-2">
              <WifiIcon className="h-4 w-4 text-foreground-600" />
              <Chip
                size="sm"
                color={getStatusColor(apiStatus)}
                variant="dot"
                className="text-xs"
              >
                API
              </Chip>
            </div>
          </Tooltip>

          {/* Sync Status */}
          <Tooltip content={getStatusText(syncStatus, 'sync')}>
            <div className="flex items-center gap-2">
              <ServerIcon className="h-4 w-4 text-foreground-600" />
              <Chip
                size="sm"
                color={getStatusColor(syncStatus)}
                variant="dot"
                className="text-xs"
              >
                Sync
              </Chip>
            </div>
          </Tooltip>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-divider" />

        {/* Placeholder for theme toggle */}
        <div className="w-8 h-6" />

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
    );
  }

  return (
    <div className={`h-12 bg-content1 border-b border-divider flex items-center justify-end px-6 gap-4 w-full ${className}`}>
      {/* Status Indicators */}
      <div className="flex items-center gap-3">
        {/* API Status */}
        <Tooltip content={getStatusText(apiStatus, 'api')}>
          <div className="flex items-center gap-2">
            <WifiIcon className="h-4 w-4 text-foreground-600" />
            <Chip
              size="sm"
              color={getStatusColor(apiStatus)}
              variant="dot"
              className="text-xs"
            >
              API
            </Chip>
          </div>
        </Tooltip>

        {/* Sync Status */}
        <Tooltip content={getStatusText(syncStatus, 'sync')}>
          <div className="flex items-center gap-2">
            <ServerIcon className="h-4 w-4 text-foreground-600" />
            <Chip
              size="sm"
              color={getStatusColor(syncStatus)}
              variant="dot"
              className="text-xs"
            >
              Sync
            </Chip>
          </div>
        </Tooltip>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-divider" />

      {/* Dark/Light Mode Toggle */}
      <Tooltip content={theme === 'dark' ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}>
        <div className="flex items-center">
          <Switch
            size="sm"
            color="primary"
            isSelected={theme === 'dark'}
            onValueChange={(isSelected) => setTheme(isSelected ? 'dark' : 'light')}
            thumbIcon={({ isSelected }) =>
              isSelected ? (
                <MoonIcon className="h-3 w-3" />
              ) : (
                <SunIcon className="h-3 w-3" />
              )
            }
          />
        </div>
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
  );
}; 