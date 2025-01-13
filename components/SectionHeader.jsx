import React from 'react';

const VARIANTS = {
  chainraizer: {
    icon: '🚀',
    gradient: 'from-orange-600 to-orange-500',
    border: 'border-orange-400/20'
  },
  investor: {
    icon: '💼',
    gradient: 'from-blue-600 to-blue-500',
    border: 'border-blue-400/20'
  },
  technical: {
    icon: '⚡',
    gradient: 'from-violet-600 to-violet-500',
    border: 'border-violet-400/20'
  }
};

const SectionHeader = ({ 
  title, 
  description, 
  type = 'chainraizer'
}) => {
  const styles = VARIANTS[type];

  return (
    <div className="mb-8">
      <div className={`
        inline-flex items-center px-4 py-2 rounded-full
        bg-gradient-to-r ${styles.gradient}
        border ${styles.border}
        shadow-sm
      `}>
        <span className="text-2xl mr-2">{styles.icon}</span>
        <span className="text-white font-medium">{title}</span>
      </div>
      {description && (
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader; 