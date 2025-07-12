
import React, { useState } from 'react';
import { Bell, Shield, Eye, EyeOff, Download, Trash2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface MessagingSettings {
  allowMessagesFrom: 'everyone' | 'followersOnly' | 'expertsOnly' | 'nobody';
  showOnlineStatus: boolean;
  emailNotifications: boolean;
  desktopNotifications: boolean;
  messagePreview: boolean;
  autoReply: boolean;
  blockedUsers: Array<{
    id: string;
    username: string;
    blockedAt: Date;
  }>;
}

export const MessagingPreferences: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<MessagingSettings>({
    allowMessagesFrom: 'everyone',
    showOnlineStatus: true,
    emailNotifications: true,
    desktopNotifications: false,
    messagePreview: true,
    autoReply: false,
    blockedUsers: [
      {
        id: '1',
        username: 'spam_user_123',
        blockedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
      }
    ]
  });

  const handleSettingChange = (key: keyof MessagingSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your messaging preferences have been saved.",
    });
  };

  const handleExportHistory = () => {
    toast({
      title: "Export started",
      description: "Your message history will be exported and sent to your email.",
    });
  };

  const handleUnblockUser = (userId: string) => {
    setSettings(prev => ({
      ...prev,
      blockedUsers: prev.blockedUsers.filter(user => user.id !== userId)
    }));
    toast({
      title: "User unblocked",
      description: "User has been removed from your blocked list.",
    });
  };

  const getTimeSinceBlocked = (date: Date) => {
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card className="border-pulse-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-pulse-500" />
            <span>Privacy & Visibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Who can send you messages?
              </label>
              <Select
                value={settings.allowMessagesFrom}
                onValueChange={(value: any) => handleSettingChange('allowMessagesFrom', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  <SelectItem value="followersOnly">Followers only</SelectItem>
                  <SelectItem value="expertsOnly">Verified experts only</SelectItem>
                  <SelectItem value="nobody">Nobody</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Show online status</label>
                <p className="text-xs text-gray-500">Let others see when you're active</p>
              </div>
              <Switch
                checked={settings.showOnlineStatus}
                onCheckedChange={(checked) => handleSettingChange('showOnlineStatus', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Message previews</label>
                <p className="text-xs text-gray-500">Show message content in notifications</p>
              </div>
              <Switch
                checked={settings.messagePreview}
                onCheckedChange={(checked) => handleSettingChange('messagePreview', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-pulse-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-pulse-500" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Email notifications</label>
              <p className="text-xs text-gray-500">Receive new message alerts via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Desktop notifications</label>
              <p className="text-xs text-gray-500">Show browser notifications for new messages</p>
            </div>
            <Switch
              checked={settings.desktopNotifications}
              onCheckedChange={(checked) => handleSettingChange('desktopNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Auto-reply</label>
              <p className="text-xs text-gray-500">Send automatic responses when away</p>
            </div>
            <Switch
              checked={settings.autoReply}
              onCheckedChange={(checked) => handleSettingChange('autoReply', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Blocked Users */}
      <Card className="border-pulse-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-pulse-500" />
              <span>Blocked Users</span>
            </div>
            <Badge variant="secondary">{settings.blockedUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {settings.blockedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No blocked users</p>
            </div>
          ) : (
            <div className="space-y-3">
              {settings.blockedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">@{user.username}</p>
                    <p className="text-xs text-gray-500">Blocked {getTimeSinceBlocked(user.blockedAt)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnblockUser(user.id)}
                  >
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="border-pulse-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5 text-pulse-500" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Export message history</label>
              <p className="text-xs text-gray-500">Download all your conversations as JSON</p>
            </div>
            <Button variant="outline" onClick={handleExportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          <Separator />

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Trash2 className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-900">Danger Zone</h4>
                <p className="text-xs text-red-700 mt-1">
                  Permanently delete all your message history. This action cannot be undone.
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-3"
                  onClick={() => {
                    toast({
                      title: "Feature coming soon",
                      description: "Message deletion will be available in a future update.",
                    });
                  }}
                >
                  Delete All Messages
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
