import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, Search, Users, Globe, Code, Brain, Smartphone, Server, Palette, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Community {
  name: string;
  description: string;
  members: number;
  category: string;
  isJoined: boolean;
  topics: string[];
  icon: any;
}

const CommunitiesModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [joinedCommunities, setJoinedCommunities] = useState<string[]>(["Web Dev"]);

  const allCommunities: Community[] = [
    {
      name: "Web Dev",
      description: "Everything about web development, from HTML to modern frameworks",
      members: 15420,
      category: "frontend",
      isJoined: true,
      topics: ["React", "Vue", "Angular", "JavaScript", "CSS"],
      icon: Code
    },
    {
      name: "AI & ML",
      description: "Artificial Intelligence and Machine Learning discussions",
      members: 8934,
      category: "ai",
      isJoined: false,
      topics: ["Python", "TensorFlow", "PyTorch", "Neural Networks"],
      icon: Brain
    },
    {
      name: "Mobile Dev",
      description: "Mobile app development for iOS and Android",
      members: 6743,
      category: "mobile",
      isJoined: false,
      topics: ["React Native", "Flutter", "Swift", "Kotlin"],
      icon: Smartphone
    },
    {
      name: "DevOps",
      description: "DevOps practices, CI/CD, and infrastructure",
      members: 4521,
      category: "devops",
      isJoined: false,
      topics: ["Docker", "Kubernetes", "AWS", "Jenkins"],
      icon: Server
    },
    {
      name: "UI/UX",
      description: "User interface and user experience design",
      members: 3876,
      category: "design",
      isJoined: false,
      topics: ["Figma", "Adobe XD", "Prototyping", "User Research"],
      icon: Palette
    },
    {
      name: "Backend",
      description: "Server-side development and APIs",
      members: 7654,
      category: "backend",
      isJoined: false,
      topics: ["Node.js", "Python", "Java", "Databases"],
      icon: Database
    },
    {
      name: "Data Science",
      description: "Data analysis, visualization, and statistics",
      members: 5432,
      category: "data",
      isJoined: false,
      topics: ["Python", "R", "SQL", "Tableau"],
      icon: Brain
    },
    {
      name: "Game Dev",
      description: "Game development and interactive experiences",
      members: 2987,
      category: "gaming",
      isJoined: false,
      topics: ["Unity", "Unreal", "C#", "3D Modeling"],
      icon: Code
    },
    {
      name: "Cybersecurity",
      description: "Security, ethical hacking, and privacy",
      members: 3456,
      category: "security",
      isJoined: false,
      topics: ["Penetration Testing", "Cryptography", "Network Security"],
      icon: Server
    },
    {
      name: "Open Source",
      description: "Contributing to and maintaining open source projects",
      members: 6789,
      category: "opensource",
      isJoined: false,
      topics: ["GitHub", "Contributing", "Maintenance", "Documentation"],
      icon: Globe
    }
  ];

  const categories = [
    { id: "all", name: "All Communities", icon: Users },
    { id: "frontend", name: "Frontend", icon: Code },
    { id: "backend", name: "Backend", icon: Database },
    { id: "mobile", name: "Mobile", icon: Smartphone },
    { id: "ai", name: "AI & ML", icon: Brain },
    { id: "devops", name: "DevOps", icon: Server },
    { id: "design", name: "Design", icon: Palette },
    { id: "data", name: "Data", icon: Brain },
    { id: "gaming", name: "Gaming", icon: Code },
    { id: "security", name: "Security", icon: Server },
    { id: "opensource", name: "Open Source", icon: Globe }
  ];

  const filteredCommunities = allCommunities.filter(community => {
    const matchesSearch = community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         community.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || community.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedCommunities = filteredCommunities.sort((a, b) => b.members - a.members);

  const toggleCommunity = (communityName: string) => {
    setJoinedCommunities(prev => 
      prev.includes(communityName)
        ? prev.filter(name => name !== communityName)
        : [...prev, communityName]
    );
  };

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Discover Communities</h2>
            <p className="text-gray-600 mt-1">Join communities that match your interests</p>
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
                placeholder="Search communities..."
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

        {/* Communities Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedCommunities.map((community) => {
              const Icon = community.icon;
              const isJoined = joinedCommunities.includes(community.name);
              
              return (
                <div
                  key={community.name}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pulse-100 rounded-xl flex items-center justify-center">
                        <Icon className="h-6 w-6 text-pulse-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{community.name}</h3>
                        <p className="text-sm text-gray-500">{community.members.toLocaleString()} members</p>
                      </div>
                    </div>
                    <Button
                      variant={isJoined ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCommunity(community.name)}
                      className={`${
                        isJoined 
                          ? "bg-pulse-500 hover:bg-pulse-600" 
                          : "hover:bg-pulse-50 hover:border-pulse-200"
                      }`}
                    >
                      {isJoined ? "Joined" : "Join"}
                    </Button>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {community.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {community.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                    {community.topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{community.topics.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {sortedCommunities.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {sortedCommunities.length} of {allCommunities.length} communities
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

export default CommunitiesModal; 