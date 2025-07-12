
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketEvents {
  'notification:new': (data: any) => void;
  'notification:read': (data: any) => void;
  'message:received': (data: any) => void;
  'user:online': (data: any) => void;
  'user:offline': (data: any) => void;
  'chat:message': (data: any) => void;
  'chat:typing': (data: any) => void;
  'chat:stop-typing': (data: any) => void;
}

interface SocketContextType {
  isConnected: boolean;
  emit: (event: string, data: any) => void;
  on: <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => void;
  off: <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Get JWT token from storage
    const storedUser = localStorage.getItem('stackit_user') || sessionStorage.getItem('stackit_user');
    let token = '';
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        token = userData.token;
      } catch (error) {
        console.error('[Socket] Error parsing stored user data:', error);
      }
    }

    if (!token) {
      console.warn('[Socket] No JWT token found, cannot connect');
      return;
    }

    // Create socket connection with authentication
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3100', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.onAny((event, ...args) => {
      // Optionally log all events
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  const emit = (event: string, data: any) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  };

  const on = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (socket) {
      socket.on(event as string, callback);
    }
  };

  const off = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    if (socket) {
      socket.off(event as string, callback);
    }
  };

  const value: SocketContextType = {
    isConnected,
    emit,
    on,
    off
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
