import React from 'react';
import { Database, LineChart, Shield, Zap } from 'lucide-react';

const features = [
  {
    icon: <Database className="h-8 w-8 text-indigo-500" />,
    title: 'Cross-Field Analysis',
    description: 'Analyze relationships between different fields in your collections with advanced statistical metrics.'
  },
  {
    icon: <LineChart className="h-8 w-8 text-indigo-500" />,
    title: 'Statistical Insights',
    description: 'Get comprehensive statistical analysis including mean, median, distribution, and more.'
  },
  {
    icon: <Zap className="h-8 w-8 text-indigo-500" />,
    title: 'Performance Metrics',
    description: 'Monitor and optimize your database performance with detailed metrics and recommendations.'
  },
  {
    icon: <Shield className="h-8 w-8 text-indigo-500" />,
    title: 'Secure & Reliable',
    description: 'Built with security in mind, ensuring your data analysis is safe and dependable.'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;