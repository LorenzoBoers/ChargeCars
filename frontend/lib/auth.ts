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

// Token management
export const tokenManager = {
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  },

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },

  setTokenExpiry(expiry: number): void {
    localStorage.setItem('tokenExpiry', expiry.toString());
  },

  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('tokenExpiry');
    return expiry ? parseInt(expiry) : null;
  },

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  setUserData(user: User): void {
    localStorage.setItem('userData', JSON.stringify(user));
  },

  getUserData(): User | null {
    const userData = localStorage.getItem('userData');
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
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
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