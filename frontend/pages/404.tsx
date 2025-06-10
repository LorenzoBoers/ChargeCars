import React from 'react';
import { Button, Card, CardBody } from '@nextui-org/react';
import { useRouter } from 'next/router';
import { 
  ExclamationTriangleIcon, 
  HomeIcon, 
  ArrowLeftIcon 
} from '@heroicons/react/24/outline';
import Logo from '../components/ui/Logo';

export default function Custom404() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" href="/" />
        </div>

        {/* Error Card */}
        <Card className="mb-8">
          <CardBody className="p-8">
            <div className="mb-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-warning mx-auto mb-4" />
              <h1 className="text-6xl font-bold text-foreground mb-2">404</h1>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Pagina Niet Gevonden
              </h2>
              <p className="text-foreground-600">
                De pagina die je zoekt bestaat niet of is verplaatst.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                color="primary"
                size="lg"
                className="w-full"
                startContent={<HomeIcon className="h-5 w-5" />}
                onPress={() => router.push('/dashboard')}
              >
                Naar Dashboard
              </Button>
              
              <Button
                variant="flat"
                size="lg"
                className="w-full"
                startContent={<ArrowLeftIcon className="h-5 w-5" />}
                onPress={() => router.back()}
              >
                Ga Terug
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-6 pt-6 border-t border-divider">
              <p className="text-sm text-foreground-500">
                Heb je hulp nodig?{' '}
                <Button
                  variant="light"
                  size="sm"
                  color="primary"
                  className="p-0 h-auto min-w-0"
                  onPress={() => router.push('/inbox')}
                >
                  Neem contact op
                </Button>
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Quick Links */}
        <div className="text-sm text-foreground-500">
          <p className="mb-2">Populaire pagina's:</p>
          <div className="flex justify-center gap-4">
            <Button
              variant="light"
              size="sm"
              onPress={() => router.push('/orders')}
            >
              Orders
            </Button>
            <Button
              variant="light"
              size="sm"
              onPress={() => router.push('/planning')}
            >
              Planning
            </Button>
            <Button
              variant="light"
              size="sm"
              onPress={() => router.push('/inbox')}
            >
              Inbox
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 