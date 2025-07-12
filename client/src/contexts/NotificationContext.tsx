
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { Notification, NotificationType } from '@/types/notifications';

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

  // Initialize with mock notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'new_answer',
          title: 'New Answer',
          message: 'Ayush replied to your question "React State Bug"',
          isRead: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000),
          userId: user.id,
          relatedId: 'question-1',
          relatedUrl: '/questions/1'
        },
        {
          id: '2',
          type: 'mention',
          title: 'You were mentioned',
          message: '@pranav_dev mentioned you in a reply',
          isRead: false,
          createdAt: new Date(Date.now() - 15 * 60 * 1000),
          userId: user.id,
          relatedId: 'answer-5',
          relatedUrl: '/questions/2#answer-5'
        },
        {
          id: '3',
          type: 'answer_accepted',
          title: 'Answer Accepted',
          message: 'Your answer was accepted by @rahul',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userId: user.id,
          relatedId: 'answer-3',
          relatedUrl: '/questions/3#answer-3'
        }
      ];
      setNotifications(mockNotifications);
    }
  }, [isAuthenticated, user]);

  // Socket event handlers
  useEffect(() => {
    if (!isConnected || !isAuthenticated) return;

    const handleNewNotification = (data: any) => {
      const notification: Notification = {
        id: data.id || Date.now().toString(),
        type: data.type,
        title: data.title,
        message: data.message,
        isRead: false,
        createdAt: new Date(),
        userId: data.userId,
        relatedId: data.relatedId,
        relatedUrl: data.relatedUrl
      };
      
      setNotifications(prev => [notification, ...prev]);
    };

    const handleNotificationRead = (data: any) => {
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === data.id 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    };

    on('notification:new', handleNewNotification);
    on('notification:read', handleNotificationRead);

    return () => {
      off('notification:new', handleNewNotification);
      off('notification:read', handleNotificationRead);
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

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
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
