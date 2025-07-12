
import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { MessagingPreferences } from '@/components/profile/MessagingPreferences';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, MessageSquare, Shield, Bell } from 'lucide-react';

const UserSettings = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
              <p className="text-gray-600">Manage your account preferences and privacy settings</p>
            </div>

            <Tabs defaultValue="messaging" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="messaging" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messaging</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Profile settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="messaging">
                <MessagingPreferences />
              </TabsContent>

              <TabsContent value="privacy">
                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Privacy settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Notification settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default UserSettings;
