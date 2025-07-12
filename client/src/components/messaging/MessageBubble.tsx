
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Message } from '@/types/messaging';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  showTimestamp = true
}) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <Check className="h-3 w-3" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-3 group",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {showAvatar && !isOwn && (
        <Avatar className="w-9 h-9 shadow-md">
          <AvatarImage src={message.sender.avatarUrl} />
          <AvatarFallback className="bg-pulse-500 text-white text-base">
            {message.sender.firstName?.[0]}{message.sender.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "flex flex-col max-w-[80vw] sm:max-w-md",
        isOwn ? "items-end" : "items-start"
      )}>
        <div
          className={cn(
            "relative px-5 py-3 rounded-3xl shadow-lg transition-all duration-200",
            isOwn
              ? "bg-gradient-to-br from-pulse-500 to-pulse-600 text-white rounded-br-md hover:shadow-xl hover:scale-[1.02]"
              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
          )}
        >
          {message.messageType === 'text' && (
            <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
          {message.messageType === 'code' && (
            <pre className={cn(
              "text-xs font-mono p-2 rounded-lg overflow-x-auto mt-1",
              isOwn ? "bg-pulse-700/80 text-white" : "bg-gray-100 text-gray-800"
            )}>
              <code>{message.content}</code>
            </pre>
          )}
        </div>
        {showTimestamp && (
          <div
            className={cn(
              "flex items-center gap-1 mt-1 px-2 text-xs",
              isOwn ? "flex-row-reverse text-pulse-400" : "flex-row text-gray-400"
            )}
          >
            <span>{formatDistanceToNow(message.createdAt, { addSuffix: true })}</span>
            {isOwn && getStatusIcon()}
          </div>
        )}
      </div>
    </div>
  );
};
