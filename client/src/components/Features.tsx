
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MessageSquare, Bot, Users, Zap } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  isHighlight?: boolean;
}

const FeatureCard = ({ icon, title, description, index, isHighlight = false }: FeatureCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
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
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        "feature-card glass-card opacity-0 p-4 sm:p-6 md:p-8 text-center group hover:scale-105 transition-all duration-500",
        isHighlight 
          ? "bg-gradient-to-br from-pulse-50 to-pulse-100 border-pulse-200" 
          : "bg-white hover:shadow-2xl",
      )}
      style={{ animationDelay: `${0.2 * index}s` }}
    >
      <div className={cn(
        "rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center mb-4 sm:mb-6 mx-auto group-hover:animate-pulse",
        isHighlight ? "bg-pulse-500 text-white" : "bg-pulse-50 text-pulse-500"
      )}>
        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
          {icon}
        </div>
      </div>
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed">{description}</p>
      {isHighlight && (
        <div className="mt-3 sm:mt-4 inline-flex items-center text-xs sm:text-sm font-medium text-pulse-600 bg-pulse-100 px-2 sm:px-3 py-1 sm:py-2 rounded-full">
          ✨ AI Powered
        </div>
      )}
    </div>
  );
};

const Features = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".fade-in-element");
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add("animate-fade-in");
              }, index * 100);
            });
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
    <section className="py-12 sm:py-16 md:py-20 relative bg-gradient-to-b from-white to-gray-50" id="features" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-pulse-100 rounded-full opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-blue-100 rounded-full opacity-20 animate-bounce"></div>
      
      <div className="section-container">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="pulse-chip mx-auto mb-4 sm:mb-6 opacity-0 fade-in-element">
            <span>Core Features</span>
          </div>
          <h2 className="section-title mb-4 sm:mb-6 opacity-0 fade-in-element">
            Everything You Need to Learn & Share
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto opacity-0 fade-in-element px-4">
            Powerful features designed to enhance your learning experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          <FeatureCard
            icon={<MessageSquare className="w-full h-full" />}
            title="Smart Q&A"
            description="Ask questions and get intelligent answers from our community of experts."
            index={0}
          />
          <FeatureCard
            icon={<Bot className="w-full h-full" />}
            title="AI Assistant"
            description="Get instant help with AI-powered suggestions and improvements."
            index={1}
            isHighlight={true}
          />
          <FeatureCard
            icon={<Users className="w-full h-full" />}
            title="Communities"
            description="Join specialized groups and connect with like-minded learners."
            index={2}
            isHighlight={true}
          />
          <FeatureCard
            icon={<Zap className="w-full h-full" />}
            title="Real-time"
            description="Stay updated with instant notifications and live discussions."
            index={3}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;