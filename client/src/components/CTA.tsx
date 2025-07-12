
import React from "react";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-br from-pulse-50 via-white to-blue-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-32 h-32 sm:w-40 sm:h-40 md:w-80 md:h-80 bg-pulse-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/3 -left-10 w-24 h-24 sm:w-32 sm:h-32 md:w-60 md:h-60 bg-blue-200/20 rounded-full blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-1/4 w-20 h-20 sm:w-28 sm:h-28 md:w-40 md:h-40 bg-purple-200/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="section-container relative z-10 opacity-0 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto glass-card p-4 sm:p-6 md:p-8 lg:p-10 xl:p-14 text-center overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-pulse-100/30 rounded-full translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-gray-100/50 rounded-full -translate-x-1/2 translate-y-1/2 blur-2xl"></div>
          
          <div className="pulse-chip mx-auto mb-3 sm:mb-4 md:mb-6">
            <span className="text-xs sm:text-sm">Limited Availability</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4 md:mb-6">
            Be Among the First to <br className="hidden sm:inline" />
            <span className="text-pulse-500">Experience Atlas</span>
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 md:mb-8 max-w-2xl mx-auto">
            We're accepting a limited number of early adopters. Submit your application today to secure your place in the future of robotics.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <a href="#contact" className="button-primary group flex items-center justify-center w-full sm:w-auto text-sm sm:text-base">
              Request Early Access
              <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#" className="button-secondary w-full sm:w-auto text-center text-sm sm:text-base">
              Join Waitlist
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
