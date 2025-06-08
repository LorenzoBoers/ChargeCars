import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export const useProtectedRoute = (redirectTo: string = '/auth/login') => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return;

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, user, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    user,
    isReady: !isLoading && isAuthenticated && user
  };
}; 