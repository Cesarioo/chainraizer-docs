import React from 'react';

const VARIANTS = {
  informative: {
    container: 'bg-gradient-to-br from-[#2563eb] to-[#3b82f6]',
    icon: 'text-white',
    title: 'text-white',
    description: 'text-white/90'
  },
  attention: {
    container: 'bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6]',
    icon: 'text-white',
    title: 'text-white',
    description: 'text-white/90'
  },
  destructive: {
    container: 'bg-gradient-to-br from-[#dc2626] to-[#ef4444]',
    icon: 'text-white',
    title: 'text-white',
    description: 'text-white/90'
  }
};

const ICONS = {
  informative: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  attention: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  destructive: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

const Highlight = ({ 
  title, 
  description, 
  type = 'informative'
}) => {
  const styles = VARIANTS[type];

  return (
    <div className={`
      p-6 rounded-2xl
      ${styles.container}
      transform transition-all duration-300
      hover:scale-[1.02] hover:-translate-y-1
      shadow-lg hover:shadow-xl
      border border-white/10
      backdrop-blur-sm
      group
      my-8
    `}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 ${styles.icon} p-2 bg-white/10 rounded-lg group-hover:scale-110 transition-transform`}>
          {ICONS[type]}
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-bold ${styles.title} m-0`}>
            {title}
          </h3>
          <div className={`mt-2 ${styles.description} text-base leading-relaxed`}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Highlight; 