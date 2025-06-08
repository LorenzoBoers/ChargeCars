import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
  Divider,
  Chip,
  Spacer
} from "@nextui-org/react";
import {
  EyeIcon,
  EyeSlashIcon,
  BoltIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

interface LoginFormData {
  email: string;
  password: string;
}

interface AuthResponse {
  authToken: string;
  expires_in: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null); // Clear error when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Temporary mock login for demo credentials while Xano is unavailable
    const mockCredentials = [
      { email: 'admin@chargecars.nl', password: 'demo123', role: 'admin' },
      { email: 'customer@test.nl', password: 'demo123', role: 'customer' },
      { email: 'lorenzo_boers@outlook.com', password: 'Laadpaal2231', role: 'user' }
    ];

    const mockUser = mockCredentials.find(
      cred => cred.email === formData.email && cred.password === formData.password
    );

    if (mockUser) {
      // Generate a mock token
      const mockToken = `mock_token_${mockUser.role}_${Date.now()}`;
      
      // Store mock auth data
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('tokenExpiry', (Date.now() + 24 * 60 * 60 * 1000).toString());
      localStorage.setItem('userRole', mockUser.role);
      
      // Simulate a brief delay
      setTimeout(() => {
        setIsLoading(false);
        router.push('/dashboard');
      }, 1000);
      return;
    }

    try {
      const response = await fetch('https://api.chargecars.nl/api:auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      // Debug log for API response
      if (!response.ok) {
        console.error('Login API error response:', data);
      }

      // Support both camelCase and snake_case token fields
      const token = data.authToken || data.auth_token;
      const expiry = data.expires_in || data.expiresIn;

      if (response.ok && token) {
        // Store auth token
        localStorage.setItem('authToken', token);
        if (expiry) {
          localStorage.setItem('tokenExpiry', expiry);
        }
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Network error connecting to Xano:', err);
      setError('Unable to connect to server. Using demo credentials or check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        <Card className="bg-content1/80 backdrop-blur-xl border border-gray-800 shadow-2xl">
          <CardHeader className="flex flex-col gap-4 px-8 pt-8 pb-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
                <BoltIcon className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ChargeCars</h1>
                <p className="text-sm text-gray-400">Order Management System</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Welcome Back</h2>
              <p className="text-gray-400 text-sm mt-1">Sign in to your account to continue</p>
            </div>
          </CardHeader>

          <CardBody className="px-8 pb-8">
            {error && (
              <Chip
                color="danger"
                variant="flat"
                startContent={<ExclamationTriangleIcon className="h-4 w-4" />}
                className="w-full justify-start p-3 mb-4"
              >
                {error}
              </Chip>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onValueChange={(value) => handleInputChange('email', value)}
                startContent={<EnvelopeIcon className="h-4 w-4 text-gray-400" />}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-content2 border-gray-700 hover:border-primary focus-within:border-primary transition-colors"
                }}
                isRequired
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onValueChange={(value) => handleInputChange('password', value)}
                startContent={<LockClosedIcon className="h-4 w-4 text-gray-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-content2 border-gray-700 hover:border-primary focus-within:border-primary transition-colors"
                }}
                isRequired
              />

              <div className="flex justify-end">
                <Link 
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-3 shadow-lg hover:shadow-primary/25 transition-all duration-200"
                isLoading={isLoading}
                isDisabled={!isFormValid}
                size="lg"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

            <Spacer y={6} />
            
            <Divider className="bg-gray-700" />
            
            <Spacer y={6} />

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link 
                  href="/auth/signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-content2 rounded-lg border border-gray-700">
              <p className="text-xs text-gray-400 mb-2 font-medium">Demo Accounts:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Admin:</span>
                  <span className="text-gray-300">admin@chargecars.nl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span className="text-gray-300">customer@test.nl</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Test User:</span>
                  <span className="text-gray-300">lorenzo_boers@outlook.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Password:</span>
                  <span className="text-gray-300">demo123 / Laadpaal2231</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-xs">
            © 2025 ChargeCars. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 