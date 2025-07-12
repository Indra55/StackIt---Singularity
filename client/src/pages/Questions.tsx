import React, { useState, useEffect } from "react";
import PlatformNavbar from "@/components/navigation/PlatformNavbar";
import QuestionCard from "@/components/platform/QuestionCard";
import { QuestionActions } from "@/components/platform/QuestionActions";
import LeftSidebar from "@/components/sidebars/LeftSidebar";
import RightSidebar from "@/components/sidebars/RightSidebar";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const Questions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const questionsPerPage = 10;

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("http://localhost:3100/posts");
        const data = await res.json();
        if (data.status === "success" && Array.isArray(data.posts)) {
          // Map backend data to QuestionCard props
          setQuestions(
            data.posts.map((q: any) => ({
              id: q.id,
              title: q.title,
              description: q.content,
              author: {
                id: q.user_id,
                username: q.username,
                avatar: "/placeholder-avatar.jpg", // No avatar in backend response
                reputation: 0 // No reputation in backend response
              },
              tags: q.tags || [],
              votes: (q.upvotes || 0) - (q.downvotes || 0),
              answers: q.answer_count || 0,
              views: q.view_count || 0,
              createdAt: new Date(q.created),
              hasAcceptedAnswer: q.is_answered || false
            }))
          );
        } else {
          setError("Failed to load questions");
        }
      } catch (err: any) {
        setError("Failed to load questions");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  const totalPages = Math.ceil(questions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const currentQuestions = questions.slice(startIndex, startIndex + questionsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Questions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Enhanced spacing */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-28">
              <LeftSidebar />
            </div>
          </div>

          {/* Main Content - Better spacing and organization */}
          <div className="flex-1 max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              {/* Enhanced Questions Header */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-border p-4 sm:p-6 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
                  <div className="mb-4 sm:mb-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                      Community Questions
                    </h1>
                    <p className="text-gray-600 text-sm sm:text-base">
                      Discover answers from the developer community
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-pulse-600">
                      {loading ? "..." : questions.length.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">questions</div>
                  </div>
                </div>

                {/* Community Features */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/messages/experts')}
                    className="hover:bg-pulse-50 hover:border-pulse-200 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Message Experts
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/messages/community')}
                    className="hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 text-xs sm:text-sm"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Join Discussions
                  </Button>
                </div>

                {/* Enhanced Mobile Sidebar Content */}
                <div className="lg:hidden mb-6 sm:mb-8">
                  <div className="bg-gradient-to-r from-pulse-50 to-orange-50 rounded-lg sm:rounded-xl border border-pulse-200 p-4 sm:p-6">
                    <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-base sm:text-lg">Popular Tags</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {["React", "JavaScript", "TypeScript", "Node.js", "Python"].map((tag) => (
                        <button
                          key={tag}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-pulse-700 rounded-full text-xs sm:text-sm font-medium hover:bg-pulse-100 hover:scale-105 transition-all duration-300 shadow-md border border-pulse-200"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Question Cards with better spacing */}
              <div className="space-y-4 sm:space-y-6">
                {loading ? (
                  <div className="text-center py-8 sm:py-12 text-base sm:text-lg text-gray-500">Loading questions...</div>
                ) : error ? (
                  <div className="text-center py-8 sm:py-12 text-base sm:text-lg text-red-500">{error}</div>
                ) : currentQuestions.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-base sm:text-lg text-gray-500">No questions found.</div>
                ) : (
                  currentQuestions.map((question, index) => (
                    <div 
                      key={question.id}
                      className="opacity-0 animate-fade-in bg-white rounded-xl sm:rounded-2xl shadow-lg border border-border overflow-hidden"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="p-4 sm:p-6">
                        <QuestionCard question={question} />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && !loading && !error && (
                <div className="mt-8 sm:mt-12 flex justify-center">
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-border p-4 sm:p-6">
                    <Pagination>
                      <PaginationContent className="gap-1 sm:gap-2">
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className="hover:bg-pulse-50 hover:text-pulse-700 transition-all duration-300 rounded-lg sm:rounded-xl text-xs sm:text-sm"
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
                              className={`hover:bg-pulse-50 hover:text-pulse-700 transition-all duration-300 rounded-lg sm:rounded-xl text-xs sm:text-sm ${
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
                            className="hover:bg-pulse-50 hover:text-pulse-700 transition-all duration-300 rounded-lg sm:rounded-xl text-xs sm:text-sm"
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
