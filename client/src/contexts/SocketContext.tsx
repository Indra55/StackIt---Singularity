
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [isConnected, setIsConnected] = useState(false);
  const [eventHandlers] = useState<Map<string, Function[]>>(new Map());

  useEffect(() => {
    // Mock WebSocket connection
    console.log('🚀 Initializing socket connection for user: admin');
    
    const connectSocket = () => {
      setTimeout(() => {
        setIsConnected(true);
        console.log('🔌 Mock WebSocket connected');
      }, 1000);
    };

    connectSocket();

    return () => {
      setIsConnected(false);
      eventHandlers.clear();
    };
  }, [eventHandlers]);

  const emit = (event: string, data: any) => {
    console.log(`📤 Emitting: ${event}`, data);
  };

  const on = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    const eventName = event as string;
    if (!eventHandlers.has(eventName)) {
      eventHandlers.set(eventName, []);
    }
    eventHandlers.get(eventName)?.push(callback);
    console.log(`👂 Socket listening to: ${eventName}`);
  };

  const off = <K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]) => {
    const eventName = event as string;
    const handlers = eventHandlers.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
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
