
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Phone, Video, Wifi, WifiOff, Home } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { MessageInput } from '@/components/messaging/MessageInput';
import { TypingIndicator } from '@/components/messaging/TypingIndicator';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const MessageThread = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    messages,
    typingIndicators,
    isLoading,
    isConnected,
    sendMessage,
    startTyping,
    stopTyping
  } = useMessages(conversationId || '');

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  if (!conversationId) {
    navigate('/messages');
    return null;
  }

  const otherParticipant = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    username: 'sarah_dev',
    isOnline: true
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white md:hidden">
        {/* Mobile Thread Header */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/messages')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/questions')}
                className="hover:bg-pulse-50"
              >
                <Home className="h-4 w-4" />
              </Button>
              
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-pulse-500 to-pulse-600 text-white">
                    SJ
                  </AvatarFallback>
                </Avatar>
                {otherParticipant.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <div>
                <h2 className="font-semibold text-gray-900">
                  {otherParticipant.firstName} {otherParticipant.lastName}
                </h2>
                <div className="flex items-center space-x-2">
                  <p className={cn(
                    "text-sm",
                    otherParticipant.isOnline ? "text-green-600" : "text-gray-500"
                  )}>
                    {otherParticipant.isOnline ? "Online" : "Offline"}
                  </p>
                  {isConnected ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" title="Voice call">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="Video call">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" title="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div 
          id="messages-container"
          className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg font-medium mb-2">Start the conversation</p>
                  <p className="text-sm">Send a message to begin chatting with {otherParticipant.firstName}</p>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === user?.id;
                    const showAvatar = !isOwn && (
                      index === 0 || 
                      messages[index - 1].senderId !== message.senderId ||
                      new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000
                    );
                    
                    return (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={isOwn}
                        showAvatar={showAvatar}
                        showTimestamp={true}
                      />
                    );
                  })}
                  
                  <TypingIndicator indicators={typingIndicators} />
                </>
              )}
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200">
          <MessageInput
            onSendMessage={sendMessage}
            placeholder={`Message ${otherParticipant.firstName}...`}
            disabled={!isConnected}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MessageThread;
