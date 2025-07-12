
import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Code, Smile, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string, type?: 'text' | 'code') => void;
  placeholder?: string;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  placeholder = "Type a message...",
  disabled = false
}) => {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'text' | 'code'>('text');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), messageType);
      setMessage('');
      setMessageType('text');
      setIsExpanded(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    
    setIsExpanded(textarea.scrollHeight > 44);
  };

  return (
    <div className="p-4 border-t border-gray-200 bg-white">
      <div className={cn(
        "flex items-end space-x-3 transition-all duration-200",
        isExpanded && "items-start pt-2"
      )}>
        {/* Message type toggle */}
        <div className="flex flex-col space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMessageType(messageType === 'text' ? 'code' : 'text')}
            className={cn(
              "h-8 w-8 p-0 transition-colors",
              messageType === 'code' 
                ? "bg-pulse-100 text-pulse-700 hover:bg-pulse-200" 
                : "text-gray-400 hover:text-gray-600"
            )}
            title={messageType === 'code' ? 'Switch to text' : 'Switch to code'}
          >
            <Code className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            title="Add attachment"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>

        {/* Input area */}
        <div className="flex-1 relative">
          {messageType === 'code' && (
            <div className="absolute -top-6 left-0 text-xs text-pulse-600 font-medium">
              Code Block
            </div>
          )}
          
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={messageType === 'code' ? 'Write your code...' : placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none transition-all duration-200",
              messageType === 'code' && "font-mono text-sm",
              "bg-gray-50 border-gray-200 focus:bg-white focus:border-pulse-500 focus:ring-2 focus:ring-pulse-100"
            )}
            style={{ height: 'auto' }}
          />
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-11 bg-pulse-500 hover:bg-pulse-600 disabled:opacity-50 transition-all duration-200 hover:scale-105"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Hint text */}
      <p className="text-xs text-gray-500 mt-2 pl-12">
        Press Enter to send, Shift + Enter for new line
      </p>
    </div>
  );
};
