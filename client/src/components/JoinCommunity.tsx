
import React from "react";
import { Users, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

const JoinCommunity = () => {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-pulse-50 via-white to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-pulse-200 p-6 sm:p-8 md:p-12 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-pulse-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 sm:w-24 sm:h-24 bg-orange-100/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
            
            {/* Icon */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pulse-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-pulse-600" />
            </div>

            {/* Content */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4">
              Join Our Growing Community
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Connect with thousands of learners, developers, and knowledge seekers. Share your expertise, ask questions, and grow together.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-pulse-600 mb-1 sm:mb-2">10K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">50K+</div>
                <div className="text-xs sm:text-sm text-gray-600">Questions Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">4.8</div>
                <div className="flex items-center justify-center gap-1 mb-1 sm:mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">User Rating</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                to="/auth/signup"
                className="bg-pulse-500 hover:bg-pulse-600 text-white font-medium px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/communities"
                className="border-2 border-pulse-500 bg-transparent hover:bg-pulse-500 text-pulse-500 hover:text-white font-medium px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base hover:scale-105"
              >
                Explore Communities
                <Users className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-500">
                Join thousands of developers from companies like Google, Microsoft, and GitHub
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCommunity;
