
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

export const useAuthActions = () => {
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    defaultTab: 'login' | 'signup';
    redirectTo?: string;
  }>({
    isOpen: false,
    defaultTab: 'login'
  });

  const { isAuthenticated } = useAuth();

  const requireAuth = (action: () => void, redirectTo?: string) => {
    if (isAuthenticated) {
      action();
    } else {
      setAuthModal({
        isOpen: true,
        defaultTab: 'login',
        redirectTo
      });
    }
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const AuthModalComponent = () => (
    <AuthModal
      isOpen={authModal.isOpen}
      onClose={closeAuthModal}
      defaultTab={authModal.defaultTab}
      redirectTo={authModal.redirectTo}
    />
  );

  return {
    requireAuth,
    AuthModalComponent
  };
};
