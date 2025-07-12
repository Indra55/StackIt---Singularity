
import React, { useState } from 'react';
import { Star, MessageSquare, Trophy, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Expert {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  reputation: number;
  specialties: string[];
  answersCount: number;
  helpfulVotes: number;
  isOnline: boolean;
  responseTime: string;
}

const mockExperts: Expert[] = [
  {
    id: '2',
    username: 'sarah_react_guru',
    firstName: 'Sarah',
    lastName: 'Johnson',
    reputation: 15420,
    specialties: ['React', 'TypeScript', 'Next.js'],
    answersCount: 342,
    helpfulVotes: 1284,
    isOnline: true,
    responseTime: '~2 hours'
  },
  {
    id: '3',
    username: 'alex_fullstack',
    firstName: 'Alex',
    lastName: 'Chen',
    reputation: 12890,
    specialties: ['Node.js', 'MongoDB', 'Express'],
    answersCount: 298,
    helpfulVotes: 967,
    isOnline: false,
    responseTime: '~4 hours'
  },
  {
    id: '4',
    username: 'maya_css_wizard',
    firstName: 'Maya',
    lastName: 'Patel',
    reputation: 9750,
    specialties: ['CSS', 'Tailwind', 'Design'],
    answersCount: 189,
    helpfulVotes: 743,
    isOnline: true,
    responseTime: '~1 hour'
  }
];

export const ExpertConnections: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const filteredExperts = mockExperts.filter(expert => {
    const matchesSearch = expert.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = !selectedTag || expert.specialties.some(spec => 
      spec.toLowerCase().includes(selectedTag.toLowerCase())
    );

    return matchesSearch && matchesTag;
  });

  const handleMessageExpert = (expert: Expert) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to message experts.",
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

    // Try to find an existing conversation with this expert
    let conversation = conversations.find((conv: any) =>
      (conv.participant && conv.participant.id === expert.id)
    );

    // If not found, create a new one
    if (!conversation) {
      const newId = (conversations.length + 1).toString();
      conversation = {
        id: newId,
        participant: {
          id: expert.id,
          username: expert.username,
          firstName: expert.firstName,
          lastName: expert.lastName,
          avatarUrl: expert.avatarUrl,
          isOnline: expert.isOnline,
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
      navigate(`/messages/${conversation.id}`);
    } else {
      localStorage.setItem('selected_conversation_id', conversation.id);
      navigate('/messages');
    }
    toast({
      title: "Starting conversation",
      description: `Opening chat with ${expert.firstName}, a ${expert.specialties[0]} expert.`,
    });
  };

  const popularTags = ['React', 'TypeScript', 'Node.js', 'Python', 'CSS', 'JavaScript'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect with Experts</h2>
        <p className="text-gray-600">Get personalized help from top contributors in the community</p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-gradient-to-r from-pulse-50 to-orange-50 border-pulse-200">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search experts by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-pulse-200 focus:border-pulse-500 focus:ring-2 focus:ring-pulse-100"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Popular Specialties:</p>
              <div className="flex flex-wrap gap-2">
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
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredExperts.map((expert) => (
          <Card key={expert.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={expert.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-pulse-500 to-pulse-600 text-white">
                      {expert.firstName[0]}{expert.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  {expert.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {expert.firstName} {expert.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">@{expert.username}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-700">
                      {expert.reputation.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {expert.specialties.slice(0, 3).map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Trophy className="h-3 w-3" />
                    <span>{expert.answersCount} answers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{expert.helpfulVotes} helpful</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-3">
                    Avg. response time: {expert.responseTime}
                  </p>
                  
                  <Button
                    onClick={() => handleMessageExpert(expert)}
                    className="w-full bg-pulse-500 hover:bg-pulse-600 transition-all duration-300"
                    size="sm"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Expert
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
          <p className="text-gray-600">Try adjusting your search or selected specialty.</p>
        </div>
      )}
    </div>
  );
};
