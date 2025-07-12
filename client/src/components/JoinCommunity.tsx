
import React, { useEffect, useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const JoinCommunity = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  
  return (
    <section className="py-20 bg-gradient-to-br from-pulse-500 to-pulse-600 relative overflow-hidden" id="join" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full animate-bounce"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full animate-ping"></div>
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white mb-8">
          <Sparkles className="w-5 h-5 mr-2" />
          <span className="font-medium">Join 10,000+ Learners</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Transform Your Learning?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Join our vibrant community and accelerate your growth journey today.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link 
            to="/auth/signup" 
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-pulse-600 font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            Get Started Free
            <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
          <a 
            href="#demo" 
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-pulse-600 transition-all duration-300"
          >
            Watch Demo
          </a>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;
