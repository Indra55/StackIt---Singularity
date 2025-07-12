import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Search, TrendingUp, Clock, MessageSquare, ThumbsUp, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface TrendingQuestion {
  id: number;
  title: string;
  description: string;
  votes: number;
  answers: number;
  views: number;
  tags: string[];
  author: {
    username: string;
    reputation: number;
  };
  createdAt: Date;
  timeFrame: string;
}

const TrendingModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState("today");

  const trendingQuestions: TrendingQuestion[] = [
    {
      id: 1,
      title: "How to implement dark mode in React?",
      description: "I'm looking for the best practices to implement dark mode in a React application. What are the recommended approaches?",
      votes: 23,
      answers: 5,
      views: 1234,
      tags: ["React", "CSS", "Dark Mode"],
      author: { username: "sarah_dev", reputation: 15420 },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      timeFrame: "today"
    },
    {
      id: 2,
      title: "Best practices for API error handling",
      description: "What are the industry best practices for handling API errors in modern web applications?",
      votes: 18,
      answers: 3,
      views: 987,
      tags: ["API", "Error Handling", "Best Practices"],
      author: { username: "alex_code", reputation: 12340 },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      timeFrame: "today"
    },
    {
      id: 3,
      title: "Understanding React Server Components",
      description: "Can someone explain React Server Components and when to use them?",
      votes: 31,
      answers: 7,
      views: 2156,
      tags: ["React", "Server Components", "Next.js"],
      author: { username: "mike_react", reputation: 9876 },
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      timeFrame: "today"
    },
    {
      id: 4,
      title: "TypeScript generic constraints explained",
      description: "I'm struggling with TypeScript generic constraints. Can someone provide clear examples?",
      votes: 15,
      answers: 2,
      views: 654,
      tags: ["TypeScript", "Generics"],
      author: { username: "emma_ts", reputation: 7654 },
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      timeFrame: "today"
    },
    {
      id: 5,
      title: "Optimizing bundle size in Webpack",
      description: "What are the most effective ways to reduce bundle size in Webpack?",
      votes: 12,
      answers: 4,
      views: 543,
      tags: ["Webpack", "Performance", "Bundle Size"],
      author: { username: "john_dev", reputation: 6543 },
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      timeFrame: "today"
    },
    {
      id: 6,
      title: "Vue 3 Composition API vs Options API",
      description: "When should I use Composition API vs Options API in Vue 3?",
      votes: 28,
      answers: 6,
      views: 1876,
      tags: ["Vue.js", "Composition API"],
      author: { username: "vue_master", reputation: 11234 },
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      timeFrame: "week"
    },
    {
      id: 7,
      title: "Docker multi-stage builds optimization",
      description: "How can I optimize my Docker multi-stage builds for faster builds?",
      votes: 22,
      answers: 3,
      views: 1432,
      tags: ["Docker", "DevOps", "Optimization"],
      author: { username: "docker_guru", reputation: 8765 },
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      timeFrame: "week"
    },
    {
      id: 8,
      title: "CSS Grid vs Flexbox: When to use which?",
      description: "I'm confused about when to use CSS Grid vs Flexbox. Can someone clarify?",
      votes: 35,
      answers: 8,
      views: 2987,
      tags: ["CSS", "Grid", "Flexbox"],
      author: { username: "css_expert", reputation: 13456 },
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      timeFrame: "week"
    }
  ];

  const timeFrames = [
    { id: "today", name: "Today", icon: Clock },
    { id: "week", name: "This Week", icon: Calendar },
    { id: "month", name: "This Month", icon: Calendar }
  ];

  const filteredQuestions = trendingQuestions.filter(question => {
    const matchesSearch = question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTimeFrame = selectedTimeFrame === "all" || question.timeFrame === selectedTimeFrame;
    return matchesSearch && matchesTimeFrame;
  });

  const sortedQuestions = filteredQuestions.sort((a, b) => b.votes - a.votes);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trending Questions</h2>
            <p className="text-gray-600 mt-1">Most popular questions in the community</p>
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
                placeholder="Search trending questions..."
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

        {/* Questions List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {sortedQuestions.map((question, index) => (
              <Link
                key={question.id}
                to={`/questions/${question.id}`}
                className="block group"
                onClick={onClose}
              >
                <div className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-pulse-100 text-pulse-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-pulse-600 transition-colors mb-2 line-clamp-2">
                        {question.title}
                      </h3>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {question.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{question.votes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{question.answers}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{question.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTimeAgo(question.createdAt)}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">by @{question.author.username}</span>
                          <Badge variant="secondary" className="text-xs">
                            {question.author.reputation.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {question.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {sortedQuestions.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trending questions found</h3>
              <p className="text-gray-600">Try adjusting your search or time frame criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {sortedQuestions.length} of {trendingQuestions.length} trending questions
            </p>
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

export default TrendingModal; 