
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
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <Card className="p-6 mt-8 text-center">Please log in to ask a question.</Card>;
  }

  return (
    <Card className="max-w-2xl mx-auto mt-8 p-6">
      <h2 className="text-2xl font-bold mb-4">Ask a Question</h2>
      {error && <FormErrorBanner message={error} />}
      <form onSubmit={handleSubmit}>
        <FloatingLabel
          label="Title"
          value={title}
          onChange={setTitle}
          required
        />
        <div className="mt-4">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Describe your question in detail..."
          />
        </div>
        <div className="mt-4">
          <CommunitySelector
            communities={communities}
            value={community}
            onChange={c => setCommunity(c)}
            required={false}
            locked={!!lockedCommunity}
          />
        </div>
        <div className="mt-4">
          <TagsInput
            allTags={allTags.map((t: any) => t.name)}
            value={tags}
            onChange={setTags}
          />
        </div>
        <Button type="submit" className="mt-6 w-full" disabled={loading}>
          {loading ? 'Posting...' : 'Post Question'}
        </Button>
      </form>
    </Card>
  );
};

export default AskQuestion;
