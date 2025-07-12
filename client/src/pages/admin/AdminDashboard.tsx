
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Shield, 
  FileText, 
  MessageSquare,
  Ban,
  Trash2,
  Flag,
  UserPlus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data - replace with actual API calls
const mockMetrics = {
  totalUsers: { value: 1823, trend: { value: 12, label: 'vs last week', isPositive: true } },
  activeUsers: { value: 342, trend: { value: 8, label: 'vs yesterday', isPositive: true } },
  totalCommunities: { value: 47, trend: { value: 3, label: 'vs last month', isPositive: true } },
  totalPosts: { value: 5234, trend: { value: 15, label: 'vs last week', isPositive: true } },
  totalComments: { value: 12891, trend: { value: -2, label: 'vs last week', isPositive: false } }
};

const quickActions = [
  {
    title: 'Ban User',
    description: 'Suspend a user account',
    icon: Ban,
    variant: 'destructive' as const,
    action: 'ban-user'
  },
  {
    title: 'Delete Community',
    description: 'Remove a community',
    icon: Trash2,
    variant: 'destructive' as const,
    action: 'delete-community'
  },
  {
    title: 'View Reports',
    description: 'Check flagged content',
    icon: Flag,
    variant: 'outline' as const,
    action: 'view-reports'
  },
  {
    title: 'Promote User',
    description: 'Make user an admin',
    icon: UserPlus,
    variant: 'default' as const,
    action: 'promote-user'
  }
];

export default function AdminDashboard() {
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    // Navigate to appropriate section or show modal
    switch (action) {
      case 'ban-user':
        toast({
          title: "Quick Action",
          description: "Navigate to User Management to ban users"
        });
        break;
      case 'delete-community':
        toast({
          title: "Quick Action", 
          description: "Navigate to Community Management to delete communities"
        });
        break;
      case 'view-reports':
        toast({
          title: "Coming Soon",
          description: "Content reporting system will be available soon"
        });
        break;
      case 'promote-user':
        toast({
          title: "Quick Action",
          description: "Navigate to User Management to promote users"
        });
        break;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Monitor your platform's key metrics and perform quick administrative actions.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <MetricCard
            title="Total Users"
            value={mockMetrics.totalUsers.value.toLocaleString()}
            icon={Users}
            trend={mockMetrics.totalUsers.trend}
          />
          <MetricCard
            title="Active Users (24h)"
            value={mockMetrics.activeUsers.value.toLocaleString()}
            icon={UserCheck}
            trend={mockMetrics.activeUsers.trend}
          />
          <MetricCard
            title="Total Communities"
            value={mockMetrics.totalCommunities.value}
            icon={Shield}
            trend={mockMetrics.totalCommunities.trend}
          />
          <MetricCard
            title="Total Posts"
            value={mockMetrics.totalPosts.value.toLocaleString()}
            icon={FileText}
            trend={mockMetrics.totalPosts.trend}
          />
          <MetricCard
            title="Total Comments"
            value={mockMetrics.totalComments.value.toLocaleString()}
            icon={MessageSquare}
            trend={mockMetrics.totalComments.trend}
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Card key={action.action} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <action.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {action.description}
                        </p>
                        <Button
                          variant={action.variant}
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => handleQuickAction(action.action)}
                        >
                          {action.title}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Preview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { username: 'alex_dev', email: 'alex@example.com', time: '2 hours ago' },
                  { username: 'sarah_designer', email: 'sarah@example.com', time: '4 hours ago' },
                  { username: 'mike_pm', email: 'mike@example.com', time: '6 hours ago' }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{user.username}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{user.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Community Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { community: 'React Developers', action: 'New post', time: '1 hour ago' },
                  { community: 'UI/UX Design', action: 'New member joined', time: '3 hours ago' },
                  { community: 'JavaScript', action: 'New comment', time: '5 hours ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{activity.community}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
