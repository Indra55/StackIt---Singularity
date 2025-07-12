
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  Users,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const mockCommunities = [
  {
    id: '1',
    name: 'React Developers',
    description: 'A community for React developers to share knowledge and best practices',
    memberCount: 2340,
    postCount: 892,
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'JavaScript',
    description: 'Everything JavaScript - from basics to advanced topics',
    memberCount: 5672,
    postCount: 1456,
    createdAt: '2024-01-05'
  },
  {
    id: '3',
    name: 'UI/UX Design',
    description: 'Design discussions, portfolio reviews, and industry insights',
    memberCount: 1230,
    postCount: 423,
    createdAt: '2024-01-20'
  }
];

export default function AdminCommunities() {
  const [searchQuery, setSearchQuery] = useState('');
  const [communities, setCommunities] = useState(mockCommunities);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCommunityAction = async (communityId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/admin/communities/${communityId}`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this community? This action cannot be undone.')) {
            setCommunities(prev => prev.filter(c => c.id !== communityId));
            toast({
              title: "Community Deleted",
              description: "Community has been deleted and members have been notified"
            });
          }
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Community Management</h2>
            <p className="text-muted-foreground">
              Manage communities, monitor activity, and moderate content.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Communities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by community name or description..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Communities ({filteredCommunities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Community</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommunities.map((community) => (
                  <TableRow key={community.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div>
                        <div className="font-medium">r/{community.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {community.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {community.memberCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {community.postCount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(community.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem 
                            onClick={() => handleCommunityAction(community.id, 'view')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleCommunityAction(community.id, 'delete')}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Community
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
