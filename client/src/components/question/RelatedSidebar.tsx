
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Eye, MessageSquare } from "lucide-react";

interface RelatedSidebarProps {
  currentQuestionId: number;
}

const mockTrendingQuestions = [
  {
    id: 2,
    title: "Best practices for TypeScript with React hooks?",
    views: 45,
    answers: 0
  },
  {
    id: 3,
    title: "How to optimize React component re-renders?",
    views: 234,
    answers: 5
  },
  {
    id: 4,
    title: "Setting up ESLint and Prettier in a new project",
    views: 89,
    answers: 2
  },
  {
    id: 5,
    title: "Understanding async/await vs Promises in JavaScript",
    views: 156,
    answers: 4
  }
];

const mockCommunityStats = {
  totalQuestions: 1547,
  totalAnswers: 3891,
  activeUsers: 156,
  todayQuestions: 23
};

const RelatedSidebar: React.FC<RelatedSidebarProps> = ({ currentQuestionId }) => {
  const relatedQuestions = mockTrendingQuestions.filter(q => q.id !== currentQuestionId);

  return (
    <div className="space-y-6">
      {/* Ask New Question CTA */}
      <div className="bg-gradient-to-r from-pulse-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="font-bold text-lg mb-2">Have a Question?</h3>
        <p className="text-pulse-100 text-sm mb-4">
          Get help from our amazing community of developers
        </p>
        <Button 
          asChild
          className="w-full bg-white text-pulse-600 hover:bg-gray-100 font-semibold"
        >
          <Link to="/ask">
            <Plus className="w-4 h-4 mr-2" />
            Ask New Question
          </Link>
        </Button>
      </div>

      {/* Community Stats */}
      <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <Users className="w-5 h-5 mr-2 text-pulse-500" />
          Community Stats
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-pulse-50 rounded-lg">
            <div className="text-xl font-bold text-pulse-600">{mockCommunityStats.totalQuestions.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Questions</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{mockCommunityStats.totalAnswers.toLocaleString()}</div>
            <div className="text-xs text-gray-600">Answers</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{mockCommunityStats.activeUsers}</div>
            <div className="text-xs text-gray-600">Active Users</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{mockCommunityStats.todayQuestions}</div>
            <div className="text-xs text-gray-600">Today</div>
          </div>
        </div>
      </div>

      {/* Trending Questions */}
      <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-pulse-500" />
          Trending Questions
        </h3>
        <div className="space-y-4">
          {relatedQuestions.map((question, index) => (
            <Link
              key={question.id}
              to={`/questions/${question.id}`}
              className="block p-4 rounded-lg border border-gray-200 hover:border-pulse-300 hover:bg-pulse-50/50 transition-all duration-200 group"
            >
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-pulse-700 line-clamp-2 mb-2">
                {question.title}
              </h4>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{question.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-3 h-3" />
                    <span>{question.answers}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <Button variant="ghost" size="sm" className="w-full mt-4 text-pulse-600 hover:text-pulse-700 hover:bg-pulse-50">
          View All Questions →
        </Button>
      </div>

      {/* Popular Tags */}
      <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
        <h3 className="font-bold text-gray-900 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {["React", "JavaScript", "TypeScript", "Node.js", "Python", "CSS", "HTML", "API"].map((tag) => (
            <Link
              key={tag}
              to={`/questions?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-pulse-100 text-pulse-700 rounded-full text-xs font-medium hover:bg-pulse-200 transition-colors hover:scale-105 transform"
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedSidebar;
