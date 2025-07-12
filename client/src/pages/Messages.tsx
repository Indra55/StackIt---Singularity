import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, Search, Plus, ArrowLeft, Wifi, WifiOff, Home } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageBubble } from '@/components/messaging/MessageBubble';
import { MessageInput } from '@/components/messaging/MessageInput';
import { TypingIndicator } from '@/components/messaging/TypingIndicator';
import { useMessages } from '@/hooks/useMessages';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';

const Messages = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId || null);

  // On mount, check for selected_conversation_id in localStorage (for desktop navigation)
  React.useEffect(() => {
    const selectedId = localStorage.getItem('selected_conversation_id');
    if (selectedId) {
      setSelectedConversation(selectedId);
      localStorage.removeItem('selected_conversation_id');
    }
  }, []);

  const {
    messages,
    typingIndicators,
    isLoading,
    sendMessage
  } = useMessages(selectedConversation || '1');

  // Load conversations from localStorage if present
  const conversationsKey = 'mock_conversations';
  let storedConversations = [];
  try {
    storedConversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
  } catch (e) {
    storedConversations = [];
  }
  // Convert date strings to Date objects
  const parsedConversations = storedConversations.map((conv: any) => ({
    ...conv,
    updatedAt: conv.updatedAt ? new Date(conv.updatedAt) : new Date(),
    participant: {
      ...conv.participant,
      lastSeen: conv.participant && conv.participant.lastSeen ? new Date(conv.participant.lastSeen) : new Date(),
    },
  }));
  const mockConversations = parsedConversations.length > 0 ? parsedConversations : [
    {
      id: '1',
      participant: {
        id: '2',
        username: 'sarah_dev',
        firstName: 'Sarah',
        lastName: 'Johnson',
        avatarUrl: undefined,
        isOnline: true,
        lastSeen: new Date()
      },
      lastMessage: 'Perfect! That makes so much sense now. Thank you! 🎉',
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 2)
    },
    {
      id: '2',
      participant: {
        id: '3',
        username: 'code_master',
        firstName: 'Alex',
        lastName: 'Chen',
        avatarUrl: undefined,
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30)
      },
      lastMessage: 'Thanks for the detailed explanation on TypeScript generics!',
      unreadCount: 0,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
    },
    {
      id: '3',
      participant: {
        id: '4',
        username: 'js_ninja',
        firstName: 'Maya',
        lastName: 'Patel',
        avatarUrl: undefined,
        isOnline: true,
        lastSeen: new Date()
      },
      lastMessage: 'The solution you provided worked perfectly! 🎉',
      unreadCount: 1,
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
    }
  ];

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    if (window.innerWidth < 768) {
      navigate(`/messages/${conversationId}`);
    }
  };

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const selectedConversationData = mockConversations.find(c => c.id === selectedConversation);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('desktop-messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-2 sm:px-4 py-4 md:py-6 max-w-full">
          <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className={cn(
              "w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0 flex flex-col",
              selectedConversation && "hidden md:flex"
            )}>
              {/* Desktop Header */}
              <div className="hidden md:flex flex-col gap-0 p-0 border-b border-gray-100 bg-white/90">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 gap-6">
                  <div className="flex items-center gap-4 min-w-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate('/questions')}
                      className="hover:bg-pulse-50 flex-shrink-0 rounded-full p-2"
                    >
                      <Home className="h-5 w-5" />
                      <span className="sr-only">Home</span>
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap tracking-tight ml-6">Messages</h1>
                  </div>
                  <Button size="sm" className="bg-pulse-500 hover:bg-pulse-600 rounded-lg px-3 py-2 ml-6 shadow-sm text-base font-semibold">
                    <Plus className="h-5 w-5 mr-1" />
                    New
                  </Button>
                </div>
                <div className="px-6 pb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50 border border-gray-200 focus:bg-white focus:border-pulse-500 focus:ring-2 focus:ring-pulse-100 transition-all duration-300 text-sm md:text-base rounded-xl shadow-sm"
                    />
                  </div>
                </div>
                <div className="border-t border-gray-100" />
              </div>
              {/* Mobile Header */}
              <div className="md:hidden bg-white border-b border-gray-200 p-3 sm:p-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/questions')}
                      className="hover:bg-pulse-50"
                    >
                      <Home className="h-4 w-4" />
                    </Button>
                    <MessageSquare className="h-7 w-7 sm:h-8 sm:w-8 text-pulse-500" />
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">Messages</h1>
                    {isConnected ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Wifi className="h-4 w-4" />
                        <span className="text-xs">Online</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-red-500">
                        <WifiOff className="h-4 w-4" />
                        <span className="text-xs">Offline</span>
                      </div>
                    )}
                  </div>
                  <Button size="sm" className="bg-pulse-500 hover:bg-pulse-600">
                    <Plus className="h-4 w-4 mr-2" />
                    New Chat
                  </Button>
                </div>
              </div>
              {/* Mobile Search */}
              <div className="md:hidden p-3 sm:p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-pulse-500 text-sm"
                  />
                </div>
              </div>
              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {mockConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation.id)}
                    className={cn(
                      "p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-gray-50 flex items-center gap-3",
                      selectedConversation === conversation.id && "bg-pulse-50 border-l-4 border-l-pulse-500"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarImage src={conversation.participant.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-pulse-500 to-pulse-600 text-white">
                          {conversation.participant.firstName?.[0]}{conversation.participant.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                          {conversation.participant.firstName} {conversation.participant.lastName}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {formatLastSeen(conversation.updatedAt)}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <Badge variant="destructive" className="bg-red-500 hover:bg-red-600 animate-pulse">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 truncate mb-0.5">
                        @{conversation.participant.username}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Conversation Thread */}
            <div className={cn(
              "flex-1 flex flex-col min-w-0",
              !selectedConversation && "hidden md:flex"
            )}>
              {selectedConversation && selectedConversationData ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Conversation Header */}
                  <div className="p-3 sm:p-4 border-b border-gray-200 bg-white flex items-center gap-3 sm:gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden"
                      onClick={() => {
                        setSelectedConversation(null);
                        navigate('/messages');
                      }}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
                        <AvatarImage src={selectedConversationData.participant.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-pulse-500 to-pulse-600 text-white">
                          {selectedConversationData.participant.firstName?.[0]}{selectedConversationData.participant.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {selectedConversationData.participant.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-400 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                        {selectedConversationData.participant.firstName} {selectedConversationData.participant.lastName}
                      </h2>
                      <p className={cn(
                        "text-xs sm:text-sm",
                        selectedConversationData.participant.isOnline ? "text-green-600" : "text-gray-500"
                      )}>
                        {selectedConversationData.participant.isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                  {/* Messages Area */}
                  <div 
                    id="desktop-messages-container"
                    className="flex-1 p-2 sm:p-4 overflow-y-auto bg-gray-50 min-h-0"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pulse-500"></div>
                      </div>
                    ) : (
                      <>
                        {messages.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-lg font-medium mb-2">Start a conversation</p>
                            <p className="text-sm">Send a message to begin chatting with {selectedConversationData.participant.firstName}</p>
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
                  <div className="px-2 sm:px-4 py-2 sm:py-3 bg-white border-t border-gray-100 flex-shrink-0">
                    <MessageInput
                      onSendMessage={sendMessage}
                      placeholder={`Message ${selectedConversationData.participant.firstName}...`}
                      disabled={!isConnected}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-500 max-w-md">
                    <MessageSquare className="h-16 w-16 mx-auto mb-6 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Messages</h2>
                    <p className="text-gray-600 mb-6">
                      Connect with the community! Send direct messages to other developers, 
                      ask questions, and build meaningful connections.
                    </p>
                    <Button className="bg-pulse-500 hover:bg-pulse-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Start New Conversation
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Messages;
