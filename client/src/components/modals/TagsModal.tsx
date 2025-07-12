import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Search, Hash, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiGet } from "@/lib/api";

interface Tag {
  name: string;
  count: number;
  color?: string;
  description?: string;
  category?: string;
}

const TagsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    apiGet("/tags")
      .then((data) => {
        if (data.status === "success" && Array.isArray(data.tags)) {
          setTags(
            data.tags.map((t: any) => ({
              name: t.tag,
              count: parseInt(t.count, 10),
              color: "bg-blue-100 text-blue-700", // Default color
              description: undefined,
              category: undefined,
            }))
          );
        } else {
          setError("Failed to load tags");
        }
      })
      .catch(() => setError("Failed to load tags"))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const categories = [
    { id: "all", name: "All Tags", icon: Hash },
    { id: "frontend", name: "Frontend", icon: TrendingUp },
    { id: "backend", name: "Backend", icon: Users },
    { id: "language", name: "Languages", icon: Hash },
    { id: "database", name: "Databases", icon: Hash },
    { id: "devops", name: "DevOps", icon: Hash },
    { id: "cloud", name: "Cloud", icon: Hash },
    { id: "tools", name: "Tools", icon: Hash }
  ];

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tag.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tag.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTags = filteredTags.sort((a, b) => b.count - a.count);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Tags</h2>
            <p className="text-gray-600 mt-1">Discover and explore tags across the community</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
        </div>
        {/* Tags Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-12 text-lg text-gray-500">Loading tags...</div>
          ) : error ? (
            <div className="text-center py-12 text-lg text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedTags.map((tag) => (
                <div
                  key={tag.name}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={`${tag.color} border-0`}>
                      {tag.name}
                    </Badge>
                    <span className="text-sm text-gray-500 font-medium">
                      {tag.count.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {tag.description || ''}
                  </p>
                </div>
              ))}
            </div>
          )}
          {sortedTags.length === 0 && !loading && !error && (
            <div className="text-center py-12">
              <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {sortedTags.length} of {tags.length} tags
            </p>
            <Button onClick={onClose} className="bg-pulse-600 hover:bg-pulse-700">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TagsModal; 