import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  reputation: number;
  role: 'user' | 'admin';
  isVerified: boolean;
  isBanned: boolean;
  createdAt: Date;
  communities: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean, role?: 'user' | 'admin') => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatarFile?: File;
  communities: string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useRequireAuth = () => {
  const auth = useAuth();
  if (!auth.isAuthenticated) {
    throw new Error('Authentication required');
  }
  return auth;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for stored authentication data
    const storedUser = localStorage.getItem('stackit_user');
    const sessionUser = sessionStorage.getItem('stackit_user');
    
    if (storedUser || sessionUser) {
      try {
        const userData = JSON.parse(storedUser || sessionUser || '');
        setAuthState({
          user: { ...userData, createdAt: new Date(userData.createdAt) },
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('stackit_user');
        sessionStorage.removeItem('stackit_user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string, rememberMe = false, role: 'user' | 'admin' = 'user') => {
    // Mock login implementation - replace with actual API call
    const mockUser: User = {
      id: role === 'admin' ? 'admin-1' : '1',
      username: role === 'admin' ? 'admin' : email.split('@')[0],
      email,
      firstName: role === 'admin' ? 'Admin' : 'John',
      lastName: role === 'admin' ? 'User' : 'Doe',
      avatarUrl: undefined,
      reputation: role === 'admin' ? 5000 : 1520,
      role: role,
      isVerified: true,
      isBanned: false,
      createdAt: new Date(),
      communities: role === 'admin' ? ['all'] : ['react', 'javascript', 'typescript']
    };

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('stackit_user', JSON.stringify(mockUser));

    setAuthState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const signup = async (userData: SignupData) => {
    // Mock signup implementation - replace with actual API call
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatarUrl: userData.avatarFile ? URL.createObjectURL(userData.avatarFile) : undefined,
      reputation: 0,
      role: 'user',
      isVerified: false,
      isBanned: false,
      createdAt: new Date(),
      communities: userData.communities
    };

    localStorage.setItem('stackit_user', JSON.stringify(newUser));

    setAuthState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    localStorage.removeItem('stackit_user');
    sessionStorage.removeItem('stackit_user');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (updates: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...updates };
      const storage = localStorage.getItem('stackit_user') ? localStorage : sessionStorage;
      storage.setItem('stackit_user', JSON.stringify(updatedUser));
      
      setAuthState(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
