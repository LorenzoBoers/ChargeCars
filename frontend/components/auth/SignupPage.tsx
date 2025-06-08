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
  Spacer,
  Select,
  SelectItem,
  Checkbox
} from "@nextui-org/react";
import {
  EyeIcon,
  EyeSlashIcon,
  BoltIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BuildingOfficeIcon
} from "@heroicons/react/24/outline";

interface SignupFormData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirmPassword: string;
  signup_type: 'customer' | 'internal' | 'external' | 'technician';
  organization_id?: string;
  agreeToTerms: boolean;
}

interface AuthResponse {
  authToken: string;
  expires_in: string;
}

const SignupPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    signup_type: 'customer',
    agreeToTerms: false
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible);

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError(null); // Clear error when user types
    if (success) setSuccess(null); // Clear success message when user types
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) return 'First name is required';
    if (!formData.last_name.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!formData.agreeToTerms) return 'You must agree to the terms and conditions';
    return null;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const signupPayload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        signup_type: formData.signup_type,
        ...(formData.organization_id && { organization_id: formData.organization_id })
      };

      const response = await fetch('https://xrxc-xsc9-6egu.xano.io/api:auth/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupPayload)
      });

      const data = await response.json();

      if (response.ok && data.authToken) {
        setSuccess('Account created successfully! Redirecting...');
        
        // Store auth token
        localStorage.setItem('authToken', data.authToken);
        localStorage.setItem('tokenExpiry', data.expires_in);
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = formData.first_name && 
                     formData.last_name && 
                     formData.email && 
                     formData.password && 
                     formData.confirmPassword &&
                     formData.agreeToTerms &&
                     !validateForm();

  const signupTypes = [
    { key: 'customer', label: 'Customer', description: 'Individual or business customer' },
    { key: 'technician', label: 'Technician', description: 'Installation technician' },
    { key: 'external', label: 'External Partner', description: 'Partner organization user' },
    { key: 'internal', label: 'Internal Staff', description: 'ChargeCars employee' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
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
              <h2 className="text-xl font-semibold text-white">Create Account</h2>
              <p className="text-gray-400 text-sm mt-1">Join ChargeCars platform to get started</p>
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

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="Enter first name"
                  value={formData.first_name}
                  onValueChange={(value) => handleInputChange('first_name', value)}
                  startContent={<UserIcon className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-content2 border-gray-700 hover:border-primary focus-within:border-primary transition-colors"
                  }}
                  isRequired
                />

                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Enter last name"
                  value={formData.last_name}
                  onValueChange={(value) => handleInputChange('last_name', value)}
                  startContent={<UserIcon className="h-4 w-4 text-gray-400" />}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-content2 border-gray-700 hover:border-primary focus-within:border-primary transition-colors"
                  }}
                  isRequired
                />
              </div>

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

              <Select
                label="Account Type"
                placeholder="Select account type"
                selectedKeys={[formData.signup_type]}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0] as string;
                  handleInputChange('signup_type', selectedKey as SignupFormData['signup_type']);
                }}
                startContent={<BuildingOfficeIcon className="h-4 w-4 text-gray-400" />}
                classNames={{
                  trigger: "bg-content2 border-gray-700 hover:border-primary data-[open=true]:border-primary transition-colors",
                  value: "text-white"
                }}
                isRequired
              >
                {signupTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-gray-400">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </Select>

              <Input
                label="Password"
                placeholder="Create a strong password"
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

              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onValueChange={(value) => handleInputChange('confirmPassword', value)}
                startContent={<LockClosedIcon className="h-4 w-4 text-gray-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleConfirmVisibility}
                  >
                    {isConfirmVisible ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400 hover:text-primary transition-colors" />
                    )}
                  </button>
                }
                type={isConfirmVisible ? "text" : "password"}
                classNames={{
                  input: "bg-transparent",
                  inputWrapper: "bg-content2 border-gray-700 hover:border-primary focus-within:border-primary transition-colors"
                }}
                isRequired
              />

              <Checkbox
                isSelected={formData.agreeToTerms}
                onValueChange={(checked) => handleInputChange('agreeToTerms', checked)}
                classNames={{
                  base: "max-w-full",
                  label: "text-sm text-gray-300"
                }}
              >
                I agree to the{' '}
                <Link href="/terms" className="text-primary hover:text-primary/80">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:text-primary/80">
                  Privacy Policy
                </Link>
              </Checkbox>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/80 text-white font-medium py-3 shadow-lg hover:shadow-primary/25 transition-all duration-200"
                isLoading={isLoading}
                isDisabled={!isFormValid}
                size="lg"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <Spacer y={6} />
            
            <Divider className="bg-gray-700" />
            
            <Spacer y={6} />

            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link 
                  href="/auth/login"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
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

export default SignupPage; 