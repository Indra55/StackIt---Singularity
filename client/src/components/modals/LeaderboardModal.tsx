import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Search, Crown, Star, Trophy, Medal, Award, TrendingUp, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface LeaderboardUser {
  id: number;
  username: string;
  reputation: number;
  badge: string;
  avatar: string;
  contributions: number;
  questions: number;
  answers: number;
  acceptedAnswers: number;
  joinDate: Date;
  rank: number;
}

const LeaderboardModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("all-time");

  const leaderboardUsers: LeaderboardUser[] = [
    {
      id: 1,
      username: "sarah_dev",
      reputation: 15420,
      badge: "gold",
      avatar: "/placeholder-avatar.jpg",
      contributions: 145,
      questions: 23,
      answers: 122,
      acceptedAnswers: 89,
      joinDate: new Date("2022-01-15"),
      rank: 1
    },
    {
      id: 2,
      username: "alex_code",
      reputation: 12340,
      badge: "gold",
      avatar: "/placeholder-avatar.jpg",
      contributions: 123,
      questions: 18,
      answers: 105,
      acceptedAnswers: 76,
      joinDate: new Date("2022-03-22"),
      rank: 2
    },
    {
      id: 3,
      username: "mike_react",
      reputation: 9876,
      badge: "silver",
      avatar: "/placeholder-avatar.jpg",
      contributions: 98,
      questions: 15,
      answers: 83,
      acceptedAnswers: 62,
      joinDate: new Date("2022-05-10"),
      rank: 3
    },
    {
      id: 4,
      username: "emma_ts",
      reputation: 7654,
      badge: "silver",
      avatar: "/placeholder-avatar.jpg",
      contributions: 87,
      questions: 12,
      answers: 75,
      acceptedAnswers: 54,
      joinDate: new Date("2022-07-08"),
      rank: 4
    },
    {
      id: 5,
      username: "john_dev",
      reputation: 6543,
      badge: "bronze",
      avatar: "/placeholder-avatar.jpg",
      contributions: 76,
      questions: 10,
      answers: 66,
      acceptedAnswers: 48,
      joinDate: new Date("2022-09-12"),
      rank: 5
    },
    {
      id: 6,
      username: "vue_master",
      reputation: 11234,
      badge: "gold",
      avatar: "/placeholder-avatar.jpg",
      contributions: 134,
      questions: 20,
      answers: 114,
      acceptedAnswers: 82,
      joinDate: new Date("2021-11-30"),
      rank: 6
    },
    {
      id: 7,
      username: "css_expert",
      reputation: 13456,
      badge: "gold",
      avatar: "/placeholder-avatar.jpg",
      contributions: 156,
      questions: 25,
      answers: 131,
      acceptedAnswers: 95,
      joinDate: new Date("2021-08-15"),
      rank: 7
    },
    {
      id: 8,
      username: "docker_guru",
      reputation: 8765,
      badge: "silver",
      avatar: "/placeholder-avatar.jpg",
      contributions: 92,
      questions: 14,
      answers: 78,
      acceptedAnswers: 58,
      joinDate: new Date("2022-02-28"),
      rank: 8
    },
    {
      id: 9,
      username: "python_pro",
      reputation: 9876,
      badge: "silver",
      avatar: "/placeholder-avatar.jpg",
      contributions: 108,
      questions: 16,
      answers: 92,
      acceptedAnswers: 67,
      joinDate: new Date("2022-04-05"),
      rank: 9
    },
    {
      id: 10,
      username: "security_hacker",
      reputation: 5432,
      badge: "bronze",
      avatar: "/placeholder-avatar.jpg",
      contributions: 65,
      questions: 8,
      answers: 57,
      acceptedAnswers: 41,
      joinDate: new Date("2022-10-20"),
      rank: 10
    }
  ];

  const timeFrames = [
    { id: "all-time", name: "All Time", icon: Trophy },
    { id: "this-month", name: "This Month", icon: Calendar },
    { id: "this-week", name: "This Week", icon: TrendingUp }
  ];

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'gold':
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'silver':
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 'bronze':
        return <Award className="h-5 w-5 text-orange-600" />;
      default:
        return <Star className="h-5 w-5 text-gray-400" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'silver':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'bronze':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredUsers = leaderboardUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const sortedUsers = filteredUsers.sort((a, b) => a.rank - b.rank);

  const formatJoinDate = (date: Date) => {
    const now = new Date();
    const diffInMonths = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30));
    return `${diffInMonths} months ago`;
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Leaderboard</h2>
            <p className="text-gray-600 mt-1">Top contributors in the community</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search contributors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Time Frame Filters */}
          <div className="flex flex-wrap gap-2">
            {timeFrames.map((timeFrame) => {
              const Icon = timeFrame.icon;
              return (
                <Button
                  key={timeFrame.id}
                  variant={selectedTimeFrame === timeFrame.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeFrame(timeFrame.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {timeFrame.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 bg-pulse-100 text-pulse-600 rounded-full flex items-center justify-center text-lg font-bold">
                    #{user.rank}
                  </div>
                  
                  {/* Avatar and Badge */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-16 h-16 bg-pulse-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      {getBadgeIcon(user.badge)}
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">@{user.username}</h3>
                      <Badge className={`${getBadgeColor(user.badge)} border`}>
                        {user.badge.charAt(0).toUpperCase() + user.badge.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{user.reputation.toLocaleString()} reputation</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{user.contributions} contributions</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatJoinDate(user.joinDate)}</span>
                      </div>
                    </div>
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{user.questions}</div>
                        <div className="text-gray-500">Questions</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">{user.answers}</div>
                        <div className="text-gray-500">Answers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-pulse-600">{user.acceptedAnswers}</div>
                        <div className="text-gray-500">Accepted</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900">
                          {user.answers > 0 ? Math.round((user.acceptedAnswers / user.answers) * 100) : 0}%
                        </div>
                        <div className="text-gray-500">Accept Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedUsers.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contributors found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                <span>Gold: 10,000+ reputation</span>
              </div>
              <div className="flex items-center gap-2">
                <Medal className="h-4 w-4 text-gray-400" />
                <span>Silver: 5,000+ reputation</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-orange-600" />
                <span>Bronze: 1,000+ reputation</span>
              </div>
            </div>
            <Button onClick={onClose} className="bg-pulse-600 hover:bg-pulse-700">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeaderboardModal; 