
import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Message, Conversation, TypingIndicator } from '@/types/messaging';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const { emit, on, off, isConnected: socketConnected } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();

  // Initialize messages
  useEffect(() => {
    setIsLoading(true);
    const fetchMessages = async () => {
      try {
        const storedUser = localStorage.getItem('stackit_user') || sessionStorage.getItem('stackit_user');
        let token = '';
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            token = userData.token;
          } catch (error) {}
        }
        if (!token) {
          setMessages([]);
          setIsLoading(false);
          return;
        }
        const response = await axios.get(
          (import.meta.env.VITE_API_URL || 'http://localhost:3100') + `/api/chats/${conversationId}/messages`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        setMessages((response.data.messages || []).map((m: any) => ({
          ...m,
          createdAt: new Date(m.created_at),
          updatedAt: new Date(m.updated_at || m.created_at)
        })));
      } catch (err) {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
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
