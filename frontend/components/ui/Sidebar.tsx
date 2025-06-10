import React from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardBody,
  Button,
  Divider,
  Avatar,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@nextui-org/react";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  BoltIcon,
  UserIcon,
  InboxIcon,
  MapIcon
} from "@heroicons/react/24/outline";
import Logo from './Logo';
import { useAuth } from '../../contexts/AuthContext';

/**
 * @component Sidebar
 * @description Reusable sidebar navigation for the entire ChargeCars app
 * @example
 * <Sidebar />
 */

interface SidebarProps {
  className?: string;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  badge?: string;
}

export function Sidebar({ className = "" }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      isActive: router.pathname === '/dashboard'
    },
    {
      label: 'Inbox',
      href: '/inbox',
      icon: InboxIcon,
      isActive: router.pathname === '/inbox',
      badge: '17'
    },
    {
      label: 'Planning',
      href: '/planning',
      icon: MapIcon,
      isActive: router.pathname === '/planning'
    },
    {
      label: 'Order Beheer',
      href: '/orders',
      icon: ClipboardDocumentListIcon,
      isActive: router.pathname === '/orders'
    },
    {
      label: 'Klanten',
      href: '/customers',
      icon: UserGroupIcon,
      isActive: router.pathname === '/customers'
    },
    {
      label: 'Rapportages',
      href: '/reports',
      icon: ChartBarIcon,
      isActive: router.pathname === '/reports'
    },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: ChartBarIcon,
      isActive: router.pathname === '/analytics'
    },
    {
      label: 'Instellingen',
      href: '/settings',
      icon: CogIcon,
      isActive: router.pathname === '/settings'
    }
  ];

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  return (
    <Card className={`h-screen w-64 rounded-none border-r border-divider bg-content1 ${className}`}>
      <CardBody className="p-0 flex flex-col h-full">
        {/* Logo Header */}
        <div className="p-4 border-b border-divider flex justify-center">
          <Logo size="xs" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={item.isActive ? "flat" : "light"}
                  color={item.isActive ? "primary" : "default"}
                  className={`w-full justify-start h-11 ${
                    item.isActive 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground-600 hover:text-foreground hover:bg-content2'
                  }`}
                  startContent={
                    <IconComponent className={`h-5 w-5 ${
                      item.isActive ? 'text-primary' : 'text-foreground-500'
                    }`} />
                  }
                  endContent={
                    item.badge && (
                      <Chip size="sm" color="primary" variant="flat">
                        {item.badge}
                      </Chip>
                    )
                  }
                  onPress={() => handleNavigation(item.href)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-divider">
          <Dropdown placement="top-start">
            <DropdownTrigger>
              <Button
                variant="light"
                className="w-full justify-start p-2 h-auto"
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar
                    size="sm"
                    name={user?.contact ? `${user.contact.first_name} ${user.contact.last_name}` : 'User'}
                    className="text-tiny"
                    color="primary"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user?.contact ? `${user.contact.first_name} ${user.contact.last_name}` : 'Gebruiker'}
                    </p>
                    <p className="text-xs text-foreground-500 truncate">
                      {user?.email || 'user@chargecars.nl'}
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu">
              <DropdownItem
                key="profile"
                startContent={<UserIcon className="h-4 w-4" />}
                textValue="Mijn Profiel"
              >
                Mijn Profiel
              </DropdownItem>
              <DropdownItem
                key="settings"
                startContent={<CogIcon className="h-4 w-4" />}
                textValue="Instellingen"
              >
                Instellingen
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
                onPress={handleLogout}
                textValue="Uitloggen"
              >
                Uitloggen
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </CardBody>
    </Card>
  );
} 