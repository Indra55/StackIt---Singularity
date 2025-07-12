
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const mockComments = [
  {
    id: '1',
    content: 'Great explanation! This really helped me understand the concept better.',
    author: 'alice_coder',
    postId: '123',
    createdAt: '2024-02-15'
  },
  {
    id: '2',
    content: 'I disagree with this approach. Here is why...',
    author: 'bob_reviewer', 
    postId: '124',
    createdAt: '2024-02-14'
  }
];

export default function AdminComments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [comments, setComments] = useState(mockComments);
  const { toast } = useToast();

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    comment.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast({
        title: "Comment Deleted",
        description: "Comment has been deleted and author notified"
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Comment Moderation</h2>
          <p className="text-muted-foreground">Review and moderate user comments.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by content or author..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments ({filteredComments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Content</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Post ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={comment.content}>
                        {comment.content}
                      </div>
                    </TableCell>
                    <TableCell>{comment.author}</TableCell>
                    <TableCell>#{comment.postId}</TableCell>
                    <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
