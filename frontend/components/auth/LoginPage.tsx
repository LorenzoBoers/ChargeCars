import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Spacer,
  Divider,
  Chip
} from "@nextui-org/react";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from 'next-themes';
import ThemeToggle from '../ThemeToggle';
import Logo from '../ui/Logo';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔍 LOGIN: Auth status changed:', { isAuthenticated, mounted, authLoading });
    if (isAuthenticated && mounted) {
      console.log('🔍 LOGIN: User is authenticated, redirecting to dashboard...');
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, mounted, authLoading]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 LOGIN: Form submitted with:', { email: formData.email, password: '***' });
    setError(null);
    setSuccess(null);

    try {
      console.log('🔐 LOGIN: Calling login function...');
      const result = await login(formData.email, formData.password);
      console.log('🔐 LOGIN: Login result:', result);
      
      if (result.success) {
        console.log('✅ LOGIN: Success! Setting success message...');
        setSuccess('Login successful! Redirecting...');
        
        // Additional redirect as backup after 1.5 seconds
        setTimeout(() => {
          console.log('✅ LOGIN: Backup redirect to dashboard...');
          router.push('/dashboard');
        }, 1500);
      } else {
        console.log('❌ LOGIN: Failed with error:', result.error);
        setError(result.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('💥 LOGIN: Exception caught:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const isFormValid = formData.email && formData.password;
  const isLoading = authLoading;

  // Don't render theme-dependent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        {/* Loading placeholder */}
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-primary rounded animate-pulse" />
          </div>
          <p className="text-foreground-500">Loading...</p>
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

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
            <div className="flex justify-center">
              <Logo />
            </div>

            <div className="text-center">
              <h2 className={`text-base font-semibold transition-colors duration-200 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>Welcome Back</h2>
              <p className={`text-xs mt-1 transition-colors duration-200 ${
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
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>test@example.com</span>
                </div>
                <div className="flex justify-between">
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>Password:</span>
                  <span className={`transition-colors duration-200 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>password</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 