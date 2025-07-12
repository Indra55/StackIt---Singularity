
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
import { apiGet } from '@/lib/api';

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
      setLoading(true);
      setError(null);
      try {
        let profile: any = null;
        if (currentUser && currentUser.username === username) {
          // Own profile
          const data = await apiGet('/users/profile');
          if (data.status === 'success' && data.user) {
            profile = data.user;
          }
        } else {
          // Search for user by username
          const data = await apiGet(`/api/search/users?q=${encodeURIComponent(username)}`);
          if (data.success && Array.isArray(data.data.users)) {
            profile = data.data.users.find((u: any) => u.username === username);
          }
        }
        if (!profile) {
          setError('User not found');
          setUserProfile(null);
        } else {
          setUserProfile({
            id: profile.id,
            username: profile.username,
            email: profile.email || '',
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            bio: profile.bio || '',
            avatarUrl: profile.avatar_url || undefined,
            role: profile.role || 'user',
            reputation: profile.reputation || 0,
            isVerified: profile.email_verified || false,
            isBanned: profile.is_banned || false,
            isOnline: profile.is_online || false,
            lastSeen: profile.last_login ? new Date(profile.last_login) : new Date(),
            createdAt: profile.created_at ? new Date(profile.created_at) : new Date(),
            communities: [], // Not available in backend response
            badges: [], // Not available in backend response
            stats: {
              questionsAsked: 0,
              answersGiven: 0,
              acceptedAnswers: 0,
              totalUpvotes: 0,
              totalDownvotes: 0,
              commentsPosted: 0,
              profileViews: 0,
              followersCount: 0,
              followingCount: 0
            },
            socialLinks: {},
          });
        }
      } catch (err) {
        setError('Failed to load user profile');
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [username, currentUser]);

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
