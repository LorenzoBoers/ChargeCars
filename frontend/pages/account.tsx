import React from 'react';
import { NextPage } from 'next';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Button, 
  Avatar,
  Divider,
  Spinner,
  Chip
} from '@nextui-org/react';
import { AppLayout } from '../components/layouts/AppLayout';
import { useUserProfile } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

/**
 * @component AccountPage
 * @description User account page showing profile information from the /me endpoint
 */
const AccountPage: NextPage = () => {
  const { 
    user,
    isLoading, 
    error,
    displayName,
    initials,
    profileImageUrl,
    roleLabel,
    email,
    hasProfileImage
  } = useUserProfile();
  
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" color="primary" />
        </div>
      </AppLayout>
    );
  }

  if (error || !user) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-danger">Er is een fout opgetreden bij het laden van uw account.</p>
          <Button color="primary" variant="flat" onPress={() => window.location.reload()}>
            Opnieuw proberen
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Mijn Account</h1>
        
        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader className="flex gap-5">
            <Avatar
              size="lg"
              src={hasProfileImage ? profileImageUrl! : undefined}
              name={initials}
              className="text-large"
              classNames={{
                base: "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]",
                name: "text-white font-medium"
              }}
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <Chip size="sm" color="primary" variant="flat">
                {roleLabel}
              </Chip>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-5 w-5 text-default-500" />
                <div>
                  <p className="text-sm text-default-500">E-mailadres</p>
                  <p>{email || 'Geen e-mailadres beschikbaar'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-5 w-5 text-default-500" />
                <div>
                  <p className="text-sm text-default-500">Telefoonnummer</p>
                  <p>{user._contact?.phone || user.phone || 'Geen telefoonnummer beschikbaar'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <BuildingOfficeIcon className="h-5 w-5 text-default-500" />
                <div>
                  <p className="text-sm text-default-500">Bedrijf</p>
                  <p>{user._contact?.organization_id ? 'Verbonden aan organisatie' : 'Geen bedrijf beschikbaar'}</p>
                </div>
              </div>
            </div>
          </CardBody>
          <Divider />
          <CardFooter className="flex justify-between">
            <Button 
              color="primary"
              variant="flat"
              startContent={<CogIcon className="h-4 w-4" />}
            >
              Profiel bewerken
            </Button>
            <Button 
              color="danger"
              variant="flat"
              startContent={<ArrowRightOnRectangleIcon className="h-4 w-4" />}
              onPress={handleLogout}
            >
              Uitloggen
            </Button>
          </CardFooter>
        </Card>
        
        {/* Additional Account Sections */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold">Account instellingen</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-default-500">
              Hier kunt u uw account instellingen beheren zoals wachtwoord wijzigen, 
              notificatie voorkeuren en privacy instellingen.
            </p>
          </CardBody>
          <CardFooter>
            <Button color="primary" variant="flat">
              Instellingen beheren
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AccountPage; 