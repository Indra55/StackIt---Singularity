
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormErrorBanner } from '@/components/form/FormErrorBanner';
import { AvatarUpload } from './AvatarUpload';
import { CommunityTagSelector } from './CommunityTagSelector';
import { cn } from '@/lib/utils';

interface SignupFormProps {
  onSuccess: () => void;
  redirectTo?: string;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccess, redirectTo }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    avatarFile: null as File | null,
    communities: [] as string[]
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { signup } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-z0-9_]+$/.test(formData.username)) {
      errors.username = 'Username can only contain lowercase letters, numbers, and underscores';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (formData.communities.length === 0) {
      errors.communities = 'Please select at least one community tag';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        avatarFile: formData.avatarFile || undefined,
        communities: formData.communities
      });

      toast({
        title: `Welcome to StackIt, ${formData.username}!`,
        description: "Your account has been created successfully.",
        variant: "default"
      });

      onSuccess();
      
      // Handle redirect
      if (redirectTo) {
        window.location.href = redirectTo;
      }
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | File | null | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Join StackIt</h2>
        <p className="text-gray-600">Create your account to get started</p>
      </div>

      <FormErrorBanner
        message={error}
        visible={!!error}
        onDismiss={() => setError('')}
      />

      <div className="space-y-4">
        <AvatarUpload
          onFileSelect={(file) => handleInputChange('avatarFile', file)}
          error={fieldErrors.avatarFile}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
              className={cn(
                "pl-10 transition-all duration-300",
                fieldErrors.username && "border-red-500 animate-pulse"
              )}
              placeholder="Choose a unique username"
            />
          </div>
          {fieldErrors.username && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.username}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={cn(
                "pl-10 transition-all duration-300",
                fieldErrors.email && "border-red-500 animate-pulse"
              )}
              placeholder="Enter your email"
            />
          </div>
          {fieldErrors.email && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={cn(
                "pl-10 pr-10 transition-all duration-300",
                fieldErrors.password && "border-red-500 animate-pulse"
              )}
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={cn(
                "pl-10 pr-10 transition-all duration-300",
                fieldErrors.confirmPassword && "border-red-500 animate-pulse"
              )}
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.confirmPassword}</p>
          )}
        </div>

        <CommunityTagSelector
          selectedTags={formData.communities}
          onTagsChange={(tags) => handleInputChange('communities', tags)}
          error={fieldErrors.communities}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-pulse-500 to-pulse-600 hover:from-pulse-600 hover:to-pulse-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Creating Account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </Button>
    </form>
  );
};
