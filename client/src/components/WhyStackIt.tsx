
import React, { useEffect, useRef } from "react";
import { Target, Users, Lightbulb } from "lucide-react";

const WhyStackIt = () => {
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
    
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-pulse-50 to-white relative overflow-hidden" id="why-stackit" ref={sectionRef}>
      {/* Animated background graphics */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pulse-200 to-pulse-100 rounded-full opacity-30 animate-pulse transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-200 to-blue-100 rounded-full opacity-30 animate-bounce transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <div className="pulse-chip mx-auto mb-6">
            <span>Why Choose StackIt</span>
          </div>
          <h2 className="section-title mb-6">
            Learn Faster, Together
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform your learning journey with collaborative knowledge sharing
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-16">
          <div className="text-center animate-on-scroll group">
            <div className="w-24 h-24 bg-gradient-to-br from-pulse-500 to-pulse-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Focused Learning</h3>
            <p className="text-gray-600 text-lg">Get precise answers to your specific questions</p>
          </div>
          
          <div className="text-center animate-on-scroll group" style={{ animationDelay: "0.2s" }}>
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Users className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Expert Community</h3>
            <p className="text-gray-600 text-lg">Learn from experienced professionals worldwide</p>
          </div>
          
          <div className="text-center animate-on-scroll group" style={{ animationDelay: "0.4s" }}>
            <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <Lightbulb className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Smart Insights</h3>
            <p className="text-gray-600 text-lg">AI-powered recommendations for better learning</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyStackIt;
