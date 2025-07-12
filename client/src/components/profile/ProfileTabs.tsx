
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  HelpCircle, 
  MessageSquare, 
  Trophy, 
  Activity,
  TrendingUp,
  Calendar,
  Tag,
  ThumbsUp,
  Eye,
  Clock,
  Award
} from 'lucide-react';
import { UserProfile, Question, Answer, UserActivity } from '@/types/user';
import { cn } from '@/lib/utils';

interface ProfileTabsProps {
  user: UserProfile;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const mockQuestions: Question[] = [
    {
      id: '1',
      title: 'How to handle state management in large React applications?',
      content: 'I am working on a large React application and struggling with state management...',
      tags: ['react', 'state-management', 'redux'],
      votes: 15,
      answerCount: 8,
      views: 234,
      createdAt: new Date(Date.now() - 2 * 24 * 3600000),
      updatedAt: new Date(Date.now() - 1 * 24 * 3600000),
      authorId: user.id,
      author: {
        username: user.username,
        avatarUrl: user.avatarUrl,
        reputation: user.reputation
      },
      community: 'React',
      isAccepted: true
    }
  ];

  const mockAnswers: Answer[] = [
    {
      id: '1',
      content: 'You can use Redux Toolkit for better state management. It provides a more streamlined approach...',
      votes: 23,
      isAccepted: true,
      createdAt: new Date(Date.now() - 3 * 24 * 3600000),
      updatedAt: new Date(Date.now() - 3 * 24 * 3600000),
      questionId: '1',
      questionTitle: 'Best practices for Redux in 2024?',
      authorId: user.id,
      author: {
        username: user.username,
        avatarUrl: user.avatarUrl,
        reputation: user.reputation
      }
    }
  ];

  const mockActivities: UserActivity[] = [
    {
      id: '1',
      type: 'badge_earned',
      title: 'Earned Gold Contributor badge',
      description: 'Reached 50+ helpful answers milestone',
      timestamp: new Date(Date.now() - 2 * 24 * 3600000),
      icon: '🏆'
    },
    {
      id: '2',
      type: 'answer_posted',
      title: 'Answered a question',
      description: 'Provided solution for "React Hook optimization"',
      timestamp: new Date(Date.now() - 5 * 24 * 3600000),
      relatedUrl: '/questions/123',
      icon: '💬'
    }
  ];

  const getTopTags = () => {
    const tagCounts = user.communities.reduce((acc, community) => {
      acc[community] = (acc[community] || 0) + Math.floor(Math.random() * 50) + 10;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-6">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Overview</span>
        </TabsTrigger>
        <TabsTrigger value="questions" className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Questions</span>
        </TabsTrigger>
        <TabsTrigger value="answers" className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">Answers</span>
        </TabsTrigger>
        <TabsTrigger value="reputation" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Reputation</span>
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span className="hidden sm:inline">Activity</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" id="stats-section">
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pulse-600 mb-1">
                {user.stats.questionsAsked}
              </div>
              <div className="text-sm text-gray-600">Questions</div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {user.stats.answersGiven}
              </div>
              <div className="text-sm text-gray-600">Answers</div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {user.stats.totalUpvotes}
              </div>
              <div className="text-sm text-gray-600">Upvotes</div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {user.stats.followersCount}
              </div>
              <div className="text-sm text-gray-600">Followers</div>
            </CardContent>
          </Card>
        </div>

        {/* Top Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Top Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {getTopTags().map(([tag, count]) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-2">
                  <span>{tag}</span>
                  <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                    {count}
                  </span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Recent Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user.badges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="text-2xl">{badge.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{badge.name}</div>
                    <div className="text-sm text-gray-600">{badge.description}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatRelativeTime(badge.earnedAt)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="questions" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Questions Asked ({user.stats.questionsAsked})</h3>
        </div>
        
        <div className="space-y-4">
          {mockQuestions.map((question) => (
            <Card key={question.id} className="hover-scale">
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 hover:text-pulse-600 cursor-pointer">
                      {question.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {question.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {question.votes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {question.answerCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {question.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(question.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="answers" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Answers Given ({user.stats.answersGiven})</h3>
        </div>
        
        <div className="space-y-4">
          {mockAnswers.map((answer) => (
            <Card key={answer.id} className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 px-2 py-1 rounded text-sm font-medium",
                    answer.isAccepted 
                      ? "bg-green-100 text-green-700" 
                      : "bg-gray-100 text-gray-600"
                  )}>
                    {answer.votes}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-2 hover:text-pulse-600 cursor-pointer">
                      {answer.questionTitle}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {answer.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        {answer.isAccepted && (
                          <Badge variant="default" className="bg-green-600">
                            ✓ Accepted
                          </Badge>
                        )}
                        <span>{answer.votes} votes</span>
                      </div>
                      <span>{formatDate(answer.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reputation" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Reputation Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-green-50">
                <span className="text-green-700">Answer upvotes</span>
                <span className="font-semibold text-green-700">
                  +{user.stats.totalUpvotes * 10}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                <span className="text-blue-700">Accepted answers</span>
                <span className="font-semibold text-blue-700">
                  +{user.stats.acceptedAnswers * 15}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-orange-50">
                <span className="text-orange-700">Question upvotes</span>
                <span className="font-semibold text-orange-700">
                  +{user.stats.questionsAsked * 5}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <Card key={activity.id} className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {formatRelativeTime(activity.timestamp)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
