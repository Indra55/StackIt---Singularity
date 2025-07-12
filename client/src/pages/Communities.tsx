
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, MessageSquare, Plus, TrendingUp, Globe, Lock, Crown, Filter, SortAsc, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { apiGet, apiPost } from '@/lib/api';

const Communities = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('members');
  const [filterBy, setFilterBy] = useState('all');
  const [communities, setCommunities] = useState<any[]>([]);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet('/api/communities');
        if (data.status === 'success' && Array.isArray(data.communities)) {
          setCommunities(data.communities);
        } else {
          setError('Failed to load communities');
        }
      } catch (err: any) {
        setError('Failed to load communities');
      } finally {
        setLoading(false);
      }
    };
    fetchCommunities();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchJoined = async () => {
      try {
        const data = await apiGet('/api/communities/user/subscribed');
        if (data.status === 'success' && Array.isArray(data.communities)) {
          setJoinedCommunities(data.communities.map((c: any) => c.name));
        }
      } catch {}
    };
    fetchJoined();
  }, [isAuthenticated]);

  const filteredAndSortedCommunities = useMemo(() => {
    let filtered = communities.filter(community => {
      const matchesSearch = 
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = 
        filterBy === 'all' ||
        (filterBy === 'joined' && joinedCommunities.includes(community.name)) ||
        (filterBy === 'public' && community.is_public) ||
        (filterBy === 'private' && !community.is_public);

      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'members':
          return (b.member_count || 0) - (a.member_count || 0);
        case 'questions':
          return (b.post_count || 0) - (a.post_count || 0);
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [searchQuery, sortBy, filterBy, joinedCommunities, communities]);

  const handleJoinCommunity = async (communityName: string) => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    const isJoined = joinedCommunities.includes(communityName);
    try {
      if (isJoined) {
        await apiPost(`/api/communities/${communityName}/leave`, {});
        setJoinedCommunities(prev => prev.filter(name => name !== communityName));
      } else {
        await apiPost(`/api/communities/${communityName}/join`, {});
        setJoinedCommunities(prev => [...prev, communityName]);
      }
      const community = communities.find(c => c.name === communityName);
      if (community) {
        toast({
          title: isJoined ? 'Left community' : 'Joined community!',
          description: `You ${isJoined ? 'left' : 'joined'} ${community.name}`,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to update community membership',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      <div className="container mx-auto px-6 py-8">
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
                {loading ? '...' : communities.length}
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
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">Loading communities...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCommunities.map((community) => (
              <Card key={community.name} className="overflow-hidden">
                {/* Community Cover Image */}
                <div className="w-full h-28 bg-gray-100 relative">
                  <img
                    src="/combg.jpg"
                    alt="Community Cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 z-10">
                    {community.is_public ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        <Globe className="h-3 w-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {joinedCommunities.includes(community.name) && (
                      <Badge className="bg-pulse-500 text-white">
                        <Heart className="h-3 w-3 mr-1" />
                        Joined
                      </Badge>
                    )}
                  </div>
                </div>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={"/placeholder-avatar.jpg"} />
                        <AvatarFallback className="text-xs">
                          {community.created_by_username?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        by @{community.created_by_username}
                      </span>
                    </div>
                    {/* Responsive button group */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/community/${community.name}`)}
                        className="w-full sm:w-auto"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleJoinCommunity(community.name)}
                        className={
                          (joinedCommunities.includes(community.name)
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-pulse-600 hover:bg-pulse-700") +
                          " w-full sm:w-auto"
                        }
                      >
                        {joinedCommunities.includes(community.name) ? 'Joined' : 'Join'}
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="font-bold text-lg text-gray-900 mb-1">{community.name}</div>
                    <div className="text-gray-600 text-sm mb-2 line-clamp-2">{community.description}</div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span><Users className="inline w-4 h-4 mr-1" />{community.member_count || 0} members</span>
                      <span><MessageSquare className="inline w-4 h-4 mr-1" />{community.post_count || 0} questions</span>
                      <span><TrendingUp className="inline w-4 h-4 mr-1" />{new Date(community.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;
