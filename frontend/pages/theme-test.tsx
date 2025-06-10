import React from 'react';
import { Button, Card, CardBody, Chip } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function ThemeTestPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Theme Test Page</h1>
          <p className="text-lg text-foreground-600">
            Test de light/dark mode functionaliteit
          </p>
        </div>

        {/* Theme Info */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-2xl font-semibold">Theme Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Chip color="primary" variant="flat">
                  Current Theme: {theme}
                </Chip>
              </div>
              <div>
                <Chip color="secondary" variant="flat">
                  Resolved Theme: {resolvedTheme}
                </Chip>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                color="primary"
                variant={theme === 'light' ? 'solid' : 'flat'}
                startContent={<SunIcon className="h-4 w-4" />}
                onPress={() => setTheme('light')}
              >
                Light Mode
              </Button>
              <Button
                color="primary"
                variant={theme === 'dark' ? 'solid' : 'flat'}
                startContent={<MoonIcon className="h-4 w-4" />}
                onPress={() => setTheme('dark')}
              >
                Dark Mode
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Color Samples */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-2xl font-semibold">Color Samples</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-16 bg-background border border-divider rounded-lg flex items-center justify-center">
                  Background
                </div>
                <div className="h-16 bg-content1 border border-divider rounded-lg flex items-center justify-center">
                  Content1
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-content2 border border-divider rounded-lg flex items-center justify-center">
                  Content2
                </div>
                <div className="h-16 bg-content3 border border-divider rounded-lg flex items-center justify-center">
                  Content3
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
                  Primary
                </div>
                <div className="h-16 bg-secondary text-secondary-foreground rounded-lg flex items-center justify-center">
                  Secondary
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-16 bg-success text-success-foreground rounded-lg flex items-center justify-center">
                  Success
                </div>
                <div className="h-16 bg-warning text-warning-foreground rounded-lg flex items-center justify-center">
                  Warning
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Text Samples */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-2xl font-semibold">Text Samples</h2>
            <div className="space-y-2">
              <p className="text-foreground">Primary text (foreground)</p>
              <p className="text-foreground-600">Secondary text (foreground-600)</p>
              <p className="text-foreground-500">Tertiary text (foreground-500)</p>
              <p className="text-foreground-400">Muted text (foreground-400)</p>
            </div>
          </CardBody>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardBody className="space-y-4">
            <h2 className="text-2xl font-semibold">Debug Information</h2>
            <div className="space-y-2">
              <p>Document class list: {typeof document !== 'undefined' ? document.documentElement.className : 'Not available'}</p>
              <p>LocalStorage theme: {typeof localStorage !== 'undefined' ? localStorage.getItem('chargecars-theme') || 'Not set' : 'Not available'}</p>
              <p>System prefers dark: {typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches.toString() : 'Not available'}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
} 