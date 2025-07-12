import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Search, Hash, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Tag {
  name: string;
  count: number;
  color: string;
  description: string;
  category: string;
}

const TagsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const allTags: Tag[] = [
    { name: "React", count: 1245, color: "bg-blue-100 text-blue-700", description: "A JavaScript library for building user interfaces", category: "frontend" },
    { name: "JavaScript", count: 2156, color: "bg-yellow-100 text-yellow-700", description: "Programming language for web development", category: "language" },
    { name: "TypeScript", count: 987, color: "bg-blue-100 text-blue-700", description: "Typed superset of JavaScript", category: "language" },
    { name: "Node.js", count: 765, color: "bg-green-100 text-green-700", description: "JavaScript runtime for server-side development", category: "backend" },
    { name: "Python", count: 1432, color: "bg-green-100 text-green-700", description: "High-level programming language", category: "language" },
    { name: "CSS", count: 654, color: "bg-purple-100 text-purple-700", description: "Styling language for web pages", category: "frontend" },
    { name: "HTML", count: 432, color: "bg-orange-100 text-orange-700", description: "Markup language for web pages", category: "frontend" },
    { name: "Vue.js", count: 321, color: "bg-green-100 text-green-700", description: "Progressive JavaScript framework", category: "frontend" },
    { name: "Angular", count: 298, color: "bg-red-100 text-red-700", description: "Platform for building web applications", category: "frontend" },
    { name: "Django", count: 456, color: "bg-green-100 text-green-700", description: "High-level Python web framework", category: "backend" },
    { name: "Flask", count: 234, color: "bg-gray-100 text-gray-700", description: "Lightweight Python web framework", category: "backend" },
    { name: "Express.js", count: 567, color: "bg-gray-100 text-gray-700", description: "Web application framework for Node.js", category: "backend" },
    { name: "MongoDB", count: 345, color: "bg-green-100 text-green-700", description: "NoSQL database", category: "database" },
    { name: "PostgreSQL", count: 289, color: "bg-blue-100 text-blue-700", description: "Object-relational database", category: "database" },
    { name: "Docker", count: 412, color: "bg-blue-100 text-blue-700", description: "Containerization platform", category: "devops" },
    { name: "Kubernetes", count: 198, color: "bg-blue-100 text-blue-700", description: "Container orchestration platform", category: "devops" },
    { name: "AWS", count: 523, color: "bg-orange-100 text-orange-700", description: "Cloud computing platform", category: "cloud" },
    { name: "Git", count: 876, color: "bg-orange-100 text-orange-700", description: "Version control system", category: "tools" },
    { name: "Webpack", count: 234, color: "bg-blue-100 text-blue-700", description: "Module bundler", category: "tools" },
    { name: "Vite", count: 156, color: "bg-purple-100 text-purple-700", description: "Build tool and dev server", category: "tools" }
  ];

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

  const filteredTags = allTags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tag.description.toLowerCase().includes(searchTerm.toLowerCase());
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
                  {tag.description}
                </p>
              </div>
            ))}
          </div>

          {sortedTags.length === 0 && (
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
              Showing {sortedTags.length} of {allTags.length} tags
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