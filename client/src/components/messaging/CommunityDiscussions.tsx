
import React, { useState } from 'react';
import { Hash, Users, MessageCircle, TrendingUp, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Discussion {
  id: string;
  title: string;
  tag: string;
  description: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  messageCount: number;
  lastActivity: Date;
  isActive: boolean;
  trending: boolean;
}

const mockDiscussions: Discussion[] = [
  {
    id: '1',
    title: 'React 18 Best Practices',
    tag: 'React',
    description: 'Discussion about the latest React 18 features, concurrent rendering, and performance optimizations.',
    participants: [
      { id: '1', name: 'Sarah J.' },
      { id: '2', name: 'Alex C.' },
      { id: '3', name: 'Maya P.' },
      { id: '4', name: 'John D.' }
    ],
    messageCount: 127,
    lastActivity: new Date(Date.now() - 1000 * 60 * 15),
    isActive: true,
    trending: true
  },
  {
    id: '2',
    title: 'TypeScript Tips & Tricks',
    tag: 'TypeScript',
    description: 'Share your favorite TypeScript patterns, utility types, and advanced techniques.',
    participants: [
      { id: '5', name: 'Emma S.' },
      { id: '6', name: 'David L.' },
      { id: '7', name: 'Lisa M.' }
    ],
    messageCount: 89,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
    isActive: true,
    trending: false
  },
  {
    id: '3',
    title: 'CSS Grid vs Flexbox',
    tag: 'CSS',
    description: 'When to use CSS Grid vs Flexbox? Share your experiences and examples.',
    participants: [
      { id: '8', name: 'Mike K.' },
      { id: '9', name: 'Anna T.' }
    ],
    messageCount: 45,
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 8),
    isActive: false,
    trending: false
  }
];

export const CommunityDiscussions: React.FC = () => {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleJoinDiscussion = (discussion: Discussion) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to join community discussions.",
        variant: "destructive"
      });
      return;
    }

    navigate(`/messages/community/${discussion.id}`);
    toast({
      title: "Joining discussion",
      description: `Welcome to the ${discussion.title} discussion!`,
    });
  };

  const filteredDiscussions = selectedTag 
    ? mockDiscussions.filter(d => d.tag === selectedTag)
    : mockDiscussions;

  const getTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const popularTags = ['React', 'TypeScript', 'JavaScript', 'CSS', 'Node.js', 'Python'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Community Discussions</h2>
        <p className="text-gray-600">Join ongoing conversations about your favorite technologies</p>
      </div>

      {/* Tag Filters */}
      <Card className="bg-gradient-to-r from-pulse-50 to-orange-50 border-pulse-200">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              className={selectedTag === null 
                ? "bg-pulse-500 hover:bg-pulse-600" 
                : "hover:bg-pulse-50 hover:border-pulse-200"
              }
            >
              All Topics
            </Button>
            {popularTags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={selectedTag === tag 
                  ? "bg-pulse-500 hover:bg-pulse-600" 
                  : "hover:bg-pulse-50 hover:border-pulse-200"
                }
              >
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.map((discussion) => (
          <Card key={discussion.id} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className="bg-pulse-100 text-pulse-700 hover:bg-pulse-200"
                    >
                      <Hash className="h-3 w-3 mr-1" />
                      {discussion.tag}
                    </Badge>
                    {discussion.trending && (
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {discussion.isActive && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {discussion.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {discussion.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {discussion.participants.length} participants
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {discussion.messageCount} messages
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getTimeAgo(discussion.lastActivity)}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleJoinDiscussion(discussion)}
                      className="bg-pulse-500 hover:bg-pulse-600 transition-all duration-300"
                      size="sm"
                    >
                      Join Discussion
                    </Button>
                  </div>
                </div>
              </div>

              {/* Participant Avatars */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Recent participants:</span>
                    <div className="flex -space-x-2">
                      {discussion.participants.slice(0, 4).map((participant, index) => (
                        <Avatar key={participant.id} className="w-6 h-6 border-2 border-white">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-pulse-500 to-pulse-600 text-white text-xs">
                            {participant.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {discussion.participants.length > 4 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{discussion.participants.length - 4}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDiscussions.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
          <p className="text-gray-600">Try selecting a different topic or check back later.</p>
        </div>
      )}
    </div>
  );
};
