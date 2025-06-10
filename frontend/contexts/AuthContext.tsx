import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User, authAPI, tokenManager, demoCredentials } from '../lib/auth';
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

  // Auto-login with demo credentials for testing (only if never logged in before)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !sessionStorage.getItem('chargecars_login_attempted')) {
      // Auto-login with demo admin user for development (one time only)
      const timer = setTimeout(() => {
        sessionStorage.setItem('chargecars_login_attempted', 'true');
        login('admin@chargecars.nl', 'admin123');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated]);

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
    setIsLoading(true);

    try {
      // First try demo credentials for testing
      const demoUser = demoCredentials.find(
        cred => cred.email === email && cred.password === password
      );

      if (demoUser) {
        // Create mock user data
        const mockUser: User = {
          id: `demo_${demoUser.role}_${Date.now()}`,
          email: demoUser.email,
          role_id: `role_${demoUser.role}`,
          contact: {
            id: `contact_${Date.now()}`,
            first_name: demoUser.name.split(' ')[0],
            last_name: demoUser.name.split(' ')[1] || '',
          },
          organization: {
            id: 'demo_org',
            name: 'Demo Organization',
            type: 'demo'
          }
        };

        // Store mock auth data
        const mockToken = `demo_token_${demoUser.role}_${Date.now()}`;
        const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

        tokenManager.setAuthToken(mockToken);
        tokenManager.setTokenExpiry(expiry);
        tokenManager.setUserData(mockUser);
        apiClient.setToken(mockToken); // Set token for API client
        
        setUser(mockUser);
        setIsLoading(false);
        return { success: true };
      }

      // Try real API
      try {
        const response = await apiClient.login(email, password);
        
        if (response.success && response.data) {
          // Store auth data
          tokenManager.setAuthToken(response.data.auth_token);
          tokenManager.setRefreshToken(response.data.refresh_token);
          tokenManager.setUserData(response.data.user);
          apiClient.setToken(response.data.auth_token); // Set token for API client
          
          setUser(response.data.user);
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { 
            success: false, 
            error: response.error?.message || 'Login failed. Please check your credentials.' 
          };
        }
        
      } catch (apiError) {
        console.error('API login failed:', apiError);
        setIsLoading(false);
        return { 
          success: false, 
          error: apiError instanceof Error ? apiError.message : 'Login failed. Please check your credentials.' 
        };
      }
      
    } catch (error) {
      console.error('Login error:', error);
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