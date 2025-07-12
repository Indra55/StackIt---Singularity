
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormErrorBanner } from '@/components/form/FormErrorBanner';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  onSuccess: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    role: 'user' as 'user' | 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login } = useAuth();
  const { toast } = useToast();

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
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
      await login(formData.email, formData.password, formData.rememberMe, formData.role);
      toast({
        title: "Welcome back!",
        description: `You've been successfully signed in as ${formData.role === 'admin' ? 'an administrator' : 'a user'}.`,
        variant: "default"
      });
      onSuccess();
      
      // Handle redirect based on role
      if (redirectTo) {
        window.location.href = redirectTo;
      } else if (formData.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/questions';
      }
    } catch (error) {
      setError('Invalid email or password. Please try again.');
      // Trigger shake animation
      const form = document.getElementById('login-form');
      if (form) {
        form.classList.add('animate-shake');
        setTimeout(() => form.classList.remove('animate-shake'), 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to continue to StackIt</p>
      </div>

      <FormErrorBanner
        message={error}
        visible={!!error}
        onDismiss={() => setError('')}
      />

      <div className="space-y-4">
        {/* Role Selection */}
        <div>
          <Label>Login as</Label>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => handleInputChange('role', 'user')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-300",
                formData.role === 'user'
                  ? "border-pulse-500 bg-pulse-50 text-pulse-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              )}
            >
              <User className="w-4 h-4" />
              <span className="font-medium">User</span>
            </button>
            <button
              type="button"
              onClick={() => handleInputChange('role', 'admin')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-300",
                formData.role === 'admin'
                  ? "border-pulse-500 bg-pulse-50 text-pulse-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              )}
            >
              <Shield className="w-4 h-4" />
              <span className="font-medium">Admin</span>
            </button>
          </div>
          {formData.role === 'admin' && (
            <p className="text-xs text-pulse-600 mt-1">
              Admin access includes user management and system controls
            </p>
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
              autoFocus
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
              placeholder="Enter your password"
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

        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={formData.rememberMe}
            onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
          />
          <Label htmlFor="remember" className="text-sm text-gray-600">
            Remember me
          </Label>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-pulse-500 to-pulse-600 hover:from-pulse-600 hover:to-pulse-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        {isSubmitting ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Signing In...</span>
          </div>
        ) : (
          `Sign In as ${formData.role === 'admin' ? 'Admin' : 'User'}`
        )}
      </Button>
    </form>
  );
};
