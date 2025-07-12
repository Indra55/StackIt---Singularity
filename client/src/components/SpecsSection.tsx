
import React from "react";

const SpecsSection = () => {
  return (
    <section className="w-full py-4 sm:py-6 md:py-10 bg-white" id="specifications">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        {/* Header with badge and line */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-16">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="pulse-chip">
              <span className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-pulse-500 text-white mr-2 text-xs">3</span>
              <span className="text-xs sm:text-sm">Specs</span>
            </div>
          </div>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>
        
        {/* Main content with text mask image - responsive text sizing */}
        <div className="max-w-5xl pl-2 sm:pl-4 md:pl-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-display leading-tight mb-6 sm:mb-8 md:mb-12">
            <span className="block bg-clip-text text-transparent bg-[url('/text-mask-image.jpg')] bg-cover bg-center">
              Atlas works with your team, not instead of it. By handling repetitive tasks, improving safety conditions, and learning from every interaction, Atlas helps humans focus on what they do best: create, solve, and innovate.
            </span>
          </h2>
        </div>
      </div>
    </section>
  );
};

export default SpecsSection;
