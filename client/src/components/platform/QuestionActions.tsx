
import React from 'react';
import { MessageSquare, UserPlus, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface QuestionActionsProps {
  questionId: number;
  authorId: number;
  authorUsername: string;
  authorName: string;
  tags: string[];
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({
  questionId,
  authorId,
  authorUsername,
  authorName,
  tags
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleMessageAuthor = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to send messages to other users.",
        variant: "destructive"
      });
      return;
    }

    // --- MOCK CONVERSATION LOGIC ---
    const conversationsKey = 'mock_conversations';
    let conversations = [];
    try {
      conversations = JSON.parse(localStorage.getItem(conversationsKey) || '[]');
    } catch (e) {
      conversations = [];
    }

    // Try to find an existing conversation with this author
    let conversation = conversations.find((conv: any) =>
      (conv.participant && conv.participant.id === authorId)
    );

    // If not found, create a new one
    if (!conversation) {
      const newId = (conversations.length + 1).toString();
      conversation = {
        id: newId,
        participant: {
          id: authorId,
          username: authorUsername,
          firstName: authorName.split('_')[0] || authorName,
          lastName: authorName.split('_')[1] || '',
          avatarUrl: undefined,
          isOnline: true,
          lastSeen: new Date()
        },
        lastMessage: '',
        unreadCount: 0,
        updatedAt: new Date()
      };
      conversations.push(conversation);
      localStorage.setItem(conversationsKey, JSON.stringify(conversations));
    }

    // Detect mobile or desktop
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // On mobile, navigate to the thread route
      navigate(`/messages/${conversation.id}`);
    } else {
      // On desktop, store the selected conversation and go to /messages
      localStorage.setItem('selected_conversation_id', conversation.id);
      navigate('/messages');
    }
    toast({
      title: "Starting conversation",
      description: `Opening chat with ${authorName} about this question.`,
    });
  };

  const handleFollowQuestion = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to follow questions.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Following question",
      description: "You'll receive notifications about new answers and updates.",
    });
  };

  const handleJoinDiscussion = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to join community discussions.",
        variant: "destructive"
      });
      return;
    }

    // Navigate to community discussions
    navigate(`/messages/community`);
    toast({
      title: "Joining community discussion",
      description: `Welcome to the community discussions!`,
    });
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Check out this question',
        url: currentUrl
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(currentUrl);
        toast({ 
          title: "Link copied!", 
          description: "Question link copied to clipboard." 
        });
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(currentUrl);
      toast({ 
        title: "Link copied!", 
        description: "Question link copied to clipboard." 
      });
    }
  };

  return (
    <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
      <Button
        variant="outline"
        size="sm"
        onClick={handleMessageAuthor}
        className="flex items-center space-x-2 hover:bg-pulse-50 hover:border-pulse-200 transition-all duration-300"
      >
        <MessageSquare className="h-4 w-4" />
        <span>Message {authorName}</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFollowQuestion}
        className="flex items-center space-x-2 hover:bg-orange-50 hover:border-orange-200 transition-all duration-300"
      >
        <Bell className="h-4 w-4" />
        <span>Follow</span>
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleJoinDiscussion}
        className="flex items-center space-x-2 hover:bg-green-50 hover:border-green-200 transition-all duration-300"
      >
        <UserPlus className="h-4 w-4" />
        <span>Join Discussion</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
