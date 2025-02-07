import React from 'react';

const VARIANTS = {
  Raizer: {
    icon: '🚀',
    gradient: 'from-orange-600 to-orange-500',
    border: 'border-orange-400/20',
    disabled: false
  },
  investor: {
    icon: '💼',
    gradient: 'from-gray-600 to-gray-500',
    border: 'border-gray-400/20',
    disabled: true
  },
  technical: {
    icon: '⚡',
    gradient: 'from-gray-600 to-gray-500',
    border: 'border-gray-400/20',
    disabled: true
  }
};

const SectionHeader = ({ 
  title, 
  description, 
  type = 'Raizer'
}) => {
  const styles = VARIANTS[type];

  return (
    <div className="mb-8">
      <div className={`
        inline-flex items-center px-4 py-2 rounded-full
        bg-gradient-to-r ${styles.gradient}
        border ${styles.border}
        shadow-sm
        ${styles.disabled ? 'opacity-60 cursor-not-allowed' : ''}
        relative
      `}>
        <span className="text-2xl mr-2">{styles.icon}</span>
        <span className="text-white font-medium">{title}</span>
      </div>
      {description && (
        <p className={`mt-3 text-lg ${styles.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300'}`}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader; 