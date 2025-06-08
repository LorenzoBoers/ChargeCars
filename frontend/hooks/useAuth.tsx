import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  created_at?: number;
  contact_id?: string;
  noloco_id?: number;
  noloco_token?: string;
  role_id?: string;
  scopes?: string;
  is_active?: boolean;
  email_verified?: boolean;
  last_login?: number | null;
  login_attempts?: number;
  account_locked_until?: number | null;
  two_factor_enabled?: boolean;
  // Contact information that may be merged from contact object
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  organization_id?: string;
  contact_type?: string;
  access_level?: string;
  // Any additional fields from the API response
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkAuthStatus: () => Promise<boolean>;
}

interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  signup_type: 'customer' | 'internal' | 'external' | 'technician';
  organization_id?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'https://api.chargecars.nl/api:auth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        
        if (storedToken) {
          // Check if token is expired
          if (tokenExpiry && new Date(tokenExpiry) < new Date()) {
            // Token expired, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
            setIsLoading(false);
            return;
          }
          
          setToken(storedToken);
          
          // Verify token and get user data
          const isValid = await checkAuthStatus();
          if (!isValid) {
            // Invalid token, clear storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('tokenExpiry');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('authToken');
        localStorage.removeItem('tokenExpiry');
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Check for different token field names
        const token = data.authToken || data.auth_token || data.token || data.accessToken;
        
        if (token) {
          // Store token
          localStorage.setItem('authToken', token);
          if (data.expires_in || data.expiresIn) {
            localStorage.setItem('tokenExpiry', data.expires_in || data.expiresIn);
          }
          
          setToken(token);
          
          // If response includes user data directly, use it
          if (data.user) {
            // Merge user data with contact data if available
            const userData = {
              ...data.user,
              ...(data.user.contact || {}),
              email: data.user.email || (data.user.contact && data.user.contact.email)
            };
            setUser(userData);
          } else {
            // Get user data separately
            await refreshUser();
          }
          
          return true;
        } else {
          throw new Error(data.message || 'No authentication token received');
        }
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.authToken) {
        // Store token
        localStorage.setItem('authToken', data.authToken);
        if (data.expires_in) {
          localStorage.setItem('tokenExpiry', data.expires_in);
        }
        
        setToken(data.authToken);
        
        // Get user data
        await refreshUser();
        
        return true;
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userRole');
    
    // Clear state
    setToken(null);
    setUser(null);
    
    // Redirect to login
    router.push('/auth/login');
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentToken = token || localStorage.getItem('authToken');
      
      if (!currentToken) {
        throw new Error('No token available');
      }

      // Handle mock tokens
      if (currentToken.startsWith('mock_token_')) {
        const userRole = localStorage.getItem('userRole') || 'customer';
        const mockUser: User = {
          id: `mock_user_${userRole}_${Date.now()}`,
          created_at: Date.now(),
          contact_id: `mock_contact_${userRole}`,
          noloco_id: userRole === 'admin' ? 1 : 2,
          noloco_token: `mock_noloco_token_${userRole}`,
          role_id: `mock_role_${userRole}`,
          scopes: userRole === 'admin' ? 'admin,manager,user' : 'user',
          is_active: true,
          email_verified: true,
          last_login: Date.now(),
          login_attempts: 0,
          account_locked_until: null,
          two_factor_enabled: false,
          first_name: userRole === 'admin' ? 'Admin' : 'Customer',
          last_name: 'User',
          email: userRole === 'admin' ? 'admin@chargecars.nl' : 'customer@test.nl',
          organization_id: `mock_org_${userRole}`,
          contact_type: userRole,
          access_level: userRole === 'admin' ? 'full' : 'limited'
        };
        setUser(mockUser);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        throw new Error('Failed to fetch user data');
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      // If refresh fails, logout user
      logout();
    }
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const currentToken = token || localStorage.getItem('authToken');
      
      if (!currentToken) {
        return false;
      }

      // Handle mock tokens
      if (currentToken.startsWith('mock_token_')) {
        await refreshUser(); // This will set mock user data
        return true;
      }

      const response = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Auth status check error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    refreshUser,
    checkAuthStatus
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

// Higher-order component for protected routes
export const withAuth = (WrappedComponent: React.ComponentType) => {
  const AuthenticatedComponent = (props: any) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login');
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Will redirect
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

export default AuthContext; 