
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
        "rounded-2xl p-8 cursor-pointer transition-all duration-500 border text-center group hover:scale-105",
        isActive 
          ? "bg-white shadow-2xl border-pulse-200 scale-105" 
          : "bg-white/70 hover:bg-white/90 border-transparent hover:shadow-xl"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300",
        isActive ? "bg-pulse-500 text-white animate-pulse" : "bg-gray-100 text-gray-500 group-hover:bg-pulse-100 group-hover:text-pulse-500"
      )}>
        {icon}
      </div>
      <div className={cn(
        "text-sm font-medium mb-2 transition-colors duration-300",
        isActive ? "text-pulse-500" : "text-gray-400"
      )}>
        Step {number}
      </div>
      <h3 className={cn(
        "text-xl font-semibold mb-4 transition-colors duration-300",
        isActive ? "text-pulse-600" : "text-gray-800"
      )}>
        {title}
      </h3>
      <p className="text-gray-600">{description}</p>
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
      icon: <UserPlus className="w-8 h-8" />
    },
    {
      number: "02", 
      title: "Ask & Answer",
      description: "Share your questions and help others with your expertise.",
      icon: <MessageCircle className="w-8 h-8" />
    },
    {
      number: "03",
      title: "Build Reputation",
      description: "Earn recognition and become a trusted community member.",
      icon: <Trophy className="w-8 h-8" />
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % stepsData.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [stepsData.length]);
  
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden" id="how-it-works" ref={sectionRef}>
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-pulse-100 rounded-full opacity-30 animate-pulse -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full opacity-30 animate-bounce translate-x-1/2 translate-y-1/2"></div>
      
      <div className="section-container relative z-10">
        <div className="text-center mb-16 animate-on-scroll">
          <div className="pulse-chip mx-auto mb-6">
            <span>How It Works</span>
          </div>
          <h2 className="section-title mb-6">Your Learning Journey</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to become part of our knowledge-sharing community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-on-scroll">
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
