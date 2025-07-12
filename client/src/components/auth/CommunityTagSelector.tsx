
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CommunityTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  error?: string;
}

const availableTags = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python',
  'Java', 'C++', 'HTML/CSS', 'Vue.js', 'Angular',
  'Express.js', 'Next.js', 'Django', 'Flask', 'Spring',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL',
  'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux'
];

export const CommunityTagSelector: React.FC<CommunityTagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  error
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayTags = showAll ? availableTags : availableTags.slice(0, 15);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < 5) {
      onTagsChange([...selectedTags, tag]);
    }
  };

  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 mb-3 block">
        Select your communities (max 5)
      </Label>
      
      <div className="space-y-4">
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-pulse-50 rounded-lg border">
            {selectedTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className="inline-flex items-center px-3 py-1 bg-pulse-500 text-white text-sm rounded-full hover:bg-pulse-600 transition-colors group"
              >
                {tag}
                <X className="w-3 h-3 ml-1 group-hover:scale-110 transition-transform" />
              </button>
            ))}
            <div className="text-xs text-gray-500 self-center ml-2">
              {selectedTags.length}/5 selected
            </div>
          </div>
        )}

        {/* Available tags */}
        <div className="flex flex-wrap gap-2">
          {displayTags.map((tag) => {
            const isSelected = selectedTags.includes(tag);
            const isDisabled = !isSelected && selectedTags.length >= 5;
            
            return (
              <button
                key={tag}
                type="button"
                onClick={() => !isDisabled && toggleTag(tag)}
                disabled={isDisabled}
                className={cn(
                  "px-3 py-2 text-sm rounded-lg border-2 transition-all duration-300 font-medium",
                  isSelected
                    ? "bg-pulse-100 border-pulse-500 text-pulse-700 hover:bg-pulse-200"
                    : isDisabled
                    ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-200 text-gray-700 hover:border-pulse-300 hover:bg-pulse-50 hover:scale-105"
                )}
              >
                {isSelected && <span className="mr-1">✓</span>}
                {tag}
              </button>
            );
          })}
          
          {!showAll && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="px-3 py-2 text-sm rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-pulse-300 hover:text-pulse-600 transition-all duration-300 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Show more
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};
