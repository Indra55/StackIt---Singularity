
import React, { useState } from "react";
import { TrendingUp, Crown, Star, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import TrendingModal from "@/components/modals/TrendingModal";
import LeaderboardModal from "@/components/modals/LeaderboardModal";

const RightSidebar = () => {
  const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const trendingQuestions = [
    {
      id: 1,
      title: "How to implement dark mode in React?",
      votes: 23,
      answers: 5
    },
    {
      id: 2,
      title: "Best practices for API error handling",
      votes: 18,
      answers: 3
    },
    {
      id: 3,
      title: "Understanding React Server Components",
      votes: 31,
      answers: 7
    },
    {
      id: 4,
      title: "TypeScript generic constraints explained",
      votes: 15,
      answers: 2
    },
    {
      id: 5,
      title: "Optimizing bundle size in Webpack",
      votes: 12,
      answers: 4
    }
  ];

  const topContributors = [
    {
      id: 1,
      username: "sarah_dev",
      reputation: 15420,
      badge: "gold",
      avatar: "/placeholder-avatar.jpg",
      contributions: 145
    },
    {
      id: 2,
      username: "alex_code",
      reputation: 12340,
      badge: "gold",
      avatar: "/placeholder-avatar.jpg",
      contributions: 123
    },
    {
      id: 3,
      username: "mike_react",
      reputation: 9876,
      badge: "silver",
      avatar: "/placeholder-avatar.jpg",
      contributions: 98
    },
    {
      id: 4,
      username: "emma_ts",
      reputation: 7654,
      badge: "silver",
      avatar: "/placeholder-avatar.jpg",
      contributions: 87
    },
    {
      id: 5,
      username: "john_dev",
      reputation: 6543,
      badge: "bronze",
      avatar: "/placeholder-avatar.jpg",
      contributions: 76
    }
  ];

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold':
        return 'text-yellow-500';
      case 'silver':
        return 'text-gray-400';
      case 'bronze':
        return 'text-orange-600';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Trending Questions */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pulse-500" />
          <h3 className="font-semibold text-gray-900">Trending</h3>
        </div>
        
        <div className="space-y-3">
          {trendingQuestions.map((question, index) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              className="block group"
            >
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 bg-pulse-100 text-pulse-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-pulse-600 transition-colors line-clamp-2 mb-2">
                    {question.title}
                  </h4>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>{question.votes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{question.answers}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <button 
          onClick={() => setIsTrendingModalOpen(true)}
          className="w-full mt-4 text-center text-pulse-600 hover:text-pulse-700 text-sm font-medium transition-colors"
        >
          View all trending →
        </button>
      </div>

      {/* Top Contributors */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Crown className="w-5 h-5 text-pulse-500" />
          <h3 className="font-semibold text-gray-900">Top Contributors</h3>
        </div>
        
        <div className="space-y-3">
          {topContributors.map((contributor, index) => (
            <Link
              key={contributor.id}
              to={`/users/${contributor.id}`}
              className="block group"
            >
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 bg-pulse-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {contributor.username.charAt(0).toUpperCase()}
                  </div>
                  
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-white">
                      <Star className={`w-3 h-3 ${getBadgeColor(contributor.badge)} fill-current`} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-pulse-600 transition-colors truncate">
                    @{contributor.username}
                  </div>
                  <div className="text-sm text-gray-500">
                    {contributor.reputation.toLocaleString()} reputation
                  </div>
                </div>
                
                <div className="text-xs text-gray-400">
                  {contributor.contributions} contributions
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <button 
          onClick={() => setIsLeaderboardModalOpen(true)}
          className="w-full mt-4 text-center text-pulse-600 hover:text-pulse-700 text-sm font-medium transition-colors"
        >
          View leaderboard →
        </button>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-br from-pulse-50 to-blue-50 rounded-lg border border-pulse-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-5 h-5 text-pulse-500" />
          <h3 className="font-semibold text-gray-900">Quick Tips</h3>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-pulse-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">Ask clear, specific questions to get better answers.</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-pulse-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">Use relevant tags to help others find your question.</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-pulse-500 rounded-full mt-2 flex-shrink-0"></div>
            <p className="text-gray-700">Vote on answers that help you or the community.</p>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <TrendingModal 
        isOpen={isTrendingModalOpen} 
        onClose={() => setIsTrendingModalOpen(false)} 
      />
      <LeaderboardModal 
        isOpen={isLeaderboardModalOpen} 
        onClose={() => setIsLeaderboardModalOpen(false)} 
      />
    </div>
  );
};

export default RightSidebar;
