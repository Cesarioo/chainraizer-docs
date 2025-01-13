import React from 'react';
import Link from 'next/link';

export const DocSelector = () => {
  const options = [
    {
      title: 'Investor Documentation',
      description: 'Token economics, investment strategy, and market analysis',
      icon: '💼',
      path: '/investor',
      gradient: 'from-[#2563eb] to-[#3b82f6]',
      shadow: 'hover:shadow-blue-500/50'
    },
    {
      title: 'Technical Documentation',
      description: 'Architecture, smart contracts, and API references',
      icon: '⚡',
      path: '/technical',
      gradient: 'from-[#7c3aed] to-[#8b5cf6]',
      shadow: 'hover:shadow-purple-500/50'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8 my-12 px-4">
      {options.map((option) => (
        <Link 
          href={option.path} 
          key={option.title}
          className="no-underline group"
        >
          <div 
            className={`
              p-8 rounded-2xl 
              bg-gradient-to-br ${option.gradient}
              transform transition-all duration-300
              hover:scale-[1.02] hover:-translate-y-1
              shadow-lg ${option.shadow}
              border border-white/10
              backdrop-blur-sm
            `}
          >
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </span>
              <h3 className="text-2xl font-bold text-white m-0">
                {option.title}
              </h3>
            </div>
            <p className="text-lg text-white/80 m-0 leading-relaxed">
              {option.description}
            </p>
            <div className="flex items-center mt-6 text-white/70 group-hover:text-white transition-colors">
              <span>Learn more</span>
              <svg 
                className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
