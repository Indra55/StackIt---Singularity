
import React, { useState } from "react";
import { Hash, Users, TrendingUp } from "lucide-react";
import TagsModal from "@/components/modals/TagsModal";
import CommunitiesModal from "@/components/modals/CommunitiesModal";

const LeftSidebar = () => {
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(["React Developers"]);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isCommunitiesModalOpen, setIsCommunitiesModalOpen] = useState(false);

  const featuredTags = [
    { name: "React", count: 1245, color: "bg-blue-100 text-blue-700" },
    { name: "JavaScript", count: 2156, color: "bg-yellow-100 text-yellow-700" },
    { name: "TypeScript", count: 987, color: "bg-blue-100 text-blue-700" },
    { name: "Node.js", count: 765, color: "bg-green-100 text-green-700" },
    { name: "Python", count: 1432, color: "bg-green-100 text-green-700" },
    { name: "CSS", count: 654, color: "bg-purple-100 text-purple-700" },
    { name: "HTML", count: 432, color: "bg-orange-100 text-orange-700" },
    { name: "Vue.js", count: 321, color: "bg-green-100 text-green-700" }
  ];

  const communities = [
    { name: "React Developers", members: 15420, isJoined: true },
    { name: "Python & AI", members: 8934, isJoined: false },
    { name: "DevOps Masters", members: 6743, isJoined: false },
    { name: "UI/UX Design Hub", members: 4521, isJoined: false },
    { name: "Blockchain Innovators", members: 3276, isJoined: false },
    { name: "Mobile Dev", members: 6743, isJoined: false }
  ];

  const toggleCommunity = (communityName: string) => {
    setJoinedCommunities(prev => 
      prev.includes(communityName)
        ? prev.filter(name => name !== communityName)
        : [...prev, communityName]
    );
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
          {featuredTags.map((tag) => (
            <button
              key={tag.name}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${tag.color}`}>
                  {tag.name}
                </span>
              </div>
              <div className="text-sm text-gray-500 group-hover:text-gray-700">
                {tag.count.toLocaleString()}
              </div>
            </button>
          ))}
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
          {communities.map((community) => (
            <div
              key={community.name}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{community.name}</div>
                <div className="text-sm text-gray-500">
                  {community.members.toLocaleString()} members
                </div>
              </div>
              
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
            </div>
          ))}
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
            <span className="font-semibold text-gray-900">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Answers Given</span>
            <span className="font-semibold text-gray-900">0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Reputation</span>
            <span className="font-semibold text-pulse-600">0</span>
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
