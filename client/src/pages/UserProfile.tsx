
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { ProfileSidebar } from '@/components/profile/ProfileSidebar';
import { UserProfile as UserProfileType } from '@/types/user';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const UserProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      try {
        // Mock API call - replace with actual API
        setTimeout(() => {
          const mockProfile: UserProfileType = {
            id: username === 'admin' ? 'admin-1' : '1',
            username: username,
            email: `${username}@example.com`,
            firstName: username === 'admin' ? 'Admin' : 'John',
            lastName: username === 'admin' ? 'User' : 'Doe',
            bio: username === 'admin' 
              ? 'Platform administrator with extensive experience in React, TypeScript, and system architecture. Always happy to help the community!'
              : 'Full-stack developer passionate about React, Node.js, and building great user experiences. Love helping others solve complex problems.',
            avatarUrl: undefined,
            role: username === 'admin' ? 'admin' : 'user',
            reputation: username === 'admin' ? 5000 : 1520,
            isVerified: true,
            isBanned: false,
            isOnline: Math.random() > 0.5,
            lastSeen: new Date(Date.now() - Math.random() * 3600000),
            createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 3600000),
            communities: username === 'admin' ? ['all'] : ['react', 'javascript', 'typescript'],
            badges: [
              {
                id: '1',
                name: 'Gold Contributor',
                description: 'Provided 50+ helpful answers',
                icon: '🏆',
                color: 'gold',
                earnedAt: new Date(Date.now() - 30 * 24 * 3600000),
                type: 'gold'
              },
              {
                id: '2',
                name: 'Rising Star',
                description: 'Quick to help newcomers',
                icon: '⭐',
                color: 'blue',
                earnedAt: new Date(Date.now() - 60 * 24 * 3600000),
                type: 'silver'
              }
            ],
            stats: {
              questionsAsked: username === 'admin' ? 25 : 12,
              answersGiven: username === 'admin' ? 150 : 45,
              acceptedAnswers: username === 'admin' ? 125 : 32,
              totalUpvotes: username === 'admin' ? 800 : 180,
              totalDownvotes: username === 'admin' ? 5 : 3,
              commentsPosted: username === 'admin' ? 200 : 85,
              profileViews: username === 'admin' ? 2500 : 350,
              followersCount: username === 'admin' ? 150 : 25,
              followingCount: username === 'admin' ? 50 : 18
            },
            socialLinks: {
              github: `https://github.com/${username}`,
              linkedin: `https://linkedin.com/in/${username}`,
              website: `https://${username}.dev`
            }
          };

          setUserProfile(mockProfile);
          setLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-fade-in">
            <Card className="p-6 mb-6">
              <div className="flex items-start gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-16 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </div>
            </Card>
            
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Skeleton className="h-12 w-full mb-4" />
                <Skeleton className="h-96 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h1>
            <p className="text-gray-600 mb-4">{error || 'The user you are looking for does not exist.'}</p>
            <button 
              onClick={() => navigate('/questions')}
              className="text-pulse-600 hover:text-pulse-700 font-medium"
            >
              ← Back to Questions
            </button>
          </Card>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === userProfile.username;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in">
        <ProfileHeader 
          user={userProfile} 
          isOwnProfile={isOwnProfile}
          currentUser={currentUser}
        />
        
        <div className="grid lg:grid-cols-4 gap-6 mt-6">
          <div className="lg:col-span-3">
            <ProfileTabs user={userProfile} />
          </div>
          
          <div className="lg:col-span-1">
            <ProfileSidebar user={userProfile} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
