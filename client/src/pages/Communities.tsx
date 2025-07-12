
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Users,
  MessageSquare,
  Plus,
  TrendingUp,
  Globe,
  Lock,
  Crown,
  Filter,
  SortAsc,
  Heart
} from 'lucide-react';
import { Community } from '@/types/community';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Mock data for communities
const mockCommunities: Community[] = [
  {
    id: '1',
    name: 'React Developers',
    slug: 'react-developers',
    description: 'Everything about React, from basics to advanced patterns',
    longDescription: 'A thriving community for React developers of all skill levels...',
    coverImageUrl: '/lovable-uploads/22d31f51-c174-40a7-bd95-00e4ad00eaf3.png',
    memberCount: 15420,
    questionCount: 2840,
    isJoined: true,
    isPrivate: false,
    createdAt: new Date('2023-01-15'),
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    creator: { id: '1', username: 'react_master', avatarUrl: '/placeholder-avatar.jpg' },
    moderators: [
      { id: '1', username: 'react_master', avatarUrl: '/placeholder-avatar.jpg', role: 'admin' },
      { id: '2', username: 'jsx_guru', avatarUrl: '/placeholder-avatar.jpg', role: 'moderator' }
    ]
  },
  {
    id: '2',
    name: 'Python & AI',
    slug: 'python-ai',
    description: 'Python programming and artificial intelligence discussions',
    coverImageUrl: '/lovable-uploads/5663820f-6c97-4492-9210-9eaa1a8dc415.png',
    memberCount: 8934,
    questionCount: 1567,
    isJoined: false,
    isPrivate: false,
    createdAt: new Date('2023-02-20'),
    tags: ['Python', 'AI', 'Machine Learning', 'Data Science'],
    creator: { id: '3', username: 'py_wizard', avatarUrl: '/placeholder-avatar.jpg' },
    moderators: []
  },
  {
    id: '3',
    name: 'DevOps Masters',
    slug: 'devops-masters',
    description: 'DevOps practices, CI/CD, and cloud infrastructure',
    coverImageUrl: '/lovable-uploads/af412c03-21e4-4856-82ff-d1a975dc84a9.png',
    memberCount: 6743,
    questionCount: 892,
    isJoined: false,
    isPrivate: false,
    createdAt: new Date('2023-03-10'),
    tags: ['DevOps', 'Docker', 'Kubernetes', 'AWS', 'CI/CD'],
    creator: { id: '4', username: 'devops_pro', avatarUrl: '/placeholder-avatar.jpg' },
    moderators: []
  },
  {
    id: '4',
    name: 'UI/UX Design Hub',
    slug: 'ui-ux-design',
    description: 'Design discussions, trends, and best practices',
    coverImageUrl: '/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png',
    memberCount: 4521,
    questionCount: 678,
    isJoined: true,
    isPrivate: false,
    createdAt: new Date('2023-04-05'),
    tags: ['Design', 'UI', 'UX', 'Figma', 'Prototyping'],
    creator: { id: '5', username: 'design_lead', avatarUrl: '/placeholder-avatar.jpg' },
    moderators: []
  },
  {
    id: '5',
    name: 'Blockchain Innovators',
    slug: 'blockchain-innovators',
    description: 'Blockchain technology, Web3, and cryptocurrency development',
    coverImageUrl: '/lovable-uploads/dc13e94f-beeb-4671-8a22-0968498cdb4c.png',
    memberCount: 3276,
    questionCount: 445,
    isJoined: false,
    isPrivate: true,
    createdAt: new Date('2023-05-12'),
    tags: ['Blockchain', 'Web3', 'Solidity', 'DeFi', 'NFT'],
    creator: { id: '6', username: 'crypto_dev', avatarUrl: '/placeholder-avatar.jpg' },
    moderators: []
  }
];

const Communities = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('members');
  const [filterBy, setFilterBy] = useState('all');
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(
    mockCommunities.filter(c => c.isJoined).map(c => c.id)
  );

  const filteredAndSortedCommunities = useMemo(() => {
    let filtered = mockCommunities.filter(community => {
      const matchesSearch = 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'joined' && joinedCommunities.includes(community.id)) ||
        (filterBy === 'public' && !community.isPrivate) ||
        (filterBy === 'private' && community.isPrivate);

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return b.memberCount - a.memberCount;
        case 'questions':
          return b.questionCount - a.questionCount;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy, filterBy, joinedCommunities]);

  const handleJoinCommunity = (communityId: string) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    setJoinedCommunities(prev => 
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    );

    const community = mockCommunities.find(c => c.id === communityId);
    if (community) {
      toast({
        title: joinedCommunities.includes(communityId) ? "Left community" : "Joined community!",
        description: `You ${joinedCommunities.includes(communityId) ? 'left' : 'joined'} ${community.name}`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Discover Communities
              </h1>
              <p className="text-gray-600">
                Join communities that match your interests and expertise
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-pulse-600">
                {mockCommunities.length}
              </div>
              <div className="text-sm text-gray-500">communities</div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/create-community')}
            className="bg-pulse-600 hover:bg-pulse-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Start Your Own Community
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-border p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="questions">Most Questions</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedCommunities.map((community, index) => (
            <Card 
              key={community.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 opacity-0 animate-fade-in bg-white"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                {community.coverImageUrl && (
                  <img
                    src={community.coverImageUrl}
                    alt={community.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  {community.isPrivate ? (
                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                      <Lock className="h-3 w-3 mr-1" />
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <Globe className="h-3 w-3 mr-1" />
                      Public
                    </Badge>
                  )}
                  {joinedCommunities.includes(community.id) && (
                    <Badge className="bg-pulse-500 text-white">
                      <Heart className="h-3 w-3 mr-1" />
                      Joined
                    </Badge>
                  )}
                </div>
              </div>

              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {community.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {community.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {community.memberCount.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {community.questionCount.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {community.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {community.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{community.tags.length - 3}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={community.creator.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {community.creator.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">
                      by @{community.creator.username}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/community/${community.slug}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleJoinCommunity(community.id)}
                      className={
                        joinedCommunities.includes(community.id)
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-pulse-600 hover:bg-pulse-700"
                      }
                    >
                      {joinedCommunities.includes(community.id) ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAndSortedCommunities.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-border p-12 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria, or create a new community!
            </p>
            <Button
              onClick={() => navigate('/create-community')}
              className="bg-pulse-600 hover:bg-pulse-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Community
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;
