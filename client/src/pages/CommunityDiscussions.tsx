
import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { CommunityDiscussions } from '@/components/messaging/CommunityDiscussions';

const CommunityDiscussionsPage = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        
        <div className="container mx-auto px-6 py-8">
          <CommunityDiscussions />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CommunityDiscussionsPage;
