
import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, Check, Clock, Edit, Trash2, Copy } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface Answer {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar: string;
    reputation: number;
  };
  votes: number;
  createdAt: Date;
  isAccepted: boolean;
  userVote: 'up' | 'down' | null;
}

interface AnswerListProps {
  answers: Answer[];
  onVote: (type: 'up' | 'down', targetType: 'answer', targetId: number) => void;
  onAcceptAnswer: (answerId: number) => void;
  questionOwnerId: number;
}

const AnswerList: React.FC<AnswerListProps> = ({
  answers,
  onVote,
  onAcceptAnswer,
  questionOwnerId
}) => {
  const { user } = useAuth();
  const [showLowScore, setShowLowScore] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleVote = (voteType: 'up' | 'down', answerId: number) => {
    onVote(voteType, 'answer', answerId);
  };

  const handleAcceptAnswer = (answerId: number) => {
    onAcceptAnswer(answerId);
    toast({
      title: "Answer accepted!",
      description: "This answer has been marked as the accepted solution.",
    });
  };

  const handleCodeCopy = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    toast({
      title: "Code copied!",
      description: "Code has been copied to your clipboard.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Sort answers: accepted first, then by votes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return b.votes - a.votes;
  });

  const filteredAnswers = showLowScore 
    ? sortedAnswers 
    : sortedAnswers.filter(answer => answer.votes >= 0);

  if (answers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-border p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No answers yet</h3>
        <p className="text-gray-600">Be the first to answer this question!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Answers Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
        
        {answers.some(answer => answer.votes < 0) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowLowScore(!showLowScore)}
            className="text-gray-600 hover:text-gray-900"
          >
            {showLowScore ? 'Hide low score answers' : 'Show all answers'}
          </Button>
        )}
      </div>

      {/* Answers List */}
      <div className="space-y-6">
        {filteredAnswers.map((answer, index) => (
          <div
            key={answer.id}
            className={cn(
              "bg-white rounded-2xl shadow-lg border border-border p-8 transition-all duration-300 hover:shadow-xl animate-fade-in-up",
              answer.isAccepted && "ring-2 ring-green-200 bg-green-50/50"
            )}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <div className="flex gap-6">
              {/* Voting Controls (Desktop) */}
              <div className="hidden md:flex flex-col items-center space-y-3 min-w-[60px]">
                <button
                  onClick={() => handleVote('up', answer.id)}
                  disabled={!user || answer.userVote === 'up'}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200 hover:scale-110",
                    answer.userVote === 'up'
                      ? "bg-pulse-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-pulse-100 hover:text-pulse-600",
                    !user && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <ThumbsUp className="w-6 h-6" />
                </button>
                
                <span className={cn(
                  "font-bold text-xl transition-colors",
                  answer.userVote === 'up' ? "text-pulse-600" : 
                  answer.userVote === 'down' ? "text-red-600" : "text-gray-700"
                )}>
                  {answer.votes}
                </span>
                
                <button
                  onClick={() => handleVote('down', answer.id)}
                  disabled={!user || answer.userVote === 'down'}
                  className={cn(
                    "p-3 rounded-full transition-all duration-200 hover:scale-110",
                    answer.userVote === 'down'
                      ? "bg-red-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600",
                    !user && "opacity-60 cursor-not-allowed"
                  )}
                >
                  <ThumbsDown className="w-6 h-6" />
                </button>
                
                {/* Accept Answer Button (for question owner) */}
                {questionOwnerId === 1 && !answer.isAccepted && (
                  <Button
                    onClick={() => handleAcceptAnswer(answer.id)}
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 mt-2"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                )}
              </div>

              {/* Answer Content */}
              <div className="flex-1 min-w-0">
                {/* Accepted Badge */}
                {answer.isAccepted && (
                  <div className="flex items-center space-x-2 mb-4 p-3 bg-green-100 rounded-lg animate-pulse-glow">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 font-semibold">Accepted Answer</span>
                  </div>
                )}

                {/* Mobile Voting */}
                <div className="md:hidden flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleVote('up', answer.id)}
                      disabled={!user || answer.userVote === 'up'}
                      className={cn(
                        "p-2 rounded-full transition-all duration-200",
                        answer.userVote === 'up'
                          ? "bg-pulse-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-pulse-100",
                        !user && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <ThumbsUp className="w-5 h-5" />
                    </button>
                    
                    <span className="font-bold text-lg text-gray-700">
                      {answer.votes}
                    </span>
                    
                    <button
                      onClick={() => handleVote('down', answer.id)}
                      disabled={!user || answer.userVote === 'down'}
                      className={cn(
                        "p-2 rounded-full transition-all duration-200",
                        answer.userVote === 'down'
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-red-100",
                        !user && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <ThumbsDown className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {questionOwnerId === 1 && !answer.isAccepted && (
                    <Button
                      onClick={() => handleAcceptAnswer(answer.id)}
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                  )}
                </div>

                {/* Answer Body */}
                <div 
                  className="prose prose-lg max-w-none mb-6"
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />

                {/* Meta Information */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <Link 
                      to={`/users/${answer.author.id}`}
                      className="flex items-center space-x-3 hover:text-pulse-600 transition-colors group"
                    >
                      <div className="w-8 h-8 bg-pulse-500 rounded-full flex items-center justify-center text-white text-sm font-semibold group-hover:scale-110 transition-transform">
                        {answer.author.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">@{answer.author.username}</div>
                        <div className="text-xs text-gray-500">{answer.author.reputation}</div>
                      </div>
                    </Link>
                    
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Answered {formatTimeAgo(answer.createdAt)}</span>
                    </div>
                  </div>

                  {/* Answer Actions */}
                  <div className="flex items-center space-x-2">
                    {answer.author.id === 999 && ( // Current user's answer
                      <>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pulse-600">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnswerList;
