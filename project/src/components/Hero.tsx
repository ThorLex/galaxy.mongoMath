import React from 'react';
import { Terminal, ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <div className="py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-8">
          <Terminal className="h-16 w-16 text-indigo-500" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-6">
          Advanced MongoDB Analysis Made Simple
        </h1>
        <p className="text-xl text-slate-300 mb-12">
          MongoMath provides powerful statistical analysis and insights for your MongoDB databases,
          enabling data-driven decisions with just a few lines of code.
        </p>
        
        <div className="flex justify-center space-x-6">
          <a
            href="#installation"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg flex items-center"
          >
            Get Started
            <ChevronRight className="ml-2 h-5 w-5" />
          </a>
          <a
            href="https://github.com/ThorLex/galaxy.mongoMath"
            className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default Hero;