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

  const BACKEND_URL = 'http://localhost:3100';

  const login = async (email: string, password: string, rememberMe = false, role: 'user' | 'admin' = 'user') => {
    // Real login implementation
    const response = await fetch(`${BACKEND_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Login failed');
    }
    // Store token and user
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('stackit_token', data.token);
    storage.setItem('stackit_user', JSON.stringify({ ...data.user, createdAt: data.user.created_at }));
    setAuthState({
      user: { ...data.user, createdAt: new Date(data.user.created_at) },
      isAuthenticated: true,
      isLoading: false
    });
  };

  const signup = async (userData: SignupData) => {
    // Real signup implementation
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    if (userData.firstName) formData.append('first_name', userData.firstName);
    if (userData.lastName) formData.append('last_name', userData.lastName);
    if (userData.avatarFile) formData.append('avatar', userData.avatarFile);
    // Communities are not handled in backend registration, so skip for now

    // Use JSON if no avatar, otherwise use FormData
    let response, data;
    if (userData.avatarFile) {
      response = await fetch(`${BACKEND_URL}/users/register`, {
        method: 'POST',
        body: formData
      });
    } else {
      response = await fetch(`${BACKEND_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          first_name: userData.firstName,
          last_name: userData.lastName
        })
      });
    }
    data = await response.json();
    if (!response.ok || data.status !== 'success') {
      throw new Error(data.message || 'Signup failed');
    }
    // Store token and user
    localStorage.setItem('stackit_token', data.token);
    localStorage.setItem('stackit_user', JSON.stringify({ ...data.user, createdAt: data.user.created_at }));
    setAuthState({
      user: { ...data.user, createdAt: new Date(data.user.created_at) },
      isAuthenticated: true,
      isLoading: false
    });
    // If avatarFile was provided, upload avatar after registration
    if (userData.avatarFile) {
      const token = data.token;
      const avatarForm = new FormData();
      avatarForm.append('avatar', userData.avatarFile);
      await fetch(`${BACKEND_URL}/api/uploads/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: avatarForm
      });
      // Optionally, update user state with new avatar URL
    }
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
