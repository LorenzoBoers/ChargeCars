import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export const useProtectedRoute = (redirectTo: string = '/auth/login') => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  
  // Check if we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Skip during SSR or when not mounted yet
    if (!isClient) return;
    
    // Don't redirect while still loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      console.log('🔒 PROTECTED ROUTE: Not authenticated, redirecting to', redirectTo);
      router.push(redirectTo);
    } else {
      console.log('🔓 PROTECTED ROUTE: Authenticated as', user.email);
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo, isClient]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isReady: isClient && !isLoading && isAuthenticated && !!user
  };
}; 