import React, { useState } from "react";
import PlatformNavbar from "@/components/navigation/PlatformNavbar";
import QuestionCard from "@/components/platform/QuestionCard";
import { QuestionActions } from "@/components/platform/QuestionActions";
import LeftSidebar from "@/components/sidebars/LeftSidebar";
import RightSidebar from "@/components/sidebars/RightSidebar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for questions
const mockQuestions = [
  {
    id: 1,
    title: "How do I integrate JWT authentication in React?",
    description: "I'm building a React application and need to implement JWT authentication. What's the best approach for handling tokens securely?",
    author: {
      id: 1,
      username: "pranav_d",
      avatar: "/placeholder-avatar.jpg",
      reputation: 1520
    },
    tags: ["React", "JWT", "Authentication", "Security"],
    votes: 15,
    answers: 3,
    views: 128,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    hasAcceptedAnswer: true
  },
  {
    id: 2,
    title: "Best practices for TypeScript with React hooks?",
    description: "I'm new to TypeScript and wondering about the best practices when using it with React hooks like useState and useEffect.",
    author: {
      id: 2,
      username: "sarah_dev",
      avatar: "/placeholder-avatar.jpg",
      reputation: 890
    },
    tags: ["TypeScript", "React", "Hooks"],
    votes: 8,
    answers: 0,
    views: 45,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    hasAcceptedAnswer: false
  },
  {
    id: 3,
    title: "How to optimize React component re-renders?",
    description: "My React app is experiencing performance issues due to unnecessary re-renders. What are the best strategies to optimize this?",
    author: {
      id: 3,
      username: "alex_code",
      avatar: "/placeholder-avatar.jpg",
      reputation: 2340
    },
    tags: ["React", "Performance", "Optimization"],
    votes: 23,
    answers: 5,
    views: 234,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    hasAcceptedAnswer: true
  },
  {
    id: 4,
    title: "Setting up ESLint and Prettier in a new project",
    description: "What's the recommended configuration for ESLint and Prettier in a modern JavaScript/TypeScript project?",
    author: {
      id: 4,
      username: "mike_lint",
      avatar: "/placeholder-avatar.jpg",
      reputation: 567
    },
    tags: ["ESLint", "Prettier", "Configuration", "JavaScript"],
    votes: 12,
    answers: 2,
    views: 89,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    hasAcceptedAnswer: false
  },
  {
    id: 5,
    title: "Understanding async/await vs Promises in JavaScript",
    description: "Can someone explain the differences between async/await and traditional Promise chains? When should I use each approach?",
    author: {
      id: 5,
      username: "emma_async",
      avatar: "/placeholder-avatar.jpg",
      reputation: 1100
    },
    tags: ["JavaScript", "Async", "Promises", "ES6"],
    votes: 19,
    answers: 4,
    views: 156,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    hasAcceptedAnswer: true
  }
];

const Questions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [questions] = useState(mockQuestions);
  const navigate = useNavigate();
  const questionsPerPage = 10;

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Enhanced spacing */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-28">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content - Better spacing and organization */}
          <div className="flex-1 max-w-4xl">
            <div className="space-y-8">
              {/* Enhanced Questions Header */}
              <div className="bg-white rounded-2xl shadow-lg border border-border p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Community Questions
                    </h1>
                    <p className="text-gray-600">
                      Discover answers from the developer community
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pulse-600">
                      {questions.length.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">questions</div>
                  </div>
                </div>

                {/* Community Features */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/messages/experts')}
                    className="hover:bg-pulse-50 hover:border-pulse-200 transition-all duration-300"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Experts
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/messages/community')}
                    className="hover:bg-orange-50 hover:border-orange-200 transition-all duration-300"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Discussions
                  </Button>
                </div>

                {/* Enhanced Mobile Sidebar Content */}
                <div className="lg:hidden mb-8">
                  <div className="bg-gradient-to-r from-pulse-50 to-orange-50 rounded-xl border border-pulse-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg">Popular Tags</h3>
                    <div className="flex flex-wrap gap-3">
                      {["React", "JavaScript", "TypeScript", "Node.js", "Python"].map((tag) => (
                        <button
                          key={tag}
                          className="px-4 py-2 bg-white text-pulse-700 rounded-full text-sm font-medium hover:bg-pulse-100 hover:scale-105 transition-all duration-300 shadow-md border border-pulse-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Question Cards with better spacing */}
              <div className="space-y-6">
                {currentQuestions.map((question, index) => (
                  <div 
                    key={question.id}
                    className="opacity-0 animate-fade-in bg-white rounded-2xl shadow-lg border border-border overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-6">
                      <QuestionCard question={question} />
                      {/* Removed QuestionActions */}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="bg-white rounded-2xl shadow-lg border border-border p-6">
                    <Pagination>
                      <PaginationContent className="gap-2">
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className="hover:bg-pulse-50 hover:text-pulse-700 transition-all duration-300 rounded-xl"
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(page);
                              }}
                              className={`hover:bg-pulse-50 hover:text-pulse-700 transition-all duration-300 rounded-xl ${
                                page === currentPage 
                                  ? 'bg-pulse-500 text-white hover:bg-pulse-600 hover:text-white' 
                                  : ''
                              }`}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        
                        <PaginationItem>
                          <PaginationNext 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className="hover:bg-pulse-50 hover:text-pulse-700 transition-all duration-300 rounded-xl"
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Enhanced spacing */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-28">
              <RightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Questions;
