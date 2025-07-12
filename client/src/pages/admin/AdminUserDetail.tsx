
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Ban, 
  UserCheck, 
  Shield, 
  ShieldOff, 
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock user data - replace with actual API call
const mockUserDetails = {
  id: '1',
  username: 'john_doe',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'user' as 'user' | 'admin',
  isBanned: false,
  isVerified: true,
  reputation: 1520,
  createdAt: '2024-01-15',
  avatarUrl: undefined,
  communities: ['react', 'javascript', 'typescript'],
  stats: {
    totalPosts: 42,
    totalComments: 128,
    totalUpvotes: 89,
    totalDownvotes: 12
  }
};

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(mockUserDetails);

  const handleUserAction = async (action: string) => {
    try {
      switch (action) {
        case 'ban':
          setUser(prev => ({ ...prev, isBanned: true }));
          toast({
            title: "User Banned",
            description: "User has been banned successfully"
          });
          break;
        case 'unban':
          setUser(prev => ({ ...prev, isBanned: false }));
          toast({
            title: "User Unbanned",
            description: "User has been unbanned successfully"
          });
          break;
        case 'promote':
          setUser(prev => ({ ...prev, role: 'admin' as 'user' | 'admin' }));
          toast({
            title: "User Promoted",
            description: "User has been promoted to admin"
          });
          break;
        case 'demote':
          setUser(prev => ({ ...prev, role: 'user' as 'user' | 'admin' }));
          toast({
            title: "User Demoted",
            description: "User has been demoted to regular user"
          });
          break;
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to perform the requested action",
        variant: "destructive"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/users')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Details</h2>
            <p className="text-muted-foreground">
              Detailed information and actions for {user.username}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* User Profile */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {user.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{user.username}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                  <Badge variant={user.isBanned ? 'destructive' : 'outline'}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>{user.reputation} reputation</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4 border-t">
                {user.isBanned ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleUserAction('unban')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Unban User
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => handleUserAction('ban')}
                  >
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </Button>
                )}
                
                {user.role === 'admin' ? (
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => handleUserAction('demote')}
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Demote to User
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => handleUserAction('promote')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Promote to Admin
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Activity Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {user.stats.totalPosts}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {user.stats.totalComments}
                  </div>
                  <div className="text-sm text-muted-foreground">Comments</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-500">
                    {user.stats.totalUpvotes}
                  </div>
                  <div className="text-sm text-muted-foreground">Upvotes</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-500">
                    {user.stats.totalDownvotes}
                  </div>
                  <div className="text-sm text-muted-foreground">Downvotes</div>
                </div>
              </div>

              {/* Communities */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Community Memberships</h4>
                <div className="flex flex-wrap gap-2">
                  {user.communities.map((community) => (
                    <Badge key={community} variant="outline">
                      r/{community}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
