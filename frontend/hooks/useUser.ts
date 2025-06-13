import { useState, useEffect, useCallback } from 'react';
import { apiClient, MeResponse, handleApiError } from '../lib/api';

/**
 * Interface defining the return type of the useUser hook
 */
export interface UseUserReturn {
  // Data state
  user: MeResponse | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  
  // Utility functions
  getDisplayName: () => string;
  getInitials: () => string;
  getProfileImageUrl: () => string | null;
  getRoleLabel: () => string;
  isInternalUser: () => boolean;
  hasPermission: (permission: string) => boolean;
  
  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * React hook for managing current user data
 * 
 * Provides functionality to:
 * - Fetch current user information from /me endpoint
 * - Handle loading and error states  
 * - Provide utilities for user display
 * - Automatic token-based fetching
 * 
 * @example
 * ```typescript
 * const { user, isLoading, error, getDisplayName } = useUser();
 * 
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error}</div>;
 * if (user) return <div>Welcome, {getDisplayName()}!</div>;
 * ```
 */
export const useUser = (): UseUserReturn => {
  // State management
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load user data from API
   */
  const loadUser = useCallback(async (): Promise<void> => {
    // Only fetch if we have a token
    if (!apiClient.getToken()) {
      setUser(null);
      setIsLoading(false);
      setIsSuccess(false);
      setIsError(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      
      console.log('👤 USER: Loading user data...');
      
      const response = await apiClient.getMe();
      
      if (response.success && response.data) {
        setUser(response.data);
        setIsSuccess(true);
        setIsError(false);
        console.log('👤 USER: User data loaded successfully:', response.data.email);
      } else {
        const errorMsg = handleApiError(response);
        setError(errorMsg);
        setIsError(true);
        setIsSuccess(false);
        setUser(null);
        console.error('❌ USER: Failed to load user data:', errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user data';
      setError(errorMessage);
      setIsError(true);
      setIsSuccess(false);
      setUser(null);
      console.error('❌ USER: Error loading user data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Utility functions for user display
  const getDisplayName = useCallback((): string => {
    if (!user) return 'Gebruiker';
    
    // Try different sources for display name
    if (user.display_name) return user.display_name;
    if (user._contact?.display_name) return user._contact.display_name;
    if (user.full_name) return user.full_name;
    
    // Build from contact first/last name (primary source)
    if (user._contact?.first_name && user._contact?.last_name) {
      return `${user._contact.first_name} ${user._contact.last_name}`;
    }
    
    // Fallback to flat fields for backward compatibility
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user._contact?.first_name) return user._contact.first_name;
    if (user.first_name) return user.first_name;
    
    // Extract from email
    const email = user._contact?.email || user.email;
    if (email) return email.split('@')[0];
    
    return 'Gebruiker';
  }, [user]);

  const getInitials = useCallback((): string => {
    if (!user) return 'G';
    
    // Try contact first/last name (primary source)
    if (user._contact?.first_name && user._contact?.last_name) {
      return `${user._contact.first_name[0]}${user._contact.last_name[0]}`.toUpperCase();
    }
    
    // Fallback to flat fields
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    
    // Single name sources
    if (user._contact?.first_name) return user._contact.first_name[0].toUpperCase();
    if (user.first_name) return user.first_name[0].toUpperCase();
    
    // Display name parsing
    const displayName = user._contact?.display_name || user.display_name;
    if (displayName) {
      const parts = displayName.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return displayName[0].toUpperCase();
    }
    
    // Email fallback
    const email = user._contact?.email || user.email;
    if (email) return email[0].toUpperCase();
    
    return 'G';
  }, [user]);

  const getProfileImageUrl = useCallback((): string | null => {
    if (!user) return null;
    
    // Check nested contact profile picture structure
    if (user._contact?.profile_picture?.url) {
      return user._contact.profile_picture.url;
    }
    
    // Check flat profile picture fields
    if (user.profile_picture) return user.profile_picture;
    if (user.avatar) return user.avatar;
    
    return null;
  }, [user]);

  const getRoleLabel = useCallback((): string => {
    if (!user) return 'Gebruiker';
    
    // Map signup_type to Dutch labels
    if (user.signup_type) {
      const roleLabels: Record<string, string> = {
        'customer': 'Klant',
        'internal': 'Medewerker', 
        'external': 'Partner',
        'technician': 'Technicus'
      };
      return roleLabels[user.signup_type] || user.signup_type;
    }
    
    // Fallback based on contact type or access level
    if (user._contact?.contact_type) {
      const contactTypeLabels: Record<string, string> = {
        'customer': 'Klant',
        'internal': 'Medewerker',
        'partner': 'Partner',
        'technician': 'Technicus'
      };
      return contactTypeLabels[user._contact.contact_type] || user._contact.contact_type;
    }
    
    return 'Gebruiker';
  }, [user]);

  const isInternalUser = useCallback((): boolean => {
    return user?.signup_type === 'internal' || 
           user?.signup_type === 'technician' ||
           user?._contact?.contact_type === 'internal' ||
           user?._contact?.contact_type === 'technician';
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permission);
  }, [user]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    setIsError(false);
  }, []);

  // Manual refresh
  const refetch = useCallback((): Promise<void> => {
    return loadUser();
  }, [loadUser]);

  // Load user data on mount and when token changes
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Listen for token changes (e.g., after login/logout)
  useEffect(() => {
    const token = apiClient.getToken();
    if (!token && user) {
      // Token was cleared, clear user data
      setUser(null);
      setIsSuccess(false);
      setIsLoading(false);
    } else if (token && !user && !isLoading) {
      // Token was set, load user data
      loadUser();
    }
  }, [user, isLoading, loadUser]);

  return {
    // Data state
    user,
    isLoading,
    isSuccess,
    isError,
    error,
    
    // Utility functions
    getDisplayName,
    getInitials,
    getProfileImageUrl,
    getRoleLabel,
    isInternalUser,
    hasPermission,
    
    // Actions
    refetch,
    clearError,
  };
};

/**
 * Hook specifically for user profile data needed in UI components
 * Returns commonly used user display properties
 */
export const useUserProfile = () => {
  const { 
    user, 
    isLoading, 
    error, 
    getDisplayName, 
    getInitials, 
    getProfileImageUrl, 
    getRoleLabel 
  } = useUser();
  
  return {
    user,
    isLoading,
    error,
    displayName: getDisplayName(),
    initials: getInitials(),
    profileImageUrl: getProfileImageUrl(),
    roleLabel: getRoleLabel(),
    email: user?._contact?.email || user?.email,
    hasProfileImage: !!getProfileImageUrl(),
  };
};

export default useUser; 