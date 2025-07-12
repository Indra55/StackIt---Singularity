import React, { useEffect, useState } from "react";
import { ArrowRight, MessageSquare, Sparkles, Users, Trophy } from "lucide-react";
import TypewriterEffect from "./TypewriterEffect";
import { Link } from "react-router-dom";

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const typewriterTexts = [
    "Ask. Answer. Evolve.",
    "Learn. Share. Grow.",
    "Question. Discover. Excel."
  ];

  return (
    <section 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-white via-pulse-50/30 to-pulse-100/50" 
      id="hero"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pulse-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-blue-200/20 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-purple-200/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 animate-float opacity-20">
          <MessageSquare className="w-8 h-8 text-pulse-500" />
        </div>
        <div className="absolute top-40 right-1/3 animate-float opacity-20" style={{ animationDelay: '1s' }}>
          <Sparkles className="w-6 h-6 text-blue-500" />
        </div>
        <div className="absolute bottom-40 left-1/3 animate-float opacity-20" style={{ animationDelay: '3s' }}>
          <Users className="w-7 h-7 text-purple-500" />
        </div>
        <div className="absolute bottom-32 right-1/4 animate-float opacity-20" style={{ animationDelay: '2.5s' }}>
          <Trophy className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
        {/* Badge */}
        <div 
          className="inline-flex items-center justify-center pulse-chip mb-8 opacity-0 animate-fade-in transform hover:scale-105 transition-transform duration-300" 
          style={{ animationDelay: "0.2s" }}
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-pulse-500 text-white mr-2 text-xs font-bold">01</span>
          <span>Next-Gen Q&A Platform</span>
        </div>
        
        {/* Main Heading with Typewriter */}
        <div className="mb-8">
          <h1 
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-gray-900 leading-tight opacity-0 animate-fade-in mb-4" 
            style={{ animationDelay: "0.4s" }}
          >
            <TypewriterEffect 
              texts={typewriterTexts}
              speed={80}
              deleteSpeed={40}
              pauseTime={2500}
              className="text-transparent bg-clip-text bg-gradient-to-r from-pulse-600 via-blue-600 to-purple-600"
            />
          </h1>
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-display font-light text-gray-700 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            Welcome to the Future of Learning
          </h2>
        </div>
        
        {/* Subtitle */}
        <p 
          className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in mb-12" 
          style={{ animationDelay: "0.8s" }}
        >
          StackIt is a modern, minimalist Q&A platform designed to help you learn, share, and grow through community-driven knowledge. Join thousands of learners in a clutter-free environment.
        </p>
        
        {/* CTA Buttons */}
        <div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center opacity-0 animate-fade-in mb-16" 
          style={{ animationDelay: "1s" }}
        >
          <Link 
            to="/questions"
            className="group relative overflow-hidden bg-pulse-500 hover:bg-pulse-600 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center"
          >
            <span className="relative z-10">Enter Platform</span>
            <MessageSquare className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1 relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-pulse-600 to-pulse-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
          <Link
            to="/auth/signup"
            className="group border-2 border-pulse-500 bg-transparent hover:bg-pulse-500 text-pulse-500 hover:text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center"
          >
            Join Community
            <ArrowRight className="ml-3 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Stats Section */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto opacity-0 animate-fade-in" 
          style={{ animationDelay: "1.2s" }}
        >
          <div className="text-center group cursor-default">
            <div className="text-3xl sm:text-4xl font-bold text-pulse-500 mb-2 group-hover:scale-110 transition-transform duration-300">10K+</div>
            <div className="text-gray-600 font-medium">Active Learners</div>
          </div>
          
          <div className="text-center group cursor-default">
            <div className="text-3xl sm:text-4xl font-bold text-blue-500 mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
            <div className="text-gray-600 font-medium">Questions Answered</div>
          </div>
          
          <div className="text-center group cursor-default">
            <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-2 group-hover:scale-110 transition-transform duration-300">4.8★</div>
            <div className="text-gray-600 font-medium">User Rating</div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
