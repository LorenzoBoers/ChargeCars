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
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from 'next-themes';
import { useUserProfile } from '../../hooks/useUser';
import { useAuth } from '../../hooks/useAuth';

interface TopBarProps {
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();
  
  // Safely handle auth context - may not be available during SSG
  let logout: (() => void) | null = null;
  try {
    const auth = useAuth();
    logout = auth.logout;
  } catch (error) {
    // AuthProvider not available, fallback to null
    console.log('TopBar: AuthProvider not available during SSG');
  }
  
  // Safely handle user profile - may not be available during SSG
  let userProfileData = {
    displayName: 'Gebruiker',
    initials: 'G',
    profileImageUrl: null as string | null,
    roleLabel: 'Gebruiker',
    email: '',
    hasProfileImage: false,
    isLoading: false
  };
  
  try {
    const userProfile = useUserProfile();
    userProfileData = {
      displayName: userProfile.displayName,
      initials: userProfile.initials,
      profileImageUrl: userProfile.profileImageUrl,
      roleLabel: userProfile.roleLabel,
      email: userProfile.email || '',
      hasProfileImage: userProfile.hasProfileImage,
      isLoading: userProfile.isLoading
    };
  } catch (error) {
    // useUser hook not available during SSG
    console.log('TopBar: useUser hook not available during SSG');
  }
  
  const { 
    displayName, 
    initials, 
    profileImageUrl, 
    roleLabel, 
    email, 
    hasProfileImage, 
    isLoading: userLoading 
  } = userProfileData;
  
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

            {/* Placeholder for theme toggle, notifications, and user */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-6" /> {/* Theme toggle placeholder */}
              <div className="w-8 h-6" /> {/* Notifications placeholder */}
              <div className="h-6 w-px bg-divider" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-content2 animate-pulse" />
                <div className="flex flex-col gap-1">
                  <div className="w-16 h-3 bg-content2 rounded animate-pulse" />
                  <div className="w-12 h-2 bg-content2 rounded animate-pulse" />
                </div>
              </div>
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

          {/* Divider */}
          <div className="h-6 w-px bg-divider" />

          {/* User Profile */}
          <Tooltip content={userLoading ? "Gebruiker laden..." : displayName}>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  size="sm"
                  variant="light"
                  className="flex items-center gap-2 px-2"
                  isLoading={userLoading}
                >
                  <Avatar
                    size="sm"
                    src={hasProfileImage ? profileImageUrl! : undefined}
                    name={initials}
                    className="w-6 h-6 text-tiny"
                    classNames={{
                      base: "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]",
                      name: "text-white font-medium"
                    }}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-medium text-foreground-700">{displayName}</span>
                    <span className="text-xs text-foreground-500">{roleLabel}</span>
                  </div>
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem 
                  key="profile-info" 
                  textValue="Profiel informatie"
                  className="cursor-default"
                  isReadOnly
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{displayName}</span>
                    <span className="text-xs text-foreground-500">{email}</span>
                    <Chip size="sm" color="primary" variant="flat" className="text-xs w-fit">
                      {roleLabel}
                    </Chip>
                  </div>
                </DropdownItem>
                <DropdownItem 
                  key="divider-1" 
                  textValue="divider"
                  className="opacity-0 cursor-default p-0 h-px"
                  isReadOnly
                />
                <DropdownItem 
                  key="profile" 
                  textValue="Profiel"
                  startContent={<UserCircleIcon className="h-4 w-4" />}
                >
                  Profiel
                </DropdownItem>
                <DropdownItem 
                  key="settings" 
                  textValue="Instellingen"
                  startContent={<Cog6ToothIcon className="h-4 w-4" />}
                >
                  Instellingen
                </DropdownItem>
                <DropdownItem 
                  key="logout" 
                  textValue="Uitloggen"
                  color="danger"
                  startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                  onPress={logout ? logout : undefined}
                >
                  Uitloggen
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}; 