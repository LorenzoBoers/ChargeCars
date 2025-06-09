import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Card,
  CardBody,
  Button,
  Chip
} from "@nextui-org/react";
import {
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import Logo from '../components/ui/Logo';

const Custom404Page: React.FC = () => {
  const router = useRouter();

  const quickActions = [
    {
      label: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      onClick: () => router.push('/dashboard'),
      color: 'primary' as const
    },
    {
      label: 'Orders',
      icon: <ClipboardDocumentListIcon className="h-5 w-5" />,
      onClick: () => router.push('/orders'),
      color: 'secondary' as const
    },
    {
      label: 'Contacten',
      icon: <UserGroupIcon className="h-5 w-5" />,
      onClick: () => router.push('/contacts'),
      color: 'success' as const
    },
    {
      label: 'Instellingen',
      icon: <CogIcon className="h-5 w-5" />,
      onClick: () => router.push('/settings'),
      color: 'warning' as const
    }
  ];

  return (
    <>
      <Head>
        <title>Pagina Niet Gevonden - ChargeCars Portal</title>
        <meta name="description" content="De pagina die u zoekt kon niet worden gevonden." />
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" />
          </div>

          {/* 404 Illustration */}
          <div className="relative">
            <div className="text-9xl font-bold text-foreground/10 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl">🔌</div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              Pagina Niet Gevonden
            </h1>
            <p className="text-lg text-foreground-600 max-w-md mx-auto">
              Sorry, de pagina die u zoekt bestaat niet of is verplaatst. Het lijkt erop dat u een verkeerde afslag heeft genomen.
            </p>
          </div>

          {/* Current URL Info */}
          <Card className="max-w-lg mx-auto">
            <CardBody>
              <div className="flex items-center gap-3 text-sm">
                <MagnifyingGlassIcon className="h-4 w-4 text-foreground-500" />
                <span className="text-foreground-600">Gezocht naar:</span>
                <Chip size="sm" variant="flat" color="default" className="font-mono text-xs">
                  {typeof window !== 'undefined' ? window.location.pathname : '/unknown'}
                </Chip>
              </div>
            </CardBody>
          </Card>

          {/* Navigation Options */}
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                color="primary"
                size="lg"
                startContent={<ArrowLeftIcon className="h-5 w-5" />}
                onPress={() => router.back()}
              >
                Ga Terug
              </Button>
              <Button
                variant="bordered"
                size="lg"
                startContent={<HomeIcon className="h-5 w-5" />}
                onPress={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
            </div>

            {/* Quick Actions */}
            <div>
              <p className="text-sm text-foreground-600 mb-4">Of ga direct naar:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="flat"
                    color={action.color}
                    startContent={action.icon}
                    onPress={action.onClick}
                    className="h-12"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div className="pt-8 border-t border-divider">
            <p className="text-sm text-foreground-500">
              Hulp nodig? Neem contact op met het support team of probeer opnieuw te zoeken.
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 text-primary/20 text-6xl">⚡</div>
          <div className="absolute bottom-10 right-10 text-success/20 text-6xl">🚗</div>
          <div className="absolute top-1/3 right-20 text-warning/20 text-4xl">🔋</div>
          <div className="absolute bottom-1/3 left-20 text-secondary/20 text-4xl">🏠</div>
        </div>
      </div>
    </>
  );
};

export default Custom404Page; 