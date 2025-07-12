
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { TypingIndicator as TypingIndicatorType } from '@/types/messaging';

interface TypingIndicatorProps {
  indicators: TypingIndicatorType[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ indicators }) => {
  if (indicators.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 px-4 py-2">
      <Avatar className="w-6 h-6">
        <AvatarImage src={indicators[0].user.avatarUrl} />
        <AvatarFallback className="bg-pulse-500 text-white text-xs">
          {indicators[0].user.firstName?.[0]}{indicators[0].user.lastName?.[0]}
        </AvatarFallback>
      </Avatar>
      
      <div className="bg-gray-100 rounded-2xl px-4 py-2 rounded-bl-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
      
      <span className="text-xs text-gray-500">
        {indicators.length === 1
          ? `${indicators[0].user.firstName} is typing...`
          : `${indicators.length} people are typing...`
        }
      </span>
    </div>
  );
};
