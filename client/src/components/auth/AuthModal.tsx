
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  redirectTo?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
  redirectTo
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
      <DialogContent className="max-w-md w-full mx-4 p-0 overflow-hidden">
        <div className="bg-white rounded-2xl shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('login')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                  activeTab === 'login'
                    ? "bg-pulse-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-pulse-600 hover:bg-pulse-50"
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setActiveTab('signup')}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300",
                  activeTab === 'signup'
                    ? "bg-pulse-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-pulse-600 hover:bg-pulse-50"
                )}
              >
                Sign Up
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'login' ? (
              <LoginForm onSuccess={onClose} redirectTo={redirectTo} />
            ) : (
              <SignupForm onSuccess={onClose} redirectTo={redirectTo} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
