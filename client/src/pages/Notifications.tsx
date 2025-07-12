
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Trash2, CheckCircle, Filter } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const Notifications: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();
  
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      new_answer: '💬',
      comment_reply: '💭',
      mention: '🏷️',
      message_received: '📩',
      answer_accepted: '✅',
      system_announcement: '📣'
    };
    return iconMap[type as keyof typeof iconMap] || '🔔';
  };

  const getNotificationColor = (type: string) => {
    const colorMap = {
      new_answer: 'bg-blue-100 border-blue-200',
      comment_reply: 'bg-green-100 border-green-200',
      mention: 'bg-yellow-100 border-yellow-200',
      message_received: 'bg-purple-100 border-purple-200',
      answer_accepted: 'bg-emerald-100 border-emerald-200',
      system_announcement: 'bg-orange-100 border-orange-200'
    };
    return colorMap[type as keyof typeof colorMap] || 'bg-gray-100 border-gray-200';
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(nId => nId !== id)
        : [...prev, id]
    );
  };

  const bulkMarkAsRead = () => {
    selectedNotifications.forEach(id => markAsRead(id));
    setSelectedNotifications([]);
  };

  const bulkDelete = () => {
    selectedNotifications.forEach(id => deleteNotification(id));
    setSelectedNotifications([]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PlatformNavbar />
        <div className="flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformNavbar />
      
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link 
                to="/questions" 
                className="flex items-center space-x-2 text-gray-600 hover:text-pulse-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Questions</span>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
                <p className="text-gray-600">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Filter Buttons */}
                <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border">
                  <Button
                    variant={filter === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="h-8"
                  >
                    All
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setFilter('unread')}
                    className="h-8"
                  >
                    Unread
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </div>
                
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Mark All Read</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedNotifications.length > 0 && (
            <div className="mb-6 p-4 bg-white rounded-lg border border-pulse-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={bulkMarkAsRead}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Mark as Read</span>
                </Button>
                <Button
                  onClick={bulkDelete}
                  variant="destructive"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h2>
                <p className="text-gray-600 mb-6">
                  {filter === 'unread' 
                    ? "You're all caught up! Check back later for new updates."
                    : "When you get notifications, they'll appear here."}
                </p>
                <Link
                  to="/questions"
                  className="inline-flex items-center px-6 py-3 bg-pulse-500 text-white rounded-lg font-medium hover:bg-pulse-600 transition-colors"
                >
                  Explore Questions
                </Link>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "group bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg",
                    !notification.isRead 
                      ? "border-pulse-200 shadow-md" 
                      : "border-gray-200 hover:border-gray-300",
                    selectedNotifications.includes(notification.id) && "ring-2 ring-pulse-500 ring-opacity-50"
                  )}
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelection(notification.id)}
                        className="mt-2 h-4 w-4 text-pulse-600 focus:ring-pulse-500 border-gray-300 rounded"
                      />
                      
                      {/* Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl",
                        getNotificationColor(notification.type)
                      )}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {!notification.isRead && (
                              <Badge variant="default" className="bg-pulse-500">
                                New
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                onClick={() => !notification.isRead && markAsRead(notification.id)}
                                className="text-pulse-600 hover:text-pulse-700 font-medium text-sm hover:underline"
                              >
                                View Details →
                              </Link>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {!notification.isRead ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                                className="flex items-center space-x-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                              >
                                <Eye className="w-4 h-4" />
                                <span>Mark Read</span>
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center space-x-1 text-gray-500 cursor-default"
                                disabled
                              >
                                <EyeOff className="w-4 h-4" />
                                <span>Read</span>
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                              className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
