// Auth types based on Xano API response
export interface User {
  id: string;
  email: string;
  role_id: string;
  contact: {
    id: string;
    first_name: string;
    last_name: string;
  };
  organization: {
    id: string;
    name: string;
    type: string;
  };
}

export interface LoginResponse {
  user: User;
  auth_token: string;
  auth_token_exp: number;
  refresh_token: string;
  refresh_token_exp: number;
}

export interface MeResponse {
  id: string;
  created_at: number;
  contact_id: string;
  role_id: string;
  email_verified: boolean;
  last_login: number;
  is_active: boolean;
  _contact: {
    id: string;
    email: string;
    organization_id: string;
    first_name: string;
    last_name: string;
    job_title: string | null;
    is_active: boolean;
  };
}

const API_BASE_URL = 'https://api.chargecars.nl/api:auth';

// Auth API functions
export const authAPI = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  },

  async getMe(token: string): Promise<MeResponse> {
    const response = await fetch(`${API_BASE_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch user data');
    }

    return data;
  }
};

// Token management with cookie support
export const tokenManager = {
  // ChargeCars cookie naming constants
  COOKIE_PREFIX: 'chargecars-',
  COOKIE_NAMES: {
    AUTH_TOKEN: 'chargecars-auth-token',
    TOKEN_EXPIRY: 'chargecars-token-expiry',
    REFRESH_TOKEN: 'chargecars-refresh-token',
    USER_DATA: 'chargecars-user-data'
  },

  // Cookie helper functions
  setCookie(name: string, value: string, days: number = 7): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Strict${secure}`;
  },

  getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  deleteCookie(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  },

  // Token management methods
  setAuthToken(token: string): void {
    // Store in both localStorage (for immediate access) and cookies (for security)
    localStorage.setItem('authToken', token);
    this.setCookie(this.COOKIE_NAMES.AUTH_TOKEN, token, 7); // 7 days
  },

  getAuthToken(): string | null {
    // Try localStorage first, then cookies as fallback
    return localStorage.getItem('authToken') || this.getCookie(this.COOKIE_NAMES.AUTH_TOKEN);
  },

  setTokenExpiry(expiry: number): void {
    localStorage.setItem('tokenExpiry', expiry.toString());
    this.setCookie(this.COOKIE_NAMES.TOKEN_EXPIRY, expiry.toString(), 7);
  },

  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('tokenExpiry') || this.getCookie(this.COOKIE_NAMES.TOKEN_EXPIRY);
    return expiry ? parseInt(expiry) : null;
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
    this.setCookie(this.COOKIE_NAMES.REFRESH_TOKEN, token, 30); // 30 days for refresh token
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || this.getCookie(this.COOKIE_NAMES.REFRESH_TOKEN);
  },

  setUserData(user: User): void {
    const userData = JSON.stringify(user);
    localStorage.setItem('userData', userData);
    this.setCookie(this.COOKIE_NAMES.USER_DATA, userData, 7);
  },

  getUserData(): User | null {
    const userData = localStorage.getItem('userData') || this.getCookie(this.COOKIE_NAMES.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  },

  isTokenValid(): boolean {
    const token = this.getAuthToken();
    const expiry = this.getTokenExpiry();
    
    if (!token || !expiry) {
      return false;
    }

    return Date.now() < expiry;
  },

  clearAuth(): void {
    // Clear from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    // Clear new ChargeCars prefixed cookies
    this.deleteCookie(this.COOKIE_NAMES.AUTH_TOKEN);
    this.deleteCookie(this.COOKIE_NAMES.TOKEN_EXPIRY);
    this.deleteCookie(this.COOKIE_NAMES.REFRESH_TOKEN);
    this.deleteCookie(this.COOKIE_NAMES.USER_DATA);
    
    // Clean up old cookies (migration cleanup)
    this.deleteCookie('authToken');
    this.deleteCookie('tokenExpiry');
    this.deleteCookie('refreshToken');
    this.deleteCookie('userData');
  },

  // Helper method to clear all ChargeCars cookies (for admin/debugging)
  clearAllChargeCarsData(): void {
    // Get all cookies and delete any that start with our prefix
    const cookies = document.cookie.split(';');
    
    cookies.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim();
      if (cookieName.startsWith(this.COOKIE_PREFIX)) {
        this.deleteCookie(cookieName);
      }
    });
    
    // Also clear localStorage
    this.clearAuth();
  },

  // Debug helper to view all ChargeCars cookies
  getChargeCarsData(): Record<string, any> {
    return {
      cookies: {
        authToken: this.getCookie(this.COOKIE_NAMES.AUTH_TOKEN),
        tokenExpiry: this.getCookie(this.COOKIE_NAMES.TOKEN_EXPIRY),
        refreshToken: this.getCookie(this.COOKIE_NAMES.REFRESH_TOKEN),
        userData: this.getCookie(this.COOKIE_NAMES.USER_DATA)
      },
      localStorage: {
        authToken: localStorage.getItem('authToken'),
        tokenExpiry: localStorage.getItem('tokenExpiry'),
        refreshToken: localStorage.getItem('refreshToken'),
        userData: localStorage.getItem('userData')
      },
      computed: {
        isTokenValid: this.isTokenValid(),
        tokenExpiryDate: this.getTokenExpiry() ? new Date(this.getTokenExpiry()!) : null,
        currentUser: this.getUserData()
      }
    };
  }
};

// Demo credentials for testing
export const demoCredentials = [
  { 
    email: 'admin@chargecars.nl', 
    password: 'demo123', 
    role: 'admin',
    name: 'Admin User'
  },
  { 
    email: 'customer@test.nl', 
    password: 'demo123', 
    role: 'customer',
    name: 'Test Customer'
  },
  { 
    email: 'lorenzo_boers@outlook.com', 
    password: 'Laadpaal2231', 
    role: 'user',
    name: 'Lorenzo Monteur'
  }
];

// Global debug helpers for development (accessible via browser console)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).chargeCarsDebug = {
    auth: tokenManager,
    viewData: () => {
      console.table(tokenManager.getChargeCarsData());
      return tokenManager.getChargeCarsData();
    },
    clearAll: () => {
      tokenManager.clearAllChargeCarsData();
      console.log('🧹 All ChargeCars data cleared');
    },
    listCookies: () => {
      const cookies = document.cookie.split(';')
        .map(cookie => cookie.trim())
        .filter(cookie => cookie.startsWith('chargecars-'));
      console.log('🍪 ChargeCars Cookies:', cookies);
      return cookies;
    }
  };
  
  console.log('🔧 ChargeCars Debug available: window.chargeCarsDebug');
} 