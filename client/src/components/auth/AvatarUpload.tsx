
import React, { useState, useRef } from 'react';
import { Upload, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ onFileSelect, error }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "w-24 h-24 rounded-full border-2 border-dashed cursor-pointer transition-all duration-300 flex items-center justify-center group hover:scale-105",
            isDragging 
              ? "border-pulse-500 bg-pulse-50" 
              : "border-gray-300 hover:border-pulse-400 hover:bg-pulse-50",
            error && "border-red-500"
          )}
        >
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <div className="text-center">
              <User className="w-8 h-8 text-gray-400 mx-auto mb-1 group-hover:text-pulse-500 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
        </div>
        
        {preview && (
          <button
            type="button"
            onClick={clearPreview}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600 mb-1">
          {preview ? 'Click to change avatar' : 'Upload your avatar'}
        </p>
        <p className="text-xs text-gray-400">
          JPG or PNG, max 2MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
