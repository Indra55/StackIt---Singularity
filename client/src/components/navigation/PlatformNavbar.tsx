
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/notifications/NotificationBell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  User,
  Settings,
  LogOut,
  Menu,
  MessageSquare,
  HelpCircle,
  Plus,
  Search,
  Users,
  Crown,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PlatformNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/questions', label: 'Questions', icon: HelpCircle },
    { path: '/messages', label: 'Messages', icon: MessageSquare },
    { path: '/communities', label: 'Communities', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to={isAuthenticated ? "/questions" : "/"} 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.svg" 
                alt="StackIt Logo" 
                className="h-8 w-8" 
              />
              <span className="text-xl font-bold text-gray-900">StackIt</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className={cn(
                "relative transition-all duration-200",
                isSearchFocused && "scale-105"
              )}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions, tags, users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 outline-none transition-all duration-200"
                />
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                {/* Navigation Links */}
                <nav className="flex items-center space-x-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.path)
                          ? "bg-pulse-100 text-pulse-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  <Button
                    asChild
                    size="sm"
                    className="bg-pulse-600 hover:bg-pulse-700 text-white"
                  >
                    <Link to="/ask" className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Ask Question</span>
                    </Link>
                  </Button>
                </nav>

                {/* Notifications */}
                <NotificationBell />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                        <AvatarFallback className="bg-pulse-100 text-pulse-700 text-sm font-medium">
                          {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
                          {user?.lastName?.[0] || user?.username?.[1]?.toUpperCase() || ''}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80 bg-white border shadow-lg" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                            <AvatarFallback className="bg-pulse-100 text-pulse-700 text-lg font-medium">
                              {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
                              {user?.lastName?.[0] || user?.username?.[1]?.toUpperCase() || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.firstName && user?.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user?.username
                              }
                            </p>
                            <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {user?.role === 'admin' && (
                                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                                  <Crown className="w-3 h-3" />
                                  Admin
                                </Badge>
                              )}
                              <span className="text-xs text-orange-600 font-medium">
                                🔥 {user?.reputation?.toLocaleString()} rep
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={`/user/${user?.username}`} className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>View Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/dashboard" className="flex items-center text-red-600">
                            <Crown className="mr-2 h-4 w-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/auth/login">Log in</Link>
                </Button>
                <Button asChild className="bg-pulse-600 hover:bg-pulse-700">
                  <Link to="/auth/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {isAuthenticated && <NotificationBell />}
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <SheetHeader>
                  <SheetTitle className="text-left">
                    {isAuthenticated ? (
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                          <AvatarFallback className="bg-pulse-100 text-pulse-700">
                            {user?.firstName?.[0] || user?.username?.[0]?.toUpperCase()}
                            {user?.lastName?.[0] || user?.username?.[1]?.toUpperCase() || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user?.username
                            }
                          </p>
                          <p className="text-sm text-gray-500">@{user?.username}</p>
                        </div>
                      </div>
                    ) : (
                      'Menu'
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pulse-500 focus:border-pulse-500 outline-none"
                      />
                    </div>
                  </form>

                  {isAuthenticated ? (
                    <nav className="space-y-2">
                      <Link
                        to={`/user/${user?.username}`}
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        <User className="h-5 w-5" />
                        <span>My Profile</span>
                      </Link>
                      
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-2 rounded-lg",
                            isActive(item.path)
                              ? "bg-pulse-100 text-pulse-700"
                              : "hover:bg-gray-100"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Link>
                      ))}

                      <Link
                        to="/ask"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-pulse-600 text-white hover:bg-pulse-700"
                      >
                        <Plus className="h-5 w-5" />
                        <span>Ask Question</span>
                      </Link>

                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100"
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>

                      {user?.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600"
                        >
                          <Crown className="h-5 w-5" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-red-600 text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Log out</span>
                      </button>
                    </nav>
                  ) : (
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <Link to="/auth/login">Log in</Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full">
                        <Link to="/auth/signup">Sign up</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PlatformNavbar;
