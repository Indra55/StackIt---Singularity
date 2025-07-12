
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { UserPlus, MessageCircle, Trophy } from "lucide-react";

interface StepCardProps {
  icon: React.ReactNode;
  number: string;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
}

const StepCard = ({ icon, number, title, description, isActive, onClick }: StepCardProps) => {
  return (
    <div 
      className={cn(
        "rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 cursor-pointer transition-all duration-500 border text-center group hover:scale-105",
        isActive 
          ? "bg-white shadow-2xl border-pulse-200 scale-105" 
          : "bg-white/70 hover:bg-white/90 border-transparent hover:shadow-xl"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-300",
        isActive ? "bg-pulse-500 text-white animate-pulse" : "bg-gray-100 text-gray-500 group-hover:bg-pulse-100 group-hover:text-pulse-500"
      )}>
        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8">
          {icon}
        </div>
      </div>
      <div className={cn(
        "text-xs sm:text-sm font-medium mb-2 transition-colors duration-300",
        isActive ? "text-pulse-500" : "text-gray-400"
      )}>
        Step {number}
      </div>
      <h3 className={cn(
        "text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 transition-colors duration-300",
        isActive ? "text-pulse-600" : "text-gray-800"
      )}>
        {title}
      </h3>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  const stepsData = [
    {
      number: "01",
      title: "Join & Explore",
      description: "Create your account and discover our knowledge community.",
      icon: <UserPlus className="w-full h-full" />
    },
    {
      number: "02", 
      title: "Ask & Answer",
      description: "Share your questions and help others with your expertise.",
      icon: <MessageCircle className="w-full h-full" />
    },
    {
      number: "03",
      title: "Build Reputation",
      description: "Earn recognition and become a trusted community member.",
      icon: <Trophy className="w-full h-full" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % stepsData.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [stepsData.length]);
  
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" id="how-it-works" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 bg-pulse-100 rounded-full opacity-30 animate-pulse -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-100 rounded-full opacity-30 animate-bounce translate-x-1/2 translate-y-1/2"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 animate-on-scroll">
          <div className="pulse-chip mx-auto mb-4 sm:mb-6">
            <span>How It Works</span>
          </div>
          <h2 className="section-title mb-4 sm:mb-6">Your Learning Journey</h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Three simple steps to become part of our knowledge-sharing community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 animate-on-scroll">
          {stepsData.map((step, index) => (
            <StepCard
              key={step.number}
              icon={step.icon}
              number={step.number}
              title={step.title}
              description={step.description}
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
