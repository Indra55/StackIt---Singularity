
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  UserPlus, 
  UserCheck, 
  Settings, 
  BarChart3,
  Shield,
  Crown,
  Flame,
  Clock,
  Github,
  Linkedin,
  Globe,
  Twitter
} from 'lucide-react';
import { UserProfile, SocialLinks } from '@/types/user';
import { User } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwnProfile: boolean;
  currentUser: User | null;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  user, 
  isOwnProfile, 
  currentUser 
}) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const getReputationTier = (reputation: number) => {
    if (reputation >= 5000) return { tier: 'legendary', color: 'text-purple-600', glow: 'shadow-purple-500/50' };
    if (reputation >= 2000) return { tier: 'expert', color: 'text-orange-600', glow: 'shadow-orange-500/50' };
    if (reputation >= 500) return { tier: 'contributor', color: 'text-blue-600', glow: 'shadow-blue-500/50' };
    return { tier: 'newcomer', color: 'text-green-600', glow: 'shadow-green-500/50' };
  };

  const reputationInfo = getReputationTier(user.reputation);

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const SocialIcon = ({ platform, url }: { platform: keyof SocialLinks; url: string }) => {
    const icons = {
      github: Github,
      linkedin: Linkedin,
      twitter: Twitter,
      website: Globe
    };
    
    const Icon = icons[platform];
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-500 hover:text-pulse-600 transition-colors"
      >
        <Icon className="w-5 h-5" />
      </a>
    );
  };

  return (
    <Card className="overflow-hidden hover-scale">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-white shadow-lg hover:animate-pulse">
                <AvatarImage src={user.avatarUrl} alt={user.username} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-pulse-500 to-pulse-600 text-white">
                  {user.firstName?.[0] || user.username[0].toUpperCase()}
                  {user.lastName?.[0] || user.username[1]?.toUpperCase() || ''}
                </AvatarFallback>
              </Avatar>
              
              {/* Online Status */}
              <div className={cn(
                "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white",
                user.isOnline ? "bg-green-500" : "bg-gray-400"
              )} />
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1">
                {/* Name and Username */}
                <div className="mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.username
                    }
                  </h1>
                  <p className="text-gray-500 text-lg">@{user.username}</p>
                </div>

                {/* Role and Verification */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {user.role === 'admin' && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Admin
                    </Badge>
                  )}
                  {user.role === 'moderator' && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Moderator
                    </Badge>
                  )}
                  {user.isVerified && (
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      ✓ Verified
                    </Badge>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {user.bio}
                  </p>
                )}

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 shadow-lg",
                    reputationInfo.glow
                  )}>
                    <Flame className={cn("w-5 h-5", reputationInfo.color)} />
                    <span className={cn("font-bold", reputationInfo.color)}>
                      {user.reputation.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">reputation</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">
                      {user.isOnline ? "Online now" : `Last active ${formatLastSeen(user.lastSeen)}`}
                    </span>
                  </div>
                </div>

                {/* Social Links */}
                {user.socialLinks && (
                  <div className="flex items-center gap-3">
                    {user.socialLinks.github && (
                      <SocialIcon platform="github" url={user.socialLinks.github} />
                    )}
                    {user.socialLinks.linkedin && (
                      <SocialIcon platform="linkedin" url={user.socialLinks.linkedin} />
                    )}
                    {user.socialLinks.twitter && (
                      <SocialIcon platform="twitter" url={user.socialLinks.twitter} />
                    )}
                    {user.socialLinks.website && (
                      <SocialIcon platform="website" url={user.socialLinks.website} />
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {!isOwnProfile && currentUser && (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        // Navigate to messages with this user
                        window.location.href = `/messages?user=${user.username}`;
                      }}
                    >
                      <MessageSquare className="w-4 h-4" />
                      Message
                    </Button>
                    
                    <Button 
                      variant={isFollowing ? "secondary" : "default"}
                      className="flex items-center gap-2"
                      onClick={handleFollowToggle}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Follow
                        </>
                      )}
                    </Button>
                  </>
                )}

                {isOwnProfile && (
                  <Button asChild variant="outline" className="flex items-center gap-2">
                    <Link to="/settings">
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </Button>
                )}

                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => {
                    document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <BarChart3 className="w-4 h-4" />
                  View Stats
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
