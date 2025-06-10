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
        {/* Main Top Bar */}
        <div className={`h-12 bg-content1 border-b border-divider flex items-center justify-end px-6 w-full ${className}`}>
          {/* Status Indicators */}
          <div className="flex items-center gap-4">
            {/* FSN Toggle */}
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

            {/* User Status */}
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

            {/* Placeholder for theme toggle and notifications */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-6" />
              <div className="w-8 h-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Main Top Bar */}
      <div className={`h-12 bg-content1 border-b border-divider flex items-center justify-end px-6 w-full ${className}`}>
        {/* Right: Status Indicators */}
        <div className="flex items-center gap-4">
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
          <Tooltip content={getUserStatusText(userStatus)}>
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
                selectedKeys={[userStatus]}
                onSelectionChange={(keys) => {
                  const selectedStatus = Array.from(keys)[0] as string;
                  setUserStatus(selectedStatus as 'available' | 'busy' | 'away');
                }}
              >
                <DropdownItem key="available">Beschikbaar</DropdownItem>
                <DropdownItem key="busy">Bezet</DropdownItem>
                <DropdownItem key="away">Afwezig</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Tooltip>

          {/* Divider */}
          <div className="h-6 w-px bg-divider" />

          {/* Theme Toggle */}
          <Tooltip content={theme === 'dark' ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-4 w-4 text-foreground-600" />
              ) : (
                <MoonIcon className="h-4 w-4 text-foreground-600" />
              )}
            </Button>
          </Tooltip>

          {/* Notifications */}
          <Tooltip content="Notificaties">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <Badge
                    content={notificationCount}
                    color="danger"
                    size="sm"
                    isInvisible={notificationCount === 0}
                  >
                    <BellIcon className="h-4 w-4 text-foreground-600" />
                  </Badge>
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="notification-1" textValue="Nieuwe order ontvangen">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Nieuwe order ontvangen</span>
                    <span className="text-xs text-foreground-500">2 min geleden</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="notification-2" textValue="Installatie voltooid">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Installatie voltooid</span>
                    <span className="text-xs text-foreground-500">1 uur geleden</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="notification-3" textValue="Factuur gegenereerd">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Factuur gegenereerd</span>
                    <span className="text-xs text-foreground-500">3 uur geleden</span>
                  </div>
                </DropdownItem>
                <DropdownItem key="view-all" textValue="Bekijk alle notificaties">
                  <span className="text-primary">Bekijk alle notificaties</span>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}; 