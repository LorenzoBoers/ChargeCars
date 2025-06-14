import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '@nextui-org/react';

export const withAuth = <P extends object>(Component: React.ComponentType<P>) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    useEffect(() => {
      if (isMounted && !isLoading && !isAuthenticated) {
        console.log('🔒 withAuth: Not authenticated, redirecting to login');
        router.replace('/auth/login');
      }
    }, [isAuthenticated, isLoading, router, isMounted]);

    // During server-side rendering or initial mount, show nothing
    if (!isMounted) {
      return null;
    }

    // Show loading state
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <Spinner size="lg" color="primary" />
        </div>
      );
    }

    // If not authenticated, don't render the component
    if (!isAuthenticated || !user) {
      return null; // Will redirect in the useEffect
    }

    // If authenticated, render the wrapped component
    return <Component {...props} />;
  };

  // Set display name for debugging
  const displayName = Component.displayName || Component.name || 'Component';
  AuthenticatedComponent.displayName = `withAuth(${displayName})`;

  return AuthenticatedComponent;
}; 