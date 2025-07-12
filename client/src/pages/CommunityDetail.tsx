import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, Calendar, Tag, Globe, Lock, Heart, Plus, Search, Filter, SortAsc } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Community, CommunityQuestion } from '@/types/community';
import { apiGet, apiPost } from '@/lib/api';
import QuestionCard from '@/components/platform/QuestionCard';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const CommunityDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // State
  const [community, setCommunity] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'members'>('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch community and posts
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setCommunity(null);
    setQuestions([]);
    const fetchData = async () => {
      try {
        // Fetch community details
        const commRes = await apiGet(`/api/communities/${slug}`);
        if (commRes.status !== 'success' || !commRes.community) {
          throw new Error('Community not found');
        }
        // Map backend fields to frontend Community type
        const c = commRes.community;
        const mappedCommunity = {
          id: c.id,
          name: c.name,
          slug: c.name, // backend uses name as slug
          description: c.description || '',
          longDescription: c.long_description || '',
          coverImageUrl: c.cover_image_url || '',
          memberCount: c.member_count || 0,
          questionCount: c.post_count || 0,
          isJoined: false, // will check below
          isPrivate: c.is_public === false,
          createdAt: c.created_at ? new Date(c.created_at) : new Date(),
          tags: c.tags || [],
          creator: { id: c.created_by, username: c.created_by_username, avatarUrl: '' },
          moderators: [], // not available in backend response
          rules: [], // not available in backend response
          resources: [], // not available in backend response
        };
        setCommunity(mappedCommunity);
        // Fetch posts/questions for this community
        const postsRes = await apiGet(`/api/communities/${slug}/posts`);
        let posts = postsRes.posts || [];
        // Map posts to CommunityQuestion type
        setQuestions(posts.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.content,
          author: {
            id: p.user_id,
            username: p.username,
            avatarUrl: '/placeholder-avatar.jpg',
            reputation: 0,
          },
          tags: p.tags || [],
          votes: (p.upvotes || 0) - (p.downvotes || 0),
          answers: p.answer_count || 0,
          views: p.view_count || 0,
          createdAt: p.created ? new Date(p.created) : new Date(),
          hasAcceptedAnswer: p.is_answered || false,
          communityId: c.id,
        })));
        // Check if user is joined (if authenticated)
        if (isAuthenticated && user) {
          try {
            const joinedRes = await apiGet('/api/communities/user/subscribed');
            if (joinedRes.status === 'success' && Array.isArray(joinedRes.communities)) {
              setIsJoined(joinedRes.communities.some((cm: any) => cm.name === c.name));
            }
          } catch {
            setIsJoined(false);
          }
        } else {
          setIsJoined(false);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load community');
        setCommunity(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, isAuthenticated, user]);

  // Filter and sort questions
  const filteredAndSortedQuestions = questions
    .filter(question => 
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'answers':
          return b.answers - a.answers;
        case 'views':
          return b.views - a.views;
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  // Join/Leave logic
  const handleJoinCommunity = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login');
      return;
    }
    if (!community) return;
    try {
      if (isJoined) {
        await apiPost(`/api/communities/${community.slug}/leave`, {});
        setIsJoined(false);
        toast({
          title: 'Left community',
          description: `You left r/${community.name}`,
        });
      } else {
        await apiPost(`/api/communities/${community.slug}/join`, {});
        setIsJoined(true);
        toast({
          title: 'Joined community!',
          description: `You joined r/${community.name}`,
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  // Show loading or error state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading community...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !community) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-500 text-lg font-semibold mb-2">{error || 'Community not found'}</p>
              <Button onClick={() => navigate('/communities')}>Back to Communities</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-6 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/communities">Communities</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{community?.name || '...'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link 
            to="/communities"
            className="inline-flex items-center space-x-2 text-pulse-600 hover:text-pulse-700 transition-colors duration-200 group mb-4"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Communities</span>
          </Link>
        </div>

        {/* Community Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-border overflow-hidden mb-8">
          {/* Cover Image */}
          {(
            community.coverImageUrl || true // always true, so always show the banner
          ) && (
            <div className="relative h-48 md:h-64">
              <img
                src={community.coverImageUrl || '/combg.jpg'}
                alt={community.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          )}

          {/* Community Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">r/{community.name}</h1>
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
                  {isJoined && (
                    <Badge className="bg-pulse-500 text-white">
                      <Heart className="h-3 w-3 mr-1" />
                      Joined
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 text-lg mb-4">{community.description}</p>

                <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {community.memberCount.toLocaleString()} members
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {community.questionCount.toLocaleString()} questions
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {community.createdAt.toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {community.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleJoinCommunity}
                  className={
                    isJoined
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-pulse-600 hover:bg-pulse-700 text-white"
                  }
                >
                  {isJoined ? 'Joined' : 'Join Community'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/ask')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-border mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'posts', label: 'Posts', count: questions.length },
                { id: 'about', label: 'About', count: null },
                { id: 'members', label: 'Members', count: community.memberCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-pulse-500 text-pulse-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 text-gray-400">({tab.count.toLocaleString()})</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'posts' && (
              <div className="space-y-8">
                {loading ? (
                  <div className="text-center py-12 text-lg text-gray-500">Loading questions...</div>
                ) : filteredAndSortedQuestions.length === 0 ? (
                  <div className="text-center py-12 text-lg text-gray-500">No posts found.</div>
                ) : (
                  filteredAndSortedQuestions.map((question, index) => (
                    <div
                      key={question.id}
                      className="opacity-0 animate-fade-in bg-white rounded-2xl shadow-lg border border-border overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-6">
                        <QuestionCard question={question} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About this community</h3>
                  <p className="text-gray-600 leading-relaxed">{community.longDescription}</p>
                </div>

                {community.rules && community.rules.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Rules</h3>
                    <ul className="space-y-2">
                      {community.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2 text-gray-600">
                          <span className="text-pulse-500 font-semibold">{index + 1}.</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {community.resources && community.resources.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Resources</h3>
                    <div className="space-y-2">
                      {community.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-pulse-600 hover:text-pulse-700 transition-colors"
                        >
                          <Tag className="h-4 w-4" />
                          <span>{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Community Members</h3>
                  <p className="text-gray-600 mb-6">
                    This community has {community.memberCount.toLocaleString()} members.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Moderators</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {community.moderators.map((moderator) => (
                        <div key={moderator.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={moderator.avatarUrl} />
                            <AvatarFallback>
                              {moderator.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">@{moderator.username}</div>
                            <Badge variant="outline" className="text-xs">
                              {moderator.role}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail; 