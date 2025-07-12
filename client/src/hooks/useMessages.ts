
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Message, Conversation, TypingIndicator } from '@/types/messaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const { emit, on, off, isConnected: socketConnected } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();

  // Mock data for development
  const mockMessages: Message[] = [
    {
      id: '1',
      conversationId,
      senderId: '2',
      sender: {
        id: '2',
        username: 'sarah_dev',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        isOnline: true,
        lastSeen: new Date()
      },
      content: 'Hey! I saw your question about React hooks. I think I can help with that.',
      messageType: 'text',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 10),
      updatedAt: new Date(Date.now() - 1000 * 60 * 10)
    },
    {
      id: '2',
      conversationId,
      senderId: user?.id || '1',
      sender: {
        id: user?.id || '1',
        username: user?.username || 'current_user',
        email: user?.email || 'user@example.com',
        firstName: user?.firstName || 'You',
        lastName: user?.lastName || '',
        isOnline: true,
        lastSeen: new Date()
      },
      content: 'That would be amazing! I\'m struggling with useEffect dependencies.',
      messageType: 'text',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 8),
      updatedAt: new Date(Date.now() - 1000 * 60 * 8)
    },
    {
      id: '3',
      conversationId,
      senderId: '2',
      sender: {
        id: '2',
        username: 'sarah_dev',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Johnson',
        isOnline: true,
        lastSeen: new Date()
      },
      content: `useEffect(() => {
  // This runs on every render
  fetchData();
}, []); // Empty dependency array means it only runs once

useEffect(() => {
  // This runs when 'count' changes
  updateCounter();
}, [count]);`,
      messageType: 'code',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      updatedAt: new Date(Date.now() - 1000 * 60 * 5)
    },
    {
      id: '4',
      conversationId,
      senderId: user?.id || '1',
      sender: {
        id: user?.id || '1',
        username: user?.username || 'current_user',
        email: user?.email || 'user@example.com',
        firstName: user?.firstName || 'You',
        lastName: user?.lastName || '',
        isOnline: true,
        lastSeen: new Date()
      },
      content: 'Perfect! That makes so much sense now. Thank you! 🎉',
      messageType: 'text',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 2)
    }
  ];

  // Initialize messages
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Only show mock messages for demo conversations
      if (['1', '2', '3'].includes(conversationId)) {
        setMessages(mockMessages);
      } else {
        setMessages([]);
      }
      setIsLoading(false);
    }, 500);
  }, [conversationId]);

  // Socket connection status
  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  // Socket event handlers
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversationId) {
        setMessages(prev => [...prev, message]);
        
        // Show toast for new messages from others
        if (message.senderId !== user?.id) {
          toast({
            title: `${message.sender.firstName} sent a message`,
            description: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
          });
        }
      }
    };

    const handleTyping = (indicator: TypingIndicator) => {
      if (indicator.conversationId === conversationId && indicator.userId !== user?.id) {
        setTypingIndicators(prev => {
          const existing = prev.find(t => t.userId === indicator.userId);
          if (existing) return prev;
          return [...prev, indicator];
        });
      }
    };

    const handleStopTyping = ({ userId, conversationId: convId }: { userId: string; conversationId: string }) => {
      if (convId === conversationId) {
        setTypingIndicators(prev => prev.filter(t => t.userId !== userId));
      }
    };

    on('chat:message', handleNewMessage);
    on('chat:typing', handleTyping);
    on('chat:stop-typing', handleStopTyping);

    return () => {
      off('chat:message', handleNewMessage);
      off('chat:typing', handleTyping);
      off('chat:stop-typing', handleStopTyping);
    };
  }, [conversationId, user?.id, on, off, toast]);

  const sendMessage = useCallback((content: string, messageType: 'text' | 'code' = 'text') => {
    if (!user || !content.trim()) return;

    const newMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user.id,
      sender: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || 'You',
        lastName: user.lastName || '',
        isOnline: true,
        lastSeen: new Date()
      },
      content: content.trim(),
      messageType,
      status: 'sending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Optimistically add message
    setMessages(prev => [...prev, newMessage]);

    // Emit to socket
    emit('chat:message', newMessage);

    // Simulate message status updates
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    }, 500);

    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === newMessage.id 
            ? { ...msg, status: 'delivered' as const }
            : msg
        )
      );
    }, 1000);
  }, [user, conversationId, emit]);

  const startTyping = useCallback(() => {
    if (!user) return;
    
    emit('chat:typing', {
      userId: user.id,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName || 'You',
        lastName: user.lastName || '',
        isOnline: true,
        lastSeen: new Date()
      },
      conversationId
    });
  }, [user, conversationId, emit]);

  const stopTyping = useCallback(() => {
    if (!user) return;
    
    emit('chat:stop-typing', {
      userId: user.id,
      conversationId
    });
  }, [user, conversationId, emit]);

  return {
    messages,
    conversation,
    typingIndicators,
    isLoading,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  };
};
