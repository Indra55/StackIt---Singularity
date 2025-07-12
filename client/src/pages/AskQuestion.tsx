
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { apiGet, apiPost } from '@/lib/api';
import { FloatingLabel } from '@/components/form/FloatingLabel';
import { RichTextEditor } from '@/components/form/RichTextEditor';
import { CommunitySelector } from '@/components/form/CommunitySelector';
import { TagsInput } from '@/components/form/TagsInput';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormErrorBanner } from '@/components/form/FormErrorBanner';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { ArrowLeft } from 'lucide-react';

const AskQuestion = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [community, setCommunity] = useState<any>(null); // now object or null
  const [tags, setTags] = useState<string[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lockedCommunity, setLockedCommunity] = useState<any>(null);
  const [errorVisible, setErrorVisible] = useState(false);

  useEffect(() => {
    // Fetch communities and tags from backend
    const fetchData = async () => {
      try {
        const [comms, tagsData] = await Promise.all([
          apiGet('/api/communities'),
          apiGet('/tags')
        ]);
        setCommunities(comms.communities || []);
        setAllTags(tagsData.tags || []);
        // If posting from a community page, pre-select and lock that community
        if (slug && comms.communities) {
          const found = comms.communities.find((c: any) => c.name === slug || c.slug === slug);
          if (found) {
            setCommunity(found);
            setLockedCommunity(found);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setErrorVisible(true);
      }
    };
    fetchData();
  }, [slug]);

  useEffect(() => {
    // Load draft from localStorage and validate
    try {
      const draft = localStorage.getItem('ask_question_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed && typeof parsed === 'object' && parsed.title && parsed.content) {
          setTitle(parsed.title);
          setContent(parsed.content);
          setTags(parsed.tags || []);
          if (parsed.community) setCommunity(parsed.community);
        } else {
          localStorage.removeItem('ask_question_draft');
        }
      }
    } catch (e) {
      localStorage.removeItem('ask_question_draft');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!title.trim() || !content.trim()) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      const postData: any = {
        title: title.trim(),
        content: content.trim(),
        tags: tags
      };
      if (community) {
        postData.community_name = community.name;
      }
      await apiPost('/posts/create', postData);
      setSuccess(true);
      setLoading(false);
      navigate('/questions');
          } catch (err: any) {
        setError(err.message || 'Failed to post question');
        setErrorVisible(true);
        setLoading(false);
      }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PlatformNavbar />
        <div className="pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="max-w-md mx-auto p-6 text-center">
              <p className="text-gray-600">Please log in to ask a question.</p>
              <Button 
                onClick={() => navigate('/auth/login')} 
                className="mt-4 w-full"
              >
                Log In
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformNavbar />
      <div className="pt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-4">
          {/* Breadcrumb Navigation */}
          <div className="mb-3">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink 
                    onClick={() => navigate('/questions')}
                    className="cursor-pointer hover:text-pulse-600"
                  >
                    Questions
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Ask Question</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Back Button */}
          <div className="mb-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/questions')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Questions</span>
            </Button>
          </div>

          {/* Main Content */}
          <div className="max-w-4xl mx-auto">
            <Card className="p-4 sm:p-6">
              <div className="mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                  Ask a Question
                </h1>
                <p className="text-gray-600 text-sm">
                  Share your knowledge or get help from the community
                </p>
              </div>

              {error && (
                <FormErrorBanner 
                  message={error} 
                  visible={errorVisible}
                  onDismiss={() => setErrorVisible(false)}
                />
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Title Field */}
                <div>
                  <FloatingLabel
                    label="Title"
                    value={title}
                    onChange={setTitle}
                    required
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific and imagine you're asking another person
                  </p>
                </div>

                {/* Content Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Details *
                  </label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Describe your question in detail..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include all the information someone would need to answer your question
                  </p>
                </div>

                {/* Community Selector */}
                <div>
                  <CommunitySelector
                    communities={communities}
                    value={community}
                    onChange={c => setCommunity(c)}
                    required={false}
                    locked={!!lockedCommunity}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a community to post in (optional)
                  </p>
                </div>

                {/* Tags Input */}
                <div>
                  <TagsInput
                    suggestedTags={allTags.map((t: any) => t.name)}
                    value={tags}
                    onChange={setTags}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Add up to 5 tags to help others find your question
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <Button 
                    type="submit" 
                    className="flex-1 bg-pulse-600 hover:bg-pulse-700 text-white py-2.5 text-sm font-medium" 
                    disabled={loading}
                  >
                    {loading ? 'Posting...' : 'Post Question'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => navigate('/questions')}
                    className="flex-1 sm:flex-none"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
