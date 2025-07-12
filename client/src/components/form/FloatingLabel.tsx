
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FloatingLabelProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  errorMessage?: string;
  maxLength?: number;
  minLength?: number;
  type?: string;
  className?: string;
}

export const FloatingLabel: React.FC<FloatingLabelProps> = ({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  errorMessage,
  maxLength,
  minLength,
  type = "text",
  className
}) => {
  const [focused, setFocused] = useState(false);
  const [shake, setShake] = useState(false);

  const hasValue = value.length > 0;
  const isFloated = focused || hasValue;

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  React.useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={isFloated ? placeholder : ""}
          maxLength={maxLength}
          aria-required={required}
          aria-invalid={error}
          aria-describedby={error ? `${label}-error` : undefined}
          className={cn(
            "h-14 pt-6 pb-2 px-3 transition-all duration-200",
            error && "border-red-500 ring-1 ring-red-500",
            focused && "border-pulse-500 ring-2 ring-pulse-500/20",
            shake && "animate-pulse"
          )}
          style={{
            animation: shake ? "shake 0.4s ease-in-out" : undefined
          }}
        />
        
        <label
          className={cn(
            "absolute left-3 transition-all duration-200 pointer-events-none select-none",
            isFloated 
              ? "top-2 text-xs font-medium text-pulse-600" 
              : "top-1/2 transform -translate-y-1/2 text-base text-gray-500",
            error && isFloated && "text-red-500"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>

      {/* Character Counter */}
      {maxLength && (
        <div className="flex justify-end mt-1">
          <span className={cn(
            "text-xs transition-colors",
            value.length >= maxLength ? "text-red-500" : "text-gray-500"
          )}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Error Message */}
      {error && errorMessage && (
        <p id={`${label}-error`} className="text-sm text-red-500 mt-1">
          {errorMessage}
        </p>
      )}

      {/* Character Limit Tooltip */}
      {maxLength && value.length >= maxLength && (
        <div className="absolute top-full left-0 mt-1 px-2 py-1 bg-red-500 text-white text-xs rounded shadow-lg z-10">
          Maximum {maxLength} characters reached
        </div>
      )}
    </div>
  );
};
