
import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  Ban, 
  UserCheck, 
  UserX,
  Shield,
  ShieldOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Mock user data - replace with actual API call
const mockUsers = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'user' as const,
    isBanned: false,
    createdAt: '2024-01-15',
    avatarUrl: undefined
  },
  {
    id: '2', 
    username: 'jane_admin',
    email: 'jane@example.com',
    role: 'admin' as const,
    isBanned: false,
    createdAt: '2024-01-10',
    avatarUrl: undefined
  },
  {
    id: '3',
    username: 'banned_user',
    email: 'banned@example.com', 
    role: 'user' as const,
    isBanned: true,
    createdAt: '2024-02-01',
    avatarUrl: undefined
  },
  {
    id: '4',
    username: 'sarah_dev',
    email: 'sarah@example.com',
    role: 'user' as const,
    isBanned: false,
    createdAt: '2024-02-10',
    avatarUrl: undefined
  }
];

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState(mockUsers);
  const { toast } = useToast();
  const navigate = useNavigate();

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUserAction = async (userId: string, action: string) => {
    // Mock API calls - replace with actual API endpoints  
    try {
      switch (action) {
        case 'ban':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, isBanned: true } : u
          ));
          toast({
            title: "User Banned",
            description: "User has been banned successfully"
          });
          break;
        case 'unban':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, isBanned: false } : u
          ));
          toast({
            title: "User Unbanned", 
            description: "User has been unbanned successfully"
          });
          break;
        case 'promote':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, role: 'admin' as const } : u
          ));
          toast({
            title: "User Promoted",
            description: "User has been promoted to admin"
          });
          break;
        case 'demote':
          setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, role: 'user' as const } : u
          ));
          toast({
            title: "User Demoted",
            description: "User has been demoted to regular user"
          });
          break;
        case 'view':
          navigate(`/admin/users/${userId}`);
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Search Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by username or email..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>
                            {user.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.username}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBanned ? 'destructive' : 'outline'}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
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
                            onClick={() => handleUserAction(user.id, 'view')}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {user.isBanned ? (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.id, 'unban')}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unban User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.id, 'ban')}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Ban User
                            </DropdownMenuItem>
                          )}
                          {user.role === 'admin' ? (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.id, 'demote')}
                            >
                              <ShieldOff className="mr-2 h-4 w-4" />
                              Demote to User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction(user.id, 'promote')}
                            >
                              <Shield className="mr-2 h-4 w-4" />
                              Promote to Admin
                            </DropdownMenuItem>
                          )}
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
