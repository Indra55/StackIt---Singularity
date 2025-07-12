
import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorBannerProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const FormErrorBanner: React.FC<FormErrorBannerProps> = ({
  message,
  visible,
  onDismiss,
  autoHide = true,
  autoHideDelay = 8000
}) => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    
    if (visible && autoHide) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDelay);
      
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, autoHideDelay, onDismiss]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2"
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-800">
            {message}
          </p>
        </div>
        
        <button
          type="button"
          onClick={onDismiss}
          className="ml-4 p-1 rounded-full hover:bg-red-100 transition-colors duration-200"
          aria-label="Dismiss error message"
        >
          <X className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
};
