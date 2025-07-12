
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Eye, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Question {
  id: number;
  title: string;
  description: string;
  author: {
    id: number;
    username: string;
    avatar: string;
    reputation: number;
  };
  tags: string[];
  votes: number;
  answers: number;
  views: number;
  createdAt: Date;
  hasAcceptedAnswer: boolean;
}

interface QuestionCardProps {
  question: Question;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const { user } = useAuth();
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [currentVotes, setCurrentVotes] = useState(question.votes);

  const handleVote = (voteType: 'up' | 'down') => {
    if (!user) return; // Only allow logged-in users
    if (userVote === voteType) return; // Prevent voting more than once in the same direction
    // Mock voting logic - in real app this would call an API
    const voteDiff = voteType === 'up' ? 1 : -1;
    const prevVoteDiff = userVote === 'up' ? -1 : userVote === 'down' ? 1 : 0;
    setUserVote(voteType);
    setCurrentVotes(question.votes + voteDiff + prevVoteDiff);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-white rounded-lg border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
      <div className="p-6">
        <div className="flex gap-4">
          {/* Voting Controls */}
          <div className="flex flex-col items-center space-y-2 min-w-[50px]">
            <button
              onClick={() => handleVote('up')}
              disabled={!user || userVote === 'up'}
              className={cn(
                "p-2 rounded-full transition-all duration-200 hover:scale-110",
                userVote === 'up'
                  ? "bg-pulse-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-pulse-100 hover:text-pulse-600",
                !user && "opacity-60 cursor-not-allowed"
              )}
            >
              <ThumbsUp className="w-5 h-5" />
            </button>
            
            <span className={cn(
              "font-bold text-lg transition-colors",
              userVote === 'up' ? "text-pulse-600" : userVote === 'down' ? "text-red-600" : "text-gray-700"
            )}>
              {currentVotes}
            </span>
            
            <button
              onClick={() => handleVote('down')}
              disabled={!user || userVote === 'down'}
              className={cn(
                "p-2 rounded-full transition-all duration-200 hover:scale-110",
                userVote === 'down'
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600",
                !user && "opacity-60 cursor-not-allowed"
              )}
            >
              <ThumbsDown className="w-5 h-5" />
            </button>
          </div>

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <Link 
              to={`/questions/${question.id}`}
              className="block group-hover:text-pulse-600 transition-colors"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:underline">
                {question.title}
              </h2>
            </Link>

            {/* Description Preview */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {question.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 bg-pulse-100 text-pulse-700 rounded-full text-xs font-medium hover:bg-pulse-200 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Meta Information */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center space-x-4">
                {/* Author */}
                <Link 
                  to={`/users/${question.author.id}`}
                  className="flex items-center space-x-2 hover:text-pulse-600 transition-colors"
                >
                  <div className="w-6 h-6 bg-pulse-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {question.author.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium">@{question.author.username}</span>
                  <span className="text-xs text-gray-400">({question.author.reputation})</span>
                </Link>
                
                {/* Timestamp */}
                <span>{formatTimeAgo(question.createdAt)}</span>
              </div>

              {/* Answer and View Stats */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views}</span>
                </div>
                
                <Link
                  to={`/questions/${question.id}#answers`}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    question.answers > 0
                      ? question.hasAcceptedAnswer
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {question.hasAcceptedAnswer && <Check className="w-3 h-3" />}
                  <MessageSquare className="w-3 h-3" />
                  <span>{question.answers} {question.answers === 1 ? 'Answer' : 'Answers'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
