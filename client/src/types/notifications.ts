
export interface Notification {
  id: string;
  type: 'new_answer' | 'comment_reply' | 'mention' | 'message_received' | 'answer_accepted' | 'system_announcement' | 'chat';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  userId: string;
  actionUrl?: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: {
    questionId?: string;
    answerId?: string;
    messageId?: string;
    mentionedBy?: string;
    answeredBy?: string;
  };
}

export type NotificationType = Notification['type'];

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading?: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
}
