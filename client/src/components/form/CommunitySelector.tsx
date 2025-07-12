
import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

interface CommunitySelectorProps {
  communities: Community[];
  value: Community | null;
  onChange: (community: Community | null) => void;
  error?: boolean;
  className?: string;
  required?: boolean;
  locked?: boolean;
}

export const CommunitySelector: React.FC<CommunitySelectorProps> = ({
  communities,
  value,
  onChange,
  error,
  className,
  required = false,
  locked = false,
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [shake, setShake] = useState(false);

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (community.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (community: Community | null) => {
    onChange(community);
    setOpen(false);
    setSearchTerm("");
  };

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
    <div className={cn("space-y-2", className)}>
      <label className="block text-sm font-semibold text-gray-900">
        Select Community
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <DropdownMenu open={open} onOpenChange={locked ? undefined : setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select community"
            aria-required={required}
            aria-invalid={error}
            className={cn(
              "w-full h-12 justify-between text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500 ring-1 ring-red-500",
              shake && "animate-pulse",
              locked && "opacity-60 cursor-not-allowed"
            )}
            style={{
              animation: shake ? "shake 0.4s ease-in-out" : undefined
            }}
            disabled={locked}
          >
            {value ? (
              <div className="flex flex-col">
                <span className="font-medium">{value.name}</span>
                <span className="text-xs text-muted-foreground">{value.memberCount?.toLocaleString() || 0} members</span>
              </div>
            ) : (
              "None (General)"
            )}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-full min-w-[400px] p-0 bg-white shadow-lg border border-gray-200"
          style={{
            animation: open ? "slideDownFade 0.3s ease-out" : undefined
          }}
        >
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={locked}
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            <DropdownMenuItem
              key="none"
              onSelect={() => handleSelect(null)}
              className="p-3 cursor-pointer hover:bg-pulse-50 focus:bg-pulse-50"
              disabled={locked}
            >
              <div className="flex flex-col space-y-1">
                <div className="font-medium text-gray-900">None (General)</div>
                <div className="text-xs text-gray-600">Post to the main/global feed</div>
              </div>
            </DropdownMenuItem>
            {filteredCommunities.map((community) => (
              <DropdownMenuItem
                key={community.id}
                onSelect={() => handleSelect(community)}
                className="p-3 cursor-pointer hover:bg-pulse-50 focus:bg-pulse-50"
                disabled={locked}
              >
                <div className="flex flex-col space-y-1">
                  <div className="font-medium text-gray-900">{community.name}</div>
                  <div className="text-sm text-gray-600">{community.description}</div>
                  <div className="text-xs text-pulse-600 font-medium">
                    {community.memberCount?.toLocaleString() || 0} members
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {filteredCommunities.length === 0 && (
              <div className="p-3 text-sm text-gray-500 text-center">
                No communities found
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      {error && (
        <p className="text-sm text-red-500 mt-1">
          Please select a community.
        </p>
      )}
    </div>
  );
};
