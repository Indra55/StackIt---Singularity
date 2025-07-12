
import React, { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/form/RichTextEditor";
import { Button } from "@/components/ui/button";
import { FormErrorBanner } from "@/components/form/FormErrorBanner";
import { toast } from "@/hooks/use-toast";
import { Send, Save } from "lucide-react";

interface AnswerFormProps {
  onSubmit: (content: string) => void;
}

const AnswerForm: React.FC<AnswerFormProps> = ({ onSubmit }) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save draft functionality
  useEffect(() => {
    const savedDraft = localStorage.getItem('answer-draft');
    if (savedDraft) {
      setContent(savedDraft);
    }
  }, []);

  useEffect(() => {
    if (content.trim()) {
      const timer = setTimeout(() => {
        localStorage.setItem('answer-draft', content);
        setLastSaved(new Date());
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [content]);

  const validateForm = () => {
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    
    if (!textContent) {
      setError("Please provide an answer.");
      setShowError(true);
      return false;
    }
    
    if (textContent.length < 30) {
      setError("Your answer must be at least 30 characters long.");
      setShowError(true);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setShowError(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(content);
      setContent("");
      localStorage.removeItem('answer-draft');
      setLastSaved(null);
      
      toast({
        title: "Answer posted!",
        description: "Your answer has been successfully submitted.",
      });
      
      // Scroll to the new answer (it will be at the bottom)
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
      
    } catch (err) {
      setError("Failed to post your answer. Please try again.");
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearDraft = () => {
    setContent("");
    localStorage.removeItem('answer-draft');
    setLastSaved(null);
    toast({
      title: "Draft cleared",
      description: "Your answer draft has been cleared.",
    });
  };

  const textContent = content.replace(/<[^>]*>/g, '').trim();
  const isValid = textContent.length >= 30;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-border p-8 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Answer</h2>
        <p className="text-gray-600">
          Provide a detailed answer to help others learn. Include code examples, explanations, and relevant details.
        </p>
      </div>

      <FormErrorBanner 
        message={error}
        visible={showError}
        onDismiss={() => setShowError(false)}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Type your answer here... Include code examples, step-by-step explanations, and helpful details."
          minHeight={250}
          error={showError && !isValid}
          minChars={30}
        />

        {/* Draft Status */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {lastSaved && (
              <div className="flex items-center space-x-1">
                <Save className="w-4 h-4" />
                <span>Draft saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
            
            {content.trim() && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearDraft}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear Draft
              </Button>
            )}
          </div>
          
          <div className="text-right">
            <div className={`font-medium ${textContent.length >= 30 ? 'text-green-600' : 'text-gray-500'}`}>
              {textContent.length} / 30 minimum characters
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="bg-pulse-500 hover:bg-pulse-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Post Your Answer
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Guidelines */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">Answer Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Provide clear, step-by-step explanations</li>
          <li>• Include working code examples when relevant</li>
          <li>• Explain the reasoning behind your solution</li>
          <li>• Be respectful and constructive in your response</li>
        </ul>
      </div>
    </div>
  );
};

export default AnswerForm;
