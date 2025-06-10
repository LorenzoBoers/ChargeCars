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
    this.setCookie('authToken', token, 7); // 7 days
  },

  getAuthToken(): string | null {
    // Try localStorage first, then cookies as fallback
    return localStorage.getItem('authToken') || this.getCookie('authToken');
  },

  setTokenExpiry(expiry: number): void {
    localStorage.setItem('tokenExpiry', expiry.toString());
    this.setCookie('tokenExpiry', expiry.toString(), 7);
  },

  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('tokenExpiry') || this.getCookie('tokenExpiry');
    return expiry ? parseInt(expiry) : null;
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
    this.setCookie('refreshToken', token, 30); // 30 days for refresh token
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken') || this.getCookie('refreshToken');
  },

  setUserData(user: User): void {
    const userData = JSON.stringify(user);
    localStorage.setItem('userData', userData);
    this.setCookie('userData', userData, 7);
  },

  getUserData(): User | null {
    const userData = localStorage.getItem('userData') || this.getCookie('userData');
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
    // Clear from both localStorage and cookies
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    this.deleteCookie('authToken');
    this.deleteCookie('tokenExpiry');
    this.deleteCookie('refreshToken');
    this.deleteCookie('userData');
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