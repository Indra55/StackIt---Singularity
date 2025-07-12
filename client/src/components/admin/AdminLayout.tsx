
import React from 'react';
import { 
  Users, 
  Home, 
  MessageSquare, 
  FileText, 
  Activity, 
  Shield,
  Settings
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  useSidebar
} from '@/components/ui/sidebar';

const adminNavItems = [
  {
    title: 'Dashboard Overview',
    url: '/admin/dashboard',
    icon: Home
  },
  {
    title: 'User Management',
    url: '/admin/users',
    icon: Users
  },
  {
    title: 'Community Management',  
    url: '/admin/communities',
    icon: Shield
  },
  {
    title: 'Post Moderation',
    url: '/admin/posts',
    icon: FileText
  },
  {
    title: 'Comment Moderation',
    url: '/admin/comments',
    icon: MessageSquare
  },
  {
    title: 'Site Metrics',
    url: '/admin/metrics',
    icon: Activity
  }
];

function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {!isCollapsed && (
            <div>
              <h2 className="font-semibold text-lg">Admin Panel</h2>
              <p className="text-sm text-muted-foreground">StackIt Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
