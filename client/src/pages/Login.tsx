
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

const Login = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="relative">
              <MessageSquare className="h-12 w-12 text-pulse-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pulse-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-pulse-600 to-pulse-400 bg-clip-text text-transparent">
              StackIt
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 animate-scale-in">
          <LoginForm 
            onSuccess={() => window.location.href = '/questions'} 
          />

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/auth/signup" 
                className="text-pulse-500 hover:text-pulse-600 font-medium hover:underline transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
