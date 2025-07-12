
import React, { useState } from "react";
import { Mail, Check } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-pulse-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-pulse-500" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">Get the latest updates and learning tips delivered to your inbox.</p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-pulse-500 focus:border-transparent outline-none"
              required
            />
            <button
              type="submit"
              disabled={isSubscribed}
              className="px-6 py-3 bg-pulse-500 text-white font-medium rounded-full hover:bg-pulse-600 transition-colors duration-200 disabled:bg-green-500"
            >
              {isSubscribed ? (
                <Check className="w-5 h-5" />
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
