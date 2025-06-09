import { ReactNode } from 'react';
import Head from 'next/head';
import Logo from './ui/Logo';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title = 'ChargeCars Portal' }: LayoutProps) {
  const router = useRouter();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Orders', href: '/orders' },
    { name: 'Klanten', href: '/customers' },
    { name: 'Partners', href: '/partners' },
    { name: 'Rapportages', href: '/reports' },
  ];

  return (
    <>
      <Head>
        <title>{title} - ChargeCars Portal</title>
        <meta name="description" content="Beheer en volg alle laadpaal installaties in Nederland" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Logo size="md" href="/dashboard" />

              {/* Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        router.pathname === item.href
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  Welkom, <span className="font-medium">John Doe</span>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JD</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Logo size="sm" className="opacity-60" />
                <span className="text-sm text-gray-500">
                  © 2025 ChargeCars. Alle rechten voorbehouden.
                </span>
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <a href="/privacy" className="hover:text-gray-900">Privacy</a>
                <a href="/terms" className="hover:text-gray-900">Voorwaarden</a>
                <a href="/support" className="hover:text-gray-900">Support</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
} 