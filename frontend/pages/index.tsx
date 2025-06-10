import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Button,
  Card,
  CardBody,
  Chip
} from "@nextui-org/react";
import {
  ArrowRightIcon,
  BoltIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from "@heroicons/react/24/outline";
import Logo from '../components/ui/Logo';
import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/today');
    } else {
      router.push('/auth/login');
    }
  };

  const features = [
    {
      icon: ClipboardDocumentListIcon,
      title: 'Order Management',
      description: 'Beheer al je laadpaal orders op één plek'
    },
    {
      icon: ChartBarIcon,
      title: 'Rapportages',
      description: 'Inzicht in je business performance'
    },
    {
      icon: BoltIcon,
      title: 'Automatisering',
      description: 'Gestroomlijnde processen voor efficiency'
    }
  ];

  return (
    <>
      <Head>
        <title>ChargeCars Portal - Order Management System</title>
        <meta name="description" content="ChargeCars order management system - professionele laadpaal installaties" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-background via-content1 to-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="container mx-auto px-6 py-20">
            <div className="text-center">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <Logo size="xl" href="#" />
              </div>

              {/* Hero Content */}
              <div className="max-w-3xl mx-auto mb-12">
                <Chip 
                  color="primary" 
                  variant="flat" 
                  className="mb-6"
                  startContent={<BoltIcon className="h-4 w-4" />}
                >
                  Order Management System
                </Chip>
                
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  Laadpaal Orders
                  <br />
                  <span className="text-primary">Gestroomlijnd</span>
                </h1>
                
                <p className="text-xl text-foreground-600 mb-8 leading-relaxed">
                  Beheer je laadpaal orders, klanten en rapportages op één centrale plek. 
                  Van offerte tot installatie - alles onder controle.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    color="primary"
                    endContent={<ArrowRightIcon className="h-5 w-5" />}
                    className="font-semibold"
                    onPress={handleGetStarted}
                  >
                    {isAuthenticated ? 'Naar Portal' : 'Inloggen'}
                  </Button>
                  
                  <Button
                    size="lg"
                    variant="bordered"
                    className="font-semibold"
                    onPress={() => router.push('/auth/signup')}
                  >
                    Registreren
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-content1/50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Alles wat je nodig hebt
              </h2>
              <p className="text-foreground-600 text-lg max-w-2xl mx-auto">
                Een complete oplossing voor het beheren van je laadpaal business
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <Card key={index} className="border border-divider bg-content1/50 backdrop-blur-sm">
                    <CardBody className="text-center p-8">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-foreground-600">
                        {feature.description}
                      </p>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
              <CardBody className="p-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Klaar om te beginnen?
                </h2>
                <p className="text-foreground-600 mb-8 text-lg">
                  Start vandaag nog met het stroomlijnen van je laadpaal orders
                </p>
                <Button
                  size="lg"
                  color="primary"
                  endContent={<ArrowRightIcon className="h-5 w-5" />}
                  className="font-semibold"
                  onPress={handleGetStarted}
                >
                  {isAuthenticated ? 'Naar Portal' : 'Begin Nu'}
                </Button>
              </CardBody>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
} 