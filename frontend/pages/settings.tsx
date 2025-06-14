import React from 'react';
import { NextPage } from 'next';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  CardFooter,
  Button, 
  Spinner,
  Divider
} from '@nextui-org/react';
import { AppLayout } from '../components/layouts/AppLayout';
import { withAuth } from '../hooks/withAuth';
import { CogIcon } from '@heroicons/react/24/outline';

/**
 * @component SettingsPage
 * @description User settings page
 */
const SettingsPage: NextPage = () => {
  // Client-side only content
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // During SSG or if not mounted yet, show a simple loading state
  if (!isMounted) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <Spinner size="lg" color="primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Instellingen</h1>
        
        {/* Settings Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CogIcon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Algemene Instellingen</h2>
            </div>
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
              Wijzigingen opslaan
            </Button>
          </CardFooter>
        </Card>
        
        {/* Additional Settings Sections */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold">Notificatie Instellingen</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <p className="text-default-500">
              Beheer uw notificatie voorkeuren voor e-mail, app en browser meldingen.
            </p>
          </CardBody>
          <CardFooter>
            <Button color="primary" variant="flat">
              Voorkeuren opslaan
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
};

// Add getServerSideProps to prevent static generation and ensure server-side rendering
export const getServerSideProps = async () => {
  return {
    props: {
      // Empty props, just to ensure this page is server-rendered
    }
  };
}

export default withAuth(SettingsPage); 