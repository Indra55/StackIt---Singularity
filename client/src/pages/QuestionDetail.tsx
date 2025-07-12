
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ChevronRight, Eye, Clock, User } from "lucide-react";
import PlatformNavbar from "@/components/navigation/PlatformNavbar";
import QuestionBlock from "@/components/question/QuestionBlock";
import AnswerList from "@/components/question/AnswerList";
import AnswerForm from "@/components/question/AnswerForm";
import RelatedSidebar from "@/components/question/RelatedSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { apiPost } from '@/lib/api';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    const fetchData = async () => {
      try {
        // Fetch question details (with comments)
        const res = await fetch(`http://localhost:3100/posts/${id}`, {
          headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('stackit_token') || sessionStorage.getItem('stackit_token')}` } : {}
        });
        const data = await res.json();
        if (data.status === 'success' && data.post) {
          setQuestion({
            id: data.post.id,
            title: data.post.title,
            content: data.post.content,
            author: {
              id: data.post.user_id,
              username: data.post.username,
              avatar: "/placeholder-avatar.jpg",
              reputation: 0
            },
            tags: data.post.tags || [],
            votes: (data.post.upvotes || 0) - (data.post.downvotes || 0),
            views: data.post.view_count || 0,
            createdAt: new Date(data.post.created),
            hasAcceptedAnswer: data.post.is_answered || false,
            userVote: data.userVote || null
          });
          // Map comments to answers
          setAnswers(
            (data.comments || []).map((c: any) => ({
              id: c.id,
              content: c.content,
              author: {
                id: c.user_id,
                username: c.username,
                avatar: "/placeholder-avatar.jpg",
                reputation: 0
              },
              votes: (c.upvotes || 0) - (c.downvotes || 0),
              createdAt: new Date(c.created_at),
              isAccepted: c.is_accepted || false,
              userVote: null // Not available in backend response
            }))
          );
        } else {
          setError("Question not found");
        }
      } catch (err: any) {
        setError("Failed to load question");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  // Voting and accept answer handlers (to be implemented with API calls)
  const handleVote = async (type: 'up' | 'down', targetType: 'question' | 'answer', targetId: number) => {
    if (targetType === 'question') {
      if (!user) {
        setError('You must be logged in to vote.');
        return;
      }
      try {
        const endpoint = type === 'up' ? `/posts/${targetId}/upvote` : `/posts/${targetId}/downvote`;
        const data = await apiPost(endpoint, {});
        if (data.status === 'success' && data.post) {
          setQuestion((prev: any) => prev ? {
            ...prev,
            votes: (data.post.upvotes || 0) - (data.post.downvotes || 0),
            userVote: prev.userVote === type ? null : type
          } : prev);
        } else {
          setError(data.message || 'Failed to vote');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to vote');
      }
    } else if (targetType === 'answer') {
      if (!user) {
        setError('You must be logged in to vote.');
        return;
      }
      try {
        const endpoint = type === 'up' ? `/comments/${targetId}/upvote` : `/comments/${targetId}/downvote`;
        const data = await apiPost(endpoint, {});
        if (data.status === 'success' && data.comment) {
          setAnswers((prev: any[]) => prev.map((a) =>
            a.id === data.comment.id
              ? {
                  ...a,
                  votes: (data.comment.upvotes || 0) - (data.comment.downvotes || 0),
                  userVote: a.userVote === type ? null : type
                }
              : a
          ));
        } else {
          setError(data.message || 'Failed to vote on answer');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to vote on answer');
      }
    }
  };
  const handleAcceptAnswer = (answerId: number) => {
    // TODO: Implement accept answer API call
  };
  const handleNewAnswer = async (content: string) => {
    if (!user) {
      setError('You must be logged in to answer.');
      return;
    }
    try {
      const data = await apiPost(`/posts/${id}/comment`, { content });
      if (data.status === 'success') {
        // Re-fetch question and answers to update the list
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:3100/posts/${id}`, {
          headers: user ? { 'Authorization': `Bearer ${localStorage.getItem('stackit_token') || sessionStorage.getItem('stackit_token')}` } : {}
        });
        const updated = await res.json();
        if (updated.status === 'success' && updated.post) {
          setQuestion({
            id: updated.post.id,
            title: updated.post.title,
            content: updated.post.content,
            author: {
              id: updated.post.user_id,
              username: updated.post.username,
              avatar: "/placeholder-avatar.jpg",
              reputation: 0
            },
            tags: updated.post.tags || [],
            votes: (updated.post.upvotes || 0) - (updated.post.downvotes || 0),
            views: updated.post.view_count || 0,
            createdAt: new Date(updated.post.created),
            hasAcceptedAnswer: updated.post.is_answered || false,
            userVote: updated.userVote || null
          });
          setAnswers(
            (updated.comments || []).map((c: any) => ({
              id: c.id,
              content: c.content,
              author: {
                id: c.user_id,
                username: c.username,
                avatar: "/placeholder-avatar.jpg",
                reputation: 0
              },
              votes: (c.upvotes || 0) - (c.downvotes || 0),
              createdAt: new Date(c.created_at),
              isAccepted: c.is_accepted || false,
              userVote: null
            }))
          );
        }
        setLoading(false);
      } else {
        setError(data.message || 'Failed to post answer');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post answer');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading question...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-red-500">{error}</div>;
  }
  if (!question) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Question not found.</div>;
  }

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
              <BreadcrumbLink href="/questions">Questions</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{question?.title || question?.id || '...'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-4xl">
            <div className="space-y-6 sm:space-y-8">
              <QuestionBlock question={question} onVote={handleVote} onAcceptAnswer={handleAcceptAnswer} />
              <AnswerList answers={answers} onVote={handleVote} onAcceptAnswer={handleAcceptAnswer} questionOwnerId={question.author.id} />
              <AnswerForm onSubmit={handleNewAnswer} />
            </div>
          </div>
          {/* Related Sidebar */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-28">
              <RelatedSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
