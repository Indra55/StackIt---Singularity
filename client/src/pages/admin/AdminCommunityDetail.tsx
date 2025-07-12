
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, FileText, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminCommunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mockCommunity = {
    id: '1',
    name: 'React Developers',
    description: 'A community for React developers to share knowledge and best practices',
    memberCount: 2340,
    postCount: 892,
    createdAt: '2024-01-10'
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
      toast({
        title: "Community Deleted",
        description: "Community has been deleted successfully"
      });
      navigate('/admin/communities');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/communities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">r/{mockCommunity.name}</h2>
            <p className="text-muted-foreground">{mockCommunity.description}</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockCommunity.memberCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mockCommunity.postCount.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg">{new Date(mockCommunity.createdAt).toLocaleDateString()}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border border-destructive rounded-lg p-4">
              <h4 className="font-medium text-destructive mb-2">Delete Community</h4>
              <p className="text-sm text-muted-foreground mb-4">
                This will permanently delete the community and all its content. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Community
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
