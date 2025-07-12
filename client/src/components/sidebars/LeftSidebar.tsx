
import React, { useState, useEffect } from "react";
import { Hash, Users, TrendingUp } from "lucide-react";
import TagsModal from "@/components/modals/TagsModal";
import CommunitiesModal from "@/components/modals/CommunitiesModal";
import { apiGet } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const LeftSidebar = () => {
  const { isAuthenticated } = useAuth();
  const [tags, setTags] = useState<any[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [communities, setCommunities] = useState<any[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<any>({ questions: 0, answers: 0, reputation: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isCommunitiesModalOpen, setIsCommunitiesModalOpen] = useState(false);

  useEffect(() => {
    // Fetch tags
    setTagsLoading(true);
    apiGet('/tags')
      .then(data => {
        setTags(data.tags || []);
      })
      .catch(() => setTags([]))
      .finally(() => setTagsLoading(false));
    // Fetch communities
    setCommunitiesLoading(true);
    apiGet('/api/communities')
      .then(data => {
        setCommunities(data.communities || []);
      })
      .catch(() => setCommunities([]))
      .finally(() => setCommunitiesLoading(false));
    // Fetch user stats and joined communities if logged in
    if (isAuthenticated) {
      setStatsLoading(true);
      apiGet('/users/dashboard')
        .then(data => {
          setUserStats({
            questions: data.user?.questions_asked || 0,
            answers: data.user?.answers_given || 0,
            reputation: data.user?.reputation || 0
          });
        })
        .catch(() => setUserStats({ questions: 0, answers: 0, reputation: 0 }))
        .finally(() => setStatsLoading(false));
      apiGet('/api/communities/user/subscribed')
        .then(data => {
          setJoinedCommunities((data.communities || []).map((c: any) => c.name));
        })
        .catch(() => setJoinedCommunities([]));
    } else {
      setUserStats({ questions: 0, answers: 0, reputation: 0 });
      setJoinedCommunities([]);
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  const toggleCommunity = async (communityName: string) => {
    if (!isAuthenticated) return;
    const isJoined = joinedCommunities.includes(communityName);
    try {
      if (isJoined) {
        await apiGet(`/api/communities/${communityName}/leave`);
        setJoinedCommunities(prev => prev.filter(name => name !== communityName));
      } else {
        await apiGet(`/api/communities/${communityName}/join`);
        setJoinedCommunities(prev => [...prev, communityName]);
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Featured Tags */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Hash className="w-5 h-5 text-pulse-500" />
          <h3 className="font-semibold text-gray-900">Tags to Explore</h3>
        </div>
        <div className="space-y-2">
          {tagsLoading ? (
            <div className="text-gray-400 text-sm">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="text-gray-400 text-sm">No tags found.</div>
          ) : (
            tags.slice(0, 8).map((tag: any) => (
              <button
                key={tag.tag || tag.name}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-pulse-50 text-pulse-700">
                    {tag.tag || tag.name}
                  </span>
                </div>
                <div className="text-sm text-gray-500 group-hover:text-gray-700">
                  {(tag.count || tag.usage_count || 0).toLocaleString()}
                </div>
              </button>
            ))
          )}
        </div>
        <button 
          onClick={() => setIsTagsModalOpen(true)}
          className="w-full mt-4 text-center text-pulse-600 hover:text-pulse-700 text-sm font-medium transition-colors"
        >
          View all tags →
        </button>
      </div>
      {/* Communities */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-pulse-500" />
          <h3 className="font-semibold text-gray-900">Communities</h3>
        </div>
        <div className="space-y-3">
          {communitiesLoading ? (
            <div className="text-gray-400 text-sm">Loading communities...</div>
          ) : communities.length === 0 ? (
            <div className="text-gray-400 text-sm">No communities found.</div>
          ) : (
            communities.slice(0, 8).map((community: any) => (
              <div
                key={community.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{community.name}</div>
                  <div className="text-sm text-gray-500">
                    {(community.member_count || community.members || 0).toLocaleString()} members
                  </div>
                </div>
                {isAuthenticated && (
                  <button
                    onClick={() => toggleCommunity(community.name)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      joinedCommunities.includes(community.name)
                        ? "bg-pulse-500 text-white hover:bg-pulse-600"
                        : "bg-gray-100 text-gray-700 hover:bg-pulse-100 hover:text-pulse-700"
                    }`}
                  >
                    {joinedCommunities.includes(community.name) ? "Joined" : "Join"}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
        <button 
          onClick={() => setIsCommunitiesModalOpen(true)}
          className="w-full mt-4 text-center text-pulse-600 hover:text-pulse-700 text-sm font-medium transition-colors"
        >
          Discover more communities →
        </button>
      </div>
      {/* Quick Stats */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pulse-500" />
          <h3 className="font-semibold text-gray-900">Your Activity</h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Questions Asked</span>
            <span className="font-semibold text-gray-900">{statsLoading ? '...' : userStats.questions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Answers Given</span>
            <span className="font-semibold text-gray-900">{statsLoading ? '...' : userStats.answers}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reputation</span>
            <span className="font-semibold text-pulse-600">{statsLoading ? '...' : userStats.reputation}</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-pulse-50 rounded-lg">
          <p className="text-sm text-pulse-700">
            Start participating to build your reputation!
          </p>
        </div>
      </div>
      {/* Modals */}
      <TagsModal 
        isOpen={isTagsModalOpen} 
        onClose={() => setIsTagsModalOpen(false)} 
      />
      <CommunitiesModal 
        isOpen={isCommunitiesModalOpen} 
        onClose={() => setIsCommunitiesModalOpen(false)} 
      />
    </div>
  );
};

export default LeftSidebar;
