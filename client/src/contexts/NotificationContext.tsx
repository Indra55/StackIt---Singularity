
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Notification } from '@/types/notifications';
import axios from 'axios';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { isConnected, on, off } = useSocket();
  const { isAuthenticated, user } = useAuth();

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const storedUser = localStorage.getItem('stackit_user') || sessionStorage.getItem('stackit_user');
        let token = '';
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token;
          } catch (error) {}
        }
        if (!token) return;
        const response = await axios.get(
          (import.meta.env.VITE_API_URL || 'http://localhost:3100') + '/api/notifications',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setNotifications((response.data.notifications || []).map((n: any) => ({
          id: n.id.toString(),
          type: n.type,
          title: n.title,
          message: n.message,
          isRead: n.is_read,
          createdAt: new Date(n.created_at),
          userId: n.user_id?.toString?.() || '',
          relatedId: n.related_id?.toString?.(),
          relatedType: n.related_type,
          actionUrl: n.action_url
        })));
      } catch (err) {
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, [isAuthenticated, user]);

  // Socket event handlers
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;
    const handleNewNotification = (data: any) => {
      const notification: Notification = {
        id: data.id?.toString() || Date.now().toString(),
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        userId: data.user_id?.toString?.() || '',
        relatedId: data.related_id?.toString?.(),
        relatedType: data.related_type,
        actionUrl: data.action_url
      };
      setNotifications(prev => [notification, ...prev]);
    };
    on('notification:new', handleNewNotification);
    return () => {
      off('notification:new', handleNewNotification);
    };
  }, [isConnected, isAuthenticated, on, off]);

  const addNotification = (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // Optionally, update backend
    try {
      const storedUser = localStorage.getItem('stackit_user') || sessionStorage.getItem('stackit_user');
      let token = '';
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (error) {}
      }
      if (!token) return;
      await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:3100') + `/api/notifications/${id}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // Optionally, update backend
    try {
      const storedUser = localStorage.getItem('stackit_user') || sessionStorage.getItem('stackit_user');
      let token = '';
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (error) {}
      }
      if (!token) return;
      await axios.put((import.meta.env.VITE_API_URL || 'http://localhost:3100') + '/api/notifications/read-all', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Optionally, update backend
    try {
      const storedUser = localStorage.getItem('stackit_user') || sessionStorage.getItem('stackit_user');
      let token = '';
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          token = userData.token;
        } catch (error) {}
      }
      if (!token) return;
      await axios.delete((import.meta.env.VITE_API_URL || 'http://localhost:3100') + `/api/notifications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {}
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
