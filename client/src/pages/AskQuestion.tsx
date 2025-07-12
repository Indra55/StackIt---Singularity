
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, HelpCircle, CheckCircle, Loader2 } from "lucide-react";
import PlatformNavbar from "@/components/navigation/PlatformNavbar";
import { Button } from "@/components/ui/button";
import { CommunitySelector } from "@/components/form/CommunitySelector";
import { FloatingLabel } from "@/components/form/FloatingLabel";
import { RichTextEditor } from "@/components/form/RichTextEditor";
import { TagsInput } from "@/components/form/TagsInput";
import { FormErrorBanner } from "@/components/form/FormErrorBanner";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

const AskQuestion = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [selectedCommunity, setSelectedCommunity] = useState<Community | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-save draft functionality
  useEffect(() => {
    const draftKey = "askQuestion_draft";
    
    // Load draft on mount
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setDescription(draft.description || "");
        setTags(draft.tags || []);
        if (draft.communityId) {
          // In a real app, you'd look up the community by ID
          setSelectedCommunity(draft.community);
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }

    // Auto-save every 5 seconds
    const interval = setInterval(() => {
      if (title || description || tags.length > 0 || selectedCommunity) {
        const draft = {
          title,
          description,
          tags,
          community: selectedCommunity,
          communityId: selectedCommunity?.id,
          timestamp: Date.now()
        };
        localStorage.setItem(draftKey, JSON.stringify(draft));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [title, description, tags, selectedCommunity]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, boolean> = {};
    
    if (!selectedCommunity) newErrors.community = true;
    if (!title.trim() || title.length < 10 || title.length > 120) newErrors.title = true;
    if (!description.trim() || description.replace(/<[^>]*>/g, '').length < 30) newErrors.description = true;
    if (tags.length === 0) newErrors.tags = true;
    if (!agreedToTerms) newErrors.terms = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasInteracted(true);
    
    if (!validateForm()) {
      setErrorMessage("Please fix the errors above before submitting.");
      setShowErrorBanner(true);
      return;
    }

    setIsSubmitting(true);
    setShowErrorBanner(false);

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear draft after successful submission
      localStorage.removeItem("askQuestion_draft");
      
      // Show success toast
      toast({
        title: "Question Posted Successfully!",
        description: "Your question has been shared with the community.",
        duration: 5000,
      });

      // Redirect to questions page
      navigate("/questions");
      
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
      setShowErrorBanner(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic tag suggestions based on community
  const getCommunityTags = () => {
    if (!selectedCommunity) return [];
    
    const communityTagMap: Record<string, string[]> = {
      "1": ["React", "JSX", "Hooks", "State", "Props", "Components"],
      "2": ["JavaScript", "ES6", "Promise", "Async", "Function", "Object"],
      "3": ["TypeScript", "Types", "Interface", "Generic", "Compiler"],
      "4": ["CSS", "Flexbox", "Grid", "Animation", "Responsive", "SCSS"],
      "5": ["Node.js", "Express", "API", "Server", "Backend", "NPM"],
      "6": ["Performance", "Optimization", "Bundle", "Lazy", "Cache"]
    };
    
    return communityTagMap[selectedCommunity.id] || [];
  };

  // Check if form can be submitted
  const canSubmit = selectedCommunity && 
                   title.trim().length >= 10 && 
                   title.trim().length <= 120 &&
                   description.replace(/<[^>]*>/g, '').length >= 30 &&
                   tags.length > 0 &&
                   agreedToTerms;

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Compact Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/questions"
              className="inline-flex items-center space-x-2 text-pulse-600 hover:text-pulse-700 transition-colors duration-200 group"
              aria-label="Go back to questions"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600 hover:text-pulse-600 transition-colors cursor-pointer" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-pulse-500 rounded-full"></div>
              </div>
              <div className="w-7 h-7 bg-pulse-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">U</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ask a New Question</h1>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Get help from the community by asking a clear, specific question.
            </p>
          </div>
        </header>

        {/* Error Banner */}
        <FormErrorBanner
          message={errorMessage}
          visible={showErrorBanner}
          onDismiss={() => setShowErrorBanner(false)}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Form - Takes 2/3 of space on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Community Selector Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CommunitySelector
                  value={selectedCommunity}
                  onChange={setSelectedCommunity}
                  error={hasInteracted && errors.community}
                />
              </div>

              {/* Title Input Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <FloatingLabel
                  label="Question Title"
                  value={title}
                  onChange={setTitle}
                  placeholder="Enter a brief, descriptive title"
                  required
                  error={hasInteracted && errors.title}
                  errorMessage={
                    !title.trim() ? "Title is required" :
                    title.length < 10 ? "Title must be at least 10 characters" :
                    title.length > 120 ? "Title must be less than 120 characters" : ""
                  }
                  maxLength={120}
                  minLength={10}
                />
                <p className="text-xs text-gray-600 mt-2">
                  Be specific and imagine you're asking a question to another person.
                </p>
              </div>

              {/* Description Editor Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  error={hasInteracted && errors.description}
                  minChars={30}
                />
              </div>

              {/* Tags Input Card */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                <TagsInput
                  value={tags}
                  onChange={setTags}
                  error={hasInteracted && errors.tags}
                  suggestedTags={getCommunityTags()}
                  maxTags={5}
                  minTags={1}
                />
              </div>

              {/* Terms and Submit */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className={cn(
                      "mt-1 w-4 h-4 text-pulse-600 border-2 rounded focus:ring-pulse-500 focus:ring-2",
                      hasInteracted && errors.terms && "border-red-500"
                    )}
                    aria-required="true"
                    aria-invalid={hasInteracted && errors.terms}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                    I agree to the{" "}
                    <button
                      type="button"
                      className="text-pulse-600 hover:text-pulse-700 underline font-medium"
                      onClick={() => {
                        alert("Community Guidelines modal would open here");
                      }}
                    >
                      Community Guidelines
                    </button>
                    {" "}and understand that my question will be visible to all community members.
                  </label>
                </div>
                {hasInteracted && errors.terms && (
                  <p className="text-sm text-red-500 mb-4 ml-7">
                    Please agree to the community guidelines.
                  </p>
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <Link to="/questions">
                    <Button 
                      type="button"
                      variant="outline"
                      className="hover:scale-105 transition-transform duration-200"
                    >
                      Cancel
                    </Button>
                  </Link>
                  
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className={cn(
                      "bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-6 py-2 rounded-lg",
                      "transition-all duration-300 shadow-lg hover:shadow-xl",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      canSubmit && !isSubmitting && "hover:scale-105 transform",
                      isSubmitting && "animate-pulse"
                    )}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Posting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Post Your Question</span>
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Tips - Takes 1/3 of space on large screens */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm sticky top-4">
              <div className="flex items-center space-x-2 mb-3">
                <HelpCircle className="w-4 h-4 text-pulse-500" />
                <h3 className="font-semibold text-gray-900 text-sm">How to ask a good question</h3>
              </div>
              
              <div className="space-y-3 text-xs text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Be specific</h4>
                  <p>Include specific details about what you're trying to achieve.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Show your work</h4>
                  <p>Share what you've tried and what didn't work.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Use proper formatting</h4>
                  <p>Format code snippets and error messages for better readability.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">Choose relevant tags</h4>
                  <p>Tags help the right people find your question.</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-pulse-50 to-orange-50 rounded-lg border border-pulse-200 p-4">
              <h4 className="font-semibold text-pulse-900 mb-2 text-sm">Community Stats</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Members</span>
                  <span className="font-medium text-pulse-700">45,231</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions Today</span>
                  <span className="font-medium text-pulse-700">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response Time</span>
                  <span className="font-medium text-pulse-700">12 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
