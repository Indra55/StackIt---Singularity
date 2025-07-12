
import React, { useState, useRef } from "react";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Code, 
  Link, 
  Image, 
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  error?: boolean;
  minChars?: number;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Describe your question in detail...",
  minHeight = 200,
  error,
  minChars = 30
}) => {
  const [focused, setFocused] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const [charCount, setCharCount] = useState(0);

  const toolbarButtons = [
    { icon: Bold, command: 'bold', tooltip: 'Bold (Ctrl+B)' },
    { icon: Italic, command: 'italic', tooltip: 'Italic (Ctrl+I)' },
    { icon: Strikethrough, command: 'strikeThrough', tooltip: 'Strikethrough' },
    { icon: Quote, command: 'formatBlock', value: 'blockquote', tooltip: 'Quote' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Bullet List' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Numbered List' },
    { icon: Code, command: 'formatBlock', value: 'pre', tooltip: 'Code Block' },
    { icon: Link, command: 'createLink', tooltip: 'Insert Link (Ctrl+K)' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Align Left' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Align Center' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Align Right' },
  ];

  const executeCommand = (command: string, value?: string) => {
    if (command === 'createLink') {
      const url = prompt('Enter URL:');
      if (url) {
        document.execCommand(command, false, url);
      }
    } else if (value) {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false);
    }
    
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      updateCharCount(content);
    }
  };

  const updateCharCount = (content: string) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    setCharCount(textContent.length);
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      updateCharCount(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'k':
          e.preventDefault();
          executeCommand('createLink');
          break;
      }
    }
  };

  React.useEffect(() => {
    if (value && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
      updateCharCount(value);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-900">
        What are the details of your problem?
        <span className="text-red-500 ml-1">*</span>
      </label>
      <p className="text-sm text-gray-600 mb-4">
        Include all the information someone would need to answer your question.
      </p>
      
      <div className={cn(
        "border rounded-lg overflow-hidden transition-all duration-300",
        focused ? "border-pulse-500 ring-2 ring-pulse-500/20" : "border-gray-300",
        error && "border-red-500 ring-2 ring-red-500/20"
      )}>
        {/* Toolbar */}
        <div 
          className="bg-gray-50 border-b p-2 flex flex-wrap gap-1"
          style={{
            animation: focused ? "slideDownFade 0.3s ease-out" : undefined
          }}
        >
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-pulse-100 hover:text-pulse-700 transition-all duration-200 hover:scale-110"
              onClick={() => executeCommand(button.command, button.value)}
              title={button.tooltip}
              type="button"
            >
              <button.icon className="h-4 w-4" />
            </Button>
          ))}
        </div>

        {/* Editor */}
        <div
          ref={editorRef}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-required="true"
          aria-invalid={error}
          className={cn(
            "p-4 outline-none transition-all duration-300",
            focused && "bg-white"
          )}
          style={{ minHeight }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          data-placeholder={!value ? placeholder : undefined}
        />
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className={cn(
          "transition-colors duration-200",
          charCount < minChars ? "text-red-500" : "text-gray-500"
        )}>
          {charCount < minChars ? (
            <span>Minimum {minChars} characters required ({minChars - charCount} remaining)</span>
          ) : (
            <span>{charCount} characters</span>
          )}
        </div>
        
        {error && charCount < minChars && (
          <p className="text-sm text-red-500">
            Please provide more details about your question.
          </p>
        )}
      </div>
    </div>
  );
};
