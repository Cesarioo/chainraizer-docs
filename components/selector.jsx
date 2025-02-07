import React from 'react';
import Link from 'next/link';

export const DocSelector = () => {
  const options = [
    {
      title: 'Raizer',
      description: 'Learn about our company, protocol, and vision for the future of private equity',
      icon: '🚀',
      path: '/raizer',
      gradient: 'from-[#f97316] to-[#fb923c]',
      shadow: 'hover:shadow-orange-500/50',
      disabled: false
    },
    {
      title: 'Investor Documentation',
      description: 'Start investing in companies through the Raizer protocol',
      icon: '💼',
      path: '/investor',
      gradient: 'from-gray-600 to-gray-500',
      shadow: 'hover:shadow-gray-500/50',
      disabled: true
    },
    {
      title: 'Technical Documentation',
      description: 'Deep dive into how Raizer is built and its technical architecture',
      icon: '⚡',
      path: '/technical',
      gradient: 'from-gray-600 to-gray-500',
      shadow: 'hover:shadow-gray-500/50',
      disabled: true
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 my-12 px-4">
      {options.map((option) => (
        option.disabled ? (
          <div 
            key={option.title}
            className="cursor-not-allowed"
          >
            <div 
              className={`
                p-6 rounded-2xl 
                bg-gradient-to-br ${option.gradient}
                transform transition-all duration-300
                opacity-60
                shadow-lg ${option.shadow}
                border border-white/10
                backdrop-blur-sm
                h-full
                relative
              `}
            >
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl">
                  {option.icon}
                </span>
                <h3 className="text-xl font-bold text-white m-0">
                  {option.title}
                </h3>
              </div>
              <p className="text-base text-white/80 m-0 leading-relaxed">
                {option.description}
              </p>
              <div className="flex items-center mt-4 text-white/70">
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        ) : (
          <Link 
            href={option.path} 
            key={option.title}
            className="no-underline group"
          >
            <div 
              className={`
                p-6 rounded-2xl 
                bg-gradient-to-br ${option.gradient}
                transform transition-all duration-300
                hover:scale-[1.02] hover:-translate-y-1
                shadow-lg ${option.shadow}
                border border-white/10
                backdrop-blur-sm
                h-full
                relative
              `}
            >
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {option.icon}
                </span>
                <h3 className="text-xl font-bold text-white m-0">
                  {option.title}
                </h3>
              </div>
              <p className="text-base text-white/80 m-0 leading-relaxed">
                {option.description}
              </p>
              <div className="flex items-center mt-4 text-white/70 group-hover:text-white transition-colors">
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
        )
      ))}
    </div>
  );
};
