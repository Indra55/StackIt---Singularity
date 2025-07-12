
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, ChevronRight, Eye, Clock, User } from "lucide-react";
import PlatformNavbar from "@/components/navigation/PlatformNavbar";
import QuestionBlock from "@/components/question/QuestionBlock";
import AnswerList from "@/components/question/AnswerList";
import AnswerForm from "@/components/question/AnswerForm";
import RelatedSidebar from "@/components/question/RelatedSidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

// Enhanced mock data with detailed questions and answers
const mockQuestionData = {
  1: {
    id: 1,
    title: "How do I integrate JWT authentication in React?",
    content: `<p>I'm building a React application and need to implement JWT authentication. What's the best approach for handling tokens securely?</p>
    
    <p>Here's what I've tried so far:</p>
    
    <pre><code>const authenticateUser = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
};</code></pre>
    
    <p>But I'm concerned about security implications. Should I use localStorage, sessionStorage, or httpOnly cookies? Any guidance would be appreciated!</p>`,
    author: {
      id: 1,
      username: "pranav_d",
      avatar: "/placeholder-avatar.jpg",
      reputation: 1520
    },
    tags: ["React", "JWT", "Authentication", "Security"],
    votes: 15,
    answers: 3,
    views: 128,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    hasAcceptedAnswer: true,
    userVote: null
  },
  2: {
    id: 2,
    title: "Best practices for TypeScript with React hooks?",
    content: `<p>I'm new to TypeScript and wondering about the best practices when using it with React hooks like useState and useEffect.</p>` ,
    author: {
      id: 2,
      username: "sarah_dev",
      avatar: "/placeholder-avatar.jpg",
      reputation: 890
    },
    tags: ["TypeScript", "React", "Hooks"],
    votes: 8,
    answers: 0,
    views: 45,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    hasAcceptedAnswer: false,
    userVote: null
  },
  3: {
    id: 3,
    title: "How to optimize React component re-renders?",
    content: `<p>My React app is experiencing performance issues due to unnecessary re-renders. What are the best strategies to optimize this?</p>` ,
    author: {
      id: 3,
      username: "alex_code",
      avatar: "/placeholder-avatar.jpg",
      reputation: 2340
    },
    tags: ["React", "Performance", "Optimization"],
    votes: 23,
    answers: 5,
    views: 234,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    hasAcceptedAnswer: true,
    userVote: null
  },
  4: {
    id: 4,
    title: "Setting up ESLint and Prettier in a new project",
    content: `<p>What's the recommended configuration for ESLint and Prettier in a modern JavaScript/TypeScript project?</p>` ,
    author: {
      id: 4,
      username: "mike_lint",
      avatar: "/placeholder-avatar.jpg",
      reputation: 567
    },
    tags: ["ESLint", "Prettier", "Configuration", "JavaScript"],
    votes: 12,
    answers: 2,
    views: 89,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    hasAcceptedAnswer: false,
    userVote: null
  },
  5: {
    id: 5,
    title: "Understanding async/await vs Promises in JavaScript",
    content: `<p>Can someone explain the differences between async/await and traditional Promise chains? When should I use each approach?</p>` ,
    author: {
      id: 5,
      username: "emma_async",
      avatar: "/placeholder-avatar.jpg",
      reputation: 1100
    },
    tags: ["JavaScript", "Async", "Promises", "ES6"],
    votes: 19,
    answers: 4,
    views: 156,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    hasAcceptedAnswer: true,
    userVote: null
  }
};

const mockAnswersData = {
  1: [
    {
      id: 1,
      content: `<p>Great question! For JWT authentication in React, I recommend using httpOnly cookies for maximum security. Here's a comprehensive approach:</p>
      
      <h3>1. Server-side Setup</h3>
      <pre><code>// Set httpOnly cookie on login
app.post('/api/auth/login', async (req, res) => {
  const token = jwt.sign(payload, secret);
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });
  res.json({ success: true });
});</code></pre>
      
      <h3>2. Client-side Implementation</h3>
      <pre><code>// Create an axios instance with credentials
const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  
  useEffect(() => {
    api.get('/auth/verify')
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);
  
  if (isAuthenticated === null) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return children;
};</code></pre>
      
      <p><strong>Why httpOnly cookies?</strong></p>
      <ul>
        <li>Not accessible via JavaScript (XSS protection)</li>
        <li>Automatically sent with requests</li>
        <li>Can be secured with additional flags</li>
      </ul>
      
      <p>This approach is much more secure than localStorage, which is vulnerable to XSS attacks.</p>`,
      author: {
        id: 2,
        username: "security_expert",
        avatar: "/placeholder-avatar.jpg",
        reputation: 3420
      },
      votes: 23,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      isAccepted: true,
      userVote: null
    },
    {
      id: 2,
      content: `<p>I'd like to add another perspective. While httpOnly cookies are great for security, you might also consider using a combination approach:</p>
      
      <pre><code>// Use a context for auth state management
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
};</code></pre>
      
      <p>This gives you the best of both worlds - secure token storage and easy state management.</p>`,
      author: {
        id: 3,
        username: "react_ninja",
        avatar: "/placeholder-avatar.jpg",
        reputation: 2100
      },
      votes: 8,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      isAccepted: false,
      userVote: null
    }
  ],
  2: [
    {
      id: 21,
      content: `<p>Use type annotations for state and effect dependencies. Leverage TypeScript's type inference for cleaner code.</p>`,
      author: {
        id: 6,
        username: "ts_guru",
        avatar: "/placeholder-avatar.jpg",
        reputation: 1200
      },
      votes: 5,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isAccepted: false,
      userVote: null
    }
  ],
  3: [
    {
      id: 31,
      content: `<p>Use React.memo and useCallback to prevent unnecessary re-renders. Profile your components with React DevTools.</p>`,
      author: {
        id: 7,
        username: "perf_master",
        avatar: "/placeholder-avatar.jpg",
        reputation: 1800
      },
      votes: 7,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isAccepted: false,
      userVote: null
    }
  ],
  4: [
    {
      id: 41,
      content: `<p>Install ESLint and Prettier as dev dependencies. Use recommended configs and plugins for best results.</p>`,
      author: {
        id: 8,
        username: "lint_lady",
        avatar: "/placeholder-avatar.jpg",
        reputation: 900
      },
      votes: 3,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      isAccepted: false,
      userVote: null
    }
  ],
  5: [
    {
      id: 51,
      content: `<p>Async/await makes code easier to read and maintain. Use Promises for more complex flows or when you need chaining.</p>`,
      author: {
        id: 9,
        username: "js_async",
        avatar: "/placeholder-avatar.jpg",
        reputation: 1000
      },
      votes: 6,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      isAccepted: false,
      userVote: null
    }
  ]
};

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Simulate API call
    const loadQuestion = async () => {
      setLoading(true);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const questionData = mockQuestionData[id];
      const answersData = mockAnswersData[id] || [];
      
      if (questionData) {
        setQuestion(questionData);
        setAnswers(answersData);
      }
      
      setLoading(false);
    };
    
    loadQuestion();
  }, [id]);

  const handleVote = (type, targetType, targetId) => {
    // Mock voting logic
    if (targetType === 'question') {
      setQuestion(prev => ({
        ...prev,
        votes: prev.votes + (type === 'up' ? 1 : -1),
        userVote: prev.userVote === type ? null : type
      }));
    } else {
      setAnswers(prev => prev.map(answer => 
        answer.id === targetId 
          ? {
              ...answer,
              votes: answer.votes + (type === 'up' ? 1 : -1),
              userVote: answer.userVote === type ? null : type
            }
          : answer
      ));
    }
  };

  const handleAcceptAnswer = (answerId) => {
    setAnswers(prev => prev.map(answer => ({
      ...answer,
      isAccepted: answer.id === answerId ? !answer.isAccepted : false
    })));
    
    setQuestion(prev => ({
      ...prev,
      hasAcceptedAnswer: true
    }));
  };

  const handleNewAnswer = (content) => {
    const newAnswer = {
      id: Date.now(),
      content,
      author: {
        id: 999,
        username: "current_user",
        avatar: "/placeholder-avatar.jpg",
        reputation: 150
      },
      votes: 0,
      createdAt: new Date(),
      isAccepted: false,
      userVote: null
    };
    
    setAnswers(prev => [...prev, newAnswer]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pulse-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
        <PlatformNavbar />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Question Not Found</h1>
            <p className="text-gray-600 mb-8">The question you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/questions')}>
              Back to Questions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
      <PlatformNavbar />
      
      {/* Header with Navigation */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back Button & Breadcrumbs */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/questions')}
                className="hover:bg-pulse-100 hover:text-pulse-700 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Questions
              </Button>
              
              <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <Link to="/questions" className="hover:text-pulse-600 transition-colors">
                  Questions
                </Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-medium truncate max-w-md">
                  {question.title}
                </span>
              </nav>
            </div>
            
            {/* User Actions */}
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-pulse-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                U
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 animate-fade-in-up">
        <div className="flex gap-8">
          {/* Main Column */}
          <div className="flex-1 max-w-4xl space-y-8">
            <QuestionBlock 
              question={question} 
              onVote={handleVote}
              onAcceptAnswer={handleAcceptAnswer}
            />
            
            <AnswerList 
              answers={answers}
              onVote={handleVote}
              onAcceptAnswer={handleAcceptAnswer}
              questionOwnerId={question.author.id}
            />
            {isAuthenticated ? (
              <AnswerForm onSubmit={handleNewAnswer} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center mt-6">
                <p className="text-yellow-800 font-semibold mb-2">You must be logged in to post an answer.</p>
                <Button onClick={() => navigate('/login')} className="bg-pulse-500 hover:bg-pulse-600 text-white font-semibold rounded-full px-6 py-2 mt-2">Log In</Button>
              </div>
            )}
          </div>

          {/* Sidebar (Desktop) */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <RelatedSidebar currentQuestionId={question.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
