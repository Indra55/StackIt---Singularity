
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Eye, Clock, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface QuestionBlockProps {
  question: {
    id: number;
    title: string;
    content: string;
    author: {
      id: number;
      username: string;
      avatar: string;
      reputation: number;
    };
    tags: string[];
    votes: number;
    views: number;
    createdAt: Date;
    hasAcceptedAnswer: boolean;
    userVote: 'up' | 'down' | null;
  };
  onVote: (type: 'up' | 'down', targetType: 'question', targetId: number) => void;
  onAcceptAnswer: (answerId: number) => void;
}

const QuestionBlock: React.FC<QuestionBlockProps> = ({ 
  question, 
  onVote,
  onAcceptAnswer 
}) => {
  const { user } = useAuth();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleVote = (voteType: 'up' | 'down') => {
    onVote(voteType, 'question', question.id);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const handleCodeCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border p-8 animate-fade-in-up">
      <div className="flex gap-6">
        {/* Voting Controls (Desktop) */}
        <div className="hidden md:flex flex-col items-center space-y-3 min-w-[60px]">
          <button
            onClick={() => handleVote('up')}
            disabled={!user || question.userVote === 'up'}
            className={cn(
              "p-3 rounded-full transition-all duration-200 hover:scale-110",
              question.userVote === 'up'
                ? "bg-pulse-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-pulse-100 hover:text-pulse-600",
              !user && "opacity-60 cursor-not-allowed"
            )}
          >
            <ThumbsUp className="w-6 h-6" />
          </button>
          
          <span className={cn(
            "font-bold text-xl transition-colors",
            question.userVote === 'up' ? "text-pulse-600" : 
            question.userVote === 'down' ? "text-red-600" : "text-gray-700"
          )}>
            {question.votes}
          </span>
          
          <button
            onClick={() => handleVote('down')}
            disabled={!user || question.userVote === 'down'}
            className={cn(
              "p-3 rounded-full transition-all duration-200 hover:scale-110",
              question.userVote === 'down'
                ? "bg-red-500 text-white shadow-lg"
                : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600",
              !user && "opacity-60 cursor-not-allowed"
            )}
          >
            <ThumbsDown className="w-6 h-6" />
          </button>
          
          {question.hasAcceptedAnswer && (
            <div className="p-2 bg-green-100 rounded-full">
              <Check className="w-5 h-5 text-green-600" />
            </div>
          )}
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          {/* Mobile Voting */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleVote('up')}
                disabled={!user || question.userVote === 'up'}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  question.userVote === 'up'
                    ? "bg-pulse-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-pulse-100",
                  !user && "opacity-60 cursor-not-allowed"
                )}
              >
                <ThumbsUp className="w-5 h-5" />
              </button>
              
              <span className="font-bold text-lg text-gray-700">
                {question.votes}
              </span>
              
              <button
                onClick={() => handleVote('down')}
                disabled={!user || question.userVote === 'down'}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  question.userVote === 'down'
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-red-100",
                  !user && "opacity-60 cursor-not-allowed"
                )}
              >
                <ThumbsDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight animate-fade-in">
            {question.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, index) => (
              <Link
                key={tag}
                to={`/questions?tag=${encodeURIComponent(tag)}`}
                className="px-3 py-1 bg-pulse-100 text-pulse-700 rounded-full text-sm font-medium hover:bg-pulse-200 transition-all duration-300 hover:scale-105 animate-slide-down-fade"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Question Body */}
          <div 
            className="prose prose-lg max-w-none mb-6"
            dangerouslySetInnerHTML={{ __html: question.content }}
          />

          {/* Meta Information */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <Link 
                to={`/users/${question.author.id}`}
                className="flex items-center space-x-3 hover:text-pulse-600 transition-colors group"
              >
                <div className="w-10 h-10 bg-pulse-500 rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
                  {question.author.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">@{question.author.username}</div>
                  <div className="text-xs text-gray-500">{question.author.reputation} reputation</div>
                </div>
              </Link>
              
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Asked {formatTimeAgo(question.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{question.views} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionBlock;
