import React from 'react';
import Link from 'next/link';

const VARIANTS = {
  informative: {
    container: 'bg-gradient-to-br from-blue-600 to-blue-500',
    icon: 'text-blue-100',
    title: 'text-white',
    description: 'text-blue-50/90',
    border: 'border-blue-400/20',
    hover: 'hover:shadow-blue-500/20'
  },
  success: {
    container: 'bg-gradient-to-br from-emerald-600 to-emerald-500',
    icon: 'text-emerald-100',
    title: 'text-white',
    description: 'text-emerald-50/90',
    border: 'border-emerald-400/20',
    hover: 'hover:shadow-emerald-500/20'
  },
  warning: {
    container: 'bg-gradient-to-br from-amber-500 to-amber-400',
    icon: 'text-amber-100',
    title: 'text-white',
    description: 'text-amber-50/90',
    border: 'border-amber-400/20',
    hover: 'hover:shadow-amber-500/20'
  },
  error: {
    container: 'bg-gradient-to-br from-red-600 to-red-500',
    icon: 'text-red-100',
    title: 'text-white',
    description: 'text-red-50/90',
    border: 'border-red-400/20',
    hover: 'hover:shadow-red-500/20'
  },
  feature: {
    container: 'bg-gradient-to-br from-violet-600 to-violet-500',
    icon: 'text-violet-100',
    title: 'text-white',
    description: 'text-violet-50/90',
    border: 'border-violet-400/20',
    hover: 'hover:shadow-violet-500/20'
  },
  attention: {
    container: 'bg-gradient-to-br from-purple-600 to-purple-500',
    icon: 'text-purple-100',
    title: 'text-white',
    description: 'text-purple-50/90',
    border: 'border-purple-400/20',
    hover: 'hover:shadow-purple-500/20'
  }
};

const ICONS = {
  informative: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  feature: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  attention: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
};

const Highlight = ({ 
  title, 
  description, 
  type = 'informative',
  className = '',
  href
}) => {
  const styles = VARIANTS[type];
  const Content = (
    <div 
      className={`
        p-6 rounded-2xl 
        ${styles.container}
        transform transition-all duration-300
        hover:scale-[1.02] hover:-translate-y-1
        shadow-lg ${styles.hover}
        border ${styles.border}
        backdrop-blur-sm
        group
        my-8
        ${href ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      <div className="flex items-start space-x-4">
        <div className={`
          flex-shrink-0 ${styles.icon}
          p-2 bg-white/10 rounded-lg
          group-hover:scale-110 transition-transform
          ring-1 ring-white/20
        `}>
          {ICONS[type]}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${styles.title} m-0 leading-6`}>
            {title}
          </h3>
          <div className={`mt-2 ${styles.description} text-base leading-relaxed`}>
            {description}
          </div>
        </div>
        {href && (
          <div className="flex-shrink-0 self-center ml-2">
            <svg 
              className="w-5 h-5 text-white/70 group-hover:translate-x-1 transition-transform" 
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
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="no-underline">
        {Content}
      </Link>
    );
  }

  return Content;
};

export default Highlight; 