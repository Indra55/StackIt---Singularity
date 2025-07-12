
import React from "react";

const ImageShowcaseSection = () => {
  return (
    <section className="w-full pt-0 pb-6 sm:pb-8 md:pb-12 bg-white" id="showcase">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-6 sm:mb-8 md:mb-12 animate-on-scroll">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold tracking-tight text-gray-900 mb-2 sm:mb-3 md:mb-4">
            Experience the Future Today
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Our cutting-edge humanoid robot is designed to transform how we interact 
            with technology in everyday environments.
          </p>
        </div>
        
        <div className="rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden shadow-elegant mx-auto max-w-4xl animate-on-scroll">
          <div className="w-full">
            <img 
              src="/lovable-uploads/c3d5522b-6886-4b75-8ffc-d020016bb9c2.png" 
              alt="Advanced humanoid robot with orange and white design" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="bg-white p-3 sm:p-4 md:p-8">
            <h3 className="text-lg sm:text-xl md:text-2xl font-display font-semibold mb-2 sm:mb-3 md:mb-4">Next Generation Robotics</h3>
            <p className="text-gray-700 text-xs sm:text-sm md:text-base">
              Built with precision engineering and sophisticated AI, our robots seamlessly 
              integrate into various environments, from homes to hospitals, providing 
              assistance and enriching human experiences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcaseSection;
