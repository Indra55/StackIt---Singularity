
import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MessageSquare, Users, Search, Heart } from "lucide-react";

const ScreenshotsPreview = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const mockups = [
    {
      title: "Question Feed",
      description: "Browse and discover questions from the community",
      icon: <Search className="w-16 h-16 text-pulse-500" />,
      color: "from-pulse-100 to-pulse-200"
    },
    {
      title: "Ask Question",
      description: "Create rich, detailed questions with our intuitive editor",
      icon: <MessageSquare className="w-16 h-16 text-blue-500" />,
      color: "from-blue-100 to-blue-200"
    },
    {
      title: "Question Details",
      description: "Comprehensive view with answers, comments, and voting",
      icon: <Heart className="w-16 h-16 text-red-500" />,
      color: "from-red-100 to-red-200"
    },
    {
      title: "Live Communities",
      description: "Connect with peers in real-time conversations",
      icon: <Users className="w-16 h-16 text-green-500" />,
      color: "from-green-100 to-green-200"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mockups.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mockups.length) % mockups.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-20 bg-white" id="screenshots">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-on-scroll">
          <div className="pulse-chip mx-auto mb-6">
            <span>Platform Preview</span>
          </div>
          <h2 className="section-title mb-6">
            See StackIt in Action
          </h2>
          <p className="text-xl text-gray-600">
            Experience our intuitive interface designed for seamless learning.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto animate-on-scroll">
          <div className="rounded-3xl overflow-hidden shadow-2xl bg-white border">
            <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              {/* Animated mockup content */}
              <div className={`w-full h-full bg-gradient-to-br ${mockups[currentSlide].color} flex flex-col items-center justify-center transition-all duration-500`}>
                <div className="animate-bounce mb-6">
                  {mockups[currentSlide].icon}
                </div>
                <div className="text-center px-8">
                  <h3 className="text-3xl font-bold mb-4 text-gray-800">{mockups[currentSlide].title}</h3>
                  <p className="text-lg text-gray-600">{mockups[currentSlide].description}</p>
                </div>
              </div>
              
              {/* Navigation */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
                {mockups.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScreenshotsPreview;
