
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'code';
  status: 'sending' | 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  thumbnailUrl?: string;
}

export interface MessageReaction {
  id: string;
  emoji: string;
  userId: string;
  user: User;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface TypingIndicator {
  userId: string;
  user: User;
  conversationId: string;
}

export interface SocketEvents {
  'chat:message': Message;
  'chat:typing': TypingIndicator;
  'chat:stop-typing': { userId: string; conversationId: string };
  'chat:read': { messageId: string; userId: string };
  'user:online': { userId: string };
  'user:offline': { userId: string };
  'notification:new': { type: string; data: any };
}
