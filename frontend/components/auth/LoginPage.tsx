import React, { useState, useEffect } from 'react';
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
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isLoading: authLoading, isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // Router push will be handled by useEffect when isAuthenticated changes
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const isFormValid = formData.email && formData.password;
  const isLoading = authLoading;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${
      isDark 
        ? 'bg-gradient-to-br from-black via-gray-900 to-black' 
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'
    }`}>
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl`}></div>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle size="sm" />
      </div>

      <div className="relative w-full max-w-md">
        <Card className={`backdrop-blur-xl shadow-2xl transition-colors duration-200 ${
          isDark 
            ? 'bg-content1/80 border-gray-800' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <CardHeader className="flex flex-col gap-4 px-8 pt-8 pb-0">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src="/svg/chargecars-logo.svg" 
                  alt="ChargeCars" 
                  className="h-12 w-auto"
                />
              </div>
              <div>
                <h1 className={`text-2xl font-bold transition-colors duration-200 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>ChargeCars</h1>
                <p className={`text-sm transition-colors duration-200 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Order Management System</p>
              </div>
            </div>

            <div className="text-center">
              <h2 className={`text-xl font-semibold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Welcome Back</h2>
              <p className={`text-sm mt-1 transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Sign in to your account to continue</p>
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

            {success && (
              <Chip
                color="success"
                variant="flat"
                startContent={<CheckCircleIcon className="h-4 w-4" />}
                className="w-full justify-start p-3 mb-4"
              >
                {success}
              </Chip>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onValueChange={(value) => handleInputChange('email', value)}
                startContent={<EnvelopeIcon className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: `transition-colors ${
                    isDark 
                      ? 'bg-content2 border-gray-700 hover:border-primary focus-within:border-primary' 
                      : 'bg-gray-50 border-gray-300 hover:border-primary focus-within:border-primary'
                  }`
                }}
                isRequired
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onValueChange={(value) => handleInputChange('password', value)}
                startContent={<LockClosedIcon className={`h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeSlashIcon className={`h-4 w-4 hover:text-primary transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    ) : (
                      <EyeIcon className={`h-4 w-4 hover:text-primary transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: `transition-colors ${
                    isDark 
                      ? 'bg-content2 border-gray-700 hover:border-primary focus-within:border-primary' 
                      : 'bg-gray-50 border-gray-300 hover:border-primary focus-within:border-primary'
                  }`
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
            <div className={`mt-6 p-4 rounded-lg border transition-colors duration-200 ${
              isDark 
                ? 'bg-content2 border-gray-700' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className={`text-xs mb-2 font-medium transition-colors duration-200 ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>Demo Accounts:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Admin:</span>
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>admin@chargecars.nl</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Customer:</span>
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>customer@test.nl</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Test User:</span>
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>lorenzo_boers@outlook.com</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Password:</span>
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>demo123 / Laadpaal2231</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-xs transition-colors duration-200 ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}>
            © 2025 ChargeCars. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 