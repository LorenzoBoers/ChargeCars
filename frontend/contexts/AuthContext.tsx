import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User, authAPI, tokenManager } from '../lib/auth';
import { apiClient } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && tokenManager.isTokenValid();

  // Check authentication status on app load
  useEffect(() => {
    checkAuth();
  }, []);

  // Auto-login disabled - using real credentials only
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated && !sessionStorage.getItem('chargecars_login_attempted')) {
  //     // Auto-login with demo admin user for development (one time only)
  //     const timer = setTimeout(() => {
  //       sessionStorage.setItem('chargecars_login_attempted', 'true');
  //       login('admin@chargecars.nl', 'admin123');
  //     }, 500);
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [isLoading, isAuthenticated]);

  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const token = tokenManager.getAuthToken();
      const userData = tokenManager.getUserData();
      
      if (!token || !tokenManager.isTokenValid()) {
        // Token is invalid or expired
        tokenManager.clearAuth();
        setUser(null);
        setIsLoading(false);
        return;
      }

      if (userData) {
        // We have cached user data and valid token
        apiClient.setToken(token); // Set token for API client
        setUser(userData);
        setIsLoading(false);
        return;
      }

      // Try to fetch user data from API
      try {
        apiClient.setToken(token); // Set token first
        const response = await apiClient.getMe();
        
        if (response.success && response.data) {
          // Convert MeResponse to User format based on actual API response
          const userFromAPI: User = {
            id: response.data.id,
            email: response.data.email,
            role_id: response.data.role_id || 'user',
            contact: {
              id: response.data.id,
              first_name: response.data.first_name || '',
              last_name: response.data.last_name || '',
            },
            organization: {
              id: response.data.organization_id || 'default',
              name: response.data.organization_name || 'Organization',
              type: 'business'
            }
          };

          setUser(userFromAPI);
          tokenManager.setUserData(userFromAPI);
          
          // Redirect to dashboard after successful authentication
          if (router.pathname === '/auth/login' || router.pathname === '/') {
            router.push('/dashboard');
          }
        } else {
          throw new Error(response.error?.message || 'Failed to fetch user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, clear auth
        tokenManager.clearAuth();
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      tokenManager.clearAuth();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🔑 AUTH: Login started for:', email);
    setIsLoading(true);

    try {
      // Use real API only - no demo credentials
      console.log('🌐 AUTH: Attempting API login...');
      try {
        const response = await apiClient.login(email, password);
        console.log('🌐 AUTH: API response:', response);
        
        if (response.success && response.data) {
          // Store auth data
          tokenManager.setAuthToken(response.data.auth_token);
          tokenManager.setRefreshToken(response.data.refresh_token);
          tokenManager.setUserData(response.data.user);
          apiClient.setToken(response.data.auth_token); // Set token for API client
          
          setUser(response.data.user);
          setIsLoading(false);
          console.log('🌐 AUTH: API login successful, current path:', router.pathname);
          
          // Redirect to dashboard after successful API login
          if (router.pathname === '/auth/login' || router.pathname === '/') {
            console.log('🌐 AUTH: Redirecting to dashboard...');
            router.push('/dashboard');
          }
          
          console.log('🌐 AUTH: Returning success...');
          return { success: true };
        } else {
          console.log('❌ AUTH: API login failed:', response.error);
          setIsLoading(false);
          return { 
            success: false, 
            error: response.error?.message || 'Login failed. Please check your credentials.' 
          };
        }
        
      } catch (apiError) {
        console.error('💥 AUTH: API login failed:', apiError);
        setIsLoading(false);
        return { 
          success: false, 
          error: apiError instanceof Error ? apiError.message : 'Login failed. Please check your credentials.' 
        };
      }
      
    } catch (error) {
      console.error('💥 AUTH: Login error:', error);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'An unexpected error occurred. Please try again.' 
      };
    }
  };

  const logout = (): void => {
    tokenManager.clearAuth();
    setUser(null);
    router.push('/auth/login');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 