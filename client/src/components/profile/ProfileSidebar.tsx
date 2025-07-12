
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  TrendingUp, 
  Award,
  UserPlus,
  Hash,
  Calendar
} from 'lucide-react';
import { UserProfile } from '@/types/user';

interface ProfileSidebarProps {
  user: UserProfile;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  // Mock data for suggestions
  const suggestedUsers = [
    {
      id: '2',
      username: 'sarah_dev',
      name: 'Sarah Johnson',
      reputation: 2340,
      avatarUrl: undefined,
      isFollowing: false
    },
    {
      id: '3',
      username: 'mike_react',
      name: 'Mike Chen',
      reputation: 1890,
      avatarUrl: undefined,
      isFollowing: true
    }
  ];

  const trendingCommunities = [
    { name: 'React', memberCount: 15420, isJoined: user.communities.includes('react') },
    { name: 'TypeScript', memberCount: 12340, isJoined: user.communities.includes('typescript') },
    { name: 'Node.js', memberCount: 9870, isJoined: false }
  ];

  const formatMemberCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const formatJoinDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* User Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5" />
            Profile Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Profile Views</span>
            <span className="font-medium">{user.stats.profileViews.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Joined</span>
            <span className="font-medium">{formatJoinDate(user.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Communities</span>
            <span className="font-medium">{user.communities.length}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Badges Earned</span>
            <span className="font-medium">{user.badges.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Top Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5" />
            Top Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {user.badges.slice(0, 3).map((badge) => (
              <div key={badge.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="text-lg">{badge.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{badge.name}</div>
                  <div className="text-xs text-gray-500 truncate">{badge.description}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* People You May Know */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            People You May Know
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestedUsers.map((suggestedUser) => (
              <div key={suggestedUser.id} className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={suggestedUser.avatarUrl} />
                  <AvatarFallback className="text-xs bg-pulse-100 text-pulse-700">
                    {suggestedUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/user/${suggestedUser.username}`}
                    className="font-medium text-sm hover:text-pulse-600 truncate block"
                  >
                    {suggestedUser.name}
                  </Link>
                  <div className="text-xs text-gray-500">
                    {suggestedUser.reputation.toLocaleString()} reputation
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={suggestedUser.isFollowing ? "secondary" : "outline"}
                  className="text-xs px-2 py-1 h-7"
                >
                  {suggestedUser.isFollowing ? 'Following' : 'Follow'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Communities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Hash className="w-5 h-5" />
            Trending Communities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingCommunities.map((community) => (
              <div key={community.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{community.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatMemberCount(community.memberCount)} members
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={community.isJoined ? "secondary" : "outline"}
                  className="text-xs px-2 py-1 h-7"
                >
                  {community.isJoined ? 'Joined' : 'Join'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Join Date */}
      <Card>
        <CardContent className="p-4 text-center">
          <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <div className="text-sm text-gray-600 mb-1">Member since</div>
          <div className="font-medium text-gray-900">
            {formatJoinDate(user.createdAt)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
