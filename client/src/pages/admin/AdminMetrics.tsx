
import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { MetricCard } from '@/components/admin/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  Shield, 
  FileText, 
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const mockMetrics = {
  totalUsers: { value: 1823, trend: { value: 12, label: 'vs last week', isPositive: true } },
  activeUsers: { value: 342, trend: { value: 8, label: 'vs yesterday', isPositive: true } },
  totalCommunities: { value: 47, trend: { value: 3, label: 'vs last month', isPositive: true } },
  totalPosts: { value: 5234, trend: { value: 15, label: 'vs last week', isPositive: true } },
  totalComments: { value: 12891, trend: { value: -2, label: 'vs last week', isPositive: false } }
};

const chartData = [
  { name: 'Jan', users: 400, posts: 240 },
  { name: 'Feb', users: 300, posts: 139 },
  { name: 'Mar', users: 200, posts: 980 },
  { name: 'Apr', users: 278, posts: 390 },
  { name: 'May', users: 189, posts: 480 },
  { name: 'Jun', users: 239, posts: 380 },
];

export default function AdminMetrics() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Site Metrics</h2>
          <p className="text-muted-foreground">
            Detailed analytics and performance metrics for your platform.
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

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Post Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="posts" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
