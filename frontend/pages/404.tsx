import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button } from "@nextui-org/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { BackgroundBeams } from '../components/ui/background-beams';

const Custom404: React.FC = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>404 - Pagina niet gevonden - ChargeCars Portal</title>
        <meta name="description" content="De pagina die u zoekt bestaat niet." />
      </Head>

      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
        <BackgroundBeams />
        
        <div className="text-center z-10 space-y-6 p-8">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-foreground">404</h1>
            <p className="text-xl text-foreground-600">
              De pagina die je zoekt bestaat niet
            </p>
          </div>
          
          <Button
            color="primary"
            size="lg"
            startContent={<ArrowLeftIcon className="h-5 w-5" />}
            onPress={() => router.back()}
            className="mt-8"
          >
            Ga Terug
          </Button>
        </div>
      </div>
    </>
  );
};

export default Custom404; 