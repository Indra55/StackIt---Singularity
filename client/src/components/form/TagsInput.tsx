
import React, { useState, useRef } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  minTags?: number;
  error?: boolean;
  suggestedTags?: string[];
}

const defaultSuggestedTags = [
  "React", "JavaScript", "TypeScript", "CSS", "HTML", 
  "Node.js", "Python", "Vue.js", "Angular", "Next.js",
  "Express", "MongoDB", "PostgreSQL", "Redux", "GraphQL"
];

export const TagsInput: React.FC<TagsInputProps> = ({
  value,
  onChange,
  maxTags = 5,
  minTags = 1,
  error,
  suggestedTags = defaultSuggestedTags
}) => {
  const [currentTag, setCurrentTag] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setCurrentTag(inputValue);

    if (inputValue.length >= 2) {
      const filtered = suggestedTags
        .filter(tag => 
          tag.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(tag)
        )
        .slice(0, 6);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
      setCurrentTag("");
      setShowSuggestions(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentTag.trim()) {
        addTag(currentTag);
      }
    }
  };

  const availableSuggestions = suggestedTags
    .filter(tag => !value.includes(tag))
    .slice(0, 8);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        Tags
        <span className="text-red-500 ml-1">*</span>
      </label>
      <p className="text-sm text-gray-600 mb-4">
        Add up to {maxTags} tags to help others find and answer your question.
      </p>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {value.map((tag, index) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-2 px-3 py-1 bg-pulse-100 text-pulse-700 rounded-full text-sm font-medium transition-all duration-200 hover:bg-pulse-200"
              style={{
                animation: `tagEnter 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-pulse-900 transition-colors rounded-full p-0.5 hover:bg-pulse-200"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Input */}
      {value.length < maxTags && (
        <div className="relative mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                type="text"
                value={currentTag}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setShowSuggestions(suggestions.length > 0)}
                placeholder="Type a tag and press Enter"
                className={cn(
                  "transition-all duration-200",
                  error && "border-red-500 ring-1 ring-red-500"
                )}
                aria-label="Add new tag"
                role="listbox"
                aria-multiselectable="true"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto"
                  style={{
                    animation: "slideDownFade 0.3s ease-out"
                  }}
                >
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addTag(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-pulse-50 focus:bg-pulse-50 focus:outline-none transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button
              type="button"
              onClick={() => currentTag.trim() && addTag(currentTag)}
              variant="outline"
              size="default"
              disabled={!currentTag.trim()}
              className="hover:scale-105 transition-transform duration-200"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Suggested Tags */}
      {value.length < maxTags && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Suggested tags:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => addTag(tag)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-pulse-100 hover:text-pulse-700 transition-all duration-200 hover:scale-105"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Validation Error */}
      {error && (
        <p className="text-sm text-red-500 mt-1">
          Please add between {minTags} and {maxTags} tags.
        </p>
      )}
      
      {/* Tag Counter */}
      <p className="text-xs text-gray-500 mt-1">
        {value.length} / {maxTags} tags
      </p>
    </div>
  );
};
