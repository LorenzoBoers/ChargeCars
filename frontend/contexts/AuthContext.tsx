import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { User, authAPI, tokenManager, demoCredentials } from '../lib/auth';

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
        setUser(userData);
        setIsLoading(false);
        return;
      }

      // Try to fetch user data from API
      try {
        const meData = await authAPI.getMe(token);
        
        // Convert MeResponse to User format
        const userFromAPI: User = {
          id: meData.id,
          email: meData._contact.email,
          role_id: meData.role_id,
          contact: {
            id: meData._contact.id,
            first_name: meData._contact.first_name,
            last_name: meData._contact.last_name,
          },
          organization: {
            id: meData._contact.organization_id,
            name: 'Organization', // API doesn't return org name in /me
            type: 'unknown'
          }
        };

        setUser(userFromAPI);
        tokenManager.setUserData(userFromAPI);
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
        
        setUser(mockUser);
        setIsLoading(false);
        return { success: true };
      }

      // Try real Xano API
      try {
        const response = await authAPI.login(email, password);
        
        // Store auth data
        tokenManager.setAuthToken(response.auth_token);
        tokenManager.setTokenExpiry(response.auth_token_exp);
        tokenManager.setRefreshToken(response.refresh_token);
        tokenManager.setUserData(response.user);
        
        setUser(response.user);
        setIsLoading(false);
        return { success: true };
        
      } catch (apiError) {
        console.error('Xano API login failed:', apiError);
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