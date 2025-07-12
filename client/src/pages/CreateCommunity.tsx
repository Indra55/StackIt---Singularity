import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Eye, EyeOff, Users, Lock, Globe, Tag, Image as ImageIcon } from "lucide-react";
import PlatformNavbar from "@/components/navigation/PlatformNavbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CreateCommunityData {
  name: string;
  description: string;
  longDescription: string;
  isPrivate: boolean;
  tags: string[];
  coverImage?: File;
}

const CreateCommunity = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [formData, setFormData] = useState<CreateCommunityData>({
    name: "",
    description: "",
    longDescription: "",
    isPrivate: false,
    tags: [],
    coverImage: undefined
  });
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagInput, setTagInput] = useState("");
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Community name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Community name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Community name must be less than 50 characters";
    } else if (!/^[a-zA-Z0-9\s_-]+$/.test(formData.name)) {
      newErrors.name = "Community name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }
    
    if (!formData.longDescription.trim()) {
      newErrors.longDescription = "Detailed description is required";
    } else if (formData.longDescription.length < 50) {
      newErrors.longDescription = "Detailed description must be at least 50 characters";
    }
    
    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    } else if (formData.tags.length > 10) {
      newErrors.tags = "Maximum 10 tags allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Community Created Successfully!",
        description: `${formData.name} has been created and is ready for members.`,
        duration: 5000,
      });

      // Redirect to the new community (in real app, you'd get the community ID from API)
      navigate("/communities");
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tag management
  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !formData.tags.includes(cleanTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, cleanTag]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  // Cover image handling
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Cover image must be less than 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setFormData(prev => ({ ...prev, coverImage: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Suggested tags based on community name
  const getSuggestedTags = () => {
    const name = formData.name.toLowerCase();
    const suggestions: Record<string, string[]> = {
      'react': ['react', 'javascript', 'frontend', 'hooks', 'components'],
      'python': ['python', 'programming', 'backend', 'data-science'],
      'design': ['design', 'ui', 'ux', 'figma', 'prototyping'],
      'devops': ['devops', 'docker', 'kubernetes', 'ci-cd', 'cloud'],
      'mobile': ['mobile', 'ios', 'android', 'react-native', 'flutter'],
      'web': ['web', 'html', 'css', 'javascript', 'frontend'],
      'ai': ['ai', 'machine-learning', 'artificial-intelligence', 'python'],
      'blockchain': ['blockchain', 'web3', 'cryptocurrency', 'solidity'],
      'database': ['database', 'sql', 'nosql', 'mongodb', 'postgresql'],
      'security': ['security', 'cybersecurity', 'authentication', 'encryption']
    };
    
    for (const [key, tags] of Object.entries(suggestions)) {
      if (name.includes(key)) {
        return tags.filter(tag => !formData.tags.includes(tag));
      }
    }
    
    return ['programming', 'technology', 'development', 'coding', 'software'];
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/login');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Link 
              to="/communities"
              className="inline-flex items-center space-x-2 text-pulse-600 hover:text-pulse-700 transition-colors duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to Communities</span>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Community</h1>
            <p className="text-gray-600">
              Build a space for developers to connect, learn, and grow together
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Community Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., React Developers, Python Enthusiasts"
                  className={cn(errors.name && "border-red-500")}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                <p className="text-xs text-gray-500">
                  Choose a clear, descriptive name that reflects your community's focus
                </p>
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief description that appears in community listings"
                  rows={3}
                  className={cn(errors.description && "border-red-500")}
                />
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                <p className="text-xs text-gray-500">
                  {formData.description.length}/200 characters
                </p>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2">
                <Label htmlFor="longDescription">Detailed Description *</Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, longDescription: e.target.value }))}
                  placeholder="Provide a comprehensive description of your community's purpose, goals, and what members can expect..."
                  rows={6}
                  className={cn(errors.longDescription && "border-red-500")}
                />
                {errors.longDescription && <p className="text-sm text-red-500">{errors.longDescription}</p>}
                <p className="text-xs text-gray-500">
                  This will be displayed on your community's main page
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {formData.isPrivate ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-pulse-100">
                    {formData.isPrivate ? (
                      <Lock className="h-5 w-5 text-pulse-600" />
                    ) : (
                      <Globe className="h-5 w-5 text-pulse-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">
                      {formData.isPrivate ? "Private Community" : "Public Community"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formData.isPrivate 
                        ? "Only invited members can join and see content"
                        : "Anyone can discover and join your community"
                      }
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Add Tags *</Label>
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Type a tag and press Enter (e.g., react, javascript)"
                  className={cn(errors.tags && "border-red-500")}
                />
                {errors.tags && <p className="text-sm text-red-500">{errors.tags}</p>}
                <p className="text-xs text-gray-500">
                  Tags help people discover your community. Press Enter or comma to add.
                </p>
              </div>

              {/* Current Tags */}
              {formData.tags.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Tags ({formData.tags.length}/10)</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Tags */}
              <div className="space-y-2">
                <Label>Suggested Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedTags().map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-pulse-50 hover:border-pulse-200"
                      onClick={() => addTag(tag)}
                    >
                      + {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Cover Image (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Upload Cover Image</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pulse-400 transition-colors">
                  <input
                    id="coverImage"
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="hidden"
                  />
                  <label htmlFor="coverImage" className="cursor-pointer">
                    {coverImagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-32 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-gray-600">Click to change image</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/communities")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-pulse-600 hover:bg-pulse-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Community...
                </>
              ) : (
                "Create Community"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCommunity; 