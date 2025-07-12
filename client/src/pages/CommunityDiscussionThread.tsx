import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PlatformNavbar from '@/components/navigation/PlatformNavbar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ArrowLeft, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

const mockDiscussions = [
  {
    id: '1',
    title: 'React 18 Best Practices',
    tag: 'React',
    description: 'Discussion about the latest React 18 features, concurrent rendering, and performance optimizations.',
    participants: [
      { id: '1', name: 'Sarah J.' },
      { id: '2', name: 'Alex C.' },
      { id: '3', name: 'Maya P.' },
      { id: '4', name: 'John D.' }
    ],
    messages: [
      { id: 1, sender: 'Sarah J.', text: 'Welcome to the React 18 discussion!', time: '2m ago' },
      { id: 2, sender: 'Alex C.', text: 'Excited to learn about concurrent rendering.', time: '1m ago' },
      { id: 3, sender: 'Maya P.', text: 'What are the best new features?', time: '1m ago' }
    ]
  },
  {
    id: '2',
    title: 'TypeScript Tips & Tricks',
    tag: 'TypeScript',
    description: 'Share your favorite TypeScript patterns, utility types, and advanced techniques.',
    participants: [
      { id: '5', name: 'Emma S.' },
      { id: '6', name: 'David L.' },
      { id: '7', name: 'Lisa M.' }
    ],
    messages: [
      { id: 1, sender: 'Emma S.', text: 'TypeScript utility types are so powerful!', time: '5m ago' },
      { id: 2, sender: 'David L.', text: 'I love Partial and Pick.', time: '4m ago' }
    ]
  }
];

const CommunityDiscussionThread = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const discussion = mockDiscussions.find(d => d.id === id);

  useEffect(() => {
    if (discussion) {
      setMessages(discussion.messages);
    }
  }, [discussion]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        sender: user?.username || 'You',
        text: input,
        time: 'now'
      }
    ]);
    setInput('');
  };

  if (!discussion) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30">
          <PlatformNavbar />
          <div className="container mx-auto px-6 py-8">
            <div className="text-center py-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Discussion Not Found</h1>
              <Button onClick={() => navigate('/messages/community')} className="bg-pulse-500 hover:bg-pulse-600 text-white font-semibold rounded-full px-6 py-2 mt-2">Back to Discussions</Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pulse-50/30 flex flex-col">
        <PlatformNavbar />
        <div className="container mx-auto px-2 sm:px-4 py-4 flex-1 flex flex-col max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/messages/community')} className="hover:bg-pulse-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 flex-1">{discussion.title}</h1>
            <Badge className="bg-pulse-100 text-pulse-700">#{discussion.tag}</Badge>
          </div>
          <div className="bg-white rounded-xl shadow p-6 mb-4 border border-gray-100">
            <p className="text-gray-700 mb-2">{discussion.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              {discussion.participants.length} participants
              <span className="ml-4">Recent: {discussion.participants.map(p => p.name.split(' ')[0][0]).join(', ')}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-100 p-4 overflow-y-auto mb-4" style={{ minHeight: 300, maxHeight: 400 }}>
            {messages.map((msg, idx) => (
              <div key={msg.id} className={`flex ${msg.sender === user?.username ? 'justify-end' : 'justify-start'} mb-2`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl shadow ${msg.sender === user?.username ? 'bg-pulse-500 text-white' : 'bg-white text-gray-900 border border-gray-100'}`}>
                  <div className="text-xs font-semibold mb-1">{msg.sender}</div>
                  <div>{msg.text}</div>
                  <div className="text-xs text-gray-400 mt-1 text-right">{msg.time}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pulse-200 bg-white shadow"
            />
            <Button onClick={handleSend} className="bg-pulse-500 hover:bg-pulse-600 text-white rounded-full px-6 py-2 font-semibold">Send</Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default CommunityDiscussionThread; 